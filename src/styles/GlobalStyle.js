import { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    primary: '#8a2be2',      // Bright Purple (for highlights, buttons)
    primaryDark: '#7b1fa2',   // Darker Purple (for hover states)
    background: '#000000',   // Pure Black (main background)
    surface: '#121212',      // Off-Black (for cards, player)
    surfaceHighlight: '#1a1a1a', // Slightly lighter black
    text: '#ffffff',         // White
    textSecondary: '#b3b3b3',// Grey
    error: '#e91e63',        // Pink/Red for errors
  },
  fonts: {
    logo: "'Nosifer', sans-serif",
    main: "'Montserrat', sans-serif",
  }
};

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.main};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  /* Custom Scrollbar Styles */
  ::-webkit-scrollbar {
    width: 12px;
  }
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: #434343;
    border-radius: 20px;
    border: 3px solid ${({ theme }) => theme.colors.background};
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
`;
