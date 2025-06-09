const DB_NAME = 'EvilTwinsDB';
const STORE_NAME = 'downloaded_songs';
const DB_VERSION = 1;
let db;

// This function initializes the database and creates the object store if needed
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject('Database error');
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('Database opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        console.log('Object store created');
      }
    };
  });
};

// Function to add a song's metadata to the database
export const addSongToDB = (song) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('DB not initialized');
      return;
    }
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(song);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject('Failed to add song: ' + event.target.error);
  });
};

// Function to get all downloaded song objects
export const getDownloadedSongs = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('DB not initialized');
      return;
    }
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject('Failed to get songs: ' + event.target.error);
  });
};

// Function to get just the IDs of all downloaded songs
export const getDownloadedSongIds = () => {
    return new Promise((resolve, reject) => {
        if (!db) {
          reject('DB not initialized');
          return;
        }
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAllKeys();
    
        request.onsuccess = () => resolve(new Set(request.result));
        request.onerror = (event) => reject('Failed to get song IDs: ' + event.target.error);
      });
}

// Function to remove a song's metadata from the database
export const removeSongFromDB = (songId) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('DB not initialized');
      return;
    }
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(songId);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject('Failed to delete song: ' + event.target.error);
  });
};
