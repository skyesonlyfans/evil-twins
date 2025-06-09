import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { usePlayer } from '../contexts/PlayerContext';
import { findBestGeniusUrl, getLyrics } from '../services/genius';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faStepBackward, faStepForward, faPause, faPlay, faRandom } from '@fortawesome/free-solid-svg-icons';

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
  padding: 20px; /* Add padding for smaller screens */
  
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
    filter: blur(30px) brightness(0.4);
    transform: scale(1.1);
    z-index: -1;
  }
`;

const PlayerViewContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
  height: 100%;
  max-width: 90vh; /* Max-width is now tied to the viewport height */
  max-height: 90vh; /* Max-height to ensure it fits */
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
  z-index: 10;
`;

const ArtAndControls = styled.div`
  flex-shrink: 0; /* Prevent this from shrinking weirdly */
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-bottom: 2vh;
`;

const AlbumArtLarge = styled.img`
  width: 100%;
  max-width: 45vh; /* Size relative to viewport height */
  height: auto;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  margin-bottom: 3vh;
`;

const TrackInfo = styled.div`
  text-align: center;
  width: 100%;
  margin-bottom: 2vh;
`;

const TrackTitleLarge = styled.h1`
  font-size: clamp(1.5rem, 4vw, 2.5rem); /* Responsive font size */
  font-weight: 900;
  margin: 0 0 10px 0;
`;

const TrackArtistLarge = styled.h2`
  font-size: clamp(1rem, 2.5vw, 1.5rem); /* Responsive font size */
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 2vh;
`;

const TimeText = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 40px;
`;

const SeekBar = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: #4d4d4d;
  border-radius: 5px;
  outline: none;
  transition: background 0.2s;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
  }
  &:hover { background: ${({ theme }) => theme.colors.primary}; }
`;

const ControlsContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-around;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme, $isActive }) => $isActive ? theme.colors.primary : theme.colors.textSecondary};
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { color: white; transform: scale(1.1); }
`;

const PlayPauseButton = styled(ControlButton)`
  background-color: white;
  color: black;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  font-size: 2rem;
  &:hover { color: black; transform: scale(1.05); }
`;

// Note: No changes to LyricsPanel or LyricsContainer needed for this fix.
const LyricsPanel = styled.div`
  /* ... existing styles ... */
`;
const LyricsContainer = styled.div`
  /* ... existing styles ... */
`;


const PlayerView = () => {
  // All logic and functions remain the same, only styled-components were changed.
  const { 
    currentTrack, isPlaying, isShuffling, duration, currentTime,
    setIsPlaying, playNext, playPrevious, toggleShuffle, togglePlayerView, seek 
  } = usePlayer();
  const [lyrics, setLyrics] = useState('');
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(true);
  const lyricsRef = useRef(null);

  useEffect(() => {
    if (!currentTrack) return;
    const fetchLyricsData = async () => {
      setIsLoadingLyrics(true);
      setLyrics('');
      const url = await findBestGeniusUrl(currentTrack);
      if (url) {
        const scrapedLyrics = await getLyrics(url);
        setLyrics(scrapedLyrics || 'Lyrics not available for this track.');
      } else {
        setLyrics('Could not find this song on Genius.');
      }
      setIsLoadingLyrics(false);
    };
    fetchLyricsData();
  }, [currentTrack]);

  useEffect(() => {
    if (duration > 0 && lyricsRef.current) {
      const scrollPercent = currentTime / duration;
      const scrollHeight = lyricsRef.current.scrollHeight - lyricsRef.current.clientHeight;
      lyricsRef.current.scrollTop = scrollHeight * scrollPercent;
    }
  }, [currentTime, duration]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <PlayerViewOverlay bgImage={currentTrack.cover}>
      <CloseButton onClick={togglePlayerView} aria-label="Minimize Player">
        <FontAwesomeIcon icon={faChevronDown} />
      </CloseButton>
      <PlayerViewContent>
        {/* The JSX structure remains the same, but will be sized correctly by the new styles */}
        <ArtAndControls>
            <AlbumArtLarge src={currentTrack.cover} alt={currentTrack.title} />
            <TrackInfo>
                <TrackTitleLarge>{currentTrack.title}</TrackTitleLarge>
                <TrackArtistLarge>{currentTrack.artist}</TrackArtistLarge>
            </TrackInfo>
            <ProgressBarContainer>
                <TimeText>{formatTime(currentTime)}</TimeText>
                <SeekBar type="range" min="0" max={duration || 0} value={currentTime} onChange={(e) => seek(e.target.value)} />
                <TimeText>{formatTime(duration)}</TimeText>
            </ProgressBarContainer>
            <ControlsContainer>
                <ControlButton onClick={toggleShuffle} $isActive={isShuffling} aria-label="Shuffle">
                    <FontAwesomeIcon icon={faRandom} />
                </ControlButton>
                <ControlButton onClick={playPrevious} aria-label="Previous Song">
                    <FontAwesomeIcon icon={faStepBackward} />
                </ControlButton>
                <PlayPauseButton onClick={() => setIsPlaying(!isPlaying)} aria-label={isPlaying ? "Pause" : "Play"}>
                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                </PlayPauseButton>
                <ControlButton onClick={playNext} aria-label="Next Song">
                    <FontAwesomeIcon icon={faStepForward} />
                </ControlButton>
                <ControlButton style={{opacity: 0, cursor: 'default'}}>
                    <FontAwesomeIcon icon={faRandom} />
                </ControlButton>
            </ControlsContainer>
        </ArtAndControls>
        <LyricsPanel>
          <LyricsContainer ref={lyricsRef}>
            {isLoadingLyrics ? 'Loading lyrics...' : <div dangerouslySetInnerHTML={{ __html: lyrics }} />}
          </LyricsContainer>
        </LyricsPanel>
      </PlayerViewContent>
    </PlayerViewOverlay>
  );
};

export default PlayerView;
