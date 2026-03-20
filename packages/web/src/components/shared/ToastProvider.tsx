import * as Toast from '@radix-ui/react-toast'
import { useState, useEffect } from 'react'

type ToastMessage = { id: string; title: string; type: 'success' | 'error' }

// Simple event bus for toasts — module-level so it's a singleton
const listeners: ((msg: ToastMessage) => void)[] = []

export function showToast(title: string, type: 'success' | 'error' = 'success') {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  listeners.forEach(fn => fn({ id, title, type }))
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const handler = (msg: ToastMessage) => {
      setToasts(prev => [...prev, msg])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== msg.id))
      }, 3000)
    }
    listeners.push(handler)
    return () => {
      const idx = listeners.indexOf(handler)
      if (idx >= 0) listeners.splice(idx, 1)
    }
  }, [])

  return (
    <Toast.Provider swipeDirection="right">
      {children}
      {toasts.map(toast => (
        <Toast.Root
          key={toast.id}
          open={true}
          className={`
            fixed bottom-4 right-4 z-[100] flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg
            transition-all duration-200
            ${toast.type === 'success'
              ? 'border-green-200 bg-white text-green-800 dark:border-green-800 dark:bg-warm-900 dark:text-green-300'
              : 'border-red-200 bg-white text-red-800 dark:border-red-800 dark:bg-warm-900 dark:text-red-300'}
          `}
        >
          <Toast.Title className="text-sm font-medium">{toast.title}</Toast.Title>
          <Toast.Close className="ml-2 opacity-50 hover:opacity-100 text-xs">✕</Toast.Close>
        </Toast.Root>
      ))}
      <Toast.Viewport />
    </Toast.Provider>
  )
}
