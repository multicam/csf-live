import { useState, useRef, useEffect } from 'react'
import type { ContentItem } from '@csf-live/shared'
import { useMockStore } from '@/mocks/store'
import { useUpdateContentItem } from '@/hooks/useContentItem'
import { formatDistanceToNow } from '@/lib/time'
import { cn } from '@/lib/utils'

interface IdeaDetailProps {
  item: ContentItem
}

export function IdeaDetail({ item }: IdeaDetailProps) {
  const { users } = useMockStore()
  const author = users.find(u => u.id === item.authorId)
  const updateItem = useUpdateContentItem()

  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(item.body ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setBody(item.body ?? '')
  }, [item.id, item.body])

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [editing])

  function handleBlur() {
    setEditing(false)
    if (body !== item.body) {
      updateItem.mutate({ itemId: item.id, patch: { body } })
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const tags = (item.metadata?.tags as string[] | undefined) ?? []

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      {/* Title */}
      {item.title && (
        <h2 className="text-base font-semibold text-warm-900 dark:text-warm-100 mb-2">
          {item.title}
        </h2>
      )}

      {/* Body — click to edit */}
      {editing ? (
        <textarea
          ref={textareaRef}
          value={body}
          onChange={handleTextareaChange}
          onBlur={handleBlur}
          className="w-full resize-none rounded-md border border-warm-300 bg-warm-50 p-2 text-sm text-warm-900 focus:border-warm-500 focus:outline-none dark:border-warm-600 dark:bg-warm-800 dark:text-warm-100 min-h-[100px]"
        />
      ) : (
        <div
          onClick={() => setEditing(true)}
          className={cn(
            'cursor-text rounded-md p-2 text-sm text-warm-700 dark:text-warm-300 min-h-[80px] hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors',
            !body && 'text-warm-400 dark:text-warm-500 italic'
          )}
        >
          {body || 'Click to add content…'}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="rounded-full bg-warm-100 px-2 py-0.5 text-xs text-warm-600 dark:bg-warm-800 dark:text-warm-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="mt-4 border-t border-warm-100 dark:border-warm-800 pt-3 text-xs text-warm-400 dark:text-warm-500 space-y-1">
        <div>By {author?.name ?? 'Unknown'}</div>
        <div>{formatDistanceToNow(new Date(item.createdAt))}</div>
        {updateItem.isPending && (
          <div className="text-blue-500">Saving…</div>
        )}
      </div>
    </div>
  )
}
