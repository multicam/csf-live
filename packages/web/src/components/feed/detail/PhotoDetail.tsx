import { useState } from 'react'
import type { ContentItem } from '@csf-live/shared'
import { useMockStore } from '@/mocks/store'
import { formatDistanceToNow } from '@/lib/time'
import { cn } from '@/lib/utils'

interface PhotoDetailProps {
  item: ContentItem
}

export function PhotoDetail({ item }: PhotoDetailProps) {
  const { users } = useMockStore()
  const author = users.find(u => u.id === item.authorId)
  const [zoomed, setZoomed] = useState(false)

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 gap-4">
      {item.title && (
        <h2 className="text-base font-semibold text-warm-900 dark:text-warm-100">
          {item.title}
        </h2>
      )}

      {item.mediaUrl && (
        <div
          className={cn(
            'overflow-hidden rounded-lg cursor-zoom-in transition-all',
            zoomed && 'cursor-zoom-out'
          )}
          onClick={() => setZoomed(z => !z)}
        >
          <img
            src={item.mediaUrl}
            alt={item.title ?? 'Photo'}
            className={cn(
              'w-full object-contain transition-transform duration-300',
              zoomed ? 'scale-150 object-center' : 'max-h-96'
            )}
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
