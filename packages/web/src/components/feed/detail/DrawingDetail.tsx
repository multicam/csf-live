import type { ContentItem } from '@csf-live/shared'
import { DrawingEditor } from '@/components/editor/DrawingEditor'

interface DrawingDetailProps {
  item: ContentItem
  onClose?: () => void
}

export function DrawingDetail({ item, onClose }: DrawingDetailProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <DrawingEditor itemId={item.id} onClose={onClose} />
    </div>
  )
}
