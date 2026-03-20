import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../mocks/api'
import { CURRENT_USER_ID } from '@csf-live/shared/constants'

export function useMessages(discussionId: string) {
  return useQuery({
    queryKey: ['messages', discussionId],
    queryFn: () => api.getMessages(discussionId),
    enabled: !!discussionId,
  })
}

export function usePostMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ discussionId, content }: { discussionId: string; content: string }) =>
      api.postMessage(discussionId, content, CURRENT_USER_ID),
    onSuccess: (_data, { discussionId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', discussionId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
