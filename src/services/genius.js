import axios from 'axios';

// A more efficient and direct approach using a public lyrics API.
// This avoids scraping and the unreliable CORS proxy.
const LYRICS_API_BASE_URL = 'https://api.lyrics.ovh/v1';

/**
 * Fetches lyrics for a given song and artist using a direct lyrics API.
 * @param {object} song The song object with title and artist.
 * @returns {Promise<string|null>} A promise that resolves to the lyrics text, or null on failure.
 */
export const getLyrics = async (song) => {
    if (!song || !song.artist || !song.title) {
        return null;
    }
    
    console.log(`Fetching lyrics for "${song.title}" by ${song.artist}`);
    
    try {
        const response = await axios.get(`${LYRICS_API_BASE_URL}/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`);
        
        if (response.data.lyrics) {
            // The API returns lyrics with \n\n for paragraphs, let's make it single newlines.
            return response.data.lyrics.replace(/\n\n/g, '\n');
        } else {
            return "No lyrics found for this song.";
        }
    } catch (error) {
        console.error('Error fetching lyrics from API:', error.response?.data?.error || error.message);
        return `Lyrics for "${song.title}" could not be found.`;
    }
}

// The old functions for scraping Genius are no longer needed with this more efficient method.
// We are removing findBestGeniusUrl, getSongById, and searchForSong.
