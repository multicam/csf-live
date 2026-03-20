import { createFileRoute } from '@tanstack/react-router'

function CanvasRoute() {
  return <div>Canvas Scratchpad (coming soon)</div>
}

export const Route = createFileRoute('/')({
  component: CanvasRoute,
})
