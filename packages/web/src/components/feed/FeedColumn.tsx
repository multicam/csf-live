import { useRef, useEffect, useState } from 'react'
import { useFeedItems } from '@/hooks/useFeed'
import { FeedItemRenderer } from './FeedItemRenderer'
import { ComposeInput } from './ComposeInput'
import { FEED_DISCUSSION_ID } from '@csf-live/shared/constants'

type FeedMode = 'timeline' | 'categorized' | 'search'

export function FeedColumn() {
  const { data: feedItems = [], isLoading } = useFeedItems()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<FeedMode>('timeline')

  // Auto-scroll to bottom when new items arrive in timeline mode
  useEffect(() => {
    if (bottomRef.current && mode === 'timeline') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [feedItems.length, mode])

  return (
    <div className="flex h-full flex-col pt-12">
      {/* Mode tabs */}
      <div className="flex border-b border-warm-200 dark:border-warm-800 px-3">
        {(['timeline', 'categorized', 'search'] as FeedMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              mode === m
                ? 'border-warm-900 text-warm-900 dark:border-warm-100 dark:text-warm-100'
                : 'border-transparent text-warm-400 hover:text-warm-600 dark:text-warm-500 dark:hover:text-warm-300'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Feed content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-warm-400">
            Loading…
          </div>
        ) : feedItems.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-warm-400 dark:text-warm-500">
            Start a conversation or capture an idea.
          </div>
        ) : (
          <div className="px-3 py-4 space-y-2">
            {feedItems.map(item => (
              <FeedItemRenderer key={item.id} item={item} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Compose input */}
      <ComposeInput discussionId={FEED_DISCUSSION_ID} />
    </div>
  )
}
