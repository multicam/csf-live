import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../mocks/api'
import { CURRENT_USER_ID } from '@csf-live/shared/constants'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications', CURRENT_USER_ID],
    queryFn: () => api.getNotifications(CURRENT_USER_ID),
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', CURRENT_USER_ID, 'unread'],
    queryFn: () => api.getUnreadNotificationCount(CURRENT_USER_ID),
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notificationId: string) => api.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
