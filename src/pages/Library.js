import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDownloads } from '../contexts/DownloadContext';
import { usePlayer } from '../contexts/PlayerContext';
import { getDownloadedSongs } from '../utils/db';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const PageContainer = styled.div`
  padding: 24px 32px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 24px;
`;

const EmptyLibraryMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SongListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SongRow = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr 50px;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-radius: 6px;
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
  cursor: pointer;
`;

const SongInfo = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

const SongTitle = styled.p`
  font-weight: 500;
  color: ${({ theme, $isPlaying }) => $isPlaying ? theme.colors.primary : theme.colors.text};
`;

const SongArtist = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.error};
  }
`;

const Library = () => {
  const [localSongs, setLocalSongs] = useState([]);
  const { downloadedSongIds, deleteSong } = useDownloads();
  const { playAlbum, currentTrack } = usePlayer();

  useEffect(() => {
    const fetchDownloads = async () => {
      const songs = await getDownloadedSongs();
      setLocalSongs(songs);
    };

    fetchDownloads();
  }, [downloadedSongIds]); // This dependency automatically refreshes the list when a song is added/removed

  const handlePlayTrack = (trackIndex) => {
    // Set the queue to be ONLY the downloaded songs
    playAlbum(localSongs, trackIndex);
  };

  return (
    <PageContainer>
      <PageTitle>Your Library</PageTitle>
      {localSongs.length === 0 ? (
        <EmptyLibraryMessage>You haven't downloaded any songs yet. Find a song and click the download icon to save it for offline listening.</EmptyLibraryMessage>
      ) : (
        <SongListContainer>
          {localSongs.map((song, index) => (
            <SongRow key={song.id} $isPlaying={currentTrack?.id === song.id}>
              <SongCover src={song.cover} alt={song.title} onClick={() => handlePlayTrack(index)} />
              <SongInfo onClick={() => handlePlayTrack(index)}>
                <SongTitle $isPlaying={currentTrack?.id === song.id}>{song.title}</SongTitle>
                <SongArtist>{song.artist}</SongArtist>
              </SongInfo>
              <DeleteButton onClick={() => deleteSong(song)} aria-label={`Delete ${song.title}`}>
                <FontAwesomeIcon icon={faTrash} />
              </DeleteButton>
            </SongRow>
          ))}
        </SongListContainer>
      )}
    </PageContainer>
  );
};

export default Library;
