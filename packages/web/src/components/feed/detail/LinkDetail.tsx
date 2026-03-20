import { useState, useEffect } from 'react'
import type { ContentItem } from '@csf-live/shared'
import { useMockStore } from '@/mocks/store'
import { useUpdateContentItem } from '@/hooks/useContentItem'
import { ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/time'
import * as Tooltip from '@radix-ui/react-tooltip'

interface LinkDetailProps {
  item: ContentItem
}

export function LinkDetail({ item }: LinkDetailProps) {
  const { users } = useMockStore()
  const author = users.find(u => u.id === item.authorId)
  const updateItem = useUpdateContentItem()

  const [notes, setNotes] = useState(item.body ?? '')

  useEffect(() => {
    setNotes(item.body ?? '')
  }, [item.id, item.body])

  function handleNotesBlur() {
    if (notes !== item.body) {
      updateItem.mutate({ itemId: item.id, patch: { body: notes } })
    }
  }

  const meta = item.metadata
  const title = (meta?.title as string | undefined) ?? item.title ?? item.mediaUrl ?? 'Link'
  const description = meta?.description as string | undefined
  const ogImage = meta?.ogImage as string | undefined
  const domain = meta?.domain as string | undefined
  const favicon = meta?.favicon as string | undefined
  const url = item.mediaUrl ?? ''

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 gap-4">
      {/* OG Image */}
      {ogImage && (
        <div className="overflow-hidden rounded-lg">
          <img src={ogImage} alt={title} className="w-full object-cover max-h-48" />
        </div>
      )}

      {/* Domain + favicon */}
      <div className="flex items-center gap-2">
        {favicon && (
          <img src={favicon} alt="" className="h-4 w-4 rounded-sm" />
        )}
        {domain && (
          <span className="text-xs text-warm-400 dark:text-warm-500">{domain}</span>
        )}
      </div>

      {/* Title */}
      <h2 className="text-base font-semibold text-warm-900 dark:text-warm-100">
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className="text-sm text-warm-600 dark:text-warm-400">{description}</p>
      )}

      {/* URL + open link button (disabled in Tier 1) */}
      <div className="flex items-center gap-2">
        <span className="flex-1 truncate rounded-md border border-warm-200 bg-warm-50 px-2 py-1.5 text-xs text-warm-500 dark:border-warm-700 dark:bg-warm-900 dark:text-warm-400 font-mono">
          {url}
        </span>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                disabled
                className="flex items-center gap-1 rounded-md border border-warm-200 bg-warm-50 px-3 py-1.5 text-xs text-warm-400 opacity-50 cursor-not-allowed dark:border-warm-700 dark:bg-warm-900"
              >
                <ExternalLink size={12} />
                Open
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="rounded-md bg-warm-900 px-2 py-1 text-xs text-white dark:bg-warm-100 dark:text-warm-900 shadow-lg"
                sideOffset={4}
              >
                Link opening available in Phase 2
                <Tooltip.Arrow className="fill-warm-900 dark:fill-warm-100" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>

      {/* Notes */}
      <div>
        <div className="mb-1 text-xs font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wide">
          Notes
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Add notes about this link…"
          rows={4}
          className="w-full resize-none rounded-md border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-warm-900 placeholder-warm-400 focus:border-warm-400 focus:bg-white focus:outline-none dark:border-warm-700 dark:bg-warm-900 dark:text-warm-100 dark:placeholder-warm-500 dark:focus:bg-warm-800 transition-colors"
        />
        {updateItem.isPending && (
          <div className="mt-1 text-xs text-blue-500">Saving…</div>
        )}
      </div>

      {/* Metadata */}
      <div className="text-xs text-warm-400 dark:text-warm-500 space-y-1">
        <div>By {author?.name ?? 'Unknown'}</div>
        <div>{formatDistanceToNow(new Date(item.createdAt))}</div>
      </div>
    </div>
  )
}
