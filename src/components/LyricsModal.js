import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getGeniusSongUrl } from '../services/genius';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 5px 20px rgba(0,0,0,0.4);
  text-align: center;
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
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const SongTitle = styled.h2`
  margin: 0;
  margin-bottom: 8px;
  font-size: 1.8rem;
`;

const SongArtist = styled.p`
  margin: 0;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.2rem;
`;

const LoadingMessage = styled.p`
    font-style: italic;
`;

const GeniusButton = styled.a`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 500px;
  padding: 16px 24px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const ErrorMessage = styled.p`
    color: ${({ theme }) => theme.colors.error};
`;

const LyricsModal = ({ song, onClose }) => {
  const [geniusUrl, setGeniusUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!song) return;

    const fetchUrl = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = await getGeniusSongUrl(song.title, song.artist);
        if (url) {
          setGeniusUrl(url);
        } else {
          setError('Could not find lyrics for this song on Genius.');
        }
      } catch (err) {
        setError('Failed to fetch lyrics information.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrl();
  }, [song]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faTimes} />
        </CloseButton>
        <SongTitle>{song.title}</SongTitle>
        <SongArtist>{song.artist}</SongArtist>

        {isLoading && <LoadingMessage>Searching for lyrics on Genius...</LoadingMessage>}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {geniusUrl && (
          <GeniusButton href={geniusUrl} target="_blank" rel="noopener noreferrer">
            View Lyrics on Genius
          </GeniusButton>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default LyricsModal;
