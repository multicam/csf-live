import { createFileRoute } from '@tanstack/react-router'

function ItemDetail() {
  const { slug, id } = Route.useParams()
  return <div>Item Detail: {slug}/{id} (coming soon)</div>
}

export const Route = createFileRoute('/feed/$slug/item/$id')({
  component: ItemDetail,
})
