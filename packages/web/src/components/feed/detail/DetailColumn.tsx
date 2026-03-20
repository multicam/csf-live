import { X } from 'lucide-react'
import type { FeedItem, ContentItem } from '@csf-live/shared'
import { CONTENT_TYPE_LABELS } from '@csf-live/shared/constants'
import { useContentItem } from '@/hooks/useContentItem'
import { EmptyDetail } from './EmptyDetail'
import { MessageDetail } from './MessageDetail'
import { IdeaDetail } from './IdeaDetail'
import { DocumentDetail } from './DocumentDetail'
import { DrawingDetail } from './DrawingDetail'
import { LinkDetail } from './LinkDetail'
import { PhotoDetail } from './PhotoDetail'
import { SketchDetail } from './SketchDetail'
import { VoiceDetail } from './VoiceDetail'
import { ResearchDetail } from './ResearchDetail'
import { FileDetail } from './FileDetail'

interface DetailColumnProps {
  item?: FeedItem | null        // For general feed (full item object)
  itemId?: string               // For project feed (load by ID)
  onClose: () => void
}

function ContentDetailBody({ item, onClose }: { item: ContentItem; onClose?: () => void }) {
  switch (item.type) {
    case 'idea':
      return <IdeaDetail item={item} />
    case 'document':
      return <DocumentDetail item={item} onClose={onClose} />
    case 'drawing':
      return <DrawingDetail item={item} onClose={onClose} />
    case 'link':
      return <LinkDetail item={item} />
    case 'photo':
      return <PhotoDetail item={item} />
    case 'sketch':
      return <SketchDetail item={item} />
    case 'voice':
      return <VoiceDetail item={item} />
    case 'research':
      return <ResearchDetail item={item} />
    case 'file':
      return <FileDetail item={item} />
    default:
      return <IdeaDetail item={item} />
  }
}

function DetailHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-warm-200 dark:border-warm-800 px-4 py-3 flex-shrink-0">
      <span className="text-sm font-medium text-warm-700 dark:text-warm-300 truncate">
        {title}
      </span>
      <button
        onClick={onClose}
        className="ml-2 flex-shrink-0 rounded-md p-1 text-warm-400 hover:bg-warm-100 hover:text-warm-600 dark:hover:bg-warm-800 dark:hover:text-warm-300 transition-colors"
        aria-label="Close detail"
      >
        <X size={16} />
      </button>
    </div>
  )
}

function ItemDetailByIdLoader({
  itemId,
  onClose,
}: {
  itemId: string
  onClose: () => void
}) {
  const { data: item, isLoading } = useContentItem(itemId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-warm-400 dark:text-warm-500">Loading…</div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex h-full flex-col">
        <DetailHeader title="Not found" onClose={onClose} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-sm text-warm-400 dark:text-warm-500">Item not found</div>
        </div>
      </div>
    )
  }

  const title = item.title ?? CONTENT_TYPE_LABELS[item.type] ?? item.type

  return (
    <div className="flex h-full flex-col">
      <DetailHeader title={title} onClose={onClose} />
      <div className="flex-1 overflow-hidden">
        <ContentDetailBody item={item} onClose={onClose} />
      </div>
    </div>
  )
}

export function DetailColumn({ item, itemId, onClose }: DetailColumnProps) {
  // Loading by ID (project feed)
  if (itemId && !item) {
    return (
      <div className="flex h-full flex-col bg-white dark:bg-warm-950">
        <ItemDetailByIdLoader itemId={itemId} onClose={onClose} />
      </div>
    )
  }

  // No item selected
  if (!item) {
    return (
      <div className="flex h-full flex-col bg-white dark:bg-warm-950">
        <DetailHeader title="Detail" onClose={onClose} />
        <EmptyDetail />
      </div>
    )
  }

  // Message item
  if (item._sourceTable === 'message') {
    const title = `Message from ${item.authorId}`
    return (
      <div className="flex h-full flex-col bg-white dark:bg-warm-950">
        <DetailHeader title={title} onClose={onClose} />
        <div className="flex-1 overflow-hidden">
          <MessageDetail item={item} />
        </div>
      </div>
    )
  }

  // Content item
  const title = item.title ?? CONTENT_TYPE_LABELS[item.type] ?? item.type
  return (
    <div className="flex h-full flex-col bg-white dark:bg-warm-950">
      <DetailHeader title={title} onClose={onClose} />
      <div className="flex-1 overflow-hidden">
        <ContentDetailBody item={item} onClose={onClose} />
      </div>
    </div>
  )
}
