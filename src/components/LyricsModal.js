import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { usePlayer } from '../contexts/PlayerContext';
// Corrected import: Only 'getLyrics' is needed now.
import { getLyrics } from '../services/genius';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

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

const LyricsModal = ({ song, onClose }) => {
  const [lyrics, setLyrics] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentTime, duration } = usePlayer();
  const activeLineRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (!song) return;

    const fetchLyricsData = async () => {
      setIsLoading(true);
      setError(null);
      setLyrics([]);
      try {
        // Corrected logic: Call getLyrics directly with the song object
        const textLyrics = await getLyrics(song);
        
        if (textLyrics && !textLyrics.toLowerCase().includes("could not be found")) {
            const lines = textLyrics.split('\n').filter(line => line.trim() !== '');
            setLyrics(lines);
        } else {
           setError(textLyrics); // Show the error message from the API
           setLyrics([]);
        }
      } catch (err) {
        setError('An error occurred while fetching lyrics.');
        setLyrics([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLyricsData();
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [song]);

  useEffect(() => {
    if (duration > 0 && lyrics.length > 0) {
      const progress = currentTime / duration;
      const lineIndex = Math.floor(progress * lyrics.length);
      setCurrentLineIndex(lineIndex);
    }
  }, [currentTime, duration, lyrics]);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLineIndex]);

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
            {isLoading && <LyricLine>Loading lyrics...</LyricLine>}
            {error && <LyricLine>{error}</LyricLine>}
            {!isLoading && !error && lyrics.map((line, index) => (
                <LyricLine
                  key={index}
                  $isActive={index === currentLineIndex}
                  ref={index === currentLineIndex ? activeLineRef : null}
                >
                  {line}
                </LyricLine>
              ))
            }
        </LyricsContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default LyricsModal;
