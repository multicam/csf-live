import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../mocks/api'
import { CURRENT_USER_ID } from '@csf-live/shared/constants'

export function useFeedItems() {
  return useQuery({
    queryKey: ['feed'],
    queryFn: () => api.getFeedItems(),
  })
}

export function useProjectFeedItems(projectId: string, sectionId?: string | null) {
  return useQuery({
    queryKey: ['feed', 'project', projectId, sectionId],
    queryFn: () => api.getProjectFeedItems(projectId, sectionId),
    enabled: !!projectId,
  })
}

export function usePostMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ discussionId, content }: { discussionId: string; content: string }) =>
      api.postMessage(discussionId, content, CURRENT_USER_ID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}
