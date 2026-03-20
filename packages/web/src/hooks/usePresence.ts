import { useQuery } from '@tanstack/react-query'
import * as api from '../mocks/api'

export function usePresence() {
  return useQuery({
    queryKey: ['presence'],
    queryFn: () => api.getPresence(),
  })
}
