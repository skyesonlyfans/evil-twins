import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { albums } from '../db/songs';
import { usePlayer } from '../contexts/PlayerContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

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

const SongListContainer = styled.div`
  padding: 24px 32px;
`;

const PlayButton = styled.button`
    background-color: ${({ theme }) => theme.colors.primary};
    border: none;
    border-radius: 50%;
    width: 56px;
    height: 56px;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    margin-bottom: 24px;
    transition: all 0.2s ease;

    &:hover {
        transform: scale(1.05);
        background-color: ${({ theme }) => theme.colors.primaryDark};
    }
`;

const SongRow = styled.div`
  display: grid;
  grid-template-columns: 30px 1fr;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  color: ${({ theme, $isPlaying }) => $isPlaying ? theme.colors.primary : theme.colors.textSecondary};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.text};
  }
`;

const SongIndex = styled.span`
  font-weight: bold;
  text-align: right;
`;

const SongTitle = styled.p`
  font-weight: 500;
  color: ${({ theme, $isPlaying }) => $isPlaying ? theme.colors.primary : theme.colors.text};
`;

const AlbumDetail = () => {
  const { albumId } = useParams();
  const { playAlbum, currentTrack } = usePlayer();
  const album = albums.find((a) => a.id === albumId);

  if (!album) {
    return <PageContainer><AlbumTitle>Album not found</AlbumTitle></PageContainer>;
  }

  const handlePlayAlbum = () => {
    playAlbum(album.songs);
  };

  const handlePlayTrack = (trackIndex) => {
    playAlbum(album.songs, trackIndex);
  };

  return (
    <PageContainer>
      <AlbumHeader>
        <AlbumCover src={album.cover} alt={`${album.title} cover`} />
        <AlbumInfo>
          <AlbumType>Album</AlbumType>
          <AlbumTitle>{album.title}</AlbumTitle>
          <AlbumMeta>{album.artist} &bull; {album.songs.length} songs</AlbumMeta>
        </AlbumInfo>
      </AlbumHeader>
      <SongListContainer>
        <PlayButton onClick={handlePlayAlbum} aria-label={`Play ${album.title}`}>
          <FontAwesomeIcon icon={faPlay} />
        </PlayButton>
        {album.songs.map((song, index) => (
          <SongRow 
            key={song.id} 
            onClick={() => handlePlayTrack(index)}
            $isPlaying={currentTrack?.id === song.id}
          >
            <SongIndex>{index + 1}</SongIndex>
            <SongTitle $isPlaying={currentTrack?.id === song.id}>{song.title}</SongTitle>
          </SongRow>
        ))}
      </SongListContainer>
    </PageContainer>
  );
};

export default AlbumDetail;
