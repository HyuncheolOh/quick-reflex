# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SprintTap is a React Native mobile app built with Expo that implements 3 reaction time tests for measuring "순발력" (quick reflexes). The entire application is contained within a single `App.tsx` file as an MVP implementation targeting iOS and Android.

## Development Commands

```bash
# Start the development server
npm run start

# Run on specific platforms
npm run android
npm run ios
npm run web

# Install dependencies
npm install
```

## Architecture

### Single-File MVP Structure
- **App.tsx**: Contains the entire application logic including:
  - 4 main screens: Home, Visual Reaction, Go/No-Go, Direction Change, Results
  - All test logic and state management
  - UI components (Card, Button)
  - Data persistence using AsyncStorage
  - Audio feedback using expo-speech

### Key Components
- **Root App**: Navigation between screens using simple state-based routing
- **Test Screens**: Each implements a specific reaction time test with timing logic
  - Visual Reaction: Tap when screen turns green (false start detection)
  - Audio Reaction: Tap when hearing sound (uses expo-speech)
  - Go/No-Go: Tap only on target stimulus (🔔), avoid decoys
  - Direction Change: Tap when arrow direction changes
- **Results Screen**: Displays historical test data with tabbed navigation

### Data Management
- **AsyncStorage**: Persists test results locally
- **Test Results**: Stored as arrays of Trial objects with timing data
- **Storage Keys**: Prefixed with "sprinttap:" (e.g., "sprinttap:visual")

### Test Logic Pattern
Each test follows a similar pattern:
1. State management: "ready" → "waiting" → "go" → "done"
2. Timing measurement using `Date.now()`
3. False start detection (tapping during "waiting" state)
4. Trial recording with `{ms, ok, at}` objects
5. Summary statistics calculation (avg, best, errors)

## Tech Stack
- **React Native**: 0.79.5
- **Expo**: ~53.0.20 (handles native functionality)
- **TypeScript**: ~5.8.3 (strict mode enabled)
- **AsyncStorage**: Data persistence
- **expo-speech**: Audio feedback for audio reaction test

## Development Notes
- No external state management (useState/useRef only)
- No navigation library (simple conditional rendering)
- Korean language UI text
- Dark theme styling
- Single-file architecture for rapid prototyping
- Uses Expo's new architecture (newArchEnabled: true)