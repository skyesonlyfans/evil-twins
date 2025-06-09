import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const HeaderContainer = styled.header`
  padding: 15px 32px;
  display: none; /* Hidden by default on desktop */

  @media (max-width: 768px) {
    display: flex; /* Only visible on mobile */
    align-items: center;
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1100; /* Needs to be on top of content */

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Header = ({ onMenuClick }) => {
  return (
    <HeaderContainer>
      <MenuButton onClick={onMenuClick} aria-label="Open navigation menu">
        <FontAwesomeIcon icon={faBars} />
      </MenuButton>
    </HeaderContainer>
  );
};

export default Header;
