import React from 'react';
import styled, { css } from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faBook, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

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
  overflow-y: auto;
  
  /* Mobile-specific overlay styles */
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
  flex-grow: 1;
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

  &:hover, &.active {
    color: ${({ theme }) => theme.colors.text};
  }

  svg { width: 24px; text-align: center; }
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
  margin-top: auto;
  padding: 12px 0;

  &:hover { color: ${({ theme }) => theme.colors.text}; }

  svg { width: 24px; text-align: center; }
`;

// The Sidebar now accepts props to control its mobile state
const Sidebar = ({ isMobileOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <>
      {isMobileOpen && <Backdrop onClick={onClose} />}
      <SidebarContainer $isMobileOpen={isMobileOpen}>
        <SidebarLogo>Evil Twins</SidebarLogo>
        <NavList>
          {/* When a link is clicked, close the mobile menu */}
          <StyledNavLink to="/" end onClick={onClose}>
            <FontAwesomeIcon icon={faHome} />
            Home
          </StyledNavLink>
          <StyledNavLink to="/search" onClick={onClose}>
            <FontAwesomeIcon icon={faSearch} />
            Search
          </StyledNavLink>
          <StyledNavLink to="/library" onClick={onClose}>
            <FontAwesomeIcon icon={faBook} />
            Your Library
          </StyledNavLink>
        </NavList>
        <LogoutButton onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          Log Out
        </LogoutButton>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
