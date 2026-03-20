import { useState } from 'react'
import type { FeedItem } from '@csf-live/shared'
import { useMockStore } from '@/mocks/store'
import { usePostMessage } from '@/hooks/useFeed'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/time'
import { cn } from '@/lib/utils'

interface MessageDetailProps {
  item: FeedItem & { _sourceTable: 'message' }
}

export function MessageDetail({ item }: MessageDetailProps) {
  const { users } = useMockStore()
  const author = users.find(u => u.id === item.authorId)
  const [reply, setReply] = useState('')
  const postMessage = usePostMessage()

  const isClaude = item.contentType === 'claude-response'
  const initials = author?.name?.[0]?.toUpperCase() ?? '?'

  async function handleSend() {
    if (!reply.trim()) return
    await postMessage.mutateAsync({ discussionId: item.discussionId, content: reply.trim() })
    setReply('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Message content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Author header */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className={cn(
              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium',
              isClaude
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
                : 'bg-warm-200 text-warm-700 dark:bg-warm-700 dark:text-warm-300'
            )}
          >
            {initials}
          </div>
          <div>
            <div className="text-sm font-medium text-warm-900 dark:text-warm-100">
              {author?.name ?? 'Unknown'}
              {isClaude && (
                <span className="ml-2 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-600 dark:bg-violet-900 dark:text-violet-400">
                  AI
                </span>
              )}
            </div>
            <div className="text-xs text-warm-400 dark:text-warm-500">
              {formatDistanceToNow(new Date(item.createdAt))}
            </div>
          </div>
        </div>

        {/* Message body */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {item.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Reply compose */}
      <div className="border-t border-warm-200 dark:border-warm-800 p-3">
        <div className="text-xs text-warm-400 dark:text-warm-500 mb-2 font-medium uppercase tracking-wide">
          Reply
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a reply…"
            rows={3}
            className="flex-1 resize-none rounded-lg border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-warm-900 placeholder-warm-400 focus:border-warm-400 focus:bg-white focus:outline-none dark:border-warm-700 dark:bg-warm-900 dark:text-warm-100 dark:placeholder-warm-500 dark:focus:bg-warm-800 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!reply.trim() || postMessage.isPending}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-warm-900 text-white hover:bg-warm-700 disabled:opacity-40 dark:bg-warm-100 dark:text-warm-900 dark:hover:bg-warm-200 transition-colors"
            aria-label="Send reply"
          >
            <Send size={14} />
          </button>
        </div>
        <div className="mt-1 text-xs text-warm-400 dark:text-warm-500">
          <kbd className="rounded px-1 py-0.5 bg-warm-100 dark:bg-warm-800 font-mono text-[10px]">⌘</kbd>{' '}
          <kbd className="rounded px-1 py-0.5 bg-warm-100 dark:bg-warm-800 font-mono text-[10px]">↵</kbd>{' '}
          to send
        </div>
      </div>
    </div>
  )
}
