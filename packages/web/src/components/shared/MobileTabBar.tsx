import { PenLine, FolderOpen, MessageSquare, PanelRight } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

interface MobileTabBarProps {
  activeTab: 'canvas' | 'projects' | 'feed' | 'detail'
  onTabChange: (tab: 'canvas' | 'projects' | 'feed' | 'detail') => void
  hasDetail: boolean
}

const TABS = [
  { id: 'canvas' as const, label: 'Canvas', Icon: PenLine },
  { id: 'projects' as const, label: 'Projects', Icon: FolderOpen },
  { id: 'feed' as const, label: 'Feed', Icon: MessageSquare },
  { id: 'detail' as const, label: 'Detail', Icon: PanelRight },
]

export function MobileTabBar({ activeTab, onTabChange, hasDetail }: MobileTabBarProps) {
  const navigate = useNavigate()

  function handleTabPress(tabId: 'canvas' | 'projects' | 'feed' | 'detail') {
    if (tabId === 'canvas') {
      navigate({ to: '/' })
      return
    }
    if (tabId === 'detail' && !hasDetail) return
    onTabChange(tabId)
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 bg-white dark:bg-warm-900 border-t border-warm-200 dark:border-warm-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id
        const isDisabled = id === 'detail' && !hasDetail

        return (
          <button
            key={id}
            onClick={() => handleTabPress(id)}
            disabled={isDisabled}
            aria-label={label}
            aria-selected={isActive}
            className={cn(
              'flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 py-2 transition-colors',
              isActive
                ? 'text-warm-900 dark:text-warm-100'
                : 'text-warm-400 dark:text-warm-500',
              isDisabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
