import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';

import { PlayerProvider, usePlayer } from '../contexts/PlayerContext';
import Sidebar from './Sidebar';
import Player from './Player';
import PlayerView from './PlayerView';

const AppLayout = styled.div`
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-rows: 1fr auto; /* Content grows, player is fixed height */
  grid-template-columns: auto 1fr; /* Sidebar is fixed width, content grows */
  grid-template-areas:
    "sidebar main"
    "player player";
  overflow: hidden;
`;

const MainContent = styled.main`
  grid-area: main;
  overflow-y: auto;
  background: linear-gradient(to bottom, #222, #121212 40%);
`;

const SidebarWrapper = styled.div`
  grid-area: sidebar;
`;

const PlayerWrapper = styled.div`
  grid-area: player;
`;

// A small component to consume the context and decide what to show.
// This prevents the main Dashboard from re-rendering every time the player state changes.
const AppContent = () => {
    const { isPlayerViewOpen } = usePlayer();

    return (
        <>
            {isPlayerViewOpen && <PlayerView />}
            <AppLayout>
                <SidebarWrapper>
                    <Sidebar />
                </SidebarWrapper>

                <MainContent>
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
