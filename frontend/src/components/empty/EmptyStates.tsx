'use client'

import { motion } from 'framer-motion'
import { 
  CreditCard, 
  Target, 
  Calculator, 
  BarChart3, 
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  BookOpen,
  Lightbulb,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }
  tips?: string[]
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  secondaryAction,
  tips,
  className
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('text-center py-12 px-4', className)}
    >
      <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action && (
          <Button onClick={action.onClick} variant={action.variant || 'default'}>
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button onClick={secondaryAction.onClick} variant={secondaryAction.variant || 'outline'}>
            {secondaryAction.label}
          </Button>
        )}
      </div>

      {tips && tips.length > 0 && (
        <div className="mt-8 max-w-md mx-auto">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Quick Tips
          </h4>
          <div className="space-y-2">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Transactions empty state
export function EmptyTransactions({ onAddTransaction, onImport }: {
  onAddTransaction: () => void
  onImport: () => void
}) {
  return (
    <EmptyState
      title="No transactions yet"
      description="Start tracking your finances by adding your first transaction. You can also import data from other apps."
      icon={CreditCard}
      action={{
        label: 'Add Transaction',
        onClick: onAddTransaction
      }}
      secondaryAction={{
        label: 'Import Data',
        onClick: onImport,
        variant: 'outline'
      }}
      tips={[
        'Add transactions as they happen for accurate tracking',
        'Use categories to organize your spending',
        'Import bank statements for bulk data entry'
      ]}
    />
  )
}

// Categories empty state
export function EmptyCategories({ onCreateCategory }: {
  onCreateCategory: () => void
}) {
  return (
    <EmptyState
      title="No categories yet"
      description="Create spending categories to organize your transactions and get better insights into your finances."
      icon={Target}
      action={{
        label: 'Create Category',
        onClick: onCreateCategory
      }}
      tips={[
        'Create broad categories like Food, Transport, Entertainment',
        'Use subcategories for more detailed tracking',
        'Set budget limits for each category'
      ]}
    />
  )
}

// Goals empty state
export function EmptyGoals({ onCreateGoal }: {
  onCreateGoal: () => void
}) {
  return (
    <EmptyState
      title="No financial goals yet"
      description="Set financial goals to stay motivated and track your progress towards important milestones."
      icon={Target}
      action={{
        label: 'Create Goal',
        onClick: onCreateGoal
      }}
      tips={[
        'Start with an emergency fund goal',
        'Set realistic timelines for your goals',
        'Break large goals into smaller milestones'
      ]}
    />
  )
}

// Budgets empty state
export function EmptyBudgets({ onCreateBudget }: {
  onCreateBudget: () => void
}) {
  return (
    <EmptyState
      title="No budgets yet"
      description="Create budgets to plan your spending and avoid overspending in important categories."
      icon={Calculator}
      action={{
        label: 'Create Budget',
        onClick: onCreateBudget
      }}
      tips={[
        'Start with a monthly budget',
        'Use the 50/30/20 rule as a starting point',
        'Review and adjust budgets regularly'
      ]}
    />
  )
}

// Analytics empty state
export function EmptyAnalytics({ onAddData }: {
  onAddData: () => void
}) {
  return (
    <EmptyState
      title="No data to analyze yet"
      description="Add some transactions and categories to see detailed analytics and insights about your finances."
      icon={BarChart3}
      action={{
        label: 'Add Data',
        onClick: onAddData
      }}
      tips={[
        'Add at least 10-15 transactions for meaningful insights',
        'Use consistent categories for better analysis',
        'Check back weekly to see trends'
      ]}
    />
  )
}

// Forecasts empty state
export function EmptyForecasts({ onGenerateForecast }: {
  onGenerateForecast: () => void
}) {
  return (
    <EmptyState
      title="No forecasts available"
      description="Generate financial forecasts to predict your future financial position and plan accordingly."
      icon={TrendingUp}
      action={{
        label: 'Generate Forecast',
        onClick: onGenerateForecast
      }}
      tips={[
        'Forecasts work best with 3+ months of data',
        'Include both income and expense patterns',
        'Review forecasts monthly and adjust as needed'
      ]}
    />
  )
}

// Search empty state
export function EmptySearch({ query, onClearSearch }: {
  query: string
  onClearSearch: () => void
}) {
  return (
    <EmptyState
      title="No results found"
      description={`We couldn\'t find anything matching "${query}". Try different keywords or check your spelling.`}
      icon={Search}
      action={{
        label: 'Clear Search',
        onClick: onClearSearch,
        variant: 'outline'
      }}
      tips={[
        'Try broader search terms',
        'Check for typos in your search',
        'Use category names or transaction descriptions'
      ]}
    />
  )
}

// Onboarding component
interface OnboardingStep {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action: {
    label: string
    onClick: () => void
  }
  completed?: boolean
}

interface OnboardingProps {
  steps: OnboardingStep[]
  onComplete: () => void
  className?: string
}

export function Onboarding({ steps, onComplete, className }: OnboardingProps) {
  const completedSteps = steps.filter(step => step.completed).length
  const progress = (completedSteps / steps.length) * 100

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Complete these steps to set up your financial tracking
            </CardDescription>
          </div>
          <Badge variant="outline">
            {completedSteps}/{steps.length} Complete
          </Badge>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center space-x-4 p-4 rounded-lg border',
                step.completed 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                step.completed 
                  ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
              )}>
                {step.completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                  >
                    ✓
                  </motion.div>
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className={cn(
                  'font-medium',
                  step.completed 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-gray-900 dark:text-white'
                )}>
                  {step.title}
                </h4>
                <p className={cn(
                  'text-sm',
                  step.completed 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-gray-600 dark:text-gray-400'
                )}>
                  {step.description}
                </p>
              </div>

              {!step.completed && (
                <Button onClick={step.action.onClick} size="sm">
                  {step.action.label}
                </Button>
              )}
            </motion.div>
          )
        })}

        {completedSteps === steps.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Great job! You&apos;ve completed the setup.
            </p>
            <Button onClick={onComplete} className="w-full">
              Continue to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
