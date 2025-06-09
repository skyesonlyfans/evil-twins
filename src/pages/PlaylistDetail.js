import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { usePlaylists } from '../contexts/PlaylistContext';
import { usePlayer } from '../contexts/PlayerContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChevronLeft, faTrash } from '@fortawesome/free-solid-svg-icons';

// ... (styled components are the same as the previous step)

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { playAlbum, currentTrack } = usePlayer();
  const { deletePlaylist } = usePlaylists();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      const docRef = doc(db, "playlists", playlistId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPlaylist({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such playlist!");
      }
      setLoading(false);
    };

    fetchPlaylist();
  }, [playlistId]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the playlist "${playlist.name}"?`)) {
        await deletePlaylist(playlistId);
        navigate('/'); // Navigate home after deletion
    }
  }

  if (loading) {
    return <PageContainer>Loading...</PageContainer>;
  }

  if (!playlist) {
    return <PageContainer>Playlist not found.</PageContainer>;
  }
  
  const handlePlayPlaylist = () => {
      if(playlist.songs && playlist.songs.length > 0) {
          playAlbum(playlist.songs);
      }
  }

  const handlePlayTrack = (trackIndex) => {
      if(playlist.songs && playlist.songs.length > 0) {
        playAlbum(playlist.songs, trackIndex);
      }
  }

  return (
    <PageContainer>
        <Header>
            <BackButton onClick={() => navigate(-1)}>
                <FontAwesomeIcon icon={faChevronLeft} />
            </BackButton>
            <PageTitle>{playlist.name}</PageTitle>
            {playlist.songs && playlist.songs.length > 0 && (
                <PlayButton onClick={handlePlayPlaylist} aria-label={`Play ${playlist.name}`}>
                    <FontAwesomeIcon icon={faPlay} />
                </PlayButton>
            )}
             <DeleteButton onClick={handleDelete} aria-label="Delete Playlist">
                <FontAwesomeIcon icon={faTrash} />
            </DeleteButton>
        </Header>
        
        <SongListContainer>
            {playlist.songs && playlist.songs.length > 0 ? (
                playlist.songs.map((song, index) => (
                    <SongRow key={index} onClick={() => handlePlayTrack(index)} $isPlaying={currentTrack?.id === song.id}>
                        <SongCover src={song.cover} alt={song.title} />
                        <SongInfo>
                            <SongTitle $isPlaying={currentTrack?.id === song.id}>{song.title}</SongTitle>
                            <SongArtist>{song.artist}</SongArtist>
                        </SongInfo>
                    </SongRow>
                ))
            ) : (
                <p>This playlist is empty.</p>
            )}
        </SongListContainer>

    </PageContainer>
  );
};

export default PlaylistDetail;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  background: rgba(0,0,0,0.3);
  border: none;
  border-radius: 50%;
  color: white;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  display: none; // Hidden by default
  
  @media (max-width: 768px) {
    display: inline-flex; // Visible on mobile
    align-items: center;
    justify-content: center;
  }
`;

const DeleteButton = styled.button`
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.5rem;
    cursor: pointer;
    margin-left: auto; /* Pushes it to the right */

    &:hover {
        color: ${({ theme }) => theme.colors.error};
    }
`;

const PageContainer = styled.div`
  padding: 24px 32px;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
`;

const PlayButton = styled.button`
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${({ theme }) => theme.colors.primaryDark};
        transform: scale(1.1);
    }
`;


const SongListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SongRow = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: ${({ theme, $isPlaying }) => $isPlaying ? theme.colors.primary : 'inherit'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHighlight};
  }
`;

const SongCover = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
`;

const SongInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SongTitle = styled.p`
  font-weight: 500;
  color: ${({ theme, $isPlaying }) => $isPlaying ? theme.colors.primary : theme.colors.text};
`;

const SongArtist = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
