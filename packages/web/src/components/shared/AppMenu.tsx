import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useNavigate } from '@tanstack/react-router'
import { Menu, Search, Bell, Settings, Sun, Moon, Monitor, Home } from 'lucide-react'
import { useUnreadCount } from '@/hooks/useNotifications'
import { usePresence } from '@/hooks/usePresence'
import { useMockStore } from '@/mocks/store'
import { useDarkMode } from '@/hooks/useDarkMode'

interface AppMenuProps {
  onNotificationsOpen?: () => void
}

export function AppMenu({ onNotificationsOpen }: AppMenuProps) {
  const navigate = useNavigate()
  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: presenceList = [] } = usePresence()
  const { users } = useMockStore()
  const { theme, toggle } = useDarkMode()

  const onlineUsers = presenceList.filter(p => p.status === 'online')
  const onlineUserNames = onlineUsers.map(
    p => users.find(u => u.id === p.userId)?.name ?? p.userId
  )

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-warm-600 hover:bg-warm-200 hover:text-warm-900 dark:text-warm-400 dark:hover:bg-warm-800 dark:hover:text-warm-100 transition-colors"
          aria-label="App menu"
        >
          <Menu size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-52 rounded-lg border border-warm-200 bg-white p-1 shadow-lg dark:border-warm-700 dark:bg-warm-900"
          sideOffset={4}
          align="start"
        >
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-700 hover:bg-warm-100 hover:text-warm-900 dark:text-warm-300 dark:hover:bg-warm-800 dark:hover:text-warm-100 outline-none"
            onSelect={() => navigate({ to: '/' })}
          >
            <Home size={16} />
            Home
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-700 hover:bg-warm-100 hover:text-warm-900 dark:text-warm-300 dark:hover:bg-warm-800 dark:hover:text-warm-100 outline-none"
            onSelect={() => navigate({ to: '/search' })}
          >
            <Search size={16} />
            Search
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-warm-700 hover:bg-warm-100 hover:text-warm-900 dark:text-warm-300 dark:hover:bg-warm-800 dark:hover:text-warm-100 outline-none"
            onSelect={onNotificationsOpen}
          >
            <span className="flex items-center gap-2">
              <Bell size={16} />
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {unreadCount}
              </span>
            )}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-warm-200 dark:bg-warm-700" />

          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-700 hover:bg-warm-100 hover:text-warm-900 dark:text-warm-300 dark:hover:bg-warm-800 dark:hover:text-warm-100 outline-none"
            onSelect={toggle}
          >
            {theme === 'dark' ? (
              <Moon size={16} />
            ) : theme === 'light' ? (
              <Sun size={16} />
            ) : (
              <Monitor size={16} />
            )}
            {theme === 'dark'
              ? 'Dark mode'
              : theme === 'light'
              ? 'Light mode'
              : 'System theme'}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800 outline-none opacity-60"
            disabled
          >
            <Settings size={16} />
            Settings
          </DropdownMenu.Item>

          {onlineUserNames.length > 0 && (
            <>
              <DropdownMenu.Separator className="my-1 h-px bg-warm-200 dark:bg-warm-700" />
              <div className="px-3 py-1.5 text-xs font-medium text-warm-400 dark:text-warm-500 uppercase tracking-wide">
                Who's Online
              </div>
              {onlineUserNames.map(name => (
                <div
                  key={name}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-warm-600 dark:text-warm-400"
                >
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {name}
                </div>
              ))}
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
