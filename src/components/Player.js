import React from 'react';
import styled from 'styled-components';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { usePlayer } from '../contexts/PlayerContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faFileAlt } from '@fortawesome/free-solid-svg-icons';

const PlayerContainer = styled.div`
  .rhap_container {
    background-color: ${({ theme }) => theme.colors.surface};
    box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
  }

  .rhap_header {
    font-size: 1rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text};
  }

  .rhap_time, .rhap_current-time, .rhap_total-time {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
  }

  .rhap_progress-indicator,
  .rhap_volume-indicator {
    background: ${({ theme }) => theme.colors.primary};
  }

  .rhap_progress-filled {
    background-color: ${({ theme }) => theme.colors.text};
  }
  .rhap_progress-bar:hover .rhap_progress-filled {
    background-color: ${({ theme }) => theme.colors.primary};
  }

  .rhap_main-controls-button,
  .rhap_volume-button,
  .rhap_repeat-button {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.2rem;
    transition: all 0.2s;
  }

  .rhap_main-controls-button:hover,
  .rhap_volume-button:hover,
  .rhap_repeat-button:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  .rhap_play-pause-button {
    font-size: 2.5rem;
    width: 50px;
    height: 50px;
  }

  /* Custom Controls Wrapper */
  .rhap_additional-controls {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const CustomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-right: 15px; /* Margin for controls on the left */
`;

const CustomControlButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme, $isActive }) => $isActive ? theme.colors.primary : theme.colors.textSecondary};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Player = () => {
  const {
    currentTrack,
    isPlaying,
    isShuffling,
    setIsPlaying,
    playNext,
    playPrevious,
    toggleShuffle,
  } = usePlayer();

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  // Placeholder for lyrics functionality
  const handleLyricsClick = () => {
    if (currentTrack) {
      alert(`Lyrics for "${currentTrack.title}" will be implemented soon!`);
    }
  };
  
  if (!currentTrack) {
    return (
        <PlayerContainer>
             {/* Render an empty player for consistent layout */}
            <AudioPlayer layout="stacked-reverse" style={{ boxShadow: 'none' }}/>
        </PlayerContainer>
    );
  }

  return (
    <PlayerContainer>
      <AudioPlayer
        autoPlayAfterSrcChange={true}
        src={currentTrack.url}
        header={`${currentTrack.title} - ${currentTrack.artist}`}
        
        // Control play/pause state via context
        playing={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        
        // Wire up controls to context functions
        onClickNext={playNext}
        onClickPrevious={playPrevious}
        onEnded={playNext} // Automatically play next song when one ends

        // Custom controls for shuffle and lyrics
        customControlsSection={[
            <CustomControls key="custom-controls">
                <CustomControlButton onClick={toggleShuffle} $isActive={isShuffling} aria-label="Shuffle">
                    <FontAwesomeIcon icon={faRandom} />
                </CustomControlButton>
                <CustomControlButton onClick={handleLyricsClick} aria-label="Show Lyrics">
                    <FontAwesomeIcon icon={faFileAlt} />
                </CustomControlButton>
            </CustomControls>
        ]}
        
        showSkipControls={true}
        showJumpControls={false}
        layout="stacked-reverse"
      />
    </PlayerContainer>
  );
};

export default Player;
