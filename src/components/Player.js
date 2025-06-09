import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { usePlayer } from '../contexts/PlayerContext';
import LyricsModal from './LyricsModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faQuoteRight } from '@fortawesome/free-solid-svg-icons';

const PlayerBarContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid #282828;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  padding: 0 20px;
  height: 90px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: auto;
    padding: 10px;
  }
`;

const TrackInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 180px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: none;
  }
`;

const AlbumArt = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 4px;
`;

const TrackDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const TrackTitle = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const TrackArtist = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8rem;
`;

const PlayerControlsContainer = styled.div`
  width: 100%;
  max-width: 722px;
  justify-self: center;

  .rhap_container { background-color: transparent; box-shadow: none; padding: 0; }
  .rhap_header, .rhap_progress-section, .rhap_controls-section, .rhap_main-controls, .rhap_additional-controls, .rhap_volume-controls { background: transparent; }
  .rhap_header { display: none; }
  .rhap_time { color: ${({ theme }) => theme.colors.textSecondary}; font-size: 0.8rem; }
  .rhap_progress-indicator, .rhap_volume-indicator { background: ${({ theme }) => theme.colors.primary}; }
  .rhap_progress-filled { background-color: #fff; }
  .rhap_progress-bar:hover .rhap_progress-filled { background-color: ${({ theme }) => theme.colors.primary}; }
  .rhap_main-controls-button, .rhap_volume-button, .rhap_repeat-button { color: ${({ theme }) => theme.colors.textSecondary}; font-size: 1rem; &:hover { color: #fff; } }
  .rhap_play-pause-button { color: #fff; font-size: 2rem; &:hover { color: #fff; } }
`;

const CustomControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
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
  const {
    currentTrack, isPlaying, isShuffling, togglePlayerView, setIsPlaying,
    playNext, playPrevious, toggleShuffle,
    // Get the new time state and functions from the context
    setDuration, setCurrentTime, audioRef
  } = usePlayer();

  // Sync context play state with the audio element
  useEffect(() => {
    if (audioRef.current && audioRef.current.audio.current) {
        if (isPlaying && currentTrack) {
            audioRef.current.audio.current.play().catch(e => console.error("Playback error:", e));
        } else {
            audioRef.current.audio.current.pause();
        }
    }
  }, [isPlaying, currentTrack, audioRef]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleLyricsClick = () => currentTrack && setIsLyricsOpen(true);
  
  return (
    <>
      <PlayerBarContainer>
        <TrackInfoContainer onClick={togglePlayerView}>
          {currentTrack && (
            <>
              <AlbumArt src={currentTrack.cover} alt={currentTrack.title} />
              <TrackDetails>
                <TrackTitle>{currentTrack.title}</TrackTitle>
                <TrackArtist>{currentTrack.artist}</TrackArtist>
              </TrackDetails>
            </>
          )}
        </TrackInfoContainer>
        
        <PlayerControlsContainer>
          <AudioPlayer
            ref={audioRef} // <-- Attach the shared ref to the player
            autoPlayAfterSrcChange={false}
            src={currentTrack ? currentTrack.url : ""}
            onPlay={handlePlay}
            onPause={handlePause}
            onClickNext={playNext}
            onClickPrevious={playPrevious}
            onEnded={playNext}
            // Listen for time updates and send them to the context
            onListen={(e) => setCurrentTime(e.target.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.target.duration)}
            listenInterval={100} // Update time every 100ms
            showSkipControls={true}
            showJumpControls={false}
          />
        </PlayerControlsContainer>

        <CustomControlsContainer>
            <CustomControlButton onClick={toggleShuffle} $isActive={isShuffling} aria-label="Shuffle">
                <FontAwesomeIcon icon={faRandom} />
            </CustomControlButton>
            <CustomControlButton onClick={handleLyricsClick} aria-label="Show Lyrics">
                <FontAwesomeIcon icon={faQuoteRight} />
            </CustomControlButton>
        </CustomControlsContainer>

      </PlayerBarContainer>

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
