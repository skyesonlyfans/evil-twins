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
  flex-direction: column; /* Changed to column */
  align-items: center;
  justify-content: center;
  padding: 20px;
  
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
  flex-direction: row; /* Changed to row for side-by-side on desktop */
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
  height: 100%;
  max-width: 90vw;
  max-height: 90vh;
  gap: 4vw;

  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 100%;
    max-height: 100%;
    gap: 2vh;
  }
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
  flex: 1; /* Takes up half the space */
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
`;

const AlbumArtLarge = styled.img`
  width: 100%;
  max-width: 45vh; 
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
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 900;
  margin: 0 0 10px 0;
`;

const TrackArtistLarge = styled.h2`
  font-size: clamp(1rem, 2.5vw, 1.5rem);
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

const LyricsPanel = styled.div`
  flex: 1; /* Takes up the other half */
  height: 80%;
  width: 100%;
  max-width: 500px;
  background: rgba(0,0,0,0.3);
  border-radius: 12px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 40%; /* Takes up less height on mobile */
  }
`;

const LyricsContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  text-align: center;
  font-size: clamp(1.1rem, 3vw, 1.5rem);
  line-height: 2;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.textSecondary};
  scroll-behavior: smooth; /* Smooth scrolling */

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
    border: 3px solid transparent;
  }
`;


const PlayerView = () => {
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
      try {
        const url = await findBestGeniusUrl(currentTrack);
        if (url) {
          const scrapedLyrics = await getLyrics(url);
          setLyrics(scrapedLyrics || 'Lyrics not available for this track.');
        } else {
          setLyrics('Could not find this song on Genius.');
        }
      } catch (err) {
        setLyrics('An error occurred while fetching lyrics.');
      }
      setIsLoadingLyrics(false);
    };
    fetchLyricsData();
  }, [currentTrack]);

  useEffect(() => {
    if (lyricsRef.current && duration > 0) {
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
