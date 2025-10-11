# Finance Forecast App

A comprehensive financial management application built with Next.js, React, and TypeScript. Track your expenses, manage budgets, set financial goals, and get AI-powered insights into your financial future.

![Finance Forecast App](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.1-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 Features

### 💰 Financial Management
- **Transaction Tracking**: Add, edit, and categorize income and expenses
- **Budget Management**: Create and monitor monthly budgets with alerts
- **Goal Setting**: Set and track financial goals with progress visualization
- **Category Management**: Organize spending with custom categories and subcategories

### 📊 Analytics & Insights
- **Spending Analysis**: Detailed breakdowns by category, time period, and trends
- **Income Tracking**: Monitor income sources and patterns
- **Savings Rate**: Calculate and track your savings rate over time
- **Financial Health Score**: Get insights into your financial well-being

### 🔮 Forecasting & Planning
- **AI-Powered Predictions**: Machine learning models for financial forecasting
- **Scenario Planning**: Test different financial scenarios and their outcomes
- **Goal Projections**: See when you'll reach your financial goals
- **Risk Assessment**: Identify potential financial risks and opportunities

### 🎨 User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Mode**: Beautiful themes with system preference detection
- **PWA Support**: Install as a native app with offline functionality
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support

### 🔒 Security & Privacy
- **End-to-End Encryption**: Secure data transmission and storage
- **Two-Factor Authentication**: Enhanced account security
- **Data Privacy**: GDPR compliant with user data control
- **Regular Backups**: Automated data backup and recovery

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.1** - UI library with concurrent features
- **TypeScript 5.0** - Type-safe JavaScript
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 11.18.2** - Animation library
- **Recharts 2.15.4** - Chart library for data visualization

### State Management
- **TanStack Query 5.87.4** - Server state management
- **Zustand 4.5.7** - Client state management
- **React Hook Form 7.62.0** - Form state management

### Testing
- **Jest 30.2.0** - Unit testing framework
- **React Testing Library 16.3.0** - Component testing
- **Playwright 1.40.0** - E2E testing
- **MSW 2.11.5** - API mocking

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Storybook** - Component documentation
- **Lighthouse CI** - Performance monitoring

## 📋 Prerequisites

- **Node.js** 18.17.0 or higher
- **npm** 9.0.0 or higher
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/finance-forecast-app.git
cd finance-forecast-app
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### 3. Environment Setup

Create environment files:

```bash
# Frontend environment
cp frontend/.env.example frontend/.env.local

# Backend environment (if applicable)
cp .env.example .env
```

### 4. Configure Environment Variables

#### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finance_forecast

# External Services
OPENAI_API_KEY=your-openai-key
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_OFFLINE=true
```

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finance_forecast
DATABASE_POOL_SIZE=10

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=finance-forecast-storage
AWS_REGION=us-east-1
```

### 5. Database Setup

```bash
# Start PostgreSQL (using Docker)
docker-compose up -d postgres

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### 6. Start Development Servers

```bash
# Start backend (from root)
npm run dev:backend

# Start frontend (from frontend directory)
cd frontend
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Documentation**: http://localhost:8080/api-docs
- **Storybook**: http://localhost:6006

## 📁 Project Structure

```
finance-forecast-app/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and configurations
│   │   ├── stores/          # Zustand state stores
│   │   ├── types/           # TypeScript type definitions
│   │   └── __tests__/       # Test files
│   ├── public/              # Static assets
│   ├── e2e/                 # Playwright E2E tests
│   └── stories/             # Storybook stories
├── backend/                 # Spring Boot backend (if applicable)
├── docker/                  # Docker configurations
├── docs/                    # Documentation
├── postman/                 # API collections
└── ops/                     # Deployment scripts
```

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# All tests
npm run test:all
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## 📚 Documentation

### Component Documentation
- **Storybook**: http://localhost:6006
- **Component Examples**: Interactive component playground
- **Props Documentation**: Detailed prop descriptions
- **Usage Examples**: Real-world implementation examples

### API Documentation
- **Swagger UI**: http://localhost:8080/api-docs
- **Postman Collection**: Available in `/postman` directory
- **API Reference**: Comprehensive endpoint documentation

### Additional Documentation
- **Testing Guide**: [TESTING.md](frontend/TESTING.md)
- **Deployment Guide**: [docs/deployment/](docs/deployment/)
- **Architecture Decisions**: [docs/adr/](docs/adr/)

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend (if applicable)
npm run build:backend
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment-Specific Deployment

#### Development
```bash
npm run dev
```

#### Staging
```bash
npm run build:staging
npm run deploy:staging
```

#### Production
```bash
npm run build:production
npm run deploy:production
```

## 🔧 Configuration

### Database Configuration

The application supports multiple database configurations:

```yaml
# application.yml
spring:
  datasource:
    url: ${DATABASE_URL}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
```

### Feature Flags

Control application features through environment variables:

```env
# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_OFFLINE=true
NEXT_PUBLIC_ENABLE_FORECASTING=true
NEXT_PUBLIC_ENABLE_GOALS=true
NEXT_PUBLIC_ENABLE_BUDGETS=true
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Write tests** for new functionality
5. **Run tests**: `npm run test:all`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent code formatting
- **Testing**: 80% coverage requirement
- **Documentation**: JSDoc for all public APIs

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

## 📊 Performance

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Lighthouse CI
npm run lighthouse
```

### Performance Metrics

- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Total Blocking Time**: < 300ms
- **Bundle Size**: < 500KB main bundle

## 🔒 Security

### Security Features

- **HTTPS Only**: All production traffic encrypted
- **CSP Headers**: Content Security Policy implemented
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Output encoding and sanitization
- **CSRF Protection**: Cross-Site Request Forgery prevention

### Security Checklist

- [ ] Environment variables secured
- [ ] Database credentials encrypted
- [ ] API endpoints authenticated
- [ ] File uploads validated
- [ ] Dependencies updated regularly
- [ ] Security headers configured

## 📈 Monitoring

### Application Monitoring

- **Error Tracking**: Sentry integration
- **Performance Monitoring**: Real User Monitoring (RUM)
- **Uptime Monitoring**: Health check endpoints
- **Log Aggregation**: Centralized logging

### Metrics Tracked

- **User Engagement**: Page views, session duration
- **Performance**: Core Web Vitals, API response times
- **Errors**: JavaScript errors, API failures
- **Business Metrics**: User registrations, feature usage

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
docker-compose ps postgres

# View database logs
docker-compose logs postgres
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install
```

#### Test Issues
```bash
# Clear Jest cache
npm run test -- --clearCache

# Update Playwright browsers
npm run test:setup
```

### Getting Help

- **Documentation**: Check the docs/ directory
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: support@finance-forecast.app

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Tailwind CSS** - Beautiful utility-first CSS
- **React Query** - Excellent server state management
- **Recharts** - Powerful charting library
- **Framer Motion** - Smooth animations
- **Playwright** - Reliable E2E testing

## 📞 Support

- **Email**: support@finance-forecast.app
- **Documentation**: [docs.finance-forecast.app](https://docs.finance-forecast.app)
- **Status Page**: [status.finance-forecast.app](https://status.finance-forecast.app)

---

Made with ❤️ by the Finance Forecast Team