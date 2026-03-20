import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FeedShell } from '@/components/feed/FeedShell'
import { ProjectFeed } from '@/components/projects/ProjectFeed'
import { DetailColumn } from '@/components/feed/detail/DetailColumn'

function ItemDetail() {
  const { slug, id } = Route.useParams()
  const navigate = useNavigate()

  return (
    <FeedShell
      col3={
        <DetailColumn
          itemId={id}
          onClose={() => navigate({ to: '/feed/$slug', params: { slug } })}
        />
      }
    >
      <ProjectFeed slug={slug} selectedItemId={id} />
    </FeedShell>
  )
}

export const Route = createFileRoute('/feed/$slug/item/$id')({
  component: ItemDetail,
})
