import type { ContentItem } from '@csf-live/shared'
import { useMockStore } from '@/mocks/store'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatDistanceToNow } from '@/lib/time'
import { Bot } from 'lucide-react'

interface ResearchDetailProps {
  item: ContentItem
}

export function ResearchDetail({ item }: ResearchDetailProps) {
  const { users } = useMockStore()
  const author = users.find(u => u.id === item.authorId)
  const sources = item.metadata?.sources as string[] | undefined

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 gap-4">
      {/* Badges */}
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:bg-violet-900 dark:text-violet-400 uppercase tracking-wide">
          AI Research
        </span>
        <span className="flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:bg-violet-950 dark:border-violet-800 dark:text-violet-400">
          <Bot size={10} />
          Claude
        </span>
      </div>

      {/* Title */}
      {item.title && (
        <h2 className="text-base font-semibold text-warm-900 dark:text-warm-100">
          {item.title}
        </h2>
      )}

      {/* Content */}
      {item.body && (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {item.body}
          </ReactMarkdown>
        </div>
      )}

      {/* Sources */}
      {sources && sources.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wide">
            Sources
          </div>
          <ul className="space-y-1">
            {sources.map((src, i) => (
              <li key={i} className="text-xs text-warm-500 dark:text-warm-400 truncate">
                {src}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-warm-400 dark:text-warm-500 space-y-1 border-t border-warm-100 dark:border-warm-800 pt-3">
        <div>By {author?.name ?? 'Unknown'}</div>
        <div>{formatDistanceToNow(new Date(item.createdAt))}</div>
      </div>
    </div>
  )
}
