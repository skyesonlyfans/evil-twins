import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  deleteDoc, 
  updateDoc, 
  arrayUnion,
  serverTimestamp 
} from 'firebase/firestore';

const PlaylistContext = createContext();

export const usePlaylists = () => useContext(PlaylistContext);

export const PlaylistProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Effect to fetch playlists when user logs in or out
  useEffect(() => {
    if (!currentUser) {
      setPlaylists([]);
      setLoading(false);
      return;
    }

    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        const playlistsRef = collection(db, 'playlists');
        const q = query(playlistsRef, where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const userPlaylists = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPlaylists(userPlaylists);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [currentUser]);

  const createPlaylist = async (name) => {
    if (!currentUser || !name) return;
    try {
      const newPlaylistRef = await addDoc(collection(db, 'playlists'), {
        name: name,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        songs: []
      });
      // Add the new playlist to our local state immediately for instant UI update
      setPlaylists(prev => [...prev, { id: newPlaylistRef.id, name, userId: currentUser.uid, songs: [] }]);
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };
  
  const addSongToPlaylist = async (playlistId, song) => {
    try {
        const playlistRef = doc(db, 'playlists', playlistId);
        await updateDoc(playlistRef, {
            songs: arrayUnion(song) // arrayUnion prevents duplicate entries of the exact same object
        });
        console.log(`Added "${song.title}" to playlist ${playlistId}`);
        // Optionally, we could update the local state here too for faster UI feedback
    } catch (error) {
        console.error("Error adding song to playlist:", error);
    }
  };

  const deletePlaylist = async (playlistId) => {
    try {
      await deleteDoc(doc(db, "playlists", playlistId));
      // Filter out the deleted playlist from local state for instant UI update
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    } catch (error) {
        console.error("Error deleting playlist: ", error);
    }
  };

  const value = {
    playlists,
    loadingPlaylists: loading,
    createPlaylist,
    addSongToPlaylist,
    deletePlaylist
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};
