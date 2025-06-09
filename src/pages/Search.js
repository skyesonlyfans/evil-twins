import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePlayer } from '../contexts/PlayerContext';

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
  grid-template-columns: 50px 1fr;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: ${({ theme, $isPlaying }) => $isPlaying ? theme.colors.primary : 'inherit'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHighlight};
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
`;

const SongTitle = styled.p`
  font-weight: 500;
  color: ${({ theme, $isPlaying }) => $isPlaying ? theme.colors.primary : theme.colors.text};
`;

const SongArtist = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { allSongs, playAlbum, currentTrack } = usePlayer();

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

  return (
    <PageContainer>
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
            onClick={() => handlePlayTrack(song)}
            $isPlaying={currentTrack?.id === song.id}
          >
            <SongCover src={song.cover} alt={song.title} />
            <SongInfo>
              <SongTitle $isPlaying={currentTrack?.id === song.id}>{song.title}</SongTitle>
              <SongArtist>{song.artist}</SongArtist>
            </SongInfo>
          </SongRow>
        ))}
      </ResultsContainer>
    </PageContainer>
  );
};

export default Search;
