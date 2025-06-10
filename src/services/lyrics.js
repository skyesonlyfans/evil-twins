import axios from 'axios';

const LRC_API_BASE_URL = 'https://lrclib.net/api';

/**
 * Parses a standard LRC format string into an array of timed lyric objects.
 * @param {string} lrcText The LRC formatted text.
 * @returns {Array<{time: number, text: string}>}
 */
const parseLRC = (lrcText) => {
    const lines = lrcText.split('\n');
    const lyrics = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

    for (const line of lines) {
        const match = line.match(timeRegex);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const milliseconds = parseInt(match[3], 10);
            const text = match[4].trim();

            const time = minutes * 60 + seconds + milliseconds / 1000;
            if(text) {
                lyrics.push({ time, text });
            }
        }
    }
    return lyrics;
};


/**
 * Fetches lyrics for a given song using the lrclib.net API.
 * It first tries a precise match and falls back to a broader search.
 * @param {object} song The song object with title, artist, albumName.
 * @param {number} duration The duration of the song in seconds.
 * @returns {Promise<{synced: Array, plain: string}|null>} A promise that resolves to an object with synced and plain lyrics.
 */
export const getLyrics = async (song, duration) => {
    if (!song) return null;

    try {
        // First, try to get a perfect match with all metadata
        let response = await axios.get(`${LRC_API_BASE_URL}/get`, {
            params: {
                track_name: song.title,
                artist_name: song.artist,
                album_name: song.albumName || '',
                duration: Math.round(duration)
            }
        });

        // If a perfect match is found and has lyrics, return it
        if (response.data && (response.data.syncedLyrics || response.data.plainLyrics)) {
            return {
                synced: response.data.syncedLyrics ? parseLRC(response.data.syncedLyrics) : null,
                plain: response.data.plainLyrics || "No plain lyrics available."
            };
        }
        
        // --- Fallback to Search API if no perfect match ---
        console.log("No perfect lyric match found, falling back to search API.");
        response = await axios.get(`${LRC_API_BASE_URL}/search`, {
            params: {
                track_name: song.title,
                artist_name: song.artist
            }
        });

        // If the search returns results, take the first one
        if (response.data && response.data.length > 0) {
            const firstResult = response.data[0];
            console.log("Found lyrics via search:", firstResult);
            return {
                synced: firstResult.syncedLyrics ? parseLRC(firstResult.syncedLyrics) : null,
                plain: firstResult.plainLyrics || "No plain lyrics available."
            };
        }

        return null; // No lyrics found after trying both methods

    } catch (error) {
        console.error("Error fetching lyrics from lrclib.net:", error);
        return null;
    }
};
