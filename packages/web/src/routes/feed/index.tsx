import { createFileRoute } from '@tanstack/react-router'

function FeedIndex() {
  return <div>General Feed (coming soon)</div>
}

export const Route = createFileRoute('/feed/')({
  component: FeedIndex,
})
