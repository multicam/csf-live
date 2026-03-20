import { createFileRoute } from '@tanstack/react-router'
import { ScratchpadCanvas } from '@/components/canvas/ScratchpadCanvas'
import { AppMenu } from '@/components/shared/AppMenu'
import { StatusBar } from '@/components/shared/StatusBar'

function CanvasRoute() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute top-2 left-2 z-10">
        <AppMenu />
      </div>
      <ScratchpadCanvas />
      <StatusBar />
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: CanvasRoute,
})
