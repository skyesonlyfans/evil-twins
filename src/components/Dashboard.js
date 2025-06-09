import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';

import { PlayerProvider, usePlayer } from '../contexts/PlayerContext';
import { PlaylistProvider } from '../contexts/PlaylistContext';
import Sidebar from './Sidebar';
import Player from './Player';
import PlayerView from './PlayerView';
import Header from './Header';

// The main grid for the entire application view
const AppLayout = styled.div`
  height: 100vh;
  width: 100vw;
  display: grid;
  // The player has a fixed height, the main content takes the rest
  grid-template-rows: 1fr auto; 
  grid-template-columns: auto 1fr;
  grid-template-areas:
    "sidebar main"
    "player player";
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    // Sidebar is no longer in the grid on mobile; it's an overlay
    grid-template-areas:
      "main"
      "player";
  }
`;

const MainContent = styled.main`
  grid-area: main;
  overflow-y: auto;
  background: linear-gradient(to bottom, #222, #121212 40%);
  display: flex;
  flex-direction: column;
`;

const SidebarWrapper = styled.div`
  grid-area: sidebar;
  
  @media (max-width: 768px) {
    /* On mobile, the sidebar is not part of the main grid flow */
    grid-area: unset;
  }
`;

const PlayerWrapper = styled.div`
  grid-area: player;
  position: relative;
  z-index: 1001; /* Ensures player is above main content */
`;

const AppContent = () => {
    const { isPlayerViewOpen } = usePlayer();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    return (
        <>
            {/* The full-screen player view remains an overlay */}
            {isPlayerViewOpen && <PlayerView />}

            <AppLayout>
                <SidebarWrapper>
                    <Sidebar 
                        isMobileOpen={isMobileNavOpen} 
                        onClose={() => setIsMobileNavOpen(false)} 
                    />
                </SidebarWrapper>

                <MainContent>
                    <Header onMenuClick={() => setIsMobileNavOpen(true)} />
                    <Outlet />
                </MainContent>

                <PlayerWrapper>
                    <Player />
                </PlayerWrapper>
            </AppLayout>
        </>
    )
}


const Dashboard = () => {
  return (
    <PlayerProvider>
      <PlaylistProvider>
        <AppContent />
      </PlaylistProvider>
    </PlayerProvider>
  );
};

export default Dashboard;
