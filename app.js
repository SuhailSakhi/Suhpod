// PWA Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}

// IndexedDB Setup for persistent storage
const DB_NAME = 'iPodDB';
const DB_VERSION = 1;
const STORE_NAME = 'mediaFiles';
let db;

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('name', 'name', { unique: false });
                objectStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

// Save file to IndexedDB
async function saveFileToDB(file, trackInfo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            const fileData = {
                name: trackInfo.name,
                type: file.type,
                data: arrayBuffer,
                isVideo: trackInfo.isVideo,
                timestamp: Date.now()
            };
            
            const request = store.add(fileData);
            
            request.onsuccess = () => {
                resolve(request.result); // Returns the ID
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        };
        
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

// Load all files from IndexedDB
async function loadFilesFromDB() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Delete file from IndexedDB
async function deleteFileFromDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Clear all files from IndexedDB
async function clearDB() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Initialize DB on load
initDB().then(() => {
    console.log('IndexedDB initialized');
    loadStoredTracks();
}).catch(err => {
    console.error('Failed to initialize IndexedDB:', err);
    alert('Failed to initialize storage. Your files may not be saved permanently.');
});

// Volume Control
let currentVolume = 0.5; // Default 50%
let volumeTimeout;

// Load saved volume from localStorage
if (localStorage.getItem('ipodVolume')) {
    currentVolume = parseFloat(localStorage.getItem('ipodVolume'));
}

// Set initial volume when media is loaded
function setInitialVolume() {
    if (state.audioElement) state.audioElement.volume = currentVolume;
    if (state.videoElement) state.videoElement.volume = currentVolume;
}

// Update volume display
function updateVolumeDisplay() {
    const percentage = Math.round(currentVolume * 100);
    elements.volumeFill.style.width = `${percentage}%`;
    elements.volumeText.textContent = `${percentage}%`;
    
    // Show volume indicator
    elements.volumeIndicator.style.display = 'flex';
    
    // Hide after 2 seconds
    clearTimeout(volumeTimeout);
    volumeTimeout = setTimeout(() => {
        elements.volumeIndicator.style.display = 'none';
    }, 2000);
}

// Volume up
elements.volumeUpBtn.addEventListener('click', () => {
    currentVolume = Math.min(1, currentVolume + 0.1);
    
    if (state.audioElement) state.audioElement.volume = currentVolume;
    if (state.videoElement) state.videoElement.volume = currentVolume;
    
    localStorage.setItem('ipodVolume', currentVolume.toString());
    updateVolumeDisplay();
});

// Volume down
elements.volumeDownBtn.addEventListener('click', () => {
    currentVolume = Math.max(0, currentVolume - 0.1);
    
    if (state.audioElement) state.audioElement.volume = currentVolume;
    if (state.videoElement) state.videoElement.volume = currentVolume;
    
    localStorage.setItem('ipodVolume', currentVolume.toString());
    updateVolumeDisplay();
});

// State
const state = {
    tracks: [],
    currentIndex: -1,
    isPlaying: false,
    audioElement: null,
    videoElement: null,
    isVideo: false,
    isLoading: false
};

// DOM Elements
const elements = {
    fileInput: document.getElementById('fileInput'),
    loadBtn: document.getElementById('loadBtn'),
    playBtn: document.getElementById('playBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    volumeUpBtn: document.getElementById('volumeUpBtn'),
    volumeDownBtn: document.getElementById('volumeDownBtn'),
    clearBtn: document.getElementById('clearBtn'),
    tracklist: document.getElementById('tracklist'),
    trackTitle: document.getElementById('trackTitle'),
    trackArtist: document.getElementById('trackArtist'),
    currentTime: document.getElementById('currentTime'),
    duration: document.getElementById('duration'),
    progressFill: document.getElementById('progressFill'),
    trackCount: document.getElementById('trackCount'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    videoContainer: document.getElementById('videoContainer'),
    videoPlayer: document.getElementById('videoPlayer'),
    volumeIndicator: document.getElementById('volumeIndicator'),
    volumeFill: document.getElementById('volumeFill'),
    volumeText: document.getElementById('volumeText')
};

// Initialize Audio Element
// iOS requires the audio element to be created in response to user interaction
// We create it on first user interaction and reuse it throughout the session
function initAudio() {
    if (!state.audioElement) {
        state.audioElement = new Audio();
        // Critical for iOS: prevents inline playback issues
        state.audioElement.preload = 'metadata';
        state.audioElement.volume = currentVolume;
        
        // Event listeners
        state.audioElement.addEventListener('timeupdate', handleTimeUpdate);
        state.audioElement.addEventListener('ended', handleTrackEnd);
        state.audioElement.addEventListener('loadedmetadata', handleMetadataLoad);
        state.audioElement.addEventListener('error', handleMediaError);
        
        // iOS specific: ensure audio continues in background
        state.audioElement.addEventListener('pause', () => {
            if (state.isPlaying) {
                // Only update UI if we intended to pause
                state.isPlaying = false;
                updatePlayPauseUI();
            }
        });
        
        state.audioElement.addEventListener('play', () => {
            state.isPlaying = true;
            updatePlayPauseUI();
        });
    }
}

// Initialize Video Element
function initVideo() {
    if (!state.videoElement) {
        state.videoElement = elements.videoPlayer;
        state.videoElement.preload = 'metadata';
        state.videoElement.controls = false;
        state.videoElement.playsInline = true;
        state.videoElement.volume = currentVolume;
        
        // Event listeners
        state.videoElement.addEventListener('timeupdate', handleTimeUpdate);
        state.videoElement.addEventListener('ended', handleTrackEnd);
        state.videoElement.addEventListener('loadedmetadata', handleMetadataLoad);
        state.videoElement.addEventListener('error', handleMediaError);
        
        state.videoElement.addEventListener('pause', () => {
            if (state.isPlaying) {
                state.isPlaying = false;
                updatePlayPauseUI();
            }
        });
        
        state.videoElement.addEventListener('play', () => {
            state.isPlaying = true;
            updatePlayPauseUI();
        });
    }
}

// Format time helper
function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// File Loading
elements.loadBtn.addEventListener('click', () => {
    elements.fileInput.click();
});

elements.fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Show loading state
    state.isLoading = true;
    elements.loadBtn.style.opacity = '0.5';
    elements.trackTitle.textContent = 'Importing files...';
    elements.trackArtist.textContent = 'Please wait';
    
    // Initialize audio/video on first file load (user interaction)
    initAudio();
    initVideo();
    
    let importedCount = 0;
    
    for (const file of files) {
        // Accept both audio and video files
        const isAudio = file.type.match(/^audio\/(mpeg|mp3|m4a|mp4)$/);
        const isVideo = file.type.match(/^video\/(mp4|m4v|quicktime)$/);
        
        if (!isAudio && !isVideo) continue;
        
        const trackInfo = {
            name: file.name.replace(/\.(mp3|m4a|mp4|m4v|mov)$/i, ''),
            isVideo: isVideo,
            type: file.type
        };
        
        try {
            // Save file to IndexedDB
            const dbId = await saveFileToDB(file, trackInfo);
            
            // Create blob URL from file for immediate playback
            const url = URL.createObjectURL(file);
            
            state.tracks.push({
                id: dbId,
                name: trackInfo.name,
                url: url,
                duration: 0,
                isVideo: isVideo,
                type: file.type,
                storedInDB: true
            });
            
            importedCount++;
            
            // Update progress
            elements.trackArtist.textContent = `Imported ${importedCount}/${files.length}`;
            
        } catch (err) {
            console.error('Failed to save file:', file.name, err);
        }
    }
    
    // Load metadata for all tracks
    await loadTrackMetadata();
    
    // Reset loading state
    state.isLoading = false;
    elements.loadBtn.style.opacity = '1';
    
    if (state.tracks.length === 0) {
        elements.trackTitle.textContent = 'No track loaded';
        elements.trackArtist.textContent = '—';
    } else {
        elements.trackTitle.textContent = `${importedCount} file${importedCount !== 1 ? 's' : ''} imported!`;
        elements.trackArtist.textContent = 'Saved permanently';
        
        // Auto-clear success message after 2 seconds
        setTimeout(() => {
            if (state.currentIndex === -1) {
                elements.trackTitle.textContent = 'Ready to play';
                elements.trackArtist.textContent = 'Select a track';
            }
        }, 2000);
    }
    
    // Clear file input
    elements.fileInput.value = '';
});

// Load stored tracks from IndexedDB on app start
async function loadStoredTracks() {
    try {
        const storedFiles = await loadFilesFromDB();
        
        if (storedFiles.length === 0) {
            console.log('No stored files found');
            return;
        }
        
        console.log(`Loading ${storedFiles.length} stored files...`);
        elements.trackTitle.textContent = 'Loading saved files...';
        elements.trackArtist.textContent = 'Please wait';
        
        // Initialize media elements
        initAudio();
        initVideo();
        
        for (const fileData of storedFiles) {
            // Convert ArrayBuffer back to Blob
            const blob = new Blob([fileData.data], { type: fileData.type });
            const url = URL.createObjectURL(blob);
            
            state.tracks.push({
                id: fileData.id,
                name: fileData.name,
                url: url,
                duration: 0,
                isVideo: fileData.isVideo,
                type: fileData.type,
                storedInDB: true
            });
        }
        
        // Load metadata
        await loadTrackMetadata();
        
        // Update UI
        elements.trackTitle.textContent = 'Ready to play';
        elements.trackArtist.textContent = `${storedFiles.length} file${storedFiles.length !== 1 ? 's' : ''} loaded`;
        
        // Auto-clear message after 2 seconds
        setTimeout(() => {
            if (state.currentIndex === -1) {
                elements.trackTitle.textContent = 'Tap a track to play';
                elements.trackArtist.textContent = '—';
            }
        }, 2000);
        
    } catch (err) {
        console.error('Failed to load stored tracks:', err);
    }
}

// Load track metadata (duration)
async function loadTrackMetadata() {
    const promises = state.tracks.map((track, index) => {
        return new Promise((resolve) => {
            if (track.duration > 0) {
                resolve();
                return;
            }
            
            // Use video element for video files, audio for audio files
            const tempMedia = track.isVideo ? document.createElement('video') : new Audio();
            tempMedia.preload = 'metadata';
            
            tempMedia.addEventListener('loadedmetadata', () => {
                state.tracks[index].duration = tempMedia.duration;
                resolve();
            });
            
            tempMedia.addEventListener('error', () => {
                resolve(); // Continue even if metadata fails
            });
            
            tempMedia.src = track.url;
        });
    });
    
    await Promise.all(promises);
    renderTrackList();
    updateControls();
}

// Render track list
function renderTrackList() {
    const isEmpty = state.tracks.length === 0;
    
    if (isEmpty) {
        elements.tracklist.innerHTML = `
            <li class="empty-state">
                <p>No music loaded</p>
                <p class="hint">Tap the upload button to add tracks</p>
            </li>
        `;
        elements.trackCount.textContent = '0 tracks';
        elements.clearBtn.style.display = 'none';
        return;
    }
    
    elements.trackCount.textContent = `${state.tracks.length} track${state.tracks.length !== 1 ? 's' : ''}`;
    elements.clearBtn.style.display = 'block';
    
    elements.tracklist.innerHTML = state.tracks.map((track, index) => `
        <li data-index="${index}" class="${index === state.currentIndex ? 'active' : ''}">
            <span class="track-item-title">${track.isVideo ? '🎬 ' : ''}${escapeHtml(track.name)}</span>
            <span class="track-item-duration">${formatTime(track.duration)}</span>
        </li>
    `).join('');
    
    // Add click listeners
    elements.tracklist.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
            const index = parseInt(li.dataset.index);
            loadTrack(index);
            play();
        });
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load track
function loadTrack(index) {
    if (index < 0 || index >= state.tracks.length) return;
    
    const track = state.tracks[index];
    state.currentIndex = index;
    state.isVideo = track.isVideo;
    
    // Stop current playback
    if (state.audioElement) state.audioElement.pause();
    if (state.videoElement) state.videoElement.pause();
    
    if (track.isVideo) {
        // Video playback
        initVideo();
        state.videoElement.src = track.url;
        state.videoElement.load();
        elements.videoContainer.style.display = 'block';
    } else {
        // Audio playback
        initAudio();
        state.audioElement.src = track.url;
        state.audioElement.load();
        elements.videoContainer.style.display = 'none';
    }
    
    // Update UI
    elements.trackTitle.textContent = track.name;
    elements.trackArtist.textContent = `${track.isVideo ? 'Video' : 'Track'} ${index + 1} of ${state.tracks.length}`;
    elements.duration.textContent = formatTime(track.duration);
    elements.currentTime.textContent = '0:00';
    elements.progressFill.style.width = '0%';
    
    // Update Media Session API (for lock screen controls)
    updateMediaSession(track, index);
    
    // Update tracklist active state
    renderTrackList();
    updateControls();
}

// Play
function play() {
    if (state.currentIndex === -1) return;
    
    const mediaElement = state.isVideo ? state.videoElement : state.audioElement;
    if (!mediaElement) return;
    
    mediaElement.play()
        .then(() => {
            state.isPlaying = true;
            updatePlayPauseUI();
            updateMediaSessionPlaybackState('playing');
        })
        .catch(err => {
            console.error('Playback failed:', err);
        });
}

// Pause
function pause() {
    const mediaElement = state.isVideo ? state.videoElement : state.audioElement;
    if (!mediaElement) return;
    
    mediaElement.pause();
    state.isPlaying = false;
    updatePlayPauseUI();
    updateMediaSessionPlaybackState('paused');
}

// Play/Pause toggle
elements.playBtn.addEventListener('click', () => {
    if (state.currentIndex === -1) {
        // Load first track if none loaded
        if (state.tracks.length > 0) {
            loadTrack(0);
            play();
        }
        return;
    }
    
    if (state.isPlaying) {
        pause();
    } else {
        play();
    }
});

// Previous track
elements.prevBtn.addEventListener('click', () => {
    if (state.currentIndex > 0) {
        loadTrack(state.currentIndex - 1);
        play();
    }
});

// Next track
elements.nextBtn.addEventListener('click', () => {
    if (state.currentIndex < state.tracks.length - 1) {
        loadTrack(state.currentIndex + 1);
        play();
    }
});

// Clear all tracks
elements.clearBtn.addEventListener('click', async () => {
    if (!confirm('Clear all tracks? This will delete all stored files permanently.')) return;
    
    // Show loading state
    elements.trackTitle.textContent = 'Clearing...';
    elements.trackArtist.textContent = 'Please wait';
    
    // Stop playback
    if (state.audioElement) {
        pause();
        state.audioElement.src = '';
    }
    if (state.videoElement) {
        state.videoElement.pause();
        state.videoElement.src = '';
    }
    
    // Revoke object URLs to free memory
    state.tracks.forEach(track => {
        URL.revokeObjectURL(track.url);
    });
    
    // Clear IndexedDB
    try {
        await clearDB();
        console.log('IndexedDB cleared');
    } catch (err) {
        console.error('Failed to clear IndexedDB:', err);
    }
    
    // Reset state
    state.tracks = [];
    state.currentIndex = -1;
    state.isPlaying = false;
    state.isVideo = false;
    
    // Reset UI
    elements.trackTitle.textContent = 'All files cleared';
    elements.trackArtist.textContent = 'Import new files';
    elements.currentTime.textContent = '0:00';
    elements.duration.textContent = '0:00';
    elements.progressFill.style.width = '0%';
    elements.videoContainer.style.display = 'none';
    
    renderTrackList();
    updateControls();
    
    // Auto-clear message
    setTimeout(() => {
        elements.trackTitle.textContent = 'No track loaded';
        elements.trackArtist.textContent = '—';
    }, 2000);
});

// Media event handlers
function handleTimeUpdate() {
    const mediaElement = state.isVideo ? state.videoElement : state.audioElement;
    if (!mediaElement) return;
    
    const current = mediaElement.currentTime;
    const duration = mediaElement.duration;
    
    elements.currentTime.textContent = formatTime(current);
    
    if (isFinite(duration) && duration > 0) {
        const progress = (current / duration) * 100;
        elements.progressFill.style.width = `${progress}%`;
    }
}

function handleTrackEnd() {
    // Auto-advance to next track
    if (state.currentIndex < state.tracks.length - 1) {
        loadTrack(state.currentIndex + 1);
        play();
    } else {
        // End of playlist
        state.isPlaying = false;
        updatePlayPauseUI();
        updateMediaSessionPlaybackState('paused');
    }
}

function handleMetadataLoad() {
    const mediaElement = state.isVideo ? state.videoElement : state.audioElement;
    if (!mediaElement) return;
    
    const duration = mediaElement.duration;
    if (isFinite(duration)) {
        elements.duration.textContent = formatTime(duration);
        
        // Update track duration in state
        if (state.currentIndex >= 0) {
            state.tracks[state.currentIndex].duration = duration;
        }
    }
}

function handleMediaError(e) {
    console.error('Media error:', e);
    const mediaType = state.isVideo ? 'video' : 'track';
    alert(`Failed to play this ${mediaType}. It may be corrupted or in an unsupported format.`);
}

// Update play/pause button UI
function updatePlayPauseUI() {
    if (state.isPlaying) {
        elements.playIcon.style.display = 'none';
        elements.pauseIcon.style.display = 'block';
    } else {
        elements.playIcon.style.display = 'block';
        elements.pauseIcon.style.display = 'none';
    }
}

// Update controls state
function updateControls() {
    const hasTracks = state.tracks.length > 0;
    const hasCurrentTrack = state.currentIndex >= 0;
    
    elements.playBtn.disabled = !hasTracks;
    elements.prevBtn.disabled = !hasCurrentTrack || state.currentIndex === 0;
    elements.nextBtn.disabled = !hasCurrentTrack || state.currentIndex === state.tracks.length - 1;
}

// Media Session API - for lock screen controls and Bluetooth
function updateMediaSession(track, index) {
    if (!('mediaSession' in navigator)) return;
    
    navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: `Track ${index + 1} of ${state.tracks.length}`,
        album: 'iPod',
        artwork: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
    });
    
    // Set up action handlers (only once)
    if (!navigator.mediaSession.setActionHandler.__initialized) {
        navigator.mediaSession.setActionHandler('play', () => play());
        navigator.mediaSession.setActionHandler('pause', () => pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            if (state.currentIndex > 0) {
                loadTrack(state.currentIndex - 1);
                play();
            }
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            if (state.currentIndex < state.tracks.length - 1) {
                loadTrack(state.currentIndex + 1);
                play();
            }
        });
        
        navigator.mediaSession.setActionHandler.__initialized = true;
    }
}

function updateMediaSessionPlaybackState(state) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = state;
    }
}

// Prevent iOS from sleeping during playback
// The Media Session API handles this automatically when properly configured
// No additional wake lock needed for audio playback on iOS

// Handle visibility change (optional: pause when app is backgrounded)
// Note: We DON'T pause on visibility change because we want background playback
// The audio will continue playing when the screen is locked

document.addEventListener('visibilitychange', () => {
    // Just update Media Session state if needed
    if (document.hidden && state.isPlaying) {
        updateMediaSessionPlaybackState('playing');
    }
});
