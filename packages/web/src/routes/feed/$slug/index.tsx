import { createFileRoute } from '@tanstack/react-router'
import { FeedShell } from '@/components/feed/FeedShell'
import { ProjectFeed } from '@/components/projects/ProjectFeed'
import { ProjectDashboard } from '@/components/projects/ProjectDashboard'

function ProjectFeedIndex() {
  const { slug } = Route.useParams()

  return (
    <FeedShell col3={<ProjectDashboard slug={slug} />}>
      <ProjectFeed slug={slug} />
    </FeedShell>
  )
}

export const Route = createFileRoute('/feed/$slug/')({
  component: ProjectFeedIndex,
})
