import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/query-client'
import { UserService } from '@/lib/api/user'
import type {
  UserProfile,
  UserStats,
  ActivityLog,
  ConnectedAccount,
  NotificationSettings,
  SecuritySettings,
  PrivacySettings,
  BillingSettings,
  DataExportRequest,
  DataExportResponse
} from '@/lib/api/user'

// Profile Hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: UserService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: UserService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() })
    },
  })
}

export const useUploadAvatar = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: UserService.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() })
    },
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: UserService.changePassword,
  })
}

export const useUserStats = () => {
  return useQuery({
    queryKey: queryKeys.user.stats(),
    queryFn: UserService.getUserStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useActivityLog = (page = 0, size = 20) => {
  return useQuery({
    queryKey: queryKeys.user.activity(page, size),
    queryFn: () => UserService.getActivityLog(page, size),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useConnectedAccounts = () => {
  return useQuery({
    queryKey: queryKeys.user.connectedAccounts(),
    queryFn: UserService.getConnectedAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useDisconnectAccount = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: UserService.disconnectAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.connectedAccounts() })
    },
  })
}

// Settings Hooks
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: queryKeys.user.notificationSettings(),
    queryFn: UserService.getNotificationSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: UserService.updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.notificationSettings() })
    },
  })
}

export const useSecuritySettings = () => {
  return useQuery({
    queryKey: queryKeys.user.securitySettings(),
    queryFn: UserService.getSecuritySettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateSecuritySettings = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: UserService.updateSecuritySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.securitySettings() })
    },
  })
}

export const useEnableTwoFactor = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: UserService.enableTwoFactor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.securitySettings() })
    },
  })
}

export const useDisableTwoFactor = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: UserService.disableTwoFactor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.securitySettings() })
    },
  })
}

export const usePrivacySettings = () => {
  return useQuery({
    queryKey: queryKeys.user.privacySettings(),
    queryFn: UserService.getPrivacySettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdatePrivacySettings = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: UserService.updatePrivacySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.privacySettings() })
    },
  })
}

export const useBillingSettings = () => {
  return useQuery({
    queryKey: queryKeys.user.billingSettings(),
    queryFn: UserService.getBillingSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateBillingSettings = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: UserService.updateBillingSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.billingSettings() })
    },
  })
}

// Data Management Hooks
export const useRequestDataExport = () => {
  return useMutation({
    mutationFn: UserService.requestDataExport,
  })
}

export const useDataExportStatus = (exportId: string) => {
  return useQuery({
    queryKey: queryKeys.user.dataExport(exportId),
    queryFn: () => UserService.getDataExportStatus(exportId),
    enabled: !!exportId,
    refetchInterval: (data) => {
      // Poll every 5 seconds if still processing
      return data?.status === 'processing' ? 5000 : false
    },
  })
}

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: UserService.deleteAccount,
  })
}

export const useScheduleBackup = () => {
  return useMutation({
    mutationFn: UserService.scheduleBackup,
  })
}
