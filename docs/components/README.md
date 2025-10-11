# Component Documentation

This document provides comprehensive documentation for all UI components in the Finance Forecast App.

## Table of Contents

- [Overview](#overview)
- [Component Library](#component-library)
- [Usage Examples](#usage-examples)
- [Props Documentation](#props-documentation)
- [Styling Guide](#styling-guide)
- [Accessibility](#accessibility)

## Overview

Our component library is built with React, TypeScript, and Tailwind CSS, following modern design principles and accessibility standards.

### Key Features

- **TypeScript**: Full type safety and IntelliSense support
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Accessibility**: WCAG 2.1 AA compliant components
- **Responsive**: Mobile-first responsive design
- **Dark Mode**: Built-in dark mode support
- **Storybook**: Interactive component playground

## Component Library

### UI Components

#### Button

A versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui/Button'

// Basic usage
<Button>Click me</Button>

// With variant
<Button variant="destructive">Delete</Button>

// With size
<Button size="lg">Large Button</Button>

// With icon
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>
```

**Props:**
- `variant`: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
- `size`: 'default' | 'sm' | 'lg' | 'icon'
- `disabled`: boolean
- `children`: ReactNode

#### Input

A form input component with validation support.

```tsx
import { Input } from '@/components/ui/Input'

// Basic usage
<Input placeholder="Enter text..." />

// With label
<div>
  <label htmlFor="email">Email</label>
  <Input id="email" type="email" placeholder="Enter email..." />
</div>

// With validation
<Input 
  className={hasError ? 'border-red-500' : ''}
  placeholder="Enter amount..."
/>
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
- `placeholder`: string
- `disabled`: boolean
- `required`: boolean
- `value`: string
- `onChange`: (event: ChangeEvent<HTMLInputElement>) => void

#### Card

A container component for grouping related content.

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

<Card>
  <CardHeader>
    <CardTitle>Transaction Details</CardTitle>
    <CardDescription>View and edit transaction information</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Transaction content goes here...</p>
  </CardContent>
</Card>
```

#### Tabs

A tabbed interface component for organizing content.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="transactions">Transactions</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="transactions">Transactions content</TabsContent>
  <TabsContent value="analytics">Analytics content</TabsContent>
</Tabs>
```

### Form Components

#### TransactionForm

A comprehensive form for creating and editing transactions.

```tsx
import { TransactionForm } from '@/components/forms/TransactionForm'

// Create new transaction
<TransactionForm 
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>

// Edit existing transaction
<TransactionForm 
  initialData={transaction}
  onSubmit={handleUpdate}
  onCancel={handleCancel}
/>
```

**Props:**
- `onSubmit`: (data: TransactionData) => Promise<void>
- `initialData?`: TransactionData
- `onCancel?`: () => void
- `className?`: string

#### CategoryForm

A form for managing spending categories.

```tsx
import { CategoryForm } from '@/components/forms/CategoryForm'

<CategoryForm 
  onSubmit={handleSubmit}
  initialData={category}
  onCancel={handleCancel}
/>
```

### Data Display Components

#### TransactionList

A list component for displaying transactions with filtering and sorting.

```tsx
import { TransactionList } from '@/components/transactions/TransactionList'

<TransactionList 
  transactions={transactions}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onBulkDelete={handleBulkDelete}
  filters={filters}
  onFiltersChange={handleFiltersChange}
/>
```

#### CategoryGrid

A grid component for displaying spending categories.

```tsx
import { CategoryGrid } from '@/components/categories/CategoryGrid'

<CategoryGrid 
  categories={categories}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onCreate={handleCreate}
/>
```

#### GoalCard

A card component for displaying financial goals.

```tsx
import { GoalCard } from '@/components/goals/GoalCard'

<GoalCard 
  goal={goal}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onContribute={handleContribute}
/>
```

### Chart Components

#### SpendingChart

A chart component for displaying spending trends.

```tsx
import { SpendingChart } from '@/components/charts/SpendingChart'

<SpendingChart 
  data={spendingData}
  period="month"
  onPeriodChange={handlePeriodChange}
/>
```

#### CategoryBreakdown

A pie chart component for category spending breakdown.

```tsx
import { CategoryBreakdown } from '@/components/charts/CategoryBreakdown'

<CategoryBreakdown 
  data={categoryData}
  onCategoryClick={handleCategoryClick}
/>
```

### Error Components

#### ErrorBoundary

A React error boundary component for handling JavaScript errors.

```tsx
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

<ErrorBoundary level="page">
  <YourComponent />
</ErrorBoundary>

<ErrorBoundary level="component" fallback={<CustomFallback />}>
  <YourComponent />
</ErrorBoundary>
```

**Props:**
- `level`: 'page' | 'section' | 'component'
- `fallback?`: ReactNode
- `onError?`: (error: Error, errorInfo: ErrorInfo) => void

#### EmptyState

A component for displaying empty states with actionable CTAs.

```tsx
import { EmptyTransactions } from '@/components/empty/EmptyStates'

<EmptyTransactions 
  onAddTransaction={handleAddTransaction}
  onImport={handleImport}
/>
```

### Loading Components

#### SkeletonLoader

A skeleton loading component for better perceived performance.

```tsx
import { DashboardSkeleton, TransactionsSkeleton } from '@/components/loading/LoadingStates'

// Dashboard skeleton
<DashboardSkeleton />

// Transactions skeleton
<TransactionsSkeleton />
```

#### ProgressiveLoading

A component that shows skeleton while loading and content when ready.

```tsx
import { ProgressiveLoading } from '@/components/loading/LoadingStates'

<ProgressiveLoading
  isLoading={isLoading}
  skeleton={<TransactionsSkeleton />}
>
  <TransactionList transactions={transactions} />
</ProgressiveLoading>
```

## Usage Examples

### Complete Transaction Management

```tsx
import { useState } from 'react'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'

function TransactionManagement() {
  const [transactions, setTransactions] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  const handleAddTransaction = async (data) => {
    try {
      const newTransaction = await api.transactions.create(data)
      setTransactions(prev => [newTransaction, ...prev])
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to create transaction:', error)
    }
  }

  const handleEditTransaction = async (id, data) => {
    try {
      const updatedTransaction = await api.transactions.update(id, data)
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      )
      setEditingTransaction(null)
    } catch (error) {
      console.error('Failed to update transaction:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>Add Transaction</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm 
              onSubmit={handleAddTransaction}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <TransactionList 
        transactions={transactions}
        onEdit={setEditingTransaction}
        onDelete={handleDeleteTransaction}
        onBulkDelete={handleBulkDelete}
      />

      {editingTransaction && (
        <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm 
              initialData={editingTransaction}
              onSubmit={(data) => handleEditTransaction(editingTransaction.id, data)}
              onCancel={() => setEditingTransaction(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
```

### Dashboard with Charts

```tsx
import { useState, useEffect } from 'react'
import { SpendingChart } from '@/components/charts/SpendingChart'
import { CategoryBreakdown } from '@/components/charts/CategoryBreakdown'
import { TransactionList } from '@/components/transactions/TransactionList'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await api.dashboard.get()
        setDashboardData(data)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>
        {/* More cards... */}
      </div>

      {/* Charts */}
      <Tabs defaultValue="spending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="spending">Spending Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          <TabsTrigger value="recent">Recent Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="spending">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>Your spending patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <SpendingChart data={dashboardData.spendingTrends} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryBreakdown data={dashboardData.categoryBreakdown} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList 
                transactions={dashboardData.recentTransactions}
                showActions={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

## Props Documentation

### Common Props

Most components share common props for consistency:

#### Styling Props
- `className?: string` - Additional CSS classes
- `style?: React.CSSProperties` - Inline styles
- `variant?: string` - Visual variant
- `size?: string` - Size variant

#### Event Props
- `onClick?: (event: MouseEvent) => void` - Click handler
- `onChange?: (event: ChangeEvent) => void` - Change handler
- `onFocus?: (event: FocusEvent) => void` - Focus handler
- `onBlur?: (event: FocusEvent) => void` - Blur handler

#### Accessibility Props
- `ariaLabel?: string` - Accessible label
- `ariaDescribedBy?: string` - Described by element ID
- `role?: string` - ARIA role
- `tabIndex?: number` - Tab order

### Component-Specific Props

#### Button Props
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}
```

#### Input Props
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}
```

#### Card Props
```typescript
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  clickable?: boolean
}
```

## Styling Guide

### Design Tokens

Our design system uses consistent design tokens:

```css
/* Colors */
--primary: 210 100% 50%;
--secondary: 210 40% 98%;
--accent: 210 100% 50%;
--destructive: 0 84% 60%;
--muted: 210 40% 96%;
--background: 0 0% 100%;
--foreground: 222 84% 5%;

/* Spacing */
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;

/* Typography */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
```

### Custom Styling

Components can be customized using Tailwind classes:

```tsx
<Button className="bg-custom-color hover:bg-custom-color-dark">
  Custom Button
</Button>

<Card className="border-2 border-dashed border-gray-300">
  <CardContent>
    Custom styled card
  </CardContent>
</Card>
```

### Dark Mode

Components automatically support dark mode:

```tsx
// Dark mode classes are applied automatically
<Button>Button</Button> // Works in both light and dark modes
```

## Accessibility

### WCAG 2.1 AA Compliance

All components are built with accessibility in mind:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and roles
- **Color Contrast**: WCAG AA compliant color ratios
- **Focus Management**: Visible focus indicators
- **Semantic HTML**: Proper HTML semantics

### Accessibility Examples

```tsx
// Proper labeling
<label htmlFor="email-input">Email Address</label>
<Input 
  id="email-input"
  type="email"
  aria-describedby="email-help"
/>
<p id="email-help">We'll never share your email</p>

// Button with proper ARIA
<Button 
  aria-label="Close dialog"
  onClick={handleClose}
>
  ×
</Button>

// Form with validation
<Input 
  aria-invalid={hasError}
  aria-describedby={hasError ? "error-message" : undefined}
/>
{hasError && (
  <p id="error-message" role="alert">
    {errorMessage}
  </p>
)}
```

### Testing Accessibility

Use these tools to test component accessibility:

```bash
# Storybook accessibility addon
npm run storybook

# Automated accessibility testing
npm run test:a11y

# Manual testing with screen readers
# - NVDA (Windows)
# - JAWS (Windows)
# - VoiceOver (macOS)
# - TalkBack (Android)
```

## Storybook Integration

### Viewing Components

Start Storybook to explore all components:

```bash
npm run storybook
```

### Creating Stories

Create new stories for custom components:

```tsx
// MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { MyComponent } from './MyComponent'

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    // Default props
  },
}
```

## Best Practices

### Component Design

1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition**: Build complex components from simple ones
3. **Props Interface**: Keep prop interfaces simple and intuitive
4. **Default Values**: Provide sensible defaults for optional props
5. **Error Boundaries**: Wrap components in error boundaries

### Performance

1. **Memoization**: Use React.memo for expensive components
2. **Lazy Loading**: Lazy load heavy components
3. **Bundle Size**: Keep components lightweight
4. **Tree Shaking**: Export components individually

### Testing

1. **Unit Tests**: Test component behavior, not implementation
2. **Accessibility Tests**: Test with screen readers
3. **Visual Tests**: Use Storybook for visual regression testing
4. **Integration Tests**: Test component interactions

## Support

For component-related questions:

- **Documentation**: This guide and Storybook
- **GitHub Issues**: Component-specific issues
- **Discord**: #components channel
- **Email**: components@finance-forecast.app
