# iOS Testing Checklist

Test each feature on iPhone SE 2020 to ensure full compliance.

## ✅ Installation

- [ ] App loads in Safari on iPhone
- [ ] "Add to Home Screen" option appears
- [ ] App installs with correct icon and name
- [ ] App opens in standalone mode (no Safari UI)
- [ ] Status bar is black/translucent

## ✅ File Loading

- [ ] Upload button triggers file picker
- [ ] Can select multiple MP3 files
- [ ] Can select multiple M4A files
- [ ] File names display correctly
- [ ] Track durations load and display
- [ ] Track count updates correctly

## ✅ Playback (Core)

- [ ] First track loads on tap
- [ ] Play button starts playback
- [ ] Pause button stops playback
- [ ] Current time updates during playback
- [ ] Progress bar animates smoothly
- [ ] Track auto-advances to next
- [ ] Previous button works
- [ ] Next button works
- [ ] Buttons disable appropriately (first/last track)

## ✅ Lock Screen Behavior (Critical for iOS)

- [ ] Audio continues when screen locks
- [ ] Lock screen shows track title
- [ ] Lock screen shows app name/icon
- [ ] Play/pause button on lock screen works
- [ ] Next track button on lock screen works
- [ ] Previous track button on lock screen works

## ✅ Bluetooth/Headphone Controls

- [ ] Play/pause button on headphones works
- [ ] Next track button on headphones works
- [ ] Previous track button on headphones works
- [ ] Removing headphones pauses playback (iOS default)

## ✅ Offline Functionality

- [ ] Enable Airplane Mode
- [ ] App still opens
- [ ] Previously loaded tracks still play
- [ ] Service Worker caches app shell
- [ ] No errors in console when offline

## ✅ UI/UX

- [ ] All touch targets are comfortable (44x44pt minimum)
- [ ] No accidental double-taps
- [ ] Scrolling is smooth
- [ ] Safe area insets respected (notch/home indicator)
- [ ] Text is readable at default iOS font size
- [ ] Long track names don't break layout
- [ ] Empty state displays when no tracks loaded

## ✅ Memory Management

- [ ] Load 20+ tracks without lag
- [ ] Clear all tracks works
- [ ] No memory leaks after clearing
- [ ] App doesn't crash with large files (50MB+ M4A)

## ✅ Edge Cases

- [ ] Try loading corrupted audio file (should show error)
- [ ] Try loading non-audio file (should be filtered out)
- [ ] Minimize app during playback (audio continues)
- [ ] Receive phone call during playback (audio pauses)
- [ ] Return to app after call (can resume playback)

## 🔧 Common Issues & Fixes

### Audio won't play
- **Cause**: iOS requires user interaction before playing audio
- **Fix**: Always tap a track or play button first

### Audio stops when screen locks
- **Cause**: Media Session API not properly configured
- **Fix**: Check that `navigator.mediaSession.metadata` is set

### Can't install PWA
- **Cause**: Not served over HTTPS or missing manifest
- **Fix**: Use local server (not file://), ensure manifest.json is valid

### Service Worker not registering
- **Cause**: Not on HTTPS or localhost
- **Fix**: Use `python3 -m http.server` or deploy to HTTPS host

### Files disappear after closing app
- **Expected behavior**: iOS doesn't allow persistent file system access
- **Workaround**: Users must re-select files each session (by design)

## 📊 Performance Targets

- [ ] First load: < 2 seconds
- [ ] Track switch: < 100ms
- [ ] Touch response: < 50ms
- [ ] Memory usage: < 100MB for 50 tracks
- [ ] Battery drain: Comparable to Apple Music

## 🚀 Production Deployment Checklist

- [ ] All icons present (192px, 512px)
- [ ] HTTPS enabled
- [ ] manifest.json valid
- [ ] Service Worker caches all assets
- [ ] No console errors
- [ ] Test on multiple iOS versions (14, 15, 16, 17)
- [ ] Test on different iPhone models
- [ ] Add analytics (optional)
- [ ] Add error tracking (optional)

---

**Note**: This is a session-based player. Files are NOT permanently stored. This is by design due to iOS limitations with File System Access API.
