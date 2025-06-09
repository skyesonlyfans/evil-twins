import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDownloads } from '../contexts/DownloadContext';
import { usePlayer } from '../contexts/PlayerContext';
import { getDownloadedSongs } from '../utils/db';
import ContextMenu from '../components/ContextMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

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
  grid-template-columns: 50px 1fr 50px 50px;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  color: ${({ theme, $isPlaying }) => $isPlaying ? theme.colors.primary : 'inherit'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHighlight};
    .song-action-icon {
        opacity: 1;
    }
  }
`;

const SongCover = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
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

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0;
  font-size: 1rem;
  cursor: pointer;
  text-align: center;

  &.song-action-icon:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  ${SongRow}:hover & {
    opacity: 1;
  }
`;

const DeleteButton = styled(MenuButton)`
    opacity: 1; /* Always show delete button in library */
    &:hover {
        color: ${({ theme }) => theme.colors.error};
    }
`;

const Library = () => {
  const [localSongs, setLocalSongs] = useState([]);
  const [menuState, setMenuState] = useState({ isOpen: false, x: 0, y: 0, song: null });

  const { downloadedSongIds, deleteSong } = useDownloads();
  const { playAlbum, currentTrack, addToQueue, playSongNext } = usePlayer();

  useEffect(() => {
    const fetchDownloads = async () => {
      const songs = await getDownloadedSongs();
      setLocalSongs(songs);
    };

    fetchDownloads();
  }, [downloadedSongIds]);

  const handlePlayTrack = (trackIndex) => {
    playAlbum(localSongs, trackIndex);
  };

  const handleOpenMenu = (event, song) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuState({
      isOpen: true,
      x: event.pageX,
      y: event.pageY,
      song: song,
    });
  };

  const handleCloseMenu = () => {
    setMenuState({ ...menuState, isOpen: false });
  };
  
  const menuItems = menuState.song ? [
    { label: 'Add to Queue', onClick: () => addToQueue(menuState.song) },
    { label: 'Play Next', onClick: () => playSongNext(menuState.song) },
  ] : [];

  return (
    <PageContainer>
      <ContextMenu isOpen={menuState.isOpen} onClose={handleCloseMenu} position={menuState} menuItems={menuItems} />
      <PageTitle>Your Library</PageTitle>
      {localSongs.length === 0 ? (
        <EmptyLibraryMessage>You haven't downloaded any songs yet. Find a song and click the download icon to save it for offline listening.</EmptyLibraryMessage>
      ) : (
        <SongListContainer>
          {localSongs.map((song, index) => (
            <SongRow key={song.id} $isPlaying={currentTrack?.id === song.id}>
              <div onClick={() => handlePlayTrack(index)} style={{display: 'contents', cursor: 'pointer'}}>
                <SongCover src={song.cover} alt={song.title} />
                <SongInfo>
                  <SongTitle $isPlaying={currentTrack?.id === song.id}>{song.title}</SongTitle>
                  <SongArtist>{song.artist}</SongArtist>
                </SongInfo>
              </div>
              <DeleteButton className="song-action-icon" onClick={() => deleteSong(song)} aria-label={`Delete ${song.title}`}>
                <FontAwesomeIcon icon={faTrash} />
              </DeleteButton>
              <MenuButton className="song-action-icon" onClick={(e) => handleOpenMenu(e, song)}>
                <FontAwesomeIcon icon={faEllipsisV} />
              </MenuButton>
            </SongRow>
          ))}
        </SongListContainer>
      )}
    </PageContainer>
  );
};

export default Library;
