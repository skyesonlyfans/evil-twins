import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { albums } from '../db/songs';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

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
  const [allSongs] = useState(() => 
    albums.flatMap(album => 
      album.songs.map(song => ({ ...song, cover: album.cover }))
    )
  );
  
  const [queue, setQueue] = useState([]);
  const [shuffledQueue, setShuffledQueue] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerViewOpen, setIsPlayerViewOpen] = useState(false);

  // New state for time and progress
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null); // Ref to access the actual <audio> element

  const activeQueue = isShuffling ? shuffledQueue : queue;
  const currentTrack = activeQueue[currentTrackIndex] || null;

  useEffect(() => {
    if (queue.length > 0) {
        setShuffledQueue(shuffleArray([...queue]));
    }
  }, [queue]);
  
  useEffect(() => {
    if (allSongs.length > 0 && queue.length === 0) {
        setQueue(allSongs);
        setCurrentTrackIndex(0);
        setIsPlaying(false);
    }
  }, [allSongs, queue]);

  const playAlbum = (albumSongs, startAtIndex = 0) => {
    const songsWithCovers = albumSongs.map(song => {
        if (song.cover) return song;
        const parentAlbum = albums.find(a => a.songs.some(s => s.id === song.id));
        return { ...song, cover: parentAlbum.cover };
    });
    setQueue(songsWithCovers);
    setCurrentTrackIndex(startAtIndex);
    setIsPlaying(true);
    setIsShuffling(false);
  };

  const playAndShuffleAll = () => {
    const globallyShuffled = shuffleArray([...allSongs]);
    setQueue(globallyShuffled);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
    setIsShuffling(false);
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

  const toggleShuffle = () => setIsShuffling(prev => !prev);
  const togglePlayerView = () => setIsPlayerViewOpen(prev => !prev);
  
  const addToQueue = (song) => {
    setQueue(prevQueue => [...prevQueue, song]);
    setShuffledQueue(prevShuffled => {
        const newShuffled = [...prevShuffled];
        const insertIndex = Math.floor(Math.random() * (newShuffled.length - currentTrackIndex)) + currentTrackIndex + 1;
        newShuffled.splice(insertIndex, 0, song);
        return newShuffled;
    });
  };

  const playSongNext = (song) => {
    const newQueue = [...queue];
    const originalIndex = queue.findIndex(item => item.id === currentTrack.id);
    newQueue.splice(originalIndex + 1, 0, song);
    setQueue(newQueue);

    const newShuffledQueue = [...shuffledQueue];
    const shuffledIndex = shuffledQueue.findIndex(item => item.id === currentTrack.id);
    newShuffledQueue.splice(shuffledIndex + 1, 0, song);
    setShuffledQueue(newShuffledQueue);
  };

  const seek = (time) => {
    if (audioRef.current && audioRef.current.audio.current) {
        audioRef.current.audio.current.currentTime = time;
        setCurrentTime(time);
    }
  };

  const value = {
    allSongs, queue, currentTrack, isPlaying, isShuffling,
    isPlayerViewOpen, togglePlayerView, playAlbum, playAndShuffleAll,
    playNext: handlePlayNext, playPrevious: handlePlayPrevious,
    setIsPlaying, toggleShuffle, addToQueue, playSongNext,
    // Export new time/progress state and functions
    duration, setDuration,
    currentTime, setCurrentTime,
    audioRef, seek
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
