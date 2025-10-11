'use client'

import { useState, useEffect } from 'react'
import { usePrivacySettings, useUpdatePrivacySettings } from '@/hooks/useUser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { 
  Eye, 
  Users, 
  Database, 
  Clock, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

interface PrivacySettingsProps {
  onChange: () => void
}

export function PrivacySettings({ onChange }: PrivacySettingsProps) {
  const { data: settings, isLoading } = usePrivacySettings()
  const updateSettings = useUpdatePrivacySettings()

  const [localSettings, setLocalSettings] = useState({
    profileVisibility: 'private' as 'public' | 'private' | 'friends',
    dataSharing: {
      analytics: false,
      marketing: false,
      thirdParty: false
    },
    dataRetention: {
      transactionHistory: 7,
      activityLogs: 30,
      backupData: 90
    }
  })

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleProfileVisibilityChange = (visibility: string) => {
    setLocalSettings({
      ...localSettings,
      profileVisibility: visibility as any
    })
    onChange()
  }

  const handleDataSharingToggle = (key: string) => {
    setLocalSettings({
      ...localSettings,
      dataSharing: {
        ...localSettings.dataSharing,
        [key]: !localSettings.dataSharing[key as keyof typeof localSettings.dataSharing]
      }
    })
    onChange()
  }

  const handleDataRetentionChange = (key: string, value: number) => {
    setLocalSettings({
      ...localSettings,
      dataRetention: {
        ...localSettings.dataRetention,
        [key]: value
      }
    })
    onChange()
  }

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(localSettings)
      toast.success('Privacy settings updated successfully')
    } catch (error) {
      toast.error('Failed to update privacy settings')
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
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can see your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { 
                value: 'public', 
                label: 'Public', 
                description: 'Anyone can see your profile information',
                icon: Users
              },
              { 
                value: 'private', 
                label: 'Private', 
                description: 'Only you can see your profile information',
                icon: Shield
              },
              { 
                value: 'friends', 
                label: 'Friends Only', 
                description: 'Only your connected friends can see your profile',
                icon: Users
              }
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="profileVisibility"
                  value={option.value}
                  checked={localSettings.profileVisibility === option.value}
                  onChange={() => handleProfileVisibilityChange(option.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <option.icon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Data Sharing
          </CardTitle>
          <CardDescription>
            Control how your data is shared and used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              We respect your privacy. You can control how your data is used to improve our services.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {[
              {
                key: 'analytics',
                title: 'Analytics & Usage Data',
                description: 'Help us improve the app by sharing anonymous usage statistics',
                impact: 'low'
              },
              {
                key: 'marketing',
                title: 'Marketing Communications',
                description: 'Receive promotional emails and product updates',
                impact: 'medium'
              },
              {
                key: 'thirdParty',
                title: 'Third-Party Services',
                description: 'Share data with trusted partners for enhanced features',
                impact: 'high'
              }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant={item.impact === 'low' ? 'default' : item.impact === 'medium' ? 'secondary' : 'destructive'}>
                      {item.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localSettings.dataSharing[item.key as keyof typeof localSettings.dataSharing]}
                    onChange={() => handleDataSharingToggle(item.key)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Data Retention
          </CardTitle>
          <CardDescription>
            Control how long your data is stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Data retention settings affect how long your information is kept. Shorter periods provide more privacy but may limit some features.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="transactionHistory">Transaction History (years)</Label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="transactionHistory"
                  min="1"
                  max="10"
                  value={localSettings.dataRetention.transactionHistory}
                  onChange={(e) => handleDataRetentionChange('transactionHistory', parseInt(e.target.value))}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[60px] text-center">
                  {localSettings.dataRetention.transactionHistory} years
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                How long to keep your transaction history for reporting and analysis
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLogs">Activity Logs (days)</Label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="activityLogs"
                  min="7"
                  max="365"
                  step="7"
                  value={localSettings.dataRetention.activityLogs}
                  onChange={(e) => handleDataRetentionChange('activityLogs', parseInt(e.target.value))}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[80px] text-center">
                  {localSettings.dataRetention.activityLogs} days
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                How long to keep login and activity logs for security purposes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backupData">Backup Data (days)</Label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="backupData"
                  min="30"
                  max="365"
                  step="30"
                  value={localSettings.dataRetention.backupData}
                  onChange={(e) => handleDataRetentionChange('backupData', parseInt(e.target.value))}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[80px] text-center">
                  {localSettings.dataRetention.backupData} days
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                How long to keep backup copies of your data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Summary</CardTitle>
          <CardDescription>
            Overview of your current privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Profile & Visibility</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Visibility</span>
                  <Badge variant="secondary" className="capitalize">
                    {localSettings.profileVisibility}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Data Sharing</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Analytics</span>
                  <Badge variant={localSettings.dataSharing.analytics ? "default" : "secondary"}>
                    {localSettings.dataSharing.analytics ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Marketing</span>
                  <Badge variant={localSettings.dataSharing.marketing ? "default" : "secondary"}>
                    {localSettings.dataSharing.marketing ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Third-Party</span>
                  <Badge variant={localSettings.dataSharing.thirdParty ? "default" : "secondary"}>
                    {localSettings.dataSharing.thirdParty ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Data Retention</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{localSettings.dataRetention.transactionHistory}</p>
                <p className="text-sm text-gray-600">Years for transactions</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-green-600">{localSettings.dataRetention.activityLogs}</p>
                <p className="text-sm text-gray-600">Days for activity logs</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{localSettings.dataRetention.backupData}</p>
                <p className="text-sm text-gray-600">Days for backups</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? 'Saving...' : 'Save Privacy Settings'}
        </Button>
      </div>
    </div>
  )
}
