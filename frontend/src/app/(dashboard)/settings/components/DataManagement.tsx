'use client'

import { useState } from 'react'
import { useRequestDataExport, useDataExportStatus, useDeleteAccount, useScheduleBackup } from '@/hooks/useUser'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { 
  Download, 
  Trash2, 
  Database, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  HardDrive
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function DataManagement() {
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBackupDialog, setShowBackupDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [exportRequest, setExportRequest] = useState({
    format: 'json' as 'json' | 'csv' | 'pdf',
    includeTransactions: true,
    includeCategories: true,
    includeGoals: true,
    includeBudgets: true,
    includeAnalytics: true
  })
  const [backupFrequency, setBackupFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  const requestDataExport = useRequestDataExport()
  const deleteAccount = useDeleteAccount()
  const scheduleBackup = useScheduleBackup()

  const handleDataExport = async () => {
    try {
      const response = await requestDataExport.mutateAsync(exportRequest)
      setShowExportDialog(false)
      toast.success('Data export requested. You will receive an email when ready.')
    } catch (error) {
      toast.error('Failed to request data export')
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm account deletion')
      return
    }

    try {
      await deleteAccount.mutateAsync(deletePassword)
      toast.success('Account deletion initiated. You will receive a confirmation email.')
      setShowDeleteDialog(false)
      setDeletePassword('')
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  const handleScheduleBackup = async () => {
    try {
      await scheduleBackup.mutateAsync(backupFrequency)
      setShowBackupDialog(false)
      toast.success(`Backup scheduled for ${backupFrequency} frequency`)
    } catch (error) {
      toast.error('Failed to schedule backup')
    }
  }

  const exportOptions = [
    { value: 'json', label: 'JSON', description: 'Machine-readable format for developers' },
    { value: 'csv', label: 'CSV', description: 'Spreadsheet format for data analysis' },
    { value: 'pdf', label: 'PDF', description: 'Human-readable report format' }
  ]

  const backupFrequencies = [
    { value: 'daily', label: 'Daily', description: 'Backup your data every day' },
    { value: 'weekly', label: 'Weekly', description: 'Backup your data every week' },
    { value: 'monthly', label: 'Monthly', description: 'Backup your data every month' }
  ]

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Data Export
            </h3>
            <p className="text-sm text-gray-600">
              Download a copy of your data in various formats
            </p>
          </div>
          <Button onClick={() => setShowExportDialog(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            You can export your data in JSON, CSV, or PDF format. Large exports may take some time to process.
          </AlertDescription>
        </Alert>
      </div>

      <Separator />

      {/* Backup Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <HardDrive className="w-5 h-5 mr-2" />
              Backup Management
            </h3>
            <p className="text-sm text-gray-600">
              Schedule automatic backups of your data
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowBackupDialog(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Backup
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">Last Backup</span>
            </div>
            <p className="text-sm text-gray-600">December 15, 2024</p>
            <p className="text-xs text-gray-500">2.3 MB</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Next Backup</span>
            </div>
            <p className="text-sm text-gray-600">December 22, 2024</p>
            <p className="text-xs text-gray-500">Weekly schedule</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Storage Used</span>
            </div>
            <p className="text-sm text-gray-600">15.7 MB</p>
            <p className="text-xs text-gray-500">5 backups stored</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Account Deletion */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center text-red-600">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Account
            </h3>
            <p className="text-sm text-gray-600">
              Permanently delete your account and all associated data
            </p>
          </div>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This action cannot be undone. All your data including transactions, 
            categories, goals, and budgets will be permanently deleted.
          </AlertDescription>
        </Alert>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Your Data</DialogTitle>
            <DialogDescription>
              Choose what data to export and in which format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="space-y-2">
                {exportOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value={option.value}
                      checked={exportRequest.format === option.value}
                      onChange={(e) => setExportRequest({ ...exportRequest, format: e.target.value as any })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Include Data</Label>
              <div className="space-y-2">
                {[
                  { key: 'includeTransactions', label: 'Transactions' },
                  { key: 'includeCategories', label: 'Categories' },
                  { key: 'includeGoals', label: 'Goals' },
                  { key: 'includeBudgets', label: 'Budgets' },
                  { key: 'includeAnalytics', label: 'Analytics' }
                ].map((item) => (
                  <label key={item.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exportRequest[item.key as keyof typeof exportRequest] as boolean}
                      onChange={(e) => setExportRequest({
                        ...exportRequest,
                        [item.key]: e.target.checked
                      })}
                      className="rounded"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleDataExport} disabled={requestDataExport.isPending}>
                {requestDataExport.isPending ? 'Requesting...' : 'Request Export'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Backup</DialogTitle>
            <DialogDescription>
              Choose how often you want to backup your data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Backup Frequency</Label>
              <div className="space-y-2">
                {backupFrequencies.map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={backupFrequency === option.value}
                      onChange={(e) => setBackupFrequency(e.target.value as any)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Backups are stored securely and can be restored if needed. 
                You'll receive email notifications when backups are completed.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleBackup} disabled={scheduleBackup.isPending}>
                {scheduleBackup.isPending ? 'Scheduling...' : 'Schedule Backup'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Deleting your account will permanently remove:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>All transactions and financial data</li>
                  <li>Categories, goals, and budgets</li>
                  <li>Analytics and reports</li>
                  <li>Account settings and preferences</li>
                  <li>All backups and exports</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="deletePassword">Enter your password to confirm</Label>
              <Input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={deleteAccount.isPending || !deletePassword}
              >
                {deleteAccount.isPending ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
