# Emotion Music Player - Project Documentation

## Overview
An AI-powered web application that detects user emotions through facial recognition and plays corresponding music from the Audius decentralized music platform. The app provides real-time emotion analysis, music recommendations, and session analytics.

## Technology Stack

### Core Technologies
- **React 18.3.1** - Frontend framework
- **TypeScript** - Type safety and development experience
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM 6.26.2** - Client-side routing

### AI & Machine Learning
- **face-api.js 0.22.2** - Real-time face detection and emotion recognition
- Custom emotion analysis algorithms

### Audio & Music
- **Audius API** - Decentralized music streaming platform integration
- **HTML5 Audio API** - Native audio playback controls
- Custom music player with queue management

### UI Framework & Components
- **shadcn/ui** - Modern component library
- **Radix UI** - Unstyled, accessible UI primitives
  - Accordion, Alert Dialog, Avatar, Button, Card, etc.
- **Lucide React 0.462.0** - Icon library
- **class-variance-authority 0.7.1** - Component variant management

### State Management & Data
- **TanStack React Query 5.56.2** - Server state management
- **React Hook Form 7.53.0** - Form state management
- **Zod 3.23.8** - Schema validation

### Styling & Theming
- **next-themes 0.4.6** - Dark/light mode support
- **tailwindcss-animate 1.0.7** - Animation utilities
- **tailwind-merge 2.5.2** - Conditional class merging

### Charts & Analytics
- **Recharts 2.12.7** - Data visualization
- Custom session analytics tracking

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Lovable Tagger** - Component development tools

## Project Structure

```
src/
├── components/
│   ├── ui/                     # Shadcn UI components
│   ├── EmotionAnalyzer.tsx     # Main emotion detection component
│   ├── MusicPlayer.tsx         # Audio player with queue management
│   ├── SessionAnalytics.tsx    # Session tracking and metrics
│   ├── StartScreen.tsx         # Landing page component
│   └── ThemeProvider.tsx       # Dark/light theme management
├── hooks/
│   ├── useEmotionMusic.ts      # Emotion-music integration logic
│   ├── useMusicPlayer.ts       # Audio player state management
│   ├── useSessionAnalytics.ts  # Session data tracking
│   ├── use-mobile.tsx          # Mobile device detection
│   └── use-toast.ts           # Toast notification management
├── services/
│   └── audiusApi.ts           # Audius API integration
├── utils/
│   └── emotionInsights.ts     # Emotion analysis utilities
├── pages/
│   ├── Index.tsx              # Home page
│   └── NotFound.tsx           # 404 error page
└── lib/
    └── utils.ts               # Utility functions
```

## Core Features

### 1. Emotion Detection System
- **Technology**: face-api.js with pre-trained models
- **Models Used**:
  - Face detection model
  - Face landmark detection
  - Facial expression recognition
- **Supported Emotions**:
  - Happy, Sad, Angry, Surprised, Fearful, Disgusted, Neutral
- **Real-time Processing**: 
  - Video stream capture from user camera
  - Continuous emotion analysis at configurable intervals
  - Confidence scoring for emotion predictions

### 2. Music Recommendation Engine
- **Platform**: Audius decentralized music platform
- **Recommendation Logic**:
  - Emotion-to-genre mapping algorithm
  - Trending tracks integration
  - Queue management with skip functionality
- **Supported Genres**:
  - Electronic, Hip-Hop, Rock, Pop, Jazz, Classical, Ambient, etc.
- **Features**:
  - Automatic track switching based on emotion changes
  - Manual playback controls
  - Volume adjustment
  - Track progress visualization

### 3. Session Analytics
- **Metrics Tracked**:
  - Session duration
  - Emotion distribution over time
  - Music listening patterns
  - User interaction events
- **Data Visualization**:
  - Real-time charts using Recharts
  - Emotion timeline graphs
  - Session summary statistics

### 4. User Interface
- **Design System**:
  - Consistent color palette with semantic tokens
  - Dark/light mode support
  - Responsive design for all screen sizes
- **Components**:
  - Video feed display with overlay controls
  - Real-time emotion indicators
  - Music player with queue visualization
  - Analytics dashboard
- **Accessibility**:
  - ARIA labels and descriptions
  - Keyboard navigation support
  - Screen reader compatibility

## API Integration

### Audius API
- **Base URL**: Multiple host endpoints for decentralization
- **Endpoints Used**:
  - `/v1/tracks/search` - Track search by genre/query
  - `/v1/tracks/trending` - Trending tracks by genre
- **Rate Limiting**: Handled through host rotation
- **Error Handling**: Fallback to alternative hosts

### Browser APIs
- **MediaDevices API**: Camera access for video stream
- **Web Audio API**: Audio playback and control
- **LocalStorage**: Session data persistence
- **Permissions API**: Camera permission management

## Configuration

### Environment Setup
```bash
# Installation
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Tailwind Configuration
- Custom color scheme with HSL values
- Animation keyframes for smooth transitions
- Responsive breakpoints
- Dark mode utilities

### Vite Configuration
- SWC for fast compilation
- Path aliases (@/ for src/)
- Development server on port 8080
- Component tagging for development

## Performance Optimizations

### Code Splitting
- Route-based code splitting
- Lazy loading of face-api.js models
- Dynamic imports for large dependencies

### Memory Management
- Cleanup of video streams on component unmount
- Debounced emotion analysis to prevent excessive API calls
- Efficient state updates using React Query

### Asset Optimization
- Optimized face detection models
- Compressed audio streaming
- Lazy loading of UI components

## Security Considerations

### Privacy
- No video data storage - processed locally only
- Camera permissions explicitly requested
- Session data stored locally only

### API Security
- No API keys exposed in frontend
- Rate limiting through host rotation
- CORS handling for cross-origin requests

## Browser Compatibility

### Supported Browsers
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Required Features
- WebRTC for camera access
- ES2020 support
- CSS Grid and Flexbox
- Web Audio API

## Deployment

### Build Process
1. TypeScript compilation
2. Vite bundling and optimization
3. Asset minification
4. Static file generation

### Hosting Requirements
- Static file serving capability
- HTTPS required for camera access
- CDN recommended for global performance

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for consistency
- Functional components with hooks
- Custom hooks for business logic separation

### Component Architecture
- Single responsibility principle
- Props interface definitions
- Forwarded refs where needed
- Error boundary implementations

### State Management
- React Query for server state
- Local state for UI interactions
- Custom hooks for complex logic
- Context for theme management

## Testing Strategy

### Unit Testing
- Component rendering tests
- Hook behavior verification
- Utility function validation

### Integration Testing
- Emotion detection pipeline
- Music player functionality
- API integration tests

### End-to-End Testing
- User workflow validation
- Cross-browser compatibility
- Performance benchmarking

## Future Enhancements

### Planned Features
- User profile system
- Playlist creation and sharing
- Advanced emotion analytics
- Social features integration

### Technical Improvements
- WebWorkers for emotion processing
- Progressive Web App capabilities
- Offline music caching
- Enhanced accessibility features

## License & Attribution

### Open Source Dependencies
- All dependencies use permissive licenses (MIT, Apache 2.0)
- face-api.js - MIT License
- React - MIT License
- Audius API - Community driven platform

### Models & Data
- Face detection models from face-api.js
- Music content from Audius platform
- No proprietary data or models used