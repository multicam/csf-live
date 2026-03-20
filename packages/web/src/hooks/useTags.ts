import { useQuery } from '@tanstack/react-query'
import * as api from '../mocks/api'

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => api.getTags(),
  })
}
