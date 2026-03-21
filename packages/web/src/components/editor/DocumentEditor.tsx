import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tooltip from '@radix-ui/react-tooltip'
import { X, History } from 'lucide-react'
import { useContentItem, useContentVersions, useUpdateContentItemVersion } from '@/hooks/useContentItem'
import { DOCUMENT_TYPE_LABELS } from '@csf-live/shared/constants'
import { formatDistanceToNow } from '@/lib/time'
import { useMockStore } from '@/mocks/store'
import { cn } from '@/lib/utils'

interface DocumentEditorProps {
  itemId: string
  onClose?: () => void
}

function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'rounded px-2 py-1 text-xs font-medium transition-colors',
        isActive
          ? 'bg-warm-900 text-white dark:bg-warm-100 dark:text-warm-900'
          : 'text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800'
      )}
    >
      {children}
    </button>
  )
}

function VersionHistoryPanel({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const { data: versions = [] } = useContentVersions(itemId)
  const { users } = useMockStore()
  const [previewBody, setPreviewBody] = useState<string | null>(null)

  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)

  return (
    <Dialog.Root open onOpenChange={open => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-warm-200 bg-white p-0 shadow-xl dark:border-warm-700 dark:bg-warm-900 max-h-[80vh] flex flex-col">
          <Dialog.Description className="sr-only">
            List of document versions. Click to preview. Restore is available in Phase 2.
          </Dialog.Description>
          <div className="flex items-center justify-between border-b border-warm-200 dark:border-warm-800 px-4 py-3">
            <Dialog.Title className="text-sm font-semibold text-warm-900 dark:text-warm-100">
              Version History
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-md p-1 text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Version list */}
            <div className="w-56 flex-shrink-0 border-r border-warm-200 dark:border-warm-800 overflow-y-auto">
              {sortedVersions.length === 0 ? (
                <div className="p-4 text-sm text-warm-400 dark:text-warm-500">No versions yet</div>
              ) : (
                sortedVersions.map(v => {
                  const author = users.find(u => u.id === v.authorId)
                  return (
                    <button
                      key={v.id}
                      onClick={() => setPreviewBody(v.body)}
                      className={cn(
                        'w-full text-left p-3 border-b border-warm-100 dark:border-warm-800 hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors',
                        previewBody === v.body ? 'bg-warm-100 dark:bg-warm-800' : ''
                      )}
                    >
                      <div className="text-xs font-medium text-warm-900 dark:text-warm-100">
                        v{v.versionNumber}
                      </div>
                      <div className="text-xs text-warm-500 dark:text-warm-400 truncate">
                        {v.changeSummary ?? 'No summary'}
                      </div>
                      <div className="text-xs text-warm-400 dark:text-warm-500">
                        {author?.name ?? 'Unknown'} · {formatDistanceToNow(new Date(v.createdAt))}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Preview pane */}
            <div className="flex-1 overflow-y-auto p-4">
              {previewBody ? (
                <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm">
                  {previewBody}
                </div>
              ) : (
                <div className="text-sm text-warm-400 dark:text-warm-500">
                  Select a version to preview
                </div>
              )}
            </div>
          </div>

          {/* Restore button — disabled */}
          <div className="border-t border-warm-200 dark:border-warm-800 px-4 py-3 flex justify-end">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    disabled
                    className="rounded-md border border-warm-200 bg-warm-50 px-3 py-1.5 text-sm text-warm-400 opacity-50 cursor-not-allowed dark:border-warm-700 dark:bg-warm-900"
                  >
                    Restore this version
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="rounded-md bg-warm-900 px-2 py-1 text-xs text-white dark:bg-warm-100 dark:text-warm-900 shadow-lg"
                    sideOffset={4}
                  >
                    Version restore available in Phase 2
                    <Tooltip.Arrow className="fill-warm-900 dark:fill-warm-100" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function DocumentEditor({ itemId, onClose: _onClose }: DocumentEditorProps) {
  const { data: item, isLoading } = useContentItem(itemId)
  const updateVersion = useUpdateContentItemVersion()
  const [showHistory, setShowHistory] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saving, setSaving] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none dark:prose-invert focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  // Set content once item loads
  useEffect(() => {
    if (editor && item?.body && editor.isEmpty) {
      editor.commands.setContent(item.body)
    }
  }, [editor, item?.body, item?.id])

  // Auto-save with 2s debounce
  const handleAutoSave = useCallback(() => {
    if (!editor) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      const text = editor.getText()
      await updateVersion.mutateAsync({
        itemId,
        body: text,
        changeSummary: 'Auto-save',
      })
      setSaving(false)
    }, 2000)
  }, [editor, itemId, updateVersion])

  useEffect(() => {
    if (!editor) return
    editor.on('update', handleAutoSave)
    return () => {
      editor.off('update', handleAutoSave)
    }
  }, [editor, handleAutoSave])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-warm-400 dark:text-warm-500">Loading document…</div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-warm-400 dark:text-warm-500">Document not found</div>
      </div>
    )
  }

  const docType = item.metadata?.document_type as string | undefined
  const docTypeLabel = docType ? (DOCUMENT_TYPE_LABELS[docType] ?? docType) : null

  return (
    <div className="flex h-full flex-col bg-white dark:bg-warm-950">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-warm-200 dark:border-warm-800 px-3 py-2 flex-wrap">
        {docTypeLabel && (
          <span className="mr-2 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400 uppercase tracking-wide">
            {docTypeLabel}
          </span>
        )}

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive('bold')}
          title="Bold"
        >
          B
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive('italic')}
          title="Italic"
        >
          <em>I</em>
        </ToolbarButton>
        <div className="w-px h-4 bg-warm-200 dark:bg-warm-700 mx-1" />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor?.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor?.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor?.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>
        <div className="w-px h-4 bg-warm-200 dark:bg-warm-700 mx-1" />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCode().run()}
          isActive={editor?.isActive('code')}
          title="Code"
        >
          {'<>'}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          isActive={editor?.isActive('blockquote')}
          title="Blockquote"
        >
          "
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive('bulletList')}
          title="Bullet List"
        >
          •—
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          isActive={editor?.isActive('orderedList')}
          title="Ordered List"
        >
          1—
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          —
        </ToolbarButton>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Saving indicator */}
        {saving && (
          <span className="text-xs text-warm-400 dark:text-warm-500">Saving…</span>
        )}

        {/* Version history button */}
        <button
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-warm-500 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800 transition-colors"
        >
          <History size={12} />
          History
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {showHistory && (
        <VersionHistoryPanel itemId={itemId} onClose={() => setShowHistory(false)} />
      )}
    </div>
  )
}
