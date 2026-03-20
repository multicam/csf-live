import type { ContentItem } from '@csf-live/shared'
import { useMockStore } from '@/mocks/store'
import { formatDistanceToNow } from '@/lib/time'

interface SketchDetailProps {
  item: ContentItem
}

export function SketchDetail({ item }: SketchDetailProps) {
  const { users } = useMockStore()
  const author = users.find(u => u.id === item.authorId)

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 gap-4">
      {item.title && (
        <h2 className="text-base font-semibold text-warm-900 dark:text-warm-100">
          {item.title}
        </h2>
      )}

      {item.mediaUrl && (
        <div className="overflow-hidden rounded-lg border border-warm-200 dark:border-warm-700">
          <img
            src={item.mediaUrl}
            alt={item.title ?? 'Sketch'}
            className="w-full object-contain max-h-96"
          />
        </div>
      )}

      <div className="text-xs text-warm-400 dark:text-warm-500 space-y-1">
        <div>By {author?.name ?? 'Unknown'}</div>
        <div>{formatDistanceToNow(new Date(item.createdAt))}</div>
      </div>
    </div>
  )
}
