import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePlaylists } from '../contexts/PlaylistContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faBook, faSignOutAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import CreatePlaylistModal from './CreatePlaylistModal'; // <-- Uncommented this import

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 1150;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const SidebarContainer = styled.div`
  width: 240px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow-y: hidden;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 1200;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;

    ${({ $isMobileOpen }) => $isMobileOpen && css`
      transform: translateX(0);
    `}
  }
`;

const SidebarLogo = styled.h1`
  font-family: ${({ theme }) => theme.fonts.logo};
  font-size: clamp(1.8rem, 12vw, 2.2rem);
  font-weight: normal;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 2rem 0;
  text-align: center;
  letter-spacing: 1px;
  line-height: 1.1;
  word-break: break-word;
`;

const NavList = styled.nav`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 0.2s ease-in-out;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover, &.active {
    color: ${({ theme }) => theme.colors.text};
  }

  svg { width: 24px; text-align: center; }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #282828;
  margin: 16px 0;
`;

const PlaylistsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
`;

const PlaylistsTitle = styled.h2`
  font-size: 1rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`;

const CreatePlaylistButton = styled.button`
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.2rem;
    cursor: pointer;
    &:hover { color: white; }
`;

const PlaylistScrollArea = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background-color: #434343; border-radius: 4px; }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 0.2s ease-in-out;
  padding: 12px 0;
  margin-top: 16px;

  &:hover { color: ${({ theme }) => theme.colors.text}; }

  svg { width: 24px; text-align: center; }
`;

const Sidebar = ({ isMobileOpen, onClose }) => {
  const { logout } = useAuth();
  const { playlists, loadingPlaylists } = usePlaylists();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // <-- Uncommented this state

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <>
      <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} /> {/* <-- Uncommented this component */}
      {isMobileOpen && <Backdrop onClick={onClose} />}
      <SidebarContainer $isMobileOpen={isMobileOpen}>
        <SidebarLogo>Evil Twins</SidebarLogo>
        <NavList>
          <StyledNavLink to="/" end onClick={onClose}>
            <FontAwesomeIcon icon={faHome} /> Home
          </StyledNavLink>
          <StyledNavLink to="/search" onClick={onClose}>
            <FontAwesomeIcon icon={faSearch} /> Search
          </StyledNavLink>
          <StyledNavLink to="/library" onClick={onClose}>
            <FontAwesomeIcon icon={faBook} /> Your Library
          </StyledNavLink>
        </NavList>
        <Divider />
        <PlaylistsHeader>
            <PlaylistsTitle>Playlists</PlaylistsTitle>
            <CreatePlaylistButton aria-label="Create new playlist" onClick={() => setIsModalOpen(true)}> {/* <-- Uncommented onClick */}
                <FontAwesomeIcon icon={faPlus} />
            </CreatePlaylistButton>
        </PlaylistsHeader>
        <PlaylistScrollArea>
          {loadingPlaylists ? <p>Loading...</p> : playlists.map(playlist => (
            <StyledNavLink key={playlist.id} to={`/playlist/${playlist.id}`} onClick={onClose}>
              {playlist.name}
            </StyledNavLink>
          ))}
        </PlaylistScrollArea>
        <LogoutButton onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          Log Out
        </LogoutButton>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
