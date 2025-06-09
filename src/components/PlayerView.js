import React, { useState, useEffect } from 'react';
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
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5vw;
  color: ${({ theme }) => theme.colors.text};
  padding: 80px 5vw;
  width: 100%;
  height: 100%;

  @media (max-width: 1024px) {
    flex-direction: column;
    justify-content: flex-start;
    padding: 80px 20px 20px 20px;
    gap: 40px;
    overflow-y: auto;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 500px;
`;

const AlbumArtLarge = styled.img`
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  margin-bottom: 40px;
`;

const TrackInfo = styled.div`
  text-align: center;
  width: 100%;
`;

const TrackTitleLarge = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0 0 10px 0;
`;

const TrackArtistLarge = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 40px 0;
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

const LyricsPanel = styled.div`
  flex: 1;
  height: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 2;
  
  p {
    margin: 0;
  }
  
  @media (max-width: 1024px) {
    height: auto;
    min-height: 200px;
  }
`;

const LyricsContainer = styled.div`
  overflow-y: auto;
  padding-right: 15px;
  text-align: left;
  
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background-color: #555; border-radius: 20px; }
`;


const PlayerView = () => {
  const { 
    currentTrack, isPlaying, isShuffling,
    setIsPlaying, playNext, playPrevious, toggleShuffle, togglePlayerView 
  } = usePlayer();

  const [lyrics, setLyrics] = useState('');
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(true);

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
            <ControlButton style={{opacity: 0, cursor: 'default'}}> {/* Placeholder for balance */}
                <FontAwesomeIcon icon={faRandom} />
            </ControlButton>
          </ControlsContainer>
        </ArtAndControls>

        <LyricsPanel>
          <LyricsContainer>
            {isLoadingLyrics ? 'Loading lyrics...' : <div dangerouslySetInnerHTML={{ __html: lyrics }} />}
          </LyricsContainer>
        </LyricsPanel>
        
      </PlayerViewContent>
    </PlayerViewOverlay>
  );
};

export default PlayerView;
