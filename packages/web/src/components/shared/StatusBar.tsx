export function StatusBar() {
  return (
    <div className="fixed bottom-2 right-3 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-warm-400 dark:text-warm-500">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      <span>Online</span>
    </div>
  )
}
