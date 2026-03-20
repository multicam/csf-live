import type { ContentItem } from '@csf-live/shared'
import { CONTENT_TYPE_LABELS } from '@csf-live/shared/constants'
import {
  FileText,
  Lightbulb,
  Pencil,
  Link2,
  Mic,
  Camera,
  Search,
  File,
  Image,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/time'
import { useMockStore } from '@/mocks/store'

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  idea: Lightbulb,
  document: FileText,
  drawing: Pencil,
  sketch: Image,
  link: Link2,
  voice: Mic,
  photo: Camera,
  research: Search,
  file: File,
}

interface ContentCardProps {
  item: ContentItem
  onClick?: () => void
  isSelected?: boolean
}

export function ContentCard({ item, onClick, isSelected }: ContentCardProps) {
  const { users } = useMockStore()
  const author = users.find(u => u.id === item.authorId)
  const Icon = TYPE_ICONS[item.type] ?? FileText
  const isClaude = item.authorId === 'user-claude'

  const title =
    item.title ??
    (item.metadata?.fileName as string | undefined) ??
    CONTENT_TYPE_LABELS[item.type] ??
    item.type
  const preview = item.body ? item.body.slice(0, 120) : null
  const linkTitle = item.metadata?.title as string | undefined
  const linkDomain = item.metadata?.domain as string | undefined

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border border-warm-200 bg-white p-3 transition-shadow dark:border-warm-700 dark:bg-warm-800',
        'animate-[fade-in_0.2s_ease-out]',
        '[container-type:inline-size]',
        onClick ? 'cursor-pointer hover:shadow-md' : '',
        isSelected
          ? 'ring-2 ring-warm-900 dark:ring-warm-100 border-warm-900 dark:border-warm-100'
          : ''
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <div
          className={cn(
            'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md',
            isClaude
              ? 'bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-400'
              : 'bg-warm-100 text-warm-600 dark:bg-warm-700 dark:text-warm-300'
          )}
        >
          <Icon size={14} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-warm-400 dark:text-warm-500 uppercase tracking-wide">
              {CONTENT_TYPE_LABELS[item.type] ?? item.type}
            </span>
            {isClaude && (
              <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-600 dark:bg-violet-900 dark:text-violet-400">
                AI
              </span>
            )}
            {item.type === 'document' && !!item.metadata?.document_type && (
              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400 uppercase">
                {String(item.metadata.document_type)}
              </span>
            )}
          </div>

          {(linkTitle ?? title) && (
            <p className="mt-0.5 text-sm font-medium text-warm-900 dark:text-warm-100 truncate">
              {linkTitle ?? title}
            </p>
          )}
        </div>

        <span className="flex-shrink-0 text-xs text-warm-400 dark:text-warm-500">
          {formatDistanceToNow(new Date(item.createdAt))}
        </span>
      </div>

      {/* Preview */}
      {(preview || linkDomain) && (
        <div className="mt-2 text-xs text-warm-500 dark:text-warm-400 line-clamp-2 pl-9">
          {linkDomain ? (
            <span className="text-warm-400 dark:text-warm-500">{linkDomain}</span>
          ) : (
            preview
          )}
        </div>
      )}

      {/* Author */}
      <div className="mt-2 flex items-center gap-1.5 pl-9">
        <span className="text-xs text-warm-400 dark:text-warm-500">
          {author?.name ?? 'Unknown'}
        </span>
      </div>

      {/* Photo / sketch thumbnail */}
      {(item.type === 'photo' || item.type === 'sketch') && item.mediaUrl && (
        <div className="mt-2 overflow-hidden rounded-md pl-9">
          <img
            src={item.mediaUrl}
            alt={title ?? ''}
            className="h-32 w-full object-cover"
          />
        </div>
      )}

      {/* Link OG image */}
      {item.type === 'link' && (item.metadata?.ogImage as string | undefined) && (
        <div className="mt-2 overflow-hidden rounded-md">
          <img
            src={item.metadata.ogImage as string}
            alt={linkTitle ?? ''}
            className="h-32 w-full object-cover"
          />
        </div>
      )}
    </div>
  )
}
