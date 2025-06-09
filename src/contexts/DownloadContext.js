import React, { createContext, useContext, useState, useEffect } from 'react';
import { initDB, addSongToDB, getDownloadedSongIds, removeSongFromDB } from '../utils/db';

const DownloadContext = createContext();

export const useDownloads = () => useContext(DownloadContext);

export const DownloadProvider = ({ children }) => {
  const [downloadedSongIds, setDownloadedSongIds] = useState(new Set());
  const [isDBReady, setIsDBReady] = useState(false);

  // On initial load, initialize the database and load the IDs of already downloaded songs.
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        const ids = await getDownloadedSongIds();
        setDownloadedSongIds(ids);
        setIsDBReady(true);
      } catch (error) {
        console.error("Failed to initialize DB or load song IDs:", error);
      }
    };
    initialize();
  }, []);

  // Function to download a single song
  const downloadSong = async (song) => {
    if (!isDBReady || downloadedSongIds.has(song.id)) {
      console.log(`Song ${song.id} is already downloaded or DB is not ready.`);
      return;
    }

    // 1. Tell the service worker to cache the audio file
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_SONGS',
        payload: { urls: [song.url] }
      });
    }

    // 2. Add the song's metadata to our IndexedDB database
    try {
      await addSongToDB(song);
      // 3. Update our in-app state to reflect the download
      setDownloadedSongIds(prevIds => new Set(prevIds).add(song.id));
      console.log(`Successfully downloaded: ${song.title}`);
    } catch (error) {
      console.error(`Failed to save song metadata for ${song.title}:`, error);
    }
  };

  // Function to download all songs from an album
  const downloadAlbum = (songs) => {
    console.log(`Downloading album with ${songs.length} songs.`);
    // We trigger all downloads simultaneously
    songs.forEach(song => downloadSong(song));
  };
  
  // Function to delete a downloaded song
  const deleteSong = async (song) => {
    if (!isDBReady || !downloadedSongIds.has(song.id)) {
        return;
    }
    try {
        await removeSongFromDB(song.id);
        setDownloadedSongIds(prevIds => {
            const newIds = new Set(prevIds);
            newIds.delete(song.id);
            return newIds;
        });
        // Note: This does not remove the audio from the SW cache to keep it simple,
        // but it removes it from being visible in the library.
        console.log(`Successfully deleted: ${song.title}`);
    } catch (error) {
        console.error(`Failed to delete song metadata for ${song.title}:`, error);
    }
  };


  const value = {
    downloadedSongIds,
    downloadSong,
    downloadAlbum,
    deleteSong,
    isDBReady
  };

  return (
    <DownloadContext.Provider value={value}>
      {children}
    </DownloadContext.Provider>
  );
};
