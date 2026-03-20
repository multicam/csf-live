import { createFileRoute } from '@tanstack/react-router'
import { FeedColumn } from '@/components/feed/FeedColumn'

function FeedIndex() {
  return <FeedColumn />
}

export const Route = createFileRoute('/feed/')({
  component: FeedIndex,
})
