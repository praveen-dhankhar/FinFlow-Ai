'use client'

import { useState, useEffect } from 'react'
import { useNotificationSettings, useUpdateNotificationSettings } from '@/hooks/useUser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSettingsProps {
  onChange: () => void
}

export function NotificationSettings({ onChange }: NotificationSettingsProps) {
  const { data: settings, isLoading } = useNotificationSettings()
  const updateSettings = useUpdateNotificationSettings()

  const [localSettings, setLocalSettings] = useState({
    email: {
      enabled: true,
      transactions: true,
      budgets: true,
      goals: true,
      reports: true,
      security: true,
      marketing: false
    },
    push: {
      enabled: false,
      transactions: false,
      budgets: false,
      goals: false,
      security: true
    },
    frequency: 'immediate' as 'immediate' | 'daily' | 'weekly' | 'monthly',
    thresholds: {
      budgetAlert: 80,
      goalProgress: 25,
      unusualSpending: 150
    }
  })

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleEmailToggle = (key: string) => {
    const newSettings = {
      ...localSettings,
      email: {
        ...localSettings.email,
        [key]: !localSettings.email[key as keyof typeof localSettings.email]
      }
    }
    setLocalSettings(newSettings)
    onChange()
  }

  const handlePushToggle = (key: string) => {
    const newSettings = {
      ...localSettings,
      push: {
        ...localSettings.push,
        [key]: !localSettings.push[key as keyof typeof localSettings.push]
      }
    }
    setLocalSettings(newSettings)
    onChange()
  }

  const handleFrequencyChange = (frequency: string) => {
    setLocalSettings({
      ...localSettings,
      frequency: frequency as any
    })
    onChange()
  }

  const handleThresholdChange = (key: string, value: number) => {
    setLocalSettings({
      ...localSettings,
      thresholds: {
        ...localSettings.thresholds,
        [key]: value
      }
    })
    onChange()
  }

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(localSettings)
      toast.success('Notification settings updated successfully')
    } catch (error) {
      toast.error('Failed to update notification settings')
    }
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
                {[...Array(4)].map((_, j) => (
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
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Configure which email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={localSettings.email.enabled}
                onChange={() => handleEmailToggle('enabled')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {localSettings.email.enabled && (
            <>
              <Separator />
              <div className="space-y-3">
                {[
                  { key: 'transactions', label: 'Transaction Alerts', description: 'New transactions and updates' },
                  { key: 'budgets', label: 'Budget Alerts', description: 'Budget warnings and overspend notifications' },
                  { key: 'goals', label: 'Goal Updates', description: 'Progress updates and milestone achievements' },
                  { key: 'reports', label: 'Reports', description: 'Weekly and monthly financial reports' },
                  { key: 'security', label: 'Security Alerts', description: 'Login attempts and security notifications' },
                  { key: 'marketing', label: 'Marketing', description: 'Product updates and promotional content' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={localSettings.email[item.key as keyof typeof localSettings.email] as boolean}
                        onChange={() => handleEmailToggle(item.key)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Configure push notifications for your mobile device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Push Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications on your device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={localSettings.push.enabled}
                onChange={() => handlePushToggle('enabled')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {localSettings.push.enabled && (
            <>
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  Push notifications require browser permission. Make sure to allow notifications in your browser settings.
                </AlertDescription>
              </Alert>
              <Separator />
              <div className="space-y-3">
                {[
                  { key: 'transactions', label: 'Transaction Alerts', description: 'New transactions and updates' },
                  { key: 'budgets', label: 'Budget Alerts', description: 'Budget warnings and overspend notifications' },
                  { key: 'goals', label: 'Goal Updates', description: 'Progress updates and milestone achievements' },
                  { key: 'security', label: 'Security Alerts', description: 'Login attempts and security notifications' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={localSettings.push[item.key as keyof typeof localSettings.push] as boolean}
                        onChange={() => handlePushToggle(item.key)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Notification Frequency
          </CardTitle>
          <CardDescription>
            Choose how often you want to receive non-urgent notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { value: 'immediate', label: 'Immediate', description: 'Receive notifications as they happen' },
              { value: 'daily', label: 'Daily Digest', description: 'Receive a daily summary of notifications' },
              { value: 'weekly', label: 'Weekly Summary', description: 'Receive a weekly summary of notifications' },
              { value: 'monthly', label: 'Monthly Report', description: 'Receive a monthly summary of notifications' }
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value={option.value}
                  checked={localSettings.frequency === option.value}
                  onChange={() => handleFrequencyChange(option.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Alert Thresholds
          </CardTitle>
          <CardDescription>
            Set thresholds for when you want to be notified about spending and progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budgetAlert">Budget Alert Threshold (%)</Label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="budgetAlert"
                  min="50"
                  max="100"
                  value={localSettings.thresholds.budgetAlert}
                  onChange={(e) => handleThresholdChange('budgetAlert', parseInt(e.target.value))}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[60px] text-center">
                  {localSettings.thresholds.budgetAlert}%
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Get notified when you&apos;ve spent this percentage of your budget
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalProgress">Goal Progress Threshold (%)</Label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="goalProgress"
                  min="10"
                  max="100"
                  step="5"
                  value={localSettings.thresholds.goalProgress}
                  onChange={(e) => handleThresholdChange('goalProgress', parseInt(e.target.value))}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[60px] text-center">
                  {localSettings.thresholds.goalProgress}%
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Get notified when you reach this percentage of your goal
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unusualSpending">Unusual Spending Threshold ($)</Label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="unusualSpending"
                  min="50"
                  max="500"
                  step="25"
                  value={localSettings.thresholds.unusualSpending}
                  onChange={(e) => handleThresholdChange('unusualSpending', parseInt(e.target.value))}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[80px] text-center">
                  ${localSettings.thresholds.unusualSpending}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Get notified for transactions above this amount
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>
    </div>
  )
}
