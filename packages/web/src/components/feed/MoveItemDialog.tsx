import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { useSections } from '@/hooks/useSections'
import { useMoveContentItem, useCopyContentItem } from '@/hooks/useContentItem'
import { showToast } from '@/components/shared/ToastProvider'
import { cn } from '@/lib/utils'

interface MoveItemDialogProps {
  itemId: string
  mode: 'move' | 'copy'
  onClose: () => void
}

function SectionPicker({
  projectId,
  selectedSectionId,
  onSelect,
}: {
  projectId: string
  selectedSectionId: string | null
  onSelect: (id: string | null) => void
}) {
  const { data: sections = [] } = useSections(projectId)

  if (sections.length === 0) return null

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-warm-400 dark:text-warm-500">
        Section (optional)
      </p>
      <div className="space-y-1">
        <label className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-warm-100 dark:hover:bg-warm-800">
          <input
            type="radio"
            name="section"
            checked={selectedSectionId === null}
            onChange={() => onSelect(null)}
            className="accent-warm-900 dark:accent-warm-100"
          />
          <span className="text-sm text-warm-600 dark:text-warm-400">No section</span>
        </label>
        {sections.map(section => (
          <label
            key={section.id}
            className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-warm-100 dark:hover:bg-warm-800"
          >
            <input
              type="radio"
              name="section"
              checked={selectedSectionId === section.id}
              onChange={() => onSelect(section.id)}
              className="accent-warm-900 dark:accent-warm-100"
            />
            <span className="text-sm text-warm-700 dark:text-warm-300">{section.title}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function MoveItemDialog({ itemId, mode, onClose }: MoveItemDialogProps) {
  const { data: projects = [] } = useProjects()
  const moveItem = useMoveContentItem()
  const copyItem = useCopyContentItem()

  // null = general feed (unassign), string = projectId
  const [selectedProjectId, setSelectedProjectId] = useState<string | null | undefined>(undefined)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)

  const isUnassign = selectedProjectId === null
  const hasSelection = selectedProjectId !== undefined

  const title = mode === 'move' ? 'Move to…' : 'Copy to…'
  const confirmLabel = mode === 'move' ? 'Move' : 'Copy'

  function handleConfirm() {
    if (!hasSelection) return

    const mutation = mode === 'move' ? moveItem : copyItem
    const successMessage = mode === 'move' ? 'Item moved successfully' : 'Item copied successfully'
    mutation.mutate(
      {
        itemId,
        projectId: selectedProjectId,
        sectionId: isUnassign ? null : selectedSectionId,
      },
      {
        onSuccess: () => {
          showToast(successMessage)
          onClose()
        },
      }
    )
  }

  return (
    <Dialog.Root open onOpenChange={open => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-xl border border-warm-200 bg-white p-6 shadow-xl dark:border-warm-700 dark:bg-warm-900',
            'animate-[fade-in_0.15s_ease-out]'
          )}
          onEscapeKeyDown={onClose}
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-warm-900 dark:text-warm-100">
              {title}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-warm-400 hover:bg-warm-100 hover:text-warm-700 dark:hover:bg-warm-800 dark:hover:text-warm-300 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Project list */}
          <div className="max-h-72 overflow-y-auto">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-warm-400 dark:text-warm-500">
              Project
            </p>
            <div className="space-y-1">
              {/* Unassign option */}
              <label className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-warm-100 dark:hover:bg-warm-800">
                <input
                  type="radio"
                  name="project"
                  checked={selectedProjectId === null}
                  onChange={() => {
                    setSelectedProjectId(null)
                    setSelectedSectionId(null)
                  }}
                  className="accent-warm-900 dark:accent-warm-100"
                />
                <span className="text-sm text-warm-600 dark:text-warm-400">
                  General Feed (unassign)
                </span>
              </label>

              {projects.map(project => (
                <label
                  key={project.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-warm-100 dark:hover:bg-warm-800"
                >
                  <input
                    type="radio"
                    name="project"
                    checked={selectedProjectId === project.id}
                    onChange={() => {
                      setSelectedProjectId(project.id)
                      setSelectedSectionId(null)
                    }}
                    className="accent-warm-900 dark:accent-warm-100"
                  />
                  <span className="text-sm text-warm-700 dark:text-warm-300">{project.title}</span>
                </label>
              ))}
            </div>

            {/* Section picker — shown when a real project is selected */}
            {selectedProjectId && (
              <SectionPicker
                projectId={selectedProjectId}
                selectedSectionId={selectedSectionId}
                onSelect={setSelectedSectionId}
              />
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!hasSelection || moveItem.isPending || copyItem.isPending}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                'bg-warm-900 text-white hover:bg-warm-700 dark:bg-warm-100 dark:text-warm-900 dark:hover:bg-warm-300',
                (!hasSelection || moveItem.isPending || copyItem.isPending) &&
                  'opacity-50 cursor-not-allowed'
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
