import React from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faBook, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const SidebarContainer = styled.div`
  width: 240px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden; /* Prevent content from spilling out */

  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarLogo = styled.h1`
  font-family: ${({ theme }) => theme.fonts.logo};
  font-size: clamp(1.8rem, 12vw, 2.2rem); /* Responsive font size */
  font-weight: normal;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 2rem 0;
  text-align: center;
  letter-spacing: 1px;
  line-height: 1.1;
  word-break: break-word; /* Allow the word to break if needed */
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

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &.active {
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    width: 24px;
    text-align: center;
  }
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

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    width: 24px;
    text-align: center;
  }
`;

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch {
      alert('Failed to log out');
    }
  }

  return (
    <SidebarContainer>
      <SidebarLogo>Evil Twins</SidebarLogo>
      <NavList>
        <StyledNavLink to="/" end>
          <FontAwesomeIcon icon={faHome} />
          Home
        </StyledNavLink>
        <StyledNavLink to="/search">
          <FontAwesomeIcon icon={faSearch} />
          Search
        </StyledNavLink>
        <StyledNavLink to="/library">
          <FontAwesomeIcon icon={faBook} />
          Your Library
        </StyledNavLink>
      </NavList>
      <LogoutButton onClick={handleLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} />
        Log Out
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;
