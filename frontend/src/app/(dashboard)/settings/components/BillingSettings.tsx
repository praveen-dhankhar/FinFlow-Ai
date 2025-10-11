'use client'

import { useState, useEffect } from 'react'
import { useBillingSettings, useUpdateBillingSettings } from '@/hooks/useUser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Crown,
  Zap,
  Building,
  Plus,
  Minus
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface BillingSettingsProps {
  onChange: () => void
}

export function BillingSettings({ onChange }: BillingSettingsProps) {
  const { data: settings, isLoading } = useBillingSettings()
  const updateSettings = useUpdateBillingSettings()

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'enterprise'>('premium')

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Perfect for getting started',
      features: [
        'Up to 100 transactions',
        '5 categories',
        '2 goals',
        '1 budget',
        'Basic analytics',
        'Email support'
      ],
      limits: {
        transactions: 100,
        categories: 5,
        goals: 2,
        budgets: 1
      },
      icon: CreditCard,
      color: 'gray'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      description: 'For serious budgeters',
      features: [
        'Unlimited transactions',
        'Unlimited categories',
        'Unlimited goals',
        'Unlimited budgets',
        'Advanced analytics',
        'Forecasting',
        'Priority support',
        'Data export'
      ],
      limits: {
        transactions: -1,
        categories: -1,
        goals: -1,
        budgets: -1
      },
      icon: Crown,
      color: 'blue'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 29.99,
      description: 'For teams and businesses',
      features: [
        'Everything in Premium',
        'Team collaboration',
        'Advanced reporting',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee'
      ],
      limits: {
        transactions: -1,
        categories: -1,
        goals: -1,
        budgets: -1
      },
      icon: Building,
      color: 'purple'
    }
  ]

  const currentPlan = plans.find(plan => plan.id === settings?.plan) || plans[0]

  const handleUpgrade = async () => {
    try {
      await updateSettings.mutateAsync({ plan: selectedPlan })
      setShowUpgradeDialog(false)
      onChange()
      toast.success(`Upgraded to ${selectedPlan} plan successfully`)
    } catch (error) {
      toast.error('Failed to upgrade plan')
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <currentPlan.icon className="w-5 h-5 mr-2" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your current subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
              <p className="text-gray-600">{currentPlan.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                ${currentPlan.price}
                {currentPlan.price > 0 && <span className="text-sm font-normal text-gray-600">/month</span>}
              </p>
              <Badge variant={settings?.status === 'active' ? 'default' : 'secondary'}>
                {settings?.status}
              </Badge>
            </div>
          </div>

          {settings?.nextBillingDate && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Next billing date: {format(new Date(settings.nextBillingDate), 'MMM dd, yyyy')}</span>
            </div>
          )}

          {settings?.paymentMethod && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CreditCard className="w-4 h-4" />
              <span>
                {settings.paymentMethod.brand?.toUpperCase()} •••• {settings.paymentMethod.last4}
                {settings.paymentMethod.expiryMonth && settings.paymentMethod.expiryYear && (
                  <span> • {settings.paymentMethod.expiryMonth}/{settings.paymentMethod.expiryYear}</span>
                )}
              </span>
            </div>
          )}

          {settings?.plan === 'free' && (
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Upgrade to Premium to unlock unlimited transactions, advanced analytics, and more features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Usage Statistics
          </CardTitle>
          <CardDescription>
            Your current usage compared to plan limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'transactions', label: 'Transactions', current: settings?.usage.transactions || 0, limit: currentPlan.limits.transactions },
              { key: 'categories', label: 'Categories', current: settings?.usage.categories || 0, limit: currentPlan.limits.categories },
              { key: 'goals', label: 'Goals', current: settings?.usage.goals || 0, limit: currentPlan.limits.goals },
              { key: 'budgets', label: 'Budgets', current: settings?.usage.budgets || 0, limit: currentPlan.limits.budgets }
            ].map((item) => {
              const percentage = getUsagePercentage(item.current, item.limit)
              const isUnlimited = item.limit === -1
              
              return (
                <div key={item.key} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">{item.label}</p>
                    <p className={`text-sm font-bold ${getUsageColor(percentage)}`}>
                      {item.current}
                      {!isUnlimited && ` / ${item.limit}`}
                    </p>
                  </div>
                  {!isUnlimited && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage >= 90 ? 'bg-red-500' : 
                          percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  )}
                  {isUnlimited && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Unlimited</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {settings?.plan === 'free' && (
            <div className="text-center">
              <Button onClick={() => setShowUpgradeDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Compare features and choose the plan that&apos;s right for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = plan.id === settings?.plan
              const Icon = plan.icon
              
              return (
                <div
                  key={plan.id}
                  className={`relative p-6 border rounded-lg ${
                    isCurrentPlan ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {isCurrentPlan && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      Current Plan
                    </Badge>
                  )}
                  
                  <div className="text-center mb-4">
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      plan.color === 'blue' ? 'text-blue-600' :
                      plan.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{plan.description}</p>
                    <p className="text-2xl font-bold">
                      ${plan.price}
                      {plan.price > 0 && <span className="text-sm font-normal text-gray-600">/month</span>}
                    </p>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {!isCurrentPlan && (
                    <Button
                      className="w-full"
                      variant={plan.id === 'free' ? 'outline' : 'default'}
                      onClick={() => {
                        if (plan.id === 'free') {
                          // Handle downgrade
                        } else {
                          setSelectedPlan(plan.id as any)
                          setShowUpgradeDialog(true)
                        }
                      }}
                    >
                      {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Your recent billing and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                date: '2024-01-01',
                description: 'Premium Plan - Monthly',
                amount: 9.99,
                status: 'paid'
              },
              {
                date: '2023-12-01',
                description: 'Premium Plan - Monthly',
                amount: 9.99,
                status: 'paid'
              },
              {
                date: '2023-11-01',
                description: 'Premium Plan - Monthly',
                amount: 9.99,
                status: 'paid'
              }
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{invoice.description}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(invoice.date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${invoice.amount}</p>
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              Choose a plan that fits your needs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              {plans.filter(plan => plan.id !== 'free').map((plan) => {
                const Icon = plan.icon
                return (
                  <label key={plan.id} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg">
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={selectedPlan === plan.id}
                      onChange={() => setSelectedPlan(plan.id as any)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <Icon className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                    <p className="text-lg font-bold">
                      ${plan.price}/month
                    </p>
                  </label>
                )
              })}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpgrade} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? 'Upgrading...' : 'Upgrade Plan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
