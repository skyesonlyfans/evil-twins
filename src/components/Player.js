import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { usePlayer } from '../contexts/PlayerContext';
import LyricsModal from './LyricsModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faQuoteRight } from '@fortawesome/free-solid-svg-icons';

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
    color: ${({ theme }) => theme.colors.primary};
  }

  .rhap_play-pause-button:hover {
    color: ${({ theme }) => theme.colors.primaryDark};
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
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const playerRef = useRef(null);

  const {
    currentTrack,
    isPlaying,
    isShuffling,
    setIsPlaying,
    playNext,
    playPrevious,
    toggleShuffle,
  } = usePlayer();

  // This effect syncs our context's play state WITH the player's actual state
  useEffect(() => {
    if (playerRef.current && playerRef.current.audio.current) {
        if (isPlaying) {
            playerRef.current.audio.current.play().catch(e => console.error("Playback error:", e));
        } else {
            playerRef.current.audio.current.pause();
        }
    }
  }, [isPlaying, currentTrack]); // Re-run when the track changes or play state is toggled

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const handleLyricsClick = () => {
    if (currentTrack) {
      setIsLyricsOpen(true);
    }
  };
  
  return (
    <>
      <PlayerContainer>
        <AudioPlayer
          ref={playerRef}
          autoPlayAfterSrcChange={true}
          src={currentTrack ? currentTrack.url : ""}
          header={currentTrack ? `${currentTrack.title} - ${currentTrack.artist}`: "Select a song to play"}
          
          // Let the component handle its own state, but report changes up to our context
          onPlay={handlePlay}
          onPause={handlePause}
          
          // Wire up controls to context functions
          onClickNext={playNext}
          onClickPrevious={playPrevious}
          onEnded={playNext} // Automatically play next song when one ends

          customControlsSection={[
              <CustomControls key="custom-controls">
                  <CustomControlButton onClick={toggleShuffle} $isActive={isShuffling} aria-label="Shuffle">
                      <FontAwesomeIcon icon={faRandom} />
                  </CustomControlButton>
                  <CustomControlButton onClick={handleLyricsClick} aria-label="Show Lyrics">
                      <FontAwesomeIcon icon={faQuoteRight} />
                  </CustomControlButton>
              </CustomControls>
          ]}
          
          showSkipControls={true}
          showJumpControls={false}
          layout="stacked-reverse"
        />
      </PlayerContainer>

      {isLyricsOpen && currentTrack && (
        <LyricsModal 
            song={currentTrack} 
            onClose={() => setIsLyricsOpen(false)} 
        />
      )}
    </>
  );
};

export default Player;
