import { createFileRoute } from '@tanstack/react-router'

function DocDetail() {
  const { slug, id } = Route.useParams()
  return <div>Document Detail: {slug}/{id} (coming soon)</div>
}

export const Route = createFileRoute('/feed/$slug/doc/$id')({
  component: DocDetail,
})
