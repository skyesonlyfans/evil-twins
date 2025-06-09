import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { usePlayer } from '../contexts/PlayerContext';
import LyricsModal from './LyricsModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faQuoteRight, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

const PlayerBarContainer = styled.div`
  background-color: #181818;
  border-top: 1px solid #282828;
  display: grid;
  grid-template-columns: 3fr 4fr 3fr;
  align-items: center;
  padding: 0 20px;
  height: 90px;
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    grid-template-columns: 1fr auto;
    padding: 8px 16px;
    height: 70px;
  }
`;

const PlayerWrapper = styled.div`
  grid-area: player;
`;

const MainLayout = styled.div`
  /* This ensures there's space for the fixed player at the bottom */
  padding-bottom: 90px;
  @media (max-width: 768px) {
    padding-bottom: 70px;
  }
`;

const TrackInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 180px;
  cursor: pointer;
`;

const AlbumArt = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 4px;
   @media (max-width: 768px) {
    width: 48px;
    height: 48px;
  }
`;

const TrackDetails = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TrackTitle = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  .rhap_time { color: ${({ theme }) => theme.colors.textSecondary}; font-size: 0.8rem; }
  .rhap_progress-indicator, .rhap_volume-indicator { background: ${({ theme }) => theme.colors.primary}; }
  .rhap_progress-bar-show-download { background-color: #555 !important; }
  .rhap_progress-filled { background-color: #fff; }
  .rhap_progress-bar:hover .rhap_progress-filled { background-color: ${({ theme }) => theme.colors.primary}; }
  .rhap_main-controls-button, .rhap_volume-button, .rhap_repeat-button { color: ${({ theme }) => theme.colors.textSecondary}; font-size: 1.2rem; &:hover { color: #fff; } }
  .rhap_play-pause-button { color: #fff; font-size: 2.2rem; &:hover { color: #fff; } }

  @media (max-width: 768px) {
    .rhap_progress-section, .rhap_volume-controls, .rhap_additional-controls {
      display: none;
    }
    .rhap_main-controls {
      justify-content: flex-end;
      gap: 10px;
    }
  }
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
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Player = () => {
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const {
    currentTrack, isPlaying, isShuffling, togglePlayerView, isPlayerViewOpen,
    setIsPlaying, playNext, playPrevious, toggleShuffle,
    setDuration, setCurrentTime, audioRef
  } = usePlayer();

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
      <MainLayout>
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
              ref={audioRef}
              autoPlayAfterSrcChange={false}
              src={currentTrack ? currentTrack.url : ""}
              onPlay={handlePlay}
              onPause={handlePause}
              onClickNext={playNext}
              onClickPrevious={playPrevious}
              onEnded={playNext}
              onListen={(e) => setCurrentTime(e.target.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.target.duration)}
              listenInterval={100}
              showSkipControls={true}
              showJumpControls={false}
              layout="stacked-reverse"
            />
          </PlayerControlsContainer>

          <CustomControlsContainer>
            <CustomControlButton onClick={toggleShuffle} $isActive={isShuffling} aria-label="Shuffle">
              <FontAwesomeIcon icon={faRandom} />
            </CustomControlButton>
            <CustomControlButton onClick={handleLyricsClick} aria-label="Show Lyrics">
              <FontAwesomeIcon icon={faQuoteRight} />
            </CustomControlButton>
            <CustomControlButton onClick={togglePlayerView} aria-label="Toggle Player View">
              <FontAwesomeIcon icon={isPlayerViewOpen ? faCompress : faExpand} />
            </CustomControlButton>
          </CustomControlsContainer>
        </PlayerBarContainer>
      </MainLayout>

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
