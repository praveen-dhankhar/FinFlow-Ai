import { apiClient } from './client'

// User Profile Types
export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  phone?: string
  dateOfBirth?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  preferences: {
    currency: string
    timezone: string
    language: string
    dateFormat: string
  }
  isActive: boolean
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  totalTransactions: number
  totalCategories: number
  totalGoals: number
  totalBudgets: number
  accountAge: number
  lastLogin: string
  loginCount: number
  dataExported: boolean
  lastExportDate?: string
}

export interface ActivityLog {
  id: string
  type: 'login' | 'logout' | 'password_change' | 'profile_update' | 'data_export' | 'settings_change'
  description: string
  ipAddress: string
  userAgent: string
  timestamp: string
  location?: string
}

export interface ConnectedAccount {
  id: string
  provider: 'google' | 'facebook' | 'apple' | 'github'
  email: string
  name: string
  avatar?: string
  connectedAt: string
  isActive: boolean
}

// Settings Types
export interface NotificationSettings {
  email: {
    enabled: boolean
    transactions: boolean
    budgets: boolean
    goals: boolean
    reports: boolean
    security: boolean
    marketing: boolean
  }
  push: {
    enabled: boolean
    transactions: boolean
    budgets: boolean
    goals: boolean
    security: boolean
  }
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
  thresholds: {
    budgetAlert: number
    goalProgress: number
    unusualSpending: number
  }
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  twoFactorMethod: 'sms' | 'email' | 'app' | null
  backupCodes: string[]
  sessionTimeout: number
  loginNotifications: boolean
  suspiciousActivityAlerts: boolean
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  dataSharing: {
    analytics: boolean
    marketing: boolean
    thirdParty: boolean
  }
  dataRetention: {
    transactionHistory: number
    activityLogs: number
    backupData: number
  }
}

export interface BillingSettings {
  plan: 'free' | 'premium' | 'enterprise'
  status: 'active' | 'cancelled' | 'past_due'
  nextBillingDate?: string
  paymentMethod?: {
    type: 'card' | 'paypal' | 'bank'
    last4?: string
    brand?: string
    expiryMonth?: number
    expiryYear?: number
  }
  usage: {
    transactions: number
    categories: number
    goals: number
    budgets: number
    limits: {
      transactions: number
      categories: number
      goals: number
      budgets: number
    }
  }
}

export interface DataExportRequest {
  format: 'json' | 'csv' | 'pdf'
  includeTransactions: boolean
  includeCategories: boolean
  includeGoals: boolean
  includeBudgets: boolean
  includeAnalytics: boolean
  dateRange?: {
    start: string
    end: string
  }
}

export interface DataExportResponse {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  expiresAt: string
  createdAt: string
}

// User Service
export class UserService {
  // Profile Management
  static async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get('/api/user/profile')
    return response.data
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.put('/api/user/profile', updates)
    return response.data
  }

  static async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await apiClient.post('/api/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }

  static async changePassword(data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<{ message: string }> {
    const response = await apiClient.post('/api/user/change-password', data)
    return response.data
  }

  static async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get('/api/user/stats')
    return response.data
  }

  static async getActivityLog(page = 0, size = 20): Promise<{
    data: ActivityLog[]
    pagination: {
      totalElements: number
      totalPages: number
      currentPage: number
      pageSize: number
      hasNext: boolean
      hasPrevious: boolean
    }
  }> {
    const response = await apiClient.get(`/api/user/activity?page=${page}&size=${size}`)
    return response.data
  }

  static async getConnectedAccounts(): Promise<ConnectedAccount[]> {
    const response = await apiClient.get('/api/user/connected-accounts')
    return response.data
  }

  static async disconnectAccount(accountId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/api/user/connected-accounts/${accountId}`)
    return response.data
  }

  // Settings Management
  static async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await apiClient.get('/api/user/settings/notifications')
    return response.data
  }

  static async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await apiClient.put('/api/user/settings/notifications', settings)
    return response.data
  }

  static async getSecuritySettings(): Promise<SecuritySettings> {
    const response = await apiClient.get('/api/user/settings/security')
    return response.data
  }

  static async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    const response = await apiClient.put('/api/user/settings/security', settings)
    return response.data
  }

  static async enableTwoFactor(method: 'sms' | 'email' | 'app'): Promise<{
    qrCode?: string
    backupCodes: string[]
    message: string
  }> {
    const response = await apiClient.post('/api/user/2fa/enable', { method })
    return response.data
  }

  static async disableTwoFactor(): Promise<{ message: string }> {
    const response = await apiClient.post('/api/user/2fa/disable')
    return response.data
  }

  static async getPrivacySettings(): Promise<PrivacySettings> {
    const response = await apiClient.get('/api/user/settings/privacy')
    return response.data
  }

  static async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const response = await apiClient.put('/api/user/settings/privacy', settings)
    return response.data
  }

  static async getBillingSettings(): Promise<BillingSettings> {
    const response = await apiClient.get('/api/user/settings/billing')
    return response.data
  }

  static async updateBillingSettings(settings: Partial<BillingSettings>): Promise<BillingSettings> {
    const response = await apiClient.put('/api/user/settings/billing', settings)
    return response.data
  }

  // Data Management
  static async requestDataExport(request: DataExportRequest): Promise<DataExportResponse> {
    const response = await apiClient.post('/api/user/data/export', request)
    return response.data
  }

  static async getDataExportStatus(exportId: string): Promise<DataExportResponse> {
    const response = await apiClient.get(`/api/user/data/export/${exportId}`)
    return response.data
  }

  static async deleteAccount(password: string): Promise<{ message: string }> {
    const response = await apiClient.post('/api/user/delete-account', { password })
    return response.data
  }

  static async scheduleBackup(frequency: 'daily' | 'weekly' | 'monthly'): Promise<{ message: string }> {
    const response = await apiClient.post('/api/user/backup/schedule', { frequency })
    return response.data
  }
}
