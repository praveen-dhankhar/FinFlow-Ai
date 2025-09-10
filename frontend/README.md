# Finance Forecast App - Frontend

A modern React 18+ frontend application for the Finance Forecast App, built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Features

- **React 18+** with TypeScript for type safety
- **Vite** for fast development and modern bundling
- **Tailwind CSS** for utility-first styling
- **React Router DOM** for client-side routing
- **TanStack Query** for server state management
- **React Hook Form** for form handling
- **Axios** for HTTP requests with interceptors
- **Anime.js** for smooth animations
- **Recharts** for data visualization
- **Headless UI** for accessible components
- **Heroicons** for beautiful icons
- **Vitest** for unit testing
- **MSW** for API mocking
- **ESLint & Prettier** for code quality

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── contexts/           # React contexts
├── assets/             # Static assets
└── test/               # Test utilities and mocks
```

## 🛠️ Development

### Prerequisites

- Node.js 20.19+ or 22.12+
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

### Building for Production

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

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env.local` and configure:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Finance Forecast App
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
VITE_MOCK_API=false
```

### API Integration

The frontend is configured to proxy API requests to the Spring Boot backend running on port 8080. The proxy configuration is set up in `vite.config.ts`.

## 🎨 Styling

The app uses Tailwind CSS with a custom color palette:

- **Primary**: Blue shades for main actions
- **Secondary**: Gray shades for secondary elements
- **Success**: Green shades for positive actions
- **Warning**: Yellow shades for warnings
- **Error**: Red shades for errors

## 🧪 Testing

The project uses Vitest for unit testing and React Testing Library for component testing. MSW (Mock Service Worker) is set up for API mocking during development and testing.

## 📦 Build Optimization

The Vite configuration includes:

- Code splitting with manual chunks
- Tree shaking for unused code
- Source maps for debugging
- Optimized dependencies

## 🚀 Deployment

The built application can be deployed to any static hosting service:

1. Run `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure your hosting service to serve `index.html` for all routes (SPA routing)

## 🤝 Contributing

1. Follow the existing code style
2. Write tests for new features
3. Ensure all tests pass
4. Run linting and formatting before committing

## 📄 License

This project is part of the Finance Forecast App.