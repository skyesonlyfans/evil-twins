import React, { useEffect, useRef, useState } from 'react';
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
  opacity: 0; /* Start hidden until position is calculated */
  transition: opacity 0.1s ease-in-out;

  &.visible {
    opacity: 1;
  }
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
  const [calculatedPosition, setCalculatedPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

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

  // Calculate position after menu is rendered
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menuWidth = menuRef.current.offsetWidth;
      const menuHeight = menuRef.current.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      // If menu overflows horizontally, flip it to the left of the cursor
      if (x + menuWidth > windowWidth) {
        x = x - menuWidth;
      }

      // If menu overflows vertically, align its bottom with the cursor
      if (y + menuHeight > windowHeight) {
        y = y - menuHeight;
      }
      
      setCalculatedPosition({ x, y });
      setIsVisible(true); // Make it visible after position is calculated
    } else {
      setIsVisible(false);
    }
  }, [isOpen, position]);


  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <MenuContainer 
        ref={menuRef} 
        position={calculatedPosition} 
        className={isVisible ? 'visible' : ''}
      >
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
