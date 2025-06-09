import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { AuthProvider } from './contexts/AuthContext';
import { DownloadProvider } from './contexts/DownloadContext';
import { GlobalStyle, theme } from './styles/GlobalStyle';

import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Albums from './pages/Albums';
import AlbumDetail from './pages/AlbumDetail';
import Search from './pages/Search';
import Library from './pages/Library';
import PlaylistDetail from './pages/PlaylistDetail'; // Import new page
import Queue from './pages/Queue'; // Import new page

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <DownloadProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            >
              {/* These are the nested pages that will appear inside the Dashboard */}
              <Route index element={<Albums />} />
              <Route path="album/:albumId" element={<AlbumDetail />} />
              <Route path="search" element={<Search />} />
              <Route path="library" element={<Library />} />
              <Route path="playlist/:playlistId" element={<PlaylistDetail />} /> {/* Add new route */}
              <Route path="queue" element={<Queue />} /> {/* Add new route */}
            </Route>
          </Routes>
        </DownloadProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
