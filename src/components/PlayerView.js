import React from 'react';
import styled from 'styled-components';
import { usePlayer } from '../contexts/PlayerContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faStepBackward, faStepForward, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';

const PlayerViewOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Blurred background effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(${props => props.bgImage});
    background-size: cover;
    background-position: center;
    filter: blur(20px) brightness(0.5);
    z-index: -1;
  }
`;

const PlayerViewContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  padding: 20px;
  width: 100%;
  height: 100%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 30px;
  left: 30px;
  background: rgba(0,0,0,0.3);
  border: none;
  border-radius: 50%;
  color: white;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
`;

const AlbumArtLarge = styled.img`
  width: 100%;
  max-width: 400px;
  height: auto;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  margin-bottom: 40px;
`;

const TrackTitleLarge = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0 0 10px 0;
  text-align: center;
`;

const TrackArtistLarge = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 40px 0;
  text-align: center;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: white;
    transform: scale(1.1);
  }
`;

const PlayPauseButton = styled(ControlButton)`
  background-color: white;
  color: black;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: black;
    transform: scale(1.05);
  }
`;

const PlayerView = () => {
  const { 
    currentTrack, 
    isPlaying, 
    setIsPlaying, 
    playNext, 
    playPrevious, 
    togglePlayerView 
  } = usePlayer();

  if (!currentTrack) {
    return null; // Don't render if there's no track
  }

  return (
    <PlayerViewOverlay bgImage={currentTrack.cover}>
      <CloseButton onClick={togglePlayerView} aria-label="Minimize Player">
        <FontAwesomeIcon icon={faChevronDown} />
      </CloseButton>
      <PlayerViewContent>
        <AlbumArtLarge src={currentTrack.cover} alt={currentTrack.title} />
        <TrackTitleLarge>{currentTrack.title}</TrackTitleLarge>
        <TrackArtistLarge>{currentTrack.artist}</TrackArtistLarge>
        <ControlsContainer>
          <ControlButton onClick={playPrevious} aria-label="Previous Song">
            <FontAwesomeIcon icon={faStepBackward} />
          </ControlButton>
          <PlayPauseButton onClick={() => setIsPlaying(!isPlaying)} aria-label={isPlaying ? "Pause" : "Play"}>
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </PlayPauseButton>
          <ControlButton onClick={playNext} aria-label="Next Song">
            <FontAwesomeIcon icon={faStepForward} />
          </ControlButton>
        </ControlsContainer>
      </PlayerViewContent>
    </PlayerViewOverlay>
  );
};

export default PlayerView;
