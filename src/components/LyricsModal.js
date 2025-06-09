import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { usePlayer } from '../contexts/PlayerContext';
import { getLyrics } from '../services/lyrics';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

// ... (styled components are unchanged)

const LyricsModal = ({ song, onClose }) => {
  const [lyrics, setLyrics] = useState(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);

  const { currentTime, duration } = usePlayer();
  const activeLineRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (!song) return;

    const fetchLyricsData = async () => {
      setIsLoading(true);
      setLyrics(null);
      try {
        const fetchedLyrics = await getLyrics(song);
        setLyrics(fetchedLyrics);
      } catch (error) {
        console.error("Lyrics modal error:", error);
        setLyrics(null);
      } finally {
        // This ensures the loading state is always turned off
        setIsLoading(false);
      }
    };

    fetchLyricsData();
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [song]);

  useEffect(() => {
    if (lyrics?.synced) {
      const activeLine = lyrics.synced.findIndex((line, index) => {
        const nextLine = lyrics.synced[index + 1];
        return currentTime >= line.time && (nextLine ? currentTime < nextLine.time : true);
      });
      setCurrentLineIndex(activeLine);
    }
  }, [currentTime, lyrics]);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLineIndex]);

  const renderLyrics = () => {
    if (isLoading) return <LyricLine>Loading lyrics...</LyricLine>;
    if (!lyrics || (!lyrics.synced && !lyrics.plain)) return <LyricLine>Lyrics not found.</LyricLine>;

    if (lyrics.synced && lyrics.synced.length > 0) {
      return lyrics.synced.map((line, index) => (
        <LyricLine key={`${line.time}-${index}`} $isActive={index === currentLineIndex} ref={index === currentLineIndex ? activeLineRef : null}>
          {line.text}
        </LyricLine>
      ));
    }
    
    return lyrics.plain.split('\n').map((line, index) => <LyricLine key={index}>{line}</LyricLine>);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faTimes} />
        </CloseButton>
        <ModalHeader>
            <SongTitle>{song.title}</SongTitle>
            <SongArtist>{song.artist}</SongArtist>
        </ModalHeader>
        <LyricsContainer>
          {renderLyrics()}
        </LyricsContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default LyricsModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  position: relative;
  box-shadow: 0 5px 20px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ModalHeader = styled.div`
  text-align: center;
  flex-shrink: 0;
  margin-bottom: 20px;
`;

const SongTitle = styled.h2`
  margin: 0;
  margin-bottom: 8px;
  font-size: 1.8rem;
`;

const SongArtist = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.2rem;
`;

const LyricsContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  text-align: center;
  scroll-behavior: smooth;
  padding: 40% 20px;

  &::-webkit-scrollbar { width: 0; background: transparent; }
`;

const LyricLine = styled.p`
    margin: 0;
    padding: 8px 0;
    font-size: 1.2rem;
    line-height: 1.8;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.5;
    transition: all 0.3s ease-in-out;

    ${({ $isActive }) => $isActive && css`
        color: ${({ theme }) => theme.colors.text};
        opacity: 1;
        transform: scale(1.05);
    `}
`;
