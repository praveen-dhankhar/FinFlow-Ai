# Finance Forecast App - Frontend

A modern React frontend for the Finance Forecast App built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Vite** - Lightning fast build tool and dev server
- **TypeScript** - Type-safe development with strict mode
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors and error handling
- **Anime.js** - Smooth animations and transitions
- **Recharts** - Beautiful charts and data visualization
- **Headless UI** - Accessible UI components
- **Heroicons** - Beautiful SVG icons
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Simple and complete testing utilities
- **ESLint & Prettier** - Code quality and formatting
- **Husky** - Git hooks for code quality

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API service layer
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── animations/         # Anime.js animation utilities
└── test/               # Test setup and utilities
```

## 🛠️ Development

### Prerequisites

- Node.js 20.19+ or 22.12+ (Vite requirement)
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## 🎨 Design System

The app uses a custom color palette and design tokens:

- **Primary**: Blue tones for main actions
- **Secondary**: Gray tones for secondary elements
- **Success**: Green tones for positive actions
- **Warning**: Yellow/Orange tones for warnings
- **Error**: Red tones for errors

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env.local` and configure:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Finance Forecast App
VITE_APP_VERSION=1.0.0
```

### API Proxy

The development server proxies `/api` requests to the Spring Boot backend at `http://localhost:8080`.

## 📦 Key Dependencies

- **React 19** - Latest React with concurrent features
- **Vite 7** - Next generation frontend tooling
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router 7** - Declarative routing
- **Axios** - Promise-based HTTP client
- **Anime.js** - Lightweight animation library
- **Recharts** - Composable charting library
- **Date-fns** - Modern date utility library

## 🧪 Testing

The project uses Vitest for unit testing with React Testing Library for component testing.

### Test Structure

- Component tests in `*.test.tsx` files
- Test utilities in `src/test/`
- Mock data and helpers available

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

The app builds to static files in the `dist/` directory and can be deployed to any static hosting service.

### Build Optimization

- Code splitting with manual chunks
- Tree shaking for unused code
- Minification and compression
- Source maps for debugging

## 📝 Scripts

- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build
- `test` - Run tests
- `lint` - Lint code
- `format` - Format code
- `prepare` - Setup git hooks

## 🔗 Integration

This frontend integrates with the Spring Boot backend:

- Authentication via JWT tokens
- RESTful API communication
- Real-time data updates
- Error handling and retry logic
- Request/response interceptors

## 📄 License

This project is part of the Finance Forecast App.