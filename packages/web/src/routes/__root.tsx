import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDarkMode } from '@/hooks/useDarkMode'
import { StatusBar } from '@/components/shared/StatusBar'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
})

function RootLayout() {
  // useDarkMode handles theme init and persistence
  useDarkMode()

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen bg-warm-50 text-warm-900 dark:bg-warm-950 dark:text-warm-50">
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
