import React from 'react';
import styled from 'styled-components';
import { usePlayer } from '../contexts/PlayerContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

const PageContainer = styled.div`
  padding: 24px 32px;
`;

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
  display: none;
  
  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-top: 20px;
  margin-bottom: 15px;
  border-bottom: 1px solid #282828;
  padding-bottom: 10px;
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

const Queue = () => {
  const { queue, currentTrack, playAlbum } = usePlayer();
  const navigate = useNavigate();

  // Find the index of the current track in the original queue
  const currentTrackIndex = queue.findIndex(track => track.id === currentTrack?.id);
  
  const nowPlaying = currentTrack;
  const nextUp = currentTrackIndex !== -1 ? queue.slice(currentTrackIndex + 1) : [];

  const handlePlayTrack = (song) => {
      const songIndex = queue.findIndex(s => s.id === song.id);
      if(songIndex !== -1) {
          playAlbum(queue, songIndex);
      }
  }

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faChevronLeft} />
        </BackButton>
        <PageTitle>Queue</PageTitle>
      </Header>

      {nowPlaying && (
        <>
          <SectionTitle>Now Playing</SectionTitle>
          <SongListContainer>
            <SongRow $isPlaying={true} onClick={() => handlePlayTrack(nowPlaying)}>
              <SongCover src={nowPlaying.cover} alt={nowPlaying.title} />
              <SongInfo>
                <SongTitle $isPlaying={true}>{nowPlaying.title}</SongTitle>
                <SongArtist>{nowPlaying.artist}</SongArtist>
              </SongInfo>
            </SongRow>
          </SongListContainer>
        </>
      )}

      {nextUp.length > 0 && (
        <>
            <SectionTitle>Next Up</SectionTitle>
            <SongListContainer>
            {nextUp.map((song) => (
                <SongRow key={song.id} onClick={() => handlePlayTrack(song)}>
                <SongCover src={song.cover} alt={song.title} />
                <SongInfo>
                    <SongTitle>{song.title}</SongTitle>
                    <SongArtist>{song.artist}</SongArtist>
                </SongInfo>
                </SongRow>
            ))}
            </SongListContainer>
        </>
      )}
      
      {queue.length === 0 && <p>The queue is empty.</p>}

    </PageContainer>
  );
};

export default Queue;
