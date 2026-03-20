import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useNavigate } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { useCreateProject } from '@/hooks/useProjects'
import { showToast } from '@/components/shared/ToastProvider'

interface CreateProjectDialogProps {
  onClose: () => void
}

export function CreateProjectDialog({ onClose }: CreateProjectDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const createProject = useCreateProject()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    const project = await createProject.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
    })
    showToast('Project created')
    onClose()
    navigate({ to: '/feed/$slug', params: { slug: project.slug } })
  }

  return (
    <Dialog.Root
      open
      onOpenChange={open => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-warm-200 bg-white p-6 shadow-xl dark:border-warm-700 dark:bg-warm-900">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-base font-semibold text-warm-900 dark:text-warm-100">
              New Project
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => {
                  setTitle(e.target.value)
                  setError('')
                }}
                placeholder="My Project"
                className="w-full rounded-md border border-warm-200 bg-white px-3 py-2 text-sm text-warm-900 placeholder-warm-400 focus:border-warm-400 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-100 dark:placeholder-warm-500"
                autoFocus
              />
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What's this project about?"
                rows={3}
                className="w-full rounded-md border border-warm-200 bg-white px-3 py-2 text-sm text-warm-900 placeholder-warm-400 focus:border-warm-400 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-100 dark:placeholder-warm-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-4 py-2 text-sm text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProject.isPending}
                className="rounded-md bg-warm-900 px-4 py-2 text-sm font-medium text-white hover:bg-warm-700 disabled:opacity-50 dark:bg-warm-100 dark:text-warm-900 dark:hover:bg-warm-200 transition-colors"
              >
                {createProject.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
