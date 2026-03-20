import { createFileRoute, Outlet } from '@tanstack/react-router'

function FeedLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Outlet />
    </div>
  )
}

export const Route = createFileRoute('/feed/_layout')({
  component: FeedLayout,
})
