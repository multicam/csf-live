import { createFileRoute } from '@tanstack/react-router'

function SearchRoute() {
  return <div>Search (coming soon)</div>
}

export const Route = createFileRoute('/search')({
  component: SearchRoute,
})
