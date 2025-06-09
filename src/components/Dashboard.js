import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faBook, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

// Data will be imported from here in the next step
import { albums } from '../db/songs';

// STYLED COMPONENTS (Layout)
const DashboardContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  background: linear-gradient(to bottom, #222, #121212);

  &::-webkit-scrollbar {
    width: 12px;
  }
  &::-webkit-scrollbar-track {
    background: #000;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #555;
    border-radius: 20px;
    border: 3px solid #000;
  }
`;

// SIDEBAR SUB-COMPONENT
const SidebarContainer = styled.div`
  width: 240px;
  background-color: #000;
  color: #b3b3b3;
  display: flex;
  flex-direction: column;
  padding: 24px;
`;

const SidebarLogo = styled.h1`
  font-size: 2rem;
  font-weight: 900;
  color: #1DB954;
  margin-bottom: 2rem;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  flex-grow: 1;
`;

const NavItem = styled.li`
  padding: 10px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: bold;
  transition: color 0.2s;

  &:hover, &.active {
    color: #fff;
  }
`;

const LogoutButton = styled(NavItem)`
    margin-top: auto;
    color: #b3b3b3;
    &:hover {
        color: #fff;
    }
`;


const Sidebar = ({ onLogout }) => (
  <SidebarContainer>
    <SidebarLogo>EvilTwins</SidebarLogo>
    <NavList>
      <NavItem className="active"><FontAwesomeIcon icon={faHome} /> Home</NavItem>
      <NavItem><FontAwesomeIcon icon={faSearch} /> Search</NavItem>
      <NavItem><FontAwesomeIcon icon={faBook} /> Your Library</NavItem>
    </NavList>
    <LogoutButton onClick={onLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
    </LogoutButton>
  </SidebarContainer>
);

// MAINVIEW SUB-COMPONENT
const AlbumGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 24px;
`;

const AlbumCard = styled.div`
    background-color: #181818;
    border-radius: 8px;
    padding: 16px;
    transition: background-color 0.3s;
    cursor: pointer;

    &:hover {
        background-color: #282828;
    }
`;

const AlbumCover = styled.img`
    width: 100%;
    border-radius: 4px;
    margin-bottom: 12px;
`;

const AlbumTitle = styled.h3`
    color: #fff;
    font-size: 1rem;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const SongList = styled.ul`
    list-style: none;
    margin-top: 10px;
`;

const SongItem = styled.li`
    padding: 8px 0;
    color: #b3b3b3;
    transition: color 0.2s;

    &:hover {
        color: #fff;
    }
`;


const MainView = ({ onSongSelect }) => (
  <MainContent>
    <h2>All Music</h2>
    <AlbumGrid>
      {albums.map((album) => (
        <AlbumCard key={album.id}>
          <AlbumCover src={album.cover} alt={album.title} />
          <AlbumTitle>{album.title}</AlbumTitle>
          <SongList>
            {album.songs.map((song) => (
              <SongItem key={song.id} onClick={() => onSongSelect(song)}>
                {song.title}
              </SongItem>
            ))}
          </SongList>
        </AlbumCard>
      ))}
    </AlbumGrid>
  </MainContent>
);


// PLAYER SUB-COMPONENT
const PlayerContainer = styled.div`
    .rhap_container {
        background-color: #181818;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.5);
    }
    .rhap_progress-indicator, .rhap_volume-indicator {
        background: #1DB954;
    }
    .rhap_progress-filled {
        background-color: #1DB954;
    }
    .rhap_time, .rhap_main-controls-button, .rhap_volume-button {
        color: #b3b3b3;
    }
    .rhap_main-controls-button:hover, .rhap_volume-button:hover {
        color: #fff;
    }
`;

const Player = ({ currentTrack }) => {
    if (!currentTrack) return null;

    return (
        <PlayerContainer>
            <AudioPlayer
                autoPlay
                src={currentTrack.url}
                header={`${currentTrack.title} - ${currentTrack.artist}`}
                showSkipControls={true}
                showJumpControls={false}
            />
        </PlayerContainer>
    );
}

// DASHBOARD COMPONENT (Main Export)
export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentTrack, setCurrentTrack] = useState(null);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch {
      alert('Failed to log out');
    }
  }
  
  const handleSongSelect = (song) => {
    setCurrentTrack(song);
  };

  useEffect(() => {
    // Set the first song of the first album as the default track on load
    if (albums.length > 0 && albums[0].songs.length > 0) {
      setCurrentTrack(albums[0].songs[0]);
    }
  }, []);


  return (
    <DashboardContainer>
      <Body>
        <Sidebar onLogout={handleLogout} />
        <MainView onSongSelect={handleSongSelect} />
      </Body>
      <Player currentTrack={currentTrack} />
    </DashboardContainer>
  );
}
