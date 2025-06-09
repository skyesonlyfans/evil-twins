import React from 'react';
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
  z-index: 1300;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 70vh;
  position: relative;
  box-shadow: 0 5px 20px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
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

const PlaylistList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
`;

const PlaylistItem = styled.li`
  padding: 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHighlight};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const AddToPlaylistModal = ({ isOpen, onClose, songToAdd }) => {
  const { playlists, addSongToPlaylist } = usePlaylists();

  const handleSelectPlaylist = (playlistId) => {
    addSongToPlaylist(playlistId, songToAdd);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton type="button" onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faTimes} />
        </CloseButton>
        <ModalTitle>Add to Playlist</ModalTitle>
        <PlaylistList>
            {playlists.length > 0 ? (
                playlists.map(playlist => (
                    <PlaylistItem key={playlist.id} onClick={() => handleSelectPlaylist(playlist.id)}>
                        {playlist.name}
                    </PlaylistItem>
                ))
            ) : (
                <p>You don't have any playlists yet.</p>
            )}
        </PlaylistList>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddToPlaylistModal;
