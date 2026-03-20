import type { ContentItem } from '@csf-live/shared'
import { useMockStore } from '@/mocks/store'
import { formatDistanceToNow } from '@/lib/time'
import { File, FileText, Image, Music, Video, Archive, Download } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'

interface FileDetailProps {
  item: ContentItem
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getMimeIcon(mimeType: string | null) {
  if (!mimeType) return File
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.startsWith('audio/')) return Music
  if (mimeType.startsWith('video/')) return Video
  if (mimeType.includes('pdf') || mimeType.includes('text')) return FileText
  if (mimeType.includes('zip') || mimeType.includes('archive')) return Archive
  return File
}

export function FileDetail({ item }: FileDetailProps) {
  const { users } = useMockStore()
  const author = users.find(u => u.id === item.authorId)

  const fileName = (item.metadata?.fileName as string | undefined) ?? item.title ?? 'File'
  const fileSize = item.metadata?.fileSize as number | undefined
  const mimeType = item.mediaType
  const MimeIcon = getMimeIcon(mimeType)

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 gap-4">
      {/* File icon + name */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-warm-100 text-warm-600 dark:bg-warm-800 dark:text-warm-300">
          <MimeIcon size={24} />
        </div>
        <div>
          <div className="text-base font-semibold text-warm-900 dark:text-warm-100 break-all">
            {fileName}
          </div>
          {mimeType && (
            <div className="text-xs text-warm-400 dark:text-warm-500 font-mono">{mimeType}</div>
          )}
          {fileSize !== undefined && (
            <div className="text-xs text-warm-400 dark:text-warm-500">{formatBytes(fileSize)}</div>
          )}
        </div>
      </div>

      {/* Download button — disabled in Tier 1 */}
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              disabled
              className="flex items-center gap-2 rounded-md border border-warm-200 bg-warm-50 px-4 py-2 text-sm text-warm-400 opacity-50 cursor-not-allowed dark:border-warm-700 dark:bg-warm-900 w-fit"
            >
              <Download size={14} />
              Download
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="rounded-md bg-warm-900 px-2 py-1 text-xs text-white dark:bg-warm-100 dark:text-warm-900 shadow-lg"
              sideOffset={4}
            >
              Download available in Phase 2
              <Tooltip.Arrow className="fill-warm-900 dark:fill-warm-100" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      {/* Metadata */}
      <div className="text-xs text-warm-400 dark:text-warm-500 space-y-1 border-t border-warm-100 dark:border-warm-800 pt-3">
        <div>By {author?.name ?? 'Unknown'}</div>
        <div>{formatDistanceToNow(new Date(item.createdAt))}</div>
      </div>
    </div>
  )
}
