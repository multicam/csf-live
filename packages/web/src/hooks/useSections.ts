import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../mocks/api'

export function useSections(projectId: string) {
  return useQuery({
    queryKey: ['sections', projectId],
    queryFn: () => api.getSections(projectId),
    enabled: !!projectId,
  })
}

export function useCreateSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, title, description }: { projectId: string; title: string; description?: string }) =>
      api.createSection(projectId, title, description),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['sections', projectId] })
    },
  })
}
