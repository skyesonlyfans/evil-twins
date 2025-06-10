import axios from 'axios';
import { getLyricsFromDB, addLyricsToDB } from '../utils/db';

const LRC_API_BASE_URL = 'https://lrclib.net/api';

/**
 * Parses a standard LRC format string into an array of timed lyric objects.
 * @param {string} lrcText The LRC formatted text.
 * @returns {Array<{time: number, text: string}>}
 */
const parseLRC = (lrcText) => {
    if (!lrcText) return null;
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
            if (text) {
                lyrics.push({ time, text });
            }
        }
    }
    return lyrics.length > 0 ? lyrics : null;
};

/**
 * Fetches lyrics by first checking a local cache, then making a precise API call,
 * and finally falling back to a broader search.
 * @param {object} song The song object.
 * @param {number} duration The duration of the song in seconds.
 * @returns {Promise<{synced: Array, plain: string}|null>}
 */
export const getLyrics = async (song, duration) => {
    if (!song) return null;

    // 1. Check local cache (IndexedDB) first
    const cachedLyrics = await getLyricsFromDB(song.id);
    if (cachedLyrics) {
        console.log(`Found lyrics for "${song.title}" in cache.`);
        return {
            plain: cachedLyrics.plainLyrics || "No plain lyrics available.",
            synced: parseLRC(cachedLyrics.syncedLyrics)
        };
    }

    console.log(`No cache for "${song.title}", fetching from lrclib.net...`);

    try {
        // 2. Try for a precise match on the API
        let response = await axios.get(`${LRC_API_BASE_URL}/get`, {
            params: {
                track_name: song.title,
                artist_name: song.artist,
                album_name: song.albumName || '',
                duration: Math.round(duration)
            }
        });

        if (response.data && (response.data.syncedLyrics || response.data.plainLyrics)) {
            console.log(`Found precise lyric match for "${song.title}".`);
            await addLyricsToDB(song.id, response.data); // Cache the raw API response
            return {
                plain: response.data.plainLyrics,
                synced: parseLRC(response.data.syncedLyrics)
            };
        }

        // 3. If no precise match, fall back to the search API
        console.log(`No precise match, falling back to search for "${song.title}".`);
        response = await axios.get(`${LRC_API_BASE_URL}/search`, {
            params: {
                track_name: song.title,
                artist_name: song.artist
            }
        });

        if (response.data && response.data.length > 0) {
            const bestMatch = response.data[0]; // Use the first result as the "best match"
            console.log(`Found best match via search: "${bestMatch.trackName}"`);
            await addLyricsToDB(song.id, bestMatch); // Cache the raw API response from the search
            return {
                plain: bestMatch.plainLyrics || "No plain lyrics available.",
                synced: parseLRC(bestMatch.syncedLyrics)
            };
        }

        console.log(`Could not find any lyrics for "${song.title}" on lrclib.net.`);
        return null;

    } catch (error) {
        console.error("Error fetching lyrics from lrclib.net:", error);
        return null;
    }
};
