import { createRootRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { StatusBar } from '@/components/shared/StatusBar'
import { ToastProvider } from '@/components/shared/ToastProvider'

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

  const isLoading = useRouterState({ select: s => s.status === 'pending' })

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="relative min-h-screen bg-warm-50 text-warm-900 dark:bg-warm-950 dark:text-warm-50">
          {isLoading && (
            <div className="fixed top-0 left-0 right-0 z-[200] h-0.5 bg-warm-400 dark:bg-warm-500 animate-pulse" />
          )}
          <GlobalKeyboardHandler />
          <Outlet />
          <StatusBar />
        </div>
      </ToastProvider>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </QueryClientProvider>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
