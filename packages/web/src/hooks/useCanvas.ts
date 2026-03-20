import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../mocks/api'

export function useScratchpadCanvas() {
  return useQuery({
    queryKey: ['canvas', 'scratchpad'],
    queryFn: () => api.getScratchpadCanvas(),
  })
}

export function useSaveCanvas() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tldrawDoc: unknown) => api.saveCanvas(tldrawDoc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canvas', 'scratchpad'] })
    },
  })
}

export function useSaveAndCloseCanvas() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tldrawDoc, targetProjectId, targetSectionId }: { tldrawDoc: unknown; targetProjectId?: string | null; targetSectionId?: string | null }) =>
      api.saveAndCloseCanvas(tldrawDoc, targetProjectId, targetSectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canvas', 'scratchpad'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
