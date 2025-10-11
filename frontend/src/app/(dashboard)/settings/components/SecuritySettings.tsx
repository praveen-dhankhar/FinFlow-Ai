'use client'

import { useState, useEffect } from 'react'
import { useSecuritySettings, useUpdateSecuritySettings, useEnableTwoFactor, useDisableTwoFactor } from '@/hooks/useUser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { 
  Shield, 
  Key, 
  Smartphone, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  QrCode,
  Download,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'

interface SecuritySettingsProps {
  onChange: () => void
}

export function SecuritySettings({ onChange }: SecuritySettingsProps) {
  const { data: settings, isLoading } = useSecuritySettings()
  const updateSettings = useUpdateSecuritySettings()
  const enableTwoFactor = useEnableTwoFactor()
  const disableTwoFactor = useDisableTwoFactor()

  const [localSettings, setLocalSettings] = useState({
    twoFactorEnabled: false,
    twoFactorMethod: null as 'sms' | 'email' | 'app' | null,
    backupCodes: [] as string[],
    sessionTimeout: 30,
    loginNotifications: true,
    suspiciousActivityAlerts: true
  })

  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState<'sms' | 'email' | 'app'>('app')
  const [qrCode, setQrCode] = useState('')
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([])

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleTwoFactorToggle = () => {
    if (localSettings.twoFactorEnabled) {
      handleDisableTwoFactor()
    } else {
      setShowTwoFactorDialog(true)
    }
  }

  const handleEnableTwoFactor = async () => {
    try {
      const response = await enableTwoFactor.mutateAsync(twoFactorMethod)
      setQrCode(response.qrCode || '')
      setNewBackupCodes(response.backupCodes)
      setShowTwoFactorDialog(false)
      setShowBackupCodes(true)
      onChange()
      toast.success('Two-factor authentication enabled successfully')
    } catch (error) {
      toast.error('Failed to enable two-factor authentication')
    }
  }

  const handleDisableTwoFactor = async () => {
    try {
      await disableTwoFactor.mutateAsync()
      setLocalSettings({
        ...localSettings,
        twoFactorEnabled: false,
        twoFactorMethod: null
      })
      onChange()
      toast.success('Two-factor authentication disabled successfully')
    } catch (error) {
      toast.error('Failed to disable two-factor authentication')
    }
  }

  const handleSessionTimeoutChange = (value: number) => {
    setLocalSettings({
      ...localSettings,
      sessionTimeout: value
    })
    onChange()
  }

  const handleToggle = (key: string) => {
    setLocalSettings({
      ...localSettings,
      [key]: !localSettings[key as keyof typeof localSettings]
    })
    onChange()
  }

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(localSettings)
      toast.success('Security settings updated successfully')
    } catch (error) {
      toast.error('Failed to update security settings')
    }
  }

  const copyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Backup code copied to clipboard')
  }

  const downloadBackupCodes = () => {
    const content = newBackupCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
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
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">
                {localSettings.twoFactorEnabled 
                  ? `Enabled via ${localSettings.twoFactorMethod}` 
                  : 'Add an extra layer of security to your account'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={localSettings.twoFactorEnabled ? "default" : "secondary"}>
                {localSettings.twoFactorEnabled ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Disabled
                  </>
                )}
              </Badge>
              <Button
                variant={localSettings.twoFactorEnabled ? "destructive" : "default"}
                onClick={handleTwoFactorToggle}
                disabled={enableTwoFactor.isPending || disableTwoFactor.isPending}
              >
                {localSettings.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
              </Button>
            </div>
          </div>

          {localSettings.twoFactorEnabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Backup Codes</p>
                    <p className="text-sm text-gray-600">
                      {localSettings.backupCodes.length} codes remaining
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Codes
                  </Button>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Save your backup codes in a secure location. Each code can only be used once.
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Session Management
          </CardTitle>
          <CardDescription>
            Control how long your sessions remain active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                id="sessionTimeout"
                min="5"
                max="120"
                step="5"
                value={localSettings.sessionTimeout}
                onChange={(e) => handleSessionTimeoutChange(parseInt(e.target.value))}
                className="flex-1"
              />
              <Badge variant="secondary" className="min-w-[80px] text-center">
                {localSettings.sessionTimeout} min
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Your session will automatically expire after this period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Security Alerts
          </CardTitle>
          <CardDescription>
            Configure security notifications and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Login Notifications</p>
                <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={localSettings.loginNotifications}
                  onChange={() => handleToggle('loginNotifications')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Suspicious Activity Alerts</p>
                <p className="text-sm text-gray-600">Get notified about unusual account activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={localSettings.suspiciousActivityAlerts}
                  onChange={() => handleToggle('suspiciousActivityAlerts')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Checkup */}
      <Card>
        <CardHeader>
          <CardTitle>Security Checkup</CardTitle>
          <CardDescription>
            Review your account security status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              {
                title: 'Strong Password',
                description: 'Your password meets security requirements',
                status: 'good',
                icon: CheckCircle
              },
              {
                title: 'Two-Factor Authentication',
                description: localSettings.twoFactorEnabled ? 'Enabled' : 'Not enabled',
                status: localSettings.twoFactorEnabled ? 'good' : 'warning',
                icon: localSettings.twoFactorEnabled ? CheckCircle : AlertTriangle
              },
              {
                title: 'Login Notifications',
                description: localSettings.loginNotifications ? 'Enabled' : 'Not enabled',
                status: localSettings.loginNotifications ? 'good' : 'warning',
                icon: localSettings.loginNotifications ? CheckCircle : AlertTriangle
              },
              {
                title: 'Recent Activity',
                description: 'No suspicious activity detected',
                status: 'good',
                icon: CheckCircle
              }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <item.icon className={`w-5 h-5 ${
                  item.status === 'good' ? 'text-green-600' : 'text-yellow-600'
                }`} />
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <Badge variant={item.status === 'good' ? 'default' : 'secondary'}>
                  {item.status === 'good' ? 'Good' : 'Needs Attention'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? 'Saving...' : 'Save Security Settings'}
        </Button>
      </div>

      {/* Two-Factor Setup Dialog */}
      <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Choose your preferred method for two-factor authentication
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              {[
                { value: 'app', label: 'Authenticator App', description: 'Use an app like Google Authenticator or Authy' },
                { value: 'sms', label: 'SMS', description: 'Receive codes via text message' },
                { value: 'email', label: 'Email', description: 'Receive codes via email' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="twoFactorMethod"
                    value={option.value}
                    checked={twoFactorMethod === option.value}
                    onChange={() => setTwoFactorMethod(option.value as any)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTwoFactorDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEnableTwoFactor} disabled={enableTwoFactor.isPending}>
                {enableTwoFactor.isPending ? 'Enabling...' : 'Enable 2FA'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Your Backup Codes</DialogTitle>
            <DialogDescription>
              These codes can be used to access your account if you lose your device. Save them in a secure location.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Each backup code can only be used once. Store them in a secure location.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-2">
              {newBackupCodes.map((code, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <code className="text-sm font-mono">{code}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyBackupCode(code)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={downloadBackupCodes}>
                <Download className="w-4 h-4 mr-2" />
                Download Codes
              </Button>
              <Button onClick={() => setShowBackupCodes(false)}>
                I've Saved These Codes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
