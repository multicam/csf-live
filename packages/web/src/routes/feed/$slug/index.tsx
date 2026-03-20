import { createFileRoute } from '@tanstack/react-router'

function ProjectFeedIndex() {
  const { slug } = Route.useParams()
  return <div>Project Feed: {slug} (coming soon)</div>
}

export const Route = createFileRoute('/feed/$slug/')({
  component: ProjectFeedIndex,
})
