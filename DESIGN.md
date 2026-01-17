# iPod PWA - UI Layout & Design Specifications

## Screen Layout (iPhone SE 2020 - 375×667pt)

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │ ← Safe area top
│ │                                 │ │
│ │  [iPod]              [Upload ↑] │ │ ← Header (60pt)
│ │                                 │ │
│ ├─────────────────────────────────┤ │
│ │                                 │ │
│ │      Track Title Here           │ │ ← Now Playing
│ │      Artist / Track Info        │ │   (160pt)
│ │                                 │ │
│ │  0:00  ═══════──────  3:45      │ │ ← Progress
│ │                                 │ │
│ ├─────────────────────────────────┤ │
│ │                                 │ │
│ │    [◄◄]    [▶]    [►►]          │ │ ← Controls (96pt)
│ │                                 │ │
│ ├─────────────────────────────────┤ │
│ │  3 tracks          [Clear all]  │ │ ← List header (48pt)
│ ├─────────────────────────────────┤ │
│ │  ▶ Track 1            3:45      │ │
│ │    Track 2            4:20      │ │ ← Track list
│ │    Track 3            2:58      │ │   (scrollable)
│ │    Track 4            3:12      │ │
│ │    ...                          │ │
│ │                                 │ │
│ ┌─────────────────────────────────┐ │ ← Safe area bottom
└─────────────────────────────────────┘
```

## Color Palette

```css
Background Primary:   #000000 (Pure black)
Background Secondary: #1A1A1A (Subtle gray for active states)
Text Primary:         #FFFFFF (Pure white)
Text Secondary:       #999999 (Gray for metadata)
Border Color:         #333333 (Subtle dividers)
Accent:               #FFFFFF (Progress bar)
```

## Typography

```
Logo/Header:     24pt, Weight 600, -0.5px letter-spacing
Track Title:     20pt, Weight 600, 1.3 line-height
Track Subtitle:  16pt, Weight 400
List Item:       16pt, Weight 400
Duration:        14pt, Tabular numbers
Track Count:     14pt, Uppercase, 0.5px letter-spacing
```

## Touch Targets

All interactive elements meet Apple's 44×44pt minimum:

```
Upload Button:     44×44pt (minimum)
Play/Pause:        72×72pt (primary action)
Previous/Next:     56×56pt
Track List Item:   Full width × 56pt
Clear Button:      44×44pt (minimum)
```

## Spacing System

```
Base unit: 8pt

Micro:    4pt   (progress bar height)
Small:    8pt   (text margins)
Medium:   12pt  (icon gaps)
Large:    16pt  (section padding)
XLarge:   24pt  (between sections)
XXLarge:  32pt  (screen padding)
```

## Component States

### Button States
```
Default:   opacity: 1
Active:    opacity: 0.5 (touch feedback)
Disabled:  opacity: 0.3
```

### Track List States
```
Default:   background: transparent
Active:    background: #1A1A1A, ▶ indicator
Tap:       background: #1A1A1A (momentary)
```

## Animations

```css
Touch Feedback:     0.2s ease (opacity)
Progress Bar:       0.1s linear (width)
No animations:      First render (performance)
```

## Responsive Behavior

While optimized for iPhone SE 2020, the app scales to:

- **iPhone SE (1st gen)**: 320×568pt
- **iPhone 8**: 375×667pt  
- **iPhone 12/13 mini**: 375×812pt (with notch)
- **iPhone 12-15 Pro Max**: 428×926pt

Safe area insets automatically adapt to notch/Dynamic Island.

## Icon Design

### App Icons (Required)

```
icon-192.png:  192×192px, Black background, White symbol
icon-512.png:  512×512px, Black background, White symbol

Design guidelines:
• Simple, recognizable music symbol
• High contrast (black/white only)
• No text or fine details
• Center-weighted composition
• Works at all sizes (48px to 512px)
```

### UI Icons (Inline SVG)

```
Upload:         24×24pt stroke
Play:           40×40pt fill
Pause:          40×40pt fill  
Previous/Next:  32×32pt fill

Style: iOS-inspired, minimal, geometric
```

## Accessibility

```
ARIA Labels:      All buttons
Color Contrast:   WCAG AAA (white on black)
Touch Targets:    Minimum 44×44pt
Focus States:     Visual feedback on all controls
Text Scaling:     Respects iOS Dynamic Type
```

## Performance Targets

```
First Paint:           < 500ms
Time to Interactive:   < 2s
Touch Response:        < 50ms (perceivably instant)
Frame Rate:            60 FPS during scroll
Memory (50 tracks):    < 100MB
```

## iOS-Specific Details

### Status Bar
```html
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```
• Translucent black background
• White text
• Blends with app background

### Safe Areas
```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```
• Automatically handles notch
• Prevents content clipping
• Works on all iPhone models

### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, 
      maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```
• Prevents zoom (app-like behavior)
• Covers full screen including safe areas
• Fixed at device width

## Design Philosophy

**Minimal**: Only essential controls, no clutter
**Monochrome**: Timeless black & white aesthetic  
**Touch-First**: No hover states, large targets
**Familiar**: iPod-inspired, intuitive navigation
**Fast**: Instant feedback, smooth animations
**Accessible**: High contrast, clear hierarchy

## Implementation Notes

### Why No Album Art?
• Files from Files app don't include metadata access
• Keeps UI minimal and focused
• Reduces complexity and file size
• Faster load times

### Why Session-Based?
• iOS doesn't allow persistent local file storage from Files app
• Object URLs are memory-efficient
• User maintains control over their files
• Privacy-focused (no permanent storage)

### Why No Framework?
• Reduces bundle size (entire app < 50KB)
• Faster load times
• More predictable iOS behavior
• Easier to debug and maintain
• Better battery life

---

**Design principle**: Every pixel serves a purpose. Every interaction feels instant. Every choice prioritizes the music.
