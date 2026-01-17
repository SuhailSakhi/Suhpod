# Quick Start Guide

## 1. Generate Icons (Required)

Open `icon-generator.html` in your browser:
- Right-click on the first canvas → "Save Image As..." → save as `icon-192.png`
- Right-click on the second canvas → "Save Image As..." → save as `icon-512.png`
- Place both PNG files in the `/Users/suhail/ipod` directory

## 2. Start Local Server

Choose one method:

### Python (if installed):
```bash
cd /Users/suhail/ipod
python3 -m http.server 8000
```

### Node.js (if installed):
```bash
cd /Users/suhail/ipod
npx serve -p 8000
```

### PHP (built into macOS):
```bash
cd /Users/suhail/ipod
php -S localhost:8000
```

## 3. Test on iPhone

### Option A: Same WiFi Network
1. Find your Mac's IP address:
   - Open System Settings → Network → Your WiFi → Details
   - Copy the IP address (e.g., 192.168.1.100)

2. On iPhone Safari, visit:
   ```
   http://YOUR_MAC_IP:8000
   ```

### Option B: Localhost (Mac only)
- Visit `http://localhost:8000` in Safari on your Mac

## 4. Install as PWA on iPhone

1. Tap the **Share** button (square with arrow)
2. Scroll down, tap **"Add to Home Screen"**
3. Name it "iPod" and tap **Add**
4. Open the app from your home screen

## 5. Load Music

1. Tap the upload icon (top right)
2. Select MP3 or M4A files from Files app
3. Music will be ready to play offline

## Troubleshooting

**Service Worker not working?**
- Must use HTTP or HTTPS (not file://)
- Clear Safari cache and reload

**Audio not playing on iPhone?**
- Tap a track first (iOS requires user interaction)
- Check volume and silent switch

**Can't select files?**
- Grant Safari permission to access files
- Try downloading sample MP3 files first

## Next Steps

Once working locally, deploy to:
- **GitHub Pages** (free, HTTPS)
- **Netlify** (free, HTTPS)
- **Vercel** (free, HTTPS)

For production, HTTPS is required for full PWA features.
