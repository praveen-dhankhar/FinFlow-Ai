# API Documentation

This document provides comprehensive documentation for the Finance Forecast App API.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
- [Rate Limiting](#rate-limiting)
- [SDK Examples](#sdk-examples)

## Overview

The Finance Forecast API is a RESTful API built with Spring Boot that provides comprehensive financial management capabilities. The API follows REST conventions and uses JSON for data exchange.

### Key Features

- **RESTful Design**: Standard HTTP methods and status codes
- **JSON API**: All requests and responses use JSON format
- **Authentication**: JWT-based authentication with refresh tokens
- **Validation**: Comprehensive input validation with detailed error messages
- **Pagination**: Cursor-based pagination for large datasets
- **Filtering**: Advanced filtering and sorting capabilities
- **Rate Limiting**: Built-in rate limiting to prevent abuse

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. **Login**: POST `/api/auth/login`
2. **Receive Token**: JWT token with expiration
3. **Use Token**: Include in subsequent requests
4. **Refresh Token**: Use refresh token to get new access token

### Token Types

- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal

## Base URL

```
Production: https://api.finance-forecast.app
Staging: https://staging-api.finance-forecast.app
Development: http://localhost:8080
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_REQUIRED` | Authentication token required |
| `INVALID_TOKEN` | Authentication token is invalid |
| `TOKEN_EXPIRED` | Authentication token has expired |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `RESOURCE_CONFLICT` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Internal server error |

## Endpoints

### Authentication

#### POST /api/auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

#### POST /api/auth/register

Register new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /api/auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/logout

Logout user and invalidate tokens.

### Transactions

#### GET /api/transactions

Get paginated list of transactions.

**Query Parameters:**
- `page` (number): Page number (default: 0)
- `size` (number): Page size (default: 20, max: 100)
- `search` (string): Search term
- `type` (string): Transaction type (INCOME, EXPENSE, TRANSFER)
- `category` (string): Category filter
- `startDate` (string): Start date (ISO 8601)
- `endDate` (string): End date (ISO 8601)
- `sort` (string): Sort field and direction (e.g., "date,desc")

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_123",
        "description": "Grocery Store",
        "amount": 85.50,
        "type": "EXPENSE",
        "category": "Food",
        "date": "2024-01-15",
        "tags": ["grocery", "food"],
        "notes": "Weekly grocery shopping",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "totalElements": 150,
      "totalPages": 8,
      "currentPage": 0,
      "pageSize": 20,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

#### POST /api/transactions

Create new transaction.

**Request Body:**
```json
{
  "description": "Coffee Shop",
  "amount": 4.75,
  "type": "EXPENSE",
  "category": "Food",
  "date": "2024-01-15",
  "tags": ["coffee", "breakfast"],
  "notes": "Morning coffee"
}
```

#### GET /api/transactions/{id}

Get specific transaction by ID.

#### PUT /api/transactions/{id}

Update existing transaction.

#### DELETE /api/transactions/{id}

Delete transaction.

#### POST /api/transactions/bulk-delete

Delete multiple transactions.

**Request Body:**
```json
{
  "ids": ["txn_123", "txn_456", "txn_789"]
}
```

#### GET /api/transactions/export

Export transactions to CSV or JSON.

**Query Parameters:**
- `format` (string): Export format (csv, json)
- `ids` (string): Comma-separated transaction IDs

### Categories

#### GET /api/categories

Get list of categories.

**Query Parameters:**
- `search` (string): Search term
- `parentId` (string): Parent category ID
- `isActive` (boolean): Active status filter
- `hasBudget` (boolean): Budget filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_123",
      "name": "Food & Dining",
      "description": "Restaurants, groceries, and food expenses",
      "icon": "🍕",
      "color": "#3B82F6",
      "isActive": true,
      "parentId": null,
      "budget": 500.00,
      "spending": {
        "currentMonth": 250.00,
        "lastMonth": 300.00,
        "yearToDate": 3000.00
      },
      "transactionCount": 45,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/categories

Create new category.

#### PUT /api/categories/{id}

Update category.

#### DELETE /api/categories/{id}

Delete category.

#### POST /api/categories/reorder

Reorder categories.

**Request Body:**
```json
{
  "categoryIds": ["cat_123", "cat_456", "cat_789"]
}
```

### Goals

#### GET /api/goals

Get list of financial goals.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "goal_123",
      "name": "Emergency Fund",
      "description": "Build a 6-month emergency fund",
      "targetAmount": 15000.00,
      "currentAmount": 8500.00,
      "targetDate": "2024-12-31",
      "category": "Emergency",
      "icon": "🛡️",
      "color": "#3B82F6",
      "status": "ACTIVE",
      "priority": "HIGH",
      "autoSaveAmount": 500.00,
      "autoSaveFrequency": "MONTHLY",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/goals

Create new goal.

#### PUT /api/goals/{id}

Update goal.

#### DELETE /api/goals/{id}

Delete goal.

#### GET /api/goals/{id}/progress

Get goal progress details.

#### GET /api/goals/{id}/contributions

Get goal contribution history.

#### POST /api/goals/contributions

Add goal contribution.

### Budgets

#### GET /api/budgets

Get list of budgets.

#### GET /api/budgets/current

Get current active budget.

#### POST /api/budgets

Create new budget.

#### PUT /api/budgets/{id}

Update budget.

#### DELETE /api/budgets/{id}

Delete budget.

#### GET /api/budgets/{id}/insights

Get budget insights and recommendations.

#### GET /api/budgets/{id}/recommendations

Get budget optimization recommendations.

### Analytics

#### GET /api/analytics/summary

Get financial summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSpending": 2500.00,
    "totalIncome": 7200.00,
    "netSavings": 4700.00,
    "savingsRate": 65.3,
    "topSpendingCategory": "Food & Dining",
    "biggestVariance": -150.00,
    "anomalyCount": 3,
    "goalProgress": 75
  }
}
```

#### GET /api/analytics/spending-trends

Get spending trends data.

#### GET /api/analytics/income

Get income analysis.

#### GET /api/analytics/savings-goals

Get savings goals analysis.

#### GET /api/analytics/budget-performance

Get budget performance data.

### Forecasts

#### GET /api/forecasts

Get financial forecasts.

**Query Parameters:**
- `startDate` (string): Forecast start date
- `endDate` (string): Forecast end date
- `scenarioId` (string): Scenario ID

#### GET /api/forecasts/scenarios

Get forecast scenarios.

#### POST /api/forecasts/scenarios

Create new scenario.

#### GET /api/forecasts/insights

Get forecast insights.

#### GET /api/forecasts/summary

Get forecast summary.

### User Profile

#### GET /api/user/profile

Get user profile.

#### PUT /api/user/profile

Update user profile.

#### POST /api/user/avatar

Upload user avatar.

#### POST /api/user/change-password

Change user password.

#### GET /api/user/stats

Get user statistics.

#### GET /api/user/activity

Get user activity log.

### Settings

#### GET /api/user/settings/notifications

Get notification settings.

#### PUT /api/user/settings/notifications

Update notification settings.

#### GET /api/user/settings/security

Get security settings.

#### PUT /api/user/settings/security

Update security settings.

#### POST /api/user/2fa/enable

Enable two-factor authentication.

#### POST /api/user/2fa/disable

Disable two-factor authentication.

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Authenticated Users**: 1000 requests per hour
- **Unauthenticated Users**: 100 requests per hour
- **Burst Limit**: 50 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { FinanceForecastAPI } from '@finance-forecast/sdk'

const api = new FinanceForecastAPI({
  baseURL: 'https://api.finance-forecast.app',
  apiKey: 'your-api-key'
})

// Login
const auth = await api.auth.login({
  email: 'user@example.com',
  password: 'password123'
})

// Get transactions
const transactions = await api.transactions.list({
  page: 0,
  size: 20,
  type: 'EXPENSE'
})

// Create transaction
const newTransaction = await api.transactions.create({
  description: 'Coffee Shop',
  amount: 4.75,
  type: 'EXPENSE',
  category: 'Food'
})
```

### Python

```python
from finance_forecast import FinanceForecastAPI

api = FinanceForecastAPI(
    base_url='https://api.finance-forecast.app',
    api_key='your-api-key'
)

# Login
auth = api.auth.login(
    email='user@example.com',
    password='password123'
)

# Get transactions
transactions = api.transactions.list(
    page=0,
    size=20,
    type='EXPENSE'
)

# Create transaction
new_transaction = api.transactions.create({
    'description': 'Coffee Shop',
    'amount': 4.75,
    'type': 'EXPENSE',
    'category': 'Food'
})
```

### cURL Examples

```bash
# Login
curl -X POST https://api.finance-forecast.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get transactions
curl -X GET "https://api.finance-forecast.app/api/transactions?page=0&size=20" \
  -H "Authorization: Bearer your-jwt-token"

# Create transaction
curl -X POST https://api.finance-forecast.app/api/transactions \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"description":"Coffee Shop","amount":4.75,"type":"EXPENSE","category":"Food"}'
```

## Webhooks

The API supports webhooks for real-time notifications:

### Webhook Events

- `transaction.created`
- `transaction.updated`
- `transaction.deleted`
- `goal.completed`
- `budget.exceeded`
- `user.profile.updated`

### Webhook Payload

```json
{
  "event": "transaction.created",
  "data": {
    "id": "txn_123",
    "description": "Coffee Shop",
    "amount": 4.75,
    "type": "EXPENSE"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Support

For API support and questions:

- **Email**: api-support@finance-forecast.app
- **Documentation**: https://docs.finance-forecast.app
- **Status Page**: https://status.finance-forecast.app
- **GitHub Issues**: https://github.com/finance-forecast/api/issues