import type { Section } from '@csf-live/shared'
import { cn } from '@/lib/utils'

interface SectionChipsProps {
  sections: Section[]
  activeSectionId: string | null
  onSelect: (sectionId: string | null) => void
}

export function SectionChips({ sections, activeSectionId, onSelect }: SectionChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-3 scrollbar-hide flex-shrink-0">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
          activeSectionId === null
            ? 'bg-warm-900 text-white dark:bg-warm-100 dark:text-warm-900'
            : 'bg-warm-100 text-warm-600 hover:bg-warm-200 dark:bg-warm-800 dark:text-warm-400 dark:hover:bg-warm-700'
        )}
      >
        All
      </button>
      {sections.map(section => (
        <button
          key={section.id}
          onClick={() => onSelect(section.id)}
          className={cn(
            'flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors truncate max-w-[160px]',
            activeSectionId === section.id
              ? 'bg-warm-900 text-white dark:bg-warm-100 dark:text-warm-900'
              : 'bg-warm-100 text-warm-600 hover:bg-warm-200 dark:bg-warm-800 dark:text-warm-400 dark:hover:bg-warm-700'
          )}
          title={section.title}
        >
          {section.title}
        </button>
      ))}
    </div>
  )
}
