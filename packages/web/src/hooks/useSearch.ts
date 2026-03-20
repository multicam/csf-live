import { useQuery } from '@tanstack/react-query'
import * as api from '../mocks/api'
import type { SearchFilters } from '../mocks/api'

export function useSearch(query: string, filters?: SearchFilters) {
  return useQuery({
    queryKey: ['search', query, filters],
    queryFn: () => api.searchContentItems(query, filters),
    enabled: query.trim().length > 0,
  })
}
