# AGENTS.md

This file provides guidance to AI Agents when working with code in this repository.

## Project Overview

dr4ft is a NodeJS web application that simulates MTG draft and sealed formats between players and/or bots. It's built with Express on the backend, React on the frontend, uses WebSocket communication via engine.io, and integrates MTGJson data for card sets.

## Common Commands

### Development Commands
- `npm start` - Start the production server (port 1337)
- `npm run start-dev` - Start development server with hot reload (watch + nodemon)  
- `npm run start-debug` - Start development server with debugger on port 1338
- `npm run build` - Build production bundle with webpack
- `npm run watch` - Build and watch for changes in development mode

### Testing and Code Quality
- `npm test` - Run all tests (downloads data first, then runs mocha tests)
- `npm run test:js` - Run only JavaScript tests with mocha
- `npm run lint` - Run ESLint on the codebase

### Data Management
- `npm run download_allsets` - Download MTG card data from MTGJson
- `npm run download_booster_rules` - Download booster generation rules
- `npm run update_database` - Process downloaded MTGJson files

### Running Individual Tests
Use mocha directly to run specific test files:
```bash
npx mocha backend/game.spec.js --require @babel/register --exit
npx mocha "frontend/src/**/*.spec.js" --require @babel/register --exit
```

## Architecture Overview

### Backend Structure (`/backend`)
- **app.js** - Main Express server entry point with middleware setup
- **router.js** - WebSocket connection handler and routing
- **game.js** - Core Game class extending Room, handles draft/sealed logic
- **room.js** - Base Room class for managing player connections
- **rooms.js** - Global room management singleton
- **sock.js** - WebSocket wrapper providing event-based communication
- **data.js** - MTG card/set data loading and management
- **pool.js** - Booster pack generation and card pool management
- **player/** - Player classes (Human and Bot implementations)
- **api/** - REST API endpoints for external game management

### Frontend Structure (`/frontend/src`)
- **init.js** - Application entry point
- **app.js** - Main App state management and WebSocket client
- **gamestate.js** - Game state management and synchronization  
- **lobby/** - Game lobby and creation components
- **game/** - In-game draft/sealed interface components
- **components/** - Reusable UI components
- **export/** - Deck export functionality (MTGA, MTGO, Cockatrice, etc.)

### Key Communication Pattern
- Client-Server communication uses engine.io WebSocket with custom event system
- Backend router.js creates Sock instances that emit/listen to named events
- Frontend app.js maintains global App state and handles server events
- Game state synchronization happens through WebSocket event broadcasts

### Data Flow
1. MTGJson data downloaded to `/data` directory
2. Cards/sets loaded into memory on server startup  
3. Games create Pools which generate booster packs using rules from magic-sealed-data
4. Player actions broadcast through WebSocket to update all clients

### Build System
- Webpack handles frontend bundling (common/dev/prod configs)
- Babel transpiles ES6+ and JSX
- Frontend builds to `/built` directory
- Express serves static assets from `/built`

## Development Notes

- The app automatically downloads MTG data on first run via postinstall script
- Server runs on port 1337 by default
- Debugger attaches to port 1338 when using `start-debug`
- Game instances are managed in-memory (no database persistence)
- Tests use mocha with Babel register for ES6+ support