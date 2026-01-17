# iPod Music Player PWA

A minimal, offline-first music player for iOS, inspired by the classic iPod. Optimized for iPhone SE 2020.

## Features

- **Fully Offline**: Works completely offline after installation
- **iOS Optimized**: Continues playing with screen locked, supports Bluetooth/headphone controls
- **Local File Support**: Load MP3 and M4A files from your device
- **Classic iPod UI**: Minimalist black & white interface
- **PWA**: Installable via "Add to Home Screen"

## Installation

### Local Testing

1. **Serve the app** with a local server (required for Service Worker):
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

2. **Access on iPhone**:
   - Connect iPhone and Mac to same WiFi
   - Find your Mac's local IP: `System Settings > Network`
   - On iPhone, open Safari and visit: `http://YOUR_IP:8000`

3. **Install as PWA**:
   - Tap the Share button in Safari
   - Scroll down and tap "Add to Home Screen"
   - Tap "Add"

### Production Deployment

Deploy to any static hosting service (GitHub Pages, Netlify, Vercel, etc.). **Must be served over HTTPS** for Service Worker and PWA features.

## Usage

1. **Load Music**:
   - Tap the upload icon (top right)
   - Select MP3 or M4A files from Files app
   - Files are stored in memory for the session

2. **Playback**:
   - Tap a track to play
   - Use play/pause, next/previous controls
   - Control from lock screen or Bluetooth devices

3. **Lock Screen Playback**:
   - Music continues when screen is locked
   - Control via lock screen player or headphone buttons
   - Track info displayed on lock screen

## Technical Details

### iOS Audio Considerations

- **Audio Element Initialization**: Created on first user interaction (required by iOS)
- **Background Playback**: Enabled via Media Session API
- **Blob URLs**: Used for offline file access without re-uploading
- **No Auto-play**: All playback requires explicit user action (iOS requirement)

### Memory Management

- Object URLs are revoked when clearing tracks
- Single audio element reused for all tracks
- Minimal DOM manipulation for performance

### Browser Compatibility

- **Optimized for**: iOS Safari 14+
- **Required APIs**: Service Worker, Media Session, File API
- **Tested on**: iPhone SE 2020 (iOS 14-17)

## File Structure

```
ipod/
├── index.html          # Main HTML structure
├── style.css           # iPod-inspired styles
├── app.js              # Audio player logic & PWA functionality
├── sw.js               # Service Worker for offline support
├── manifest.json       # PWA manifest
├── icon-192.png        # App icon (192x192)
├── icon-512.png        # App icon (512x512)
└── README.md           # This file
```

## Adding Icons

Create two PNG icons:
- `icon-192.png` (192×192px)
- `icon-512.png` (512×512px)

Simple monochrome design recommended (e.g., white music note on black background).

You can use this placeholder SVG converted to PNG, or design your own:

```svg
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#000"/>
  <path d="M256 128c-70.7 0-128 57.3-128 128s57.3 128 128 128 128-57.3 128-128-57.3-128-128-128zm51.2 166.4c-3.2 3.2-8 3.2-11.2 0L256 256l-40 38.4c-3.2 3.2-8 3.2-11.2 0-3.2-3.2-3.2-8 0-11.2L243.2 256l-38.4-27.2c-3.2-3.2-3.2-8 0-11.2 3.2-3.2 8-3.2 11.2 0L256 256l40-38.4c3.2-3.2 8-3.2 11.2 0 3.2 3.2 3.2 8 0 11.2L268.8 256l38.4 27.2c3.2 3.2 3.2 8 0 11.2z" fill="#fff"/>
</svg>
```

## Limitations

- **Session-based storage**: Files cleared when app is closed (iOS doesn't allow persistent file access)
- **No cloud sync**: Purely local, offline player
- **No metadata extraction**: Uses filename as track name
- **No playlists**: Single queue of tracks

## License

Public domain / MIT - use freely.
