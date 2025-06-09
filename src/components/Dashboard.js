import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';

import { PlayerProvider, usePlayer } from '../contexts/PlayerContext';
import Sidebar from './Sidebar';
import Player from './Player';
import PlayerView from './PlayerView';
import Header from './Header'; // <-- Import the new Header

const AppLayout = styled.div`
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    "sidebar main"
    "player player";
  overflow: hidden;

  @media (max-width: 768px) {
    /* On mobile, the sidebar is a fixed overlay, so we simplify the grid */
    grid-template-columns: 1fr;
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
    /* This wrapper is part of the grid, but the sidebar inside becomes fixed */
    grid-area: unset;
  }
`;

const PlayerWrapper = styled.div`
  grid-area: player;
`;

const AppContent = () => {
    const { isPlayerViewOpen } = usePlayer();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    return (
        <>
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
                    {/* Nested pages from App.js will render here */}
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
      <AppContent />
    </PlayerProvider>
  );
};

export default Dashboard;
