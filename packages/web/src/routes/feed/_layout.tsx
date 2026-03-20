import { createFileRoute } from '@tanstack/react-router'
import { FeedShell } from '@/components/feed/FeedShell'

function FeedLayout() {
  return <FeedShell />
}

export const Route = createFileRoute('/feed/_layout')({
  component: FeedLayout,
})
