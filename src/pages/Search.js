import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePlayer } from '../contexts/PlayerContext';
import ContextMenu from '../components/ContextMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

const PageContainer = styled.div`
  padding: 24px 32px;
`;

const SearchInputContainer = styled.div`
  position: relative;
  margin-bottom: 32px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 20px;
  background-color: ${({ theme }) => theme.colors.surfaceHighlight};
  border: 2px solid transparent;
  border-radius: 500px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  font-family: ${({ theme }) => theme.fonts.main};
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SongRow = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr 50px;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  color: ${({ theme, $isPlaying }) => $isPlaying ? theme.colors.primary : 'inherit'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHighlight};
    .song-action-icon {
        opacity: 1;
    }
  }
`;

const SongCover = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
`;

const SongInfo = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

const SongTitle = styled.p`
  font-weight: 500;
  color: ${({ theme, $isPlaying }) => $isPlaying ? theme.colors.primary : theme.colors.text};
`;

const SongArtist = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0;
  font-size: 1rem;
  cursor: pointer;

  &.song-action-icon:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  ${SongRow}:hover & {
    opacity: 1;
  }
`;

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [menuState, setMenuState] = useState({ isOpen: false, x: 0, y: 0, song: null });
  
  const { allSongs, playAlbum, currentTrack, addToQueue, playSongNext } = usePlayer();

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const lowercasedQuery = query.toLowerCase();
    const filteredResults = allSongs.filter(song => 
      song.title.toLowerCase().includes(lowercasedQuery) || 
      song.artist.toLowerCase().includes(lowercasedQuery)
    );
    setResults(filteredResults);

  }, [query, allSongs]);

  const handlePlayTrack = (songToPlay) => {
    const songIndex = allSongs.findIndex(song => song.id === songToPlay.id);
    if (songIndex !== -1) {
      playAlbum(allSongs, songIndex);
    }
  };

  const handleOpenMenu = (event, song) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuState({
      isOpen: true,
      x: event.pageX,
      y: event.pageY,
      song: song,
    });
  };

  const handleCloseMenu = () => {
    setMenuState({ ...menuState, isOpen: false });
  };
  
  const menuItems = menuState.song ? [
    { label: 'Add to Queue', onClick: () => addToQueue(menuState.song) },
    { label: 'Play Next', onClick: () => playSongNext(menuState.song) },
  ] : [];

  return (
    <PageContainer>
      <ContextMenu isOpen={menuState.isOpen} onClose={handleCloseMenu} position={menuState} menuItems={menuItems} />
      <SearchInputContainer>
        <SearchInput
          type="text"
          placeholder="What do you want to listen to?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </SearchInputContainer>
      <ResultsContainer>
        {results.map(song => (
          <SongRow 
            key={song.id} 
            $isPlaying={currentTrack?.id === song.id}
          >
            <div onClick={() => handlePlayTrack(song)} style={{display: 'contents', cursor: 'pointer'}}>
              <SongCover src={song.cover} alt={song.title} />
              <SongInfo>
                <SongTitle $isPlaying={currentTrack?.id === song.id}>{song.title}</SongTitle>
                <SongArtist>{song.artist}</SongArtist>
              </SongInfo>
            </div>
            <MenuButton className="song-action-icon" onClick={(e) => handleOpenMenu(e, song)}>
              <FontAwesomeIcon icon={faEllipsisV} />
            </MenuButton>
          </SongRow>
        ))}
      </ResultsContainer>
    </PageContainer>
  );
};

export default Search;
