import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../mocks/api'

export function useContentItem(id: string) {
  return useQuery({
    queryKey: ['content', id],
    queryFn: () => api.getContentItem(id),
    enabled: !!id,
  })
}

export function useContentVersions(id: string) {
  return useQuery({
    queryKey: ['content', id, 'versions'],
    queryFn: () => api.getContentVersions(id),
    enabled: !!id,
  })
}

export function useCreateContentItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (item: Parameters<typeof api.createContentItem>[0]) =>
      api.createContentItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useUpdateContentItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, patch }: { itemId: string; patch: Parameters<typeof api.updateContentItem>[1] }) =>
      api.updateContentItem(itemId, patch),
    onSuccess: (_data, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['content', itemId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useMoveContentItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, projectId, sectionId }: { itemId: string; projectId: string | null; sectionId?: string | null }) =>
      api.moveContentItem(itemId, projectId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useCopyContentItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, projectId, sectionId }: { itemId: string; projectId: string | null; sectionId?: string | null }) =>
      api.copyContentItem(itemId, projectId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useUpdateContentItemVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, body, mediaData, changeSummary }: { itemId: string; body?: string | null; mediaData?: unknown; changeSummary?: string }) =>
      api.updateContentItemVersion(itemId, body, mediaData, changeSummary),
    onSuccess: (_data, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['content', itemId, 'versions'] })
      queryClient.invalidateQueries({ queryKey: ['content', itemId] })
    },
  })
}
