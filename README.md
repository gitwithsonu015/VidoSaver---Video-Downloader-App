# VidoSaver - Video Downloader App

## Overview
Mobile app for downloading videos from URLs using yt-dlp backend. Supports multiple platforms, smooth UI, real-time progress.

## Structure
- `backend/`: Node.js Express server with yt-dlp.
- `frontend/`: React Native app.

## Setup

### Prerequisites
- Node.js (v18+)
- Python 3 (for yt-dlp)
- React Native environment: Android Studio/iOS sim, React Native CLI.

### Backend (includes frontend serve)
```bash
cd backend
npm install
npm start
```
App at http://localhost:3000/


### Frontend
```bash
cd frontend
rm -rf node_modules package-lock.json  # clean
npm install
npx react-native start --reset-cache  # new terminal
# Another terminal
npx react-native run-android  # requires Android setup
```

## Usage
1. Start backend.
2. Run frontend app.
3. Enter video URL (e.g., YouTube), tap Download.
4. Monitor progress, access downloaded file via /downloads/.

## Features
- URL-based downloads
- Real-time progress via Socket.io
- Error handling
- Responsive UI with React Native Paper

## Testing
1. npm start backend
2. http://localhost:3000/
3. Enter YouTube URL, download!


## Troubleshooting
- Ensure yt-dlp installed globally or in PATH.
- Firewall: allow port 3000.
- RN metro bundler issues: reset cache `npx react-native start --reset-cache`.

