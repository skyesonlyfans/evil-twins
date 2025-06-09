import React, { useState } from 'react';
import styled from 'styled-components';
import { usePlaylists } from '../contexts/PlaylistContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300; /* Higher than sidebar */
`;

const ModalContent = styled.form`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 5px 20px rgba(0,0,0,0.4);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ModalTitle = styled.h2`
  margin: 0 0 24px 0;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  margin-bottom: 20px;
  background-color: ${({ theme }) => theme.colors.surfaceHighlight};
  border: 1px solid #404040;
  border-radius: 5px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CreateButton = styled.button`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 500px;
  padding: 16px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const CreatePlaylistModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const { createPlaylist } = usePlaylists();

  const handleCreate = (e) => {
    e.preventDefault();
    if (name.trim()) {
      createPlaylist(name.trim());
      setName('');
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onSubmit={handleCreate} onClick={(e) => e.stopPropagation()}>
        <CloseButton type="button" onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faTimes} />
        </CloseButton>
        <ModalTitle>Create Playlist</ModalTitle>
        <Input 
            type="text"
            placeholder="My Awesome Playlist"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
        />
        <CreateButton type="submit">Create</CreateButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreatePlaylistModal;
