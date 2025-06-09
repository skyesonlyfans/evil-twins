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

  @media (max-width: 768px) {
    /* For now, we'll hide it on mobile. We can add a toggle button later. */
    display: none;
  }
`;

const SidebarLogo = styled.h1`
  font-family: ${({ theme }) => theme.fonts.logo};
  font-size: 2.5rem;
  font-weight: normal;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
  text-align: center;
  letter-spacing: 1.5px;
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
      <SidebarLogo>EvilTwins</SidebarLogo>
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
