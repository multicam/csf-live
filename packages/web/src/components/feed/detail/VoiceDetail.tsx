import type { ContentItem } from '@csf-live/shared'
import { useMockStore } from '@/mocks/store'
import { AudioPlayer } from '@/components/feed/AudioPlayer'
import { formatDistanceToNow } from '@/lib/time'

interface VoiceDetailProps {
  item: ContentItem
}

export function VoiceDetail({ item }: VoiceDetailProps) {
  const { users } = useMockStore()
  const author = users.find(u => u.id === item.authorId)
  const transcription = item.metadata?.transcription as string | undefined
  const duration = item.metadata?.duration as number | undefined

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 gap-4">
      {item.title && (
        <h2 className="text-base font-semibold text-warm-900 dark:text-warm-100">
          {item.title}
        </h2>
      )}

      {/* Audio player */}
      {item.mediaUrl ? (
        <AudioPlayer src={item.mediaUrl} duration={duration} />
      ) : (
        <div className="rounded-xl border border-warm-200 bg-warm-50 p-4 text-sm text-warm-400 dark:border-warm-700 dark:bg-warm-900 dark:text-warm-500">
          Audio not available
        </div>
      )}

      {/* Transcription */}
      <div>
        <div className="mb-2 text-xs font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wide">
          Transcription
        </div>
        <p className="text-sm text-warm-700 dark:text-warm-300 leading-relaxed">
          {transcription ?? 'Transcription not available in Tier 1'}
        </p>
      </div>

      {/* Metadata */}
      <div className="text-xs text-warm-400 dark:text-warm-500 space-y-1">
        <div>By {author?.name ?? 'Unknown'}</div>
        <div>{formatDistanceToNow(new Date(item.createdAt))}</div>
      </div>
    </div>
  )
}
