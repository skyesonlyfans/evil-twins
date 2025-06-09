import React, { createContext, useContext, useState, useEffect } from 'react';
import { albums } from '../db/songs'; // We'll use this for now to get all songs

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
  const [allSongs] = useState(() => albums.flatMap(album => album.songs));
  const [queue, setQueue] = useState([]);
  const [shuffledQueue, setShuffledQueue] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeQueue = isShuffling ? shuffledQueue : queue;
  const currentTrack = activeQueue[currentTrackIndex] || null;

  useEffect(() => {
    // When the queue changes (e.g., playing a new album), update the shuffled queue
    setShuffledQueue(shuffleArray([...queue]));
  }, [queue]);

  const playAlbum = (albumSongs, startAtIndex = 0) => {
    setQueue(albumSongs);
    setCurrentTrackIndex(startAtIndex);
    setIsPlaying(true);
  };
  
  const playNext = () => {
    if (!currentTrack) return;
    const nextIndex = (currentTrackIndex + 1) % activeQueue.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const playPrevious = () => {
    if (!currentTrack) return;
    const prevIndex = (currentTrackIndex - 1 + activeQueue.length) % activeQueue.length;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const toggleShuffle = () => {
    setIsShuffling(prev => !prev);
  };

  const value = {
    allSongs,
    currentTrack,
    isPlaying,
    isShuffling,
    playAlbum,
    playNext,
    playPrevious,
    setIsPlaying,
    toggleShuffle,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
