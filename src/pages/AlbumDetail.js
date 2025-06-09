import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { albums } from '../db/songs';
import { usePlayer } from '../contexts/PlayerContext';
import { useDownloads } from '../contexts/DownloadContext';
import ContextMenu from '../components/ContextMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faDownload, faCheckCircle, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

const PageContainer = styled.div`
  color: ${({ theme }) => theme.colors.text};
`;

const AlbumHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 24px;
  padding: 48px 32px;
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const AlbumCover = styled.img`
  width: 232px;
  height: 232px;
  object-fit: cover;
  box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    width: 200px;
    height: 200px;
  }
`;

const AlbumInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AlbumType = styled.p`
  font-size: 0.875rem;
  font-weight: bold;
  text-transform: uppercase;
`;

const AlbumTitle = styled.h1`
  font-size: 5rem;
  font-weight: 900;
  margin: 0;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const AlbumMeta = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 32px;
`;

const ActionButton = styled.button`
    background-color: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.8rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: ${({ theme }) => theme.colors.text};
        transform: scale(1.1);
    }
`;

const PlayButton = styled(ActionButton)`
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    font-size: 1.5rem;

    &:hover {
        background-color: ${({ theme }) => theme.colors.primaryDark};
        color: white;
    }
`;

const SongListContainer = styled.div`
  padding: 0 32px 24px 32px;
`;

const SongRow = styled.div`
  display: grid;
  grid-template-columns: 30px 1fr 50px 50px;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  color: ${({ theme, $isPlaying }) => $isPlaying ? theme.colors.primary : theme.colors.textSecondary};

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    .song-action-icon {
        opacity: 1;
    }
  }
`;

const SongInfoWrapper = styled.div`
  display: contents; /* Allows children to be part of the parent grid */
  cursor: pointer;
`;

const SongIndex = styled.span`
  font-weight: bold;
  text-align: right;
`;

const SongTitle = styled.p`
  font-weight: 500;
  color: ${({ theme, $isPlaying }) => $isPlaying ? theme.colors.primary : theme.colors.text};
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0;
  font-size: 1rem;
  cursor: pointer;

  &.song-action-icon:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  ${SongRow}:hover & {
    opacity: 1;
  }
`;

const DownloadStatusIcon = styled(MenuButton)``;


const AlbumDetail = () => {
  const { albumId } = useParams();
  const { playAlbum, currentTrack, addToQueue, playSongNext } = usePlayer();
  const { downloadedSongIds, downloadAlbum, downloadSong, deleteSong } = useDownloads();
  const [menuState, setMenuState] = useState({ isOpen: false, x: 0, y: 0, song: null });

  const album = albums.find((a) => a.id === albumId);

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
  
  if (!album) {
    return <PageContainer><AlbumTitle>Album not found</AlbumTitle></PageContainer>;
  }
  
  const menuItems = menuState.song ? [
    { label: 'Add to Queue', onClick: () => addToQueue(menuState.song) },
    { label: 'Play Next', onClick: () => playSongNext(menuState.song) },
  ] : [];

  const handlePlayAlbum = () => playAlbum(album.songs);
  const handlePlayTrack = (trackIndex) => playAlbum(album.songs, trackIndex);
  const songsWithCovers = album.songs.map(song => ({ ...song, cover: album.cover }));

  return (
    <PageContainer>
      <ContextMenu isOpen={menuState.isOpen} onClose={handleCloseMenu} position={menuState} menuItems={menuItems} />
      <AlbumHeader>
        <AlbumCover src={album.cover} alt={`${album.title} cover`} />
        <AlbumInfo>
          <AlbumType>Album</AlbumType>
          <AlbumTitle>{album.title}</AlbumTitle>
          <AlbumMeta>{album.artist} &bull; {album.songs.length} songs</AlbumMeta>
        </AlbumInfo>
      </AlbumHeader>
      
      <ActionsContainer>
        <PlayButton onClick={handlePlayAlbum} aria-label={`Play ${album.title}`}>
          <FontAwesomeIcon icon={faPlay} />
        </PlayButton>
        <ActionButton onClick={() => downloadAlbum(songsWithCovers)} aria-label={`Download ${album.title}`}>
            <FontAwesomeIcon icon={faDownload} />
        </ActionButton>
      </ActionsContainer>

      <SongListContainer>
        {songsWithCovers.map((song, index) => {
          const isDownloaded = downloadedSongIds.has(song.id);
          return (
            <SongRow 
              key={song.id} 
              $isPlaying={currentTrack?.id === song.id}
            >
              <SongInfoWrapper onClick={() => handlePlayTrack(index)}>
                <SongIndex>{index + 1}</SongIndex>
                <SongTitle $isPlaying={currentTrack?.id === song.id}>
                  {song.title}
                </SongTitle>
              </SongInfoWrapper>
              
              <DownloadStatusIcon
                className="song-action-icon"
                onClick={() => isDownloaded ? deleteSong(song) : downloadSong(song)}
                aria-label={isDownloaded ? 'Delete from downloads' : 'Download'}
              >
                <FontAwesomeIcon icon={isDownloaded ? faCheckCircle : faDownload} />
              </DownloadStatusIcon>

              <MenuButton className="song-action-icon" onClick={(e) => handleOpenMenu(e, song)}>
                  <FontAwesomeIcon icon={faEllipsisV} />
              </MenuButton>
            </SongRow>
          );
        })}
      </SongListContainer>
    </PageContainer>
  );
};

export default AlbumDetail;
