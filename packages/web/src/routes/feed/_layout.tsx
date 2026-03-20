import { createFileRoute, Outlet } from '@tanstack/react-router'

function FeedLayout() {
  return <Outlet />
}

export const Route = createFileRoute('/feed/_layout')({
  component: FeedLayout,
})
