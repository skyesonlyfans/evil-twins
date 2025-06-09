import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { albums } from '../db/songs';
import { usePlayer } from '../contexts/PlayerContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom } from '@fortawesome/free-solid-svg-icons';

const PageContainer = styled.div`
  padding: 24px 32px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 900;
  margin: 0;
`;

const ShuffleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 500px;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const AlbumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }
`;

const AlbumCard = styled(Link)`
  background-color: ${({ theme }) => theme.colors.surfaceHighlight};
  border-radius: 8px;
  padding: 16px;
  transition: background-color 0.3s ease;
  overflow: hidden;

  &:hover {
    background-color: #282828;
  }
`;

const AlbumCover = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
`;

const AlbumTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

const AlbumArtist = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
  margin: 4px 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Albums = () => {
  const { playAndShuffleAll } = usePlayer();

  return (
    <PageContainer>
      <HeaderContainer>
        <PageTitle>Albums</PageTitle>
        <ShuffleButton onClick={playAndShuffleAll}>
          <FontAwesomeIcon icon={faRandom} />
          Shuffle Play
        </ShuffleButton>
      </HeaderContainer>
      <AlbumGrid>
        {albums.map((album) => (
          <AlbumCard key={album.id} to={`/album/${album.id}`}>
            <AlbumCover src={album.cover} alt={album.title} />
            <AlbumTitle>{album.title}</AlbumTitle>
            <AlbumArtist>{album.artist}</AlbumArtist>
          </AlbumCard>
        ))}
      </AlbumGrid>
    </PageContainer>
  );
};

export default Albums;
