import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { usePlayer } from '../contexts/PlayerContext';
import { useDownloads } from '../contexts/DownloadContext';
import LyricsModal from './LyricsModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faQuoteRight, faExpand, faCompress, faMusic, faDownload, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const PlayerBarContainer = styled.div`
  background-color: #181818;
  border-top: 1px solid #282828;
  display: grid;
  grid-template-columns: 3fr 4fr 3fr;
  align-items: center;
  padding: 0 20px;
  height: 90px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr auto;
    padding: 8px 16px;
    height: 70px;
    gap: 10px;
  }
`;

const TrackInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 180px;
  cursor: pointer;
  overflow: hidden;
`;

const AlbumArt = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 4px;
  background-color: #333;
  flex-shrink: 0;
  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
  }
`;

const PlaceholderArt = styled.div`
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 4px;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
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
  .rhap_progress-filled { background-color: #fff; }
  .rhap_progress-bar:hover .rhap_progress-filled { background-color: ${({ theme }) => theme.colors.primary}; }
  .rhap_main-controls-button, .rhap_volume-button, .rhap_repeat-button { color: ${({ theme }) => theme.colors.textSecondary}; font-size: 1.2rem; &:hover { color: #fff; } }
  .rhap_play-pause-button { color: #fff; font-size: 2.2rem; &:hover { color: #fff; } }

  @media (max-width: 768px) {
    display: none; // Hide the full player controls on mobile
  }
`;

// Controls specifically for mobile view
const MobileControls = styled.div`
    display: none;
    @media (max-width: 768px) {
        display: flex;
        align-items: center;
        gap: 20px;
    }
`;

const CustomControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const CustomControlButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme, $isActive }) => $isActive ? theme.colors.primary : theme.colors.textSecondary};
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  &:disabled {
      cursor: not-allowed;
      opacity: 0.3;
  }
  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Player = () => {
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const { downloadedSongIds, downloadSong } = useDownloads();
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

  const isCurrentSongDownloaded = currentTrack && downloadedSongIds.has(currentTrack.id);

  return (
    <>
      <PlayerBarContainer>
        <TrackInfoContainer onClick={currentTrack ? togglePlayerView : undefined}>
          {currentTrack ? (
            <AlbumArt src={currentTrack.cover} alt={currentTrack.title} />
          ) : (
            <PlaceholderArt><FontAwesomeIcon icon={faMusic} /></PlaceholderArt>
          )}
          <TrackDetails>
            <TrackTitle>{currentTrack?.title || 'No song selected'}</TrackTitle>
            <TrackArtist>{currentTrack?.artist || 'EvilTwins'}</TrackArtist>
          </TrackDetails>
        </TrackInfoContainer>
        
        {/* Full desktop player */}
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
          />
        </PlayerControlsContainer>
        
        {/* Mobile-only controls */}
        <MobileControls>
            <CustomControlButton onClick={handleLyricsClick} disabled={!currentTrack}>
                <FontAwesomeIcon icon={faQuoteRight} />
            </CustomControlButton>
            <CustomControlButton onClick={() => currentTrack && downloadSong(currentTrack)} disabled={!currentTrack || isCurrentSongDownloaded}>
                <FontAwesomeIcon icon={isCurrentSongDownloaded ? faCheckCircle : faDownload} />
            </CustomControlButton>
             <CustomControlButton onClick={() => setIsPlaying(!isPlaying)} disabled={!currentTrack} style={{fontSize: '1.8rem', color: 'white'}}>
                <FontAwesomeIcon icon={isPlaying ? 'pause' : 'play'} />
            </CustomControlButton>
        </MobileControls>

        {/* Desktop-only extra controls */}
        <CustomControlsContainer>
            <CustomControlButton onClick={toggleShuffle} $isActive={isShuffling} aria-label="Shuffle" disabled={!currentTrack}>
                <FontAwesomeIcon icon={faRandom} />
            </CustomControlButton>
            <CustomControlButton onClick={handleLyricsClick} aria-label="Show Lyrics" disabled={!currentTrack}>
                <FontAwesomeIcon icon={faQuoteRight} />
            </CustomControlButton>
            <CustomControlButton onClick={togglePlayerView} aria-label="Toggle Player View" disabled={!currentTrack}>
              <FontAwesomeIcon icon={isPlayerViewOpen ? faCompress : faExpand} />
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
