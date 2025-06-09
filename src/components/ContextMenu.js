import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 1010; /* Must be higher than other elements */
`;

const MenuContainer = styled.div.attrs(props => ({
  style: {
    top: `${props.position.y}px`,
    left: `${props.position.x}px`,
  },
}))`
  position: absolute;
  min-width: 180px;
  background-color: #282828;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  padding: 5px;
  z-index: 1020;
`;

const MenuItem = styled.button`
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 12px 15px;
  text-align: left;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHighlight};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ContextMenu = ({ isOpen, onClose, position, menuItems }) => {
  const menuRef = useRef(null);

  // Close menu if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <MenuContainer ref={menuRef} position={position}>
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={(e) => {
              e.stopPropagation(); // Prevent overlay click from firing
              item.onClick();
              onClose();
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </MenuContainer>
    </Overlay>
  );
};

export default ContextMenu;
