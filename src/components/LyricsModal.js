import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { findBestGeniusUrl, getLyrics } from '../services/genius';
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
  line-height: 1.8;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  /* We are using dangerouslySetInnerHTML, so style the inner elements directly */
  br {
    display: block;
    content: "";
    margin-top: 1.5rem;
  }

  /* Custom Scrollbar for lyrics */
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #555;
    border-radius: 20px;
    border: 3px solid ${({ theme }) => theme.colors.surface};
  }
`;

const LoadingMessage = styled.p`
    font-style: italic;
    text-align: center;
`;

const ErrorMessage = styled.p`
    color: ${({ theme }) => theme.colors.error};
    text-align: center;
`;

const LyricsModal = ({ song, onClose }) => {
  const [lyrics, setLyrics] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    if (!song) return;

    const fetchLyricsData = async () => {
      setIsLoading(true);
      setError(null);
      setLyrics('');

      try {
        const url = await findBestGeniusUrl(song); // <-- Use the new, more robust function
        
        if (url) {
          const scrapedLyrics = await getLyrics(url);
          if (scrapedLyrics) {
            setLyrics(scrapedLyrics);
          } else {
            setError('Found the song on Genius, but could not extract the lyrics.');
          }
        } else {
          setError('Could not find this song on Genius.');
        }

      } catch (err) {
        setError('An error occurred while fetching lyrics.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLyricsData();

    return () => {
      document.body.style.overflow = 'unset';
    };

  }, [song]);

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
            {isLoading && <LoadingMessage>Searching for lyrics...</LoadingMessage>}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {lyrics && (
                <div dangerouslySetInnerHTML={{ __html: lyrics }} />
            )}
        </LyricsContainer>

      </ModalContent>
    </ModalOverlay>
  );
};

export default LyricsModal;
