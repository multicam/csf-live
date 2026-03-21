import * as Dialog from '@radix-ui/react-dialog'
import { useNavigate } from '@tanstack/react-router'
import { X, MessageSquare, Plus, Search, Bell } from 'lucide-react'
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/hooks/useNotifications'
import { useMockStore } from '@/mocks/store'
import { formatDistanceToNow } from '@/lib/time'
import { cn } from '@/lib/utils'
import type { Notification } from '@csf-live/shared'

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
}

function notificationIcon(type: string) {
  switch (type) {
    case 'mention':
      return MessageSquare
    case 'content_added':
      return Plus
    case 'research_complete':
      return Search
    case 'new_message':
      return Bell
    default:
      return Bell
  }
}

function useNotificationUrl(notification: Notification): string {
  const { projects, sections, contentItems } = useMockStore()

  const { referenceType, referenceId } = notification

  if (referenceType === 'project') {
    const project = projects.find(p => p.id === referenceId)
    return project ? `/feed/${project.slug}` : '/feed'
  }

  if (referenceType === 'section') {
    const section = sections.find(s => s.id === referenceId)
    if (!section) return '/feed'
    const project = projects.find(p => p.id === section.projectId)
    return project ? `/feed/${project.slug}?section=${referenceId}` : '/feed'
  }

  if (referenceType === 'content_item') {
    const item = contentItems.find(ci => ci.id === referenceId)
    if (!item) return '/feed'
    if (item.projectId) {
      const project = projects.find(p => p.id === item.projectId)
      return project ? `/feed/${project.slug}/item/${referenceId}` : '/feed'
    }
    return '/feed'
  }

  // 'message' or unknown
  return '/feed'
}

function NotificationRow({
  notification,
  onClose,
}: {
  notification: Notification
  onClose: () => void
}) {
  const navigate = useNavigate()
  const markRead = useMarkNotificationRead()
  const url = useNotificationUrl(notification)
  const Icon = notificationIcon(notification.type)

  function handleClick() {
    if (!notification.read) {
      markRead.mutate(notification.id)
    }
    onClose()
    // Navigate to the referenced content
    // url may contain query params; use window.location as a simple approach
    // Since TanStack Router navigate doesn't accept raw strings, use window.history
    window.location.href = url
    void navigate
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left rounded-lg p-3 transition-colors',
        'hover:bg-warm-100 dark:hover:bg-warm-800',
        notification.read
          ? 'bg-white dark:bg-warm-900'
          : 'bg-warm-50 dark:bg-warm-800'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
          notification.read
            ? 'bg-warm-100 text-warm-400 dark:bg-warm-800 dark:text-warm-500'
            : 'bg-warm-200 text-warm-600 dark:bg-warm-700 dark:text-warm-300'
        )}>
          <Icon size={14} />
        </div>

        <div className="min-w-0 flex-1">
          <p className={cn(
            'text-sm leading-snug',
            notification.read
              ? 'font-normal text-warm-700 dark:text-warm-300'
              : 'font-semibold text-warm-900 dark:text-warm-100'
          )}>
            {notification.title}
          </p>
          {notification.body && (
            <p className="mt-0.5 text-xs text-warm-500 dark:text-warm-400 line-clamp-2">
              {notification.body}
            </p>
          )}
          <p className="mt-1 text-xs text-warm-400 dark:text-warm-500">
            {formatDistanceToNow(new Date(notification.createdAt))}
          </p>
        </div>

        {!notification.read && (
          <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
        )}
      </div>
    </button>
  )
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { data: notifications = [] } = useNotifications()
  const markAllRead = useMarkAllRead()

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Dialog.Root open={open} onOpenChange={isOpen => { if (!isOpen) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]" />
        <Dialog.Content
          className={cn(
            'fixed right-4 top-4 z-50 flex h-[calc(100vh-2rem)] w-full max-w-md flex-col',
            'rounded-xl border border-warm-200 bg-white shadow-xl dark:border-warm-700 dark:bg-warm-900',
            'animate-[fade-in_0.15s_ease-out]'
          )}
          onEscapeKeyDown={onClose}
        >
          <Dialog.Description className="sr-only">
            Your recent notifications. Click any notification to navigate to the referenced content.
          </Dialog.Description>
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-warm-200 px-4 py-3 dark:border-warm-700">
            <Dialog.Title className="text-base font-semibold text-warm-900 dark:text-warm-100">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </Dialog.Title>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="text-xs font-medium text-warm-500 hover:text-warm-700 dark:text-warm-400 dark:hover:text-warm-200 transition-colors disabled:opacity-50"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-warm-400 hover:bg-warm-100 hover:text-warm-700 dark:hover:bg-warm-800 dark:hover:text-warm-300 transition-colors"
                aria-label="Close notifications"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto p-2">
            {sorted.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-warm-400 dark:text-warm-500">
                  You're all caught up.
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {sorted.map(notification => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onClose={onClose}
                  />
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
