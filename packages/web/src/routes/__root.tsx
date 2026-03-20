import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { StatusBar } from '@/components/shared/StatusBar'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
})

function GlobalKeyboardHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Cmd+Shift+F (or Ctrl+Shift+F) → navigate to Search
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault()
        navigate({ to: '/search' })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  return null
}

function RootLayout() {
  // useDarkMode handles theme init and persistence
  useDarkMode()

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen bg-warm-50 text-warm-900 dark:bg-warm-950 dark:text-warm-50">
        <GlobalKeyboardHandler />
        <Outlet />
        <StatusBar />
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </QueryClientProvider>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
