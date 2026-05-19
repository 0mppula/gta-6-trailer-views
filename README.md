# Grand Theft Auto (GTA)

A small project inspired by the **Grand Theft Auto** series, built to explore video content, UI rendering, and interactive card-based layouts.

## 🚀 Overview

This project displays a grid of video cards similar to a media dashboard. Each card shows:

- Video title
- Thumbnail preview (YouTube-style)
- View count animation
- Loading shimmer state
- Error handling state
- Fully clickable card navigation

The UI is designed to be fast, minimal, and responsive.

## 🎮 Features

- 🎥 Video grid layout
- 🖼️ Thumbnail previews using YouTube image API
- ⚡ Smooth loading shimmer states
- ❌ Error handling for failed video loads
- 📊 Animated view counter
- 🔗 Entire card clickable (improved UX)
- 📱 Responsive design

## 🧠 Key Design Decisions

- Only one clickable element per card to avoid nested anchor issues
- Separation of loading, error, and success states
- Lightweight UI with minimal re-renders
- Safe layout structure using grid-based rendering
