import React, { createContext, useContext, useState, useEffect } from 'react';
import { albums } from '../db/songs';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

// Helper function to shuffle an array
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export const PlayerProvider = ({ children }) => {
  // Create a master list of all songs, ensuring each song has its album cover.
  const [allSongs] = useState(() => 
    albums.flatMap(album => 
      album.songs.map(song => ({
        ...song,
        cover: album.cover // Inject the parent album's cover into each song object
      }))
    )
  );
  
  const [queue, setQueue] = useState([]);
  const [shuffledQueue, setShuffledQueue] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeQueue = isShuffling ? shuffledQueue : queue;
  const currentTrack = activeQueue[currentTrackIndex] || null;

  useEffect(() => {
    // When the queue changes, update the shuffled queue
    if (queue.length > 0) {
        setShuffledQueue(shuffleArray([...queue]));
    }
  }, [queue]);
  
  // Set a default queue on initial load
  useEffect(() => {
    if (allSongs.length > 0) {
        setQueue(allSongs);
        setCurrentTrackIndex(0);
    }
  }, [allSongs]);

  const playAlbum = (albumSongs, startAtIndex = 0) => {
    const songsWithCovers = albumSongs.map(song => {
        if (song.cover) return song;
        const parentAlbum = albums.find(a => a.songs.some(s => s.id === song.id));
        return { ...song, cover: parentAlbum.cover };
    });

    setQueue(songsWithCovers);
    setCurrentTrackIndex(startAtIndex);
    setIsPlaying(true);
  };
  
  const handlePlayNext = () => {
    if (!currentTrack) return;
    const nextIndex = (currentTrackIndex + 1) % activeQueue.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePlayPrevious = () => {
    if (!currentTrack) return;
    const prevIndex = (currentTrackIndex - 1 + activeQueue.length) % activeQueue.length;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const toggleShuffle = () => {
    setIsShuffling(prev => !prev);
  };
  
  const addToQueue = (song) => {
    // Add to the end of the non-shuffled queue
    setQueue(prevQueue => [...prevQueue, song]);
    // To make it available immediately in shuffle mode, add it to a random future position
    setShuffledQueue(prevShuffled => {
        const newShuffled = [...prevShuffled];
        const insertIndex = Math.floor(Math.random() * (newShuffled.length - currentTrackIndex)) + currentTrackIndex + 1;
        newShuffled.splice(insertIndex, 0, song);
        return newShuffled;
    });
    console.log(`${song.title} added to queue.`);
  };

  const playSongNext = (song) => {
    // Insert song after the current track in both queues
    const newQueue = [...queue];
    newQueue.splice(currentTrackIndex + 1, 0, song);
    setQueue(newQueue);

    const newShuffledQueue = [...shuffledQueue];
    newShuffledQueue.splice(currentTrackIndex + 1, 0, song);
    setShuffledQueue(newShuffledQueue);
    console.log(`${song.title} will play next.`);
  };

  const value = {
    allSongs,
    queue,
    currentTrack,
    isPlaying,
    isShuffling,
    playAlbum,
    playNext: handlePlayNext,
    playPrevious: handlePlayPrevious,
    setIsPlaying,
    toggleShuffle,
    addToQueue,
    playSongNext
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
