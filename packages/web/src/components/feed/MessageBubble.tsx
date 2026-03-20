import type { Message } from '@csf-live/shared'
import { useMockStore } from '@/mocks/store'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { Bot } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  onClick?: () => void
  isSelected?: boolean
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MessageBubble({ message, isOwn, onClick, isSelected }: MessageBubbleProps) {
  const { users } = useMockStore()
  const author = users.find(u => u.id === message.authorId)
  const isClaude = message.contentType === 'claude-response'

  return (
    <div
      className={cn('flex gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}
      onClick={onClick}
    >
      {/* Avatar — only for others */}
      {!isOwn && (
        <div
          className={cn(
            'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium',
            isClaude
              ? 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
              : 'bg-warm-200 text-warm-700 dark:bg-warm-700 dark:text-warm-300'
          )}
        >
          {isClaude ? <Bot size={14} /> : (author?.name?.[0] ?? '?')}
        </div>
      )}

      <div
        className={cn(
          'flex max-w-[75%] flex-col gap-1',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        {/* Author + time — only for others */}
        {!isOwn && (
          <div className="flex items-center gap-1.5 text-xs text-warm-400 dark:text-warm-500">
            <span className="font-medium">{author?.name ?? 'Unknown'}</span>
            {isClaude && (
              <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-600 dark:bg-violet-900 dark:text-violet-400">
                AI
              </span>
            )}
            <span>{formatTime(message.createdAt)}</span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-3 py-2 text-sm',
            isOwn
              ? 'bg-warm-900 text-warm-50 dark:bg-warm-100 dark:text-warm-900'
              : isClaude
              ? 'bg-violet-50 text-warm-900 border border-violet-200 dark:bg-violet-950 dark:text-warm-100 dark:border-violet-800'
              : 'bg-white text-warm-900 border border-warm-200 dark:bg-warm-800 dark:text-warm-100 dark:border-warm-700',
            isSelected ? 'ring-2 ring-warm-900 dark:ring-warm-100' : '',
            onClick ? 'cursor-pointer' : ''
          )}
        >
          {isClaude ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}
        </div>

        {/* Timestamp — only for own messages */}
        {isOwn && (
          <span className="text-xs text-warm-400 dark:text-warm-500">
            {formatTime(message.createdAt)}
          </span>
        )}
      </div>
    </div>
  )
}
