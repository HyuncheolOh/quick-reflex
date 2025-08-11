# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SprintTap is a React Native mobile app built with Expo that implements reaction time tests for measuring "순발력" (quick reflexes). The app has evolved from a single-file MVP to a well-structured modular architecture with comprehensive theming and internationalization support, targeting iOS and Android platforms.

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

### Modular Structure
The application follows a well-organized modular architecture:

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Card, Modal)
│   └── game/           # Game-specific components (CountdownTimer, GameResult)
├── constants/          # App constants and configuration
├── contexts/           # React contexts for global state
│   ├── ThemeContext    # Dark/Light theme management
│   └── LocalizationContext # i18n language management
├── hooks/              # Custom React hooks
├── localization/       # Translation files
├── navigation/         # React Navigation stack navigators
├── screens/           # Screen components
│   ├── game/          # Game-related screens
│   ├── onboarding/    # Onboarding flow screens
│   └── settings/      # Settings screens
├── services/          # Business logic and external services
│   └── storage/       # Data persistence layer
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

### Key Features

#### Theme System
- **Dark/Light Mode**: Comprehensive theming system supporting both dark and light themes
- **System Theme**: Automatically follows device theme settings
- **Theme Persistence**: User theme preferences saved locally
- **Dynamic Colors**: All UI components adapt to selected theme

#### Internationalization (i18n)
- **Multi-language Support**: Korean (ko) and English (en) languages
- **Automatic Detection**: Detects device language on first launch
- **Translation Management**: Centralized translation system with type safety
- **Language Persistence**: User language preferences saved locally

#### Game Modes
- **Tap Test**: Visual reaction time test (tap when screen turns green)
- **Audio Test**: Auditory reaction time test (coming soon)
- **Go/No-Go Test**: Selective reaction test (coming soon)

#### Data Management
- **AsyncStorage**: Local data persistence with prefixed keys (@quickreflex:*)
- **Game Sessions**: Complete game session tracking with statistics
- **User Profiles**: User preferences and settings
- **Statistics**: Comprehensive performance analytics

### Navigation
- **React Navigation**: Stack-based navigation with gesture support
- **Modular Navigation**: Separated into Onboarding and Main stacks
- **Theme Integration**: Navigation adapts to current theme

### Game Logic
Each reaction time test follows this pattern:
1. **State Management**: IDLE → COUNTDOWN → WAITING → READY → COMPLETE/FAILED
2. **Precise Timing**: Uses `Date.now()` for millisecond-accurate measurements
3. **Early Detection**: False start detection during waiting periods
4. **Session Recording**: Comprehensive attempt tracking with validation
5. **Statistics**: Real-time calculation of averages, bests, and accuracy
6. **Comparison Analysis**: Progress tracking with previous session comparisons

## Tech Stack

### Core Framework
- **React Native**: 0.79.5
- **Expo**: ~53.0.20 (handles native functionality)
- **TypeScript**: ~5.8.3 (strict mode enabled)
- **React Navigation**: Stack navigation with gesture support
- **React Native Gesture Handler**: Enhanced touch interactions

### State Management & Contexts
- **React Context API**: Global state management for themes and localization
- **Custom Hooks**: Reusable logic abstraction (`useThemedColors`, `useLocalization`)
- **Local State**: Component-level state with `useState` and `useRef`

### Storage & Persistence
- **AsyncStorage**: Local data persistence
- **Structured Storage**: Organized with service layer abstraction
- **Storage Keys**: Prefixed with "@quickreflex:" for organization

### UI & Theming
- **Dynamic Theming**: Light/Dark mode with system detection
- **Styled Components**: Theme-aware styling system
- **Responsive Design**: Optimized for various screen sizes
- **Typography System**: Consistent font sizing and weights

### Internationalization
- **expo-localization**: Device language detection
- **Custom i18n System**: Type-safe translation management
- **Multi-language Support**: Korean and English with expandable architecture

### Audio & Feedback
- **expo-speech**: Text-to-speech for audio reaction tests (planned)
- **Haptic Feedback**: Native device feedback (via Expo)

## Development Guidelines

### Theme Integration
- Always use `useThemedColors()` hook for color values
- Never hardcode colors in StyleSheets
- Apply theme-aware styling to all UI components
- Test both light and dark themes during development

### Internationalization
- Use `useLocalization()` hook for all text content
- Add new strings to both Korean and English translation files
- Use type-safe translation keys (TypeScript enforced)
- Test language switching functionality

### Game Development
- Follow existing game state patterns (IDLE → COUNTDOWN → WAITING → READY → COMPLETE/FAILED)
- Implement proper timing measurement with `Date.now()`
- Include false start detection for reaction time accuracy
- Save complete session data with statistics

### Code Style
- Use TypeScript strict mode
- Follow modular architecture patterns
- Implement proper error handling
- Use semantic component and variable naming
- Add comments for complex game logic only

### Testing Considerations
- Test on both iOS and Android platforms
- Verify theme switching works correctly
- Test language switching functionality
- Validate timing accuracy across devices
- Test edge cases (early taps, timeouts, interruptions)