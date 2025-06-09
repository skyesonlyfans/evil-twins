import axios from 'axios';

const LRC_API_BASE_URL = 'https://lrclib.net/api/get';

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
 * @param {object} song The song object with title, artist, albumName, and duration.
 * @returns {Promise<{synced: Array, plain: string}|null>} A promise that resolves to an object with synced and plain lyrics.
 */
export const getLyrics = async (song) => {
    if (!song) return null;

    try {
        const response = await axios.get(LRC_API_BASE_URL, {
            params: {
                track_name: song.title,
                artist_name: song.artist,
                album_name: song.albumName || '', // albumName is optional but helps
                duration: Math.round(song.duration)
            }
        });

        const data = response.data;
        if (data && (data.syncedLyrics || data.plainLyrics)) {
            return {
                synced: data.syncedLyrics ? parseLRC(data.syncedLyrics) : null,
                plain: data.plainLyrics || "No plain lyrics available."
            };
        }
        return null; // No lyrics found

    } catch (error) {
        console.error("Error fetching lyrics from lrclib.net:", error);
        return null;
    }
};
