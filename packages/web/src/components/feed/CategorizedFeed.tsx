import { useState, useEffect } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  Pencil,
  Link2,
  Mic,
  Camera,
  Search,
  File,
  Image,
  ChevronUp,
  LayoutGrid,
} from 'lucide-react'
import type { ContentItem, FeedItem } from '@csf-live/shared'
import { CONTENT_TYPE_LABELS } from '@csf-live/shared/constants'
import { ContentCard } from './cards/ContentCard'
import { cn } from '@/lib/utils'
import { useMockStore } from '@/mocks/store'

type GroupBy = 'type' | 'section' | 'author' | 'tag'

const GROUP_BY_LABELS: Record<GroupBy, string> = {
  type: 'Type',
  section: 'Section',
  author: 'Author',
  tag: 'Tag',
}

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  idea: Lightbulb,
  document: FileText,
  drawing: Pencil,
  sketch: Image,
  link: Link2,
  voice: Mic,
  photo: Camera,
  research: Search,
  file: File,
}

const TYPE_ORDER: string[] = [
  'idea', 'document', 'drawing', 'sketch', 'link', 'voice', 'photo', 'research', 'file',
]

const TYPE_GROUP_LABELS: Record<string, string> = {
  idea: 'Ideas',
  drawing: 'Drawings',
  sketch: 'Sketches',
  document: 'Documents',
  link: 'Links',
  voice: 'Voice Notes',
  photo: 'Photos',
  research: 'Research',
  file: 'Files',
}

interface Group {
  key: string
  label: string
  icon?: React.ComponentType<{ size?: number }>
  items: ContentItem[]
}

function buildGroups(items: ContentItem[], groupBy: GroupBy, context: {
  sections: Array<{ id: string; title: string }>
  users: Array<{ id: string; name: string }>
}): Group[] {
  if (groupBy === 'type') {
    const byType = new Map<string, ContentItem[]>()
    for (const item of items) {
      const list = byType.get(item.type) ?? []
      list.push(item)
      byType.set(item.type, list)
    }
    return TYPE_ORDER
      .filter(t => byType.has(t))
      .map(t => ({
        key: t,
        label: TYPE_GROUP_LABELS[t] ?? CONTENT_TYPE_LABELS[t] ?? t,
        icon: TYPE_ICONS[t],
        items: byType.get(t)!,
      }))
  }

  if (groupBy === 'section') {
    const unassigned: ContentItem[] = []
    const bySection = new Map<string, ContentItem[]>()
    for (const item of items) {
      if (!item.sectionId) {
        unassigned.push(item)
      } else {
        const list = bySection.get(item.sectionId) ?? []
        list.push(item)
        bySection.set(item.sectionId, list)
      }
    }
    const groups: Group[] = context.sections
      .filter(s => bySection.has(s.id))
      .map(s => ({
        key: s.id,
        label: s.title,
        items: bySection.get(s.id)!,
      }))
    if (unassigned.length > 0) {
      groups.push({ key: '_unassigned', label: 'No Section', items: unassigned })
    }
    return groups
  }

  if (groupBy === 'author') {
    const byAuthor = new Map<string, ContentItem[]>()
    for (const item of items) {
      const list = byAuthor.get(item.authorId) ?? []
      list.push(item)
      byAuthor.set(item.authorId, list)
    }
    return [...byAuthor.entries()].map(([authorId, authorItems]) => {
      const user = context.users.find(u => u.id === authorId)
      return {
        key: authorId,
        label: user?.name ?? authorId,
        items: authorItems,
      }
    })
  }

  // groupBy === 'tag'
  const untagged: ContentItem[] = []
  const byTag = new Map<string, ContentItem[]>()
  for (const item of items) {
    const tags = (item.metadata?.tags as string[] | undefined) ?? []
    if (tags.length === 0) {
      untagged.push(item)
    } else {
      for (const tag of tags) {
        const list = byTag.get(tag) ?? []
        list.push(item)
        byTag.set(tag, list)
      }
    }
  }
  const groups: Group[] = [...byTag.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tag, tagItems]) => ({
      key: tag,
      label: tag,
      items: tagItems,
    }))
  if (untagged.length > 0) {
    groups.push({ key: '_untagged', label: 'Untagged', items: untagged })
  }
  return groups
}

function loadCollapseState(context: string): Set<string> {
  const stored = localStorage.getItem(`feed-categorized-collapse-${context}`)
  if (!stored) return new Set()
  try {
    return new Set(JSON.parse(stored) as string[])
  } catch {
    return new Set()
  }
}

function saveCollapseState(context: string, collapsed: Set<string>) {
  localStorage.setItem(`feed-categorized-collapse-${context}`, JSON.stringify([...collapsed]))
}

interface CategorizedGroupProps {
  group: Group
  isCollapsed: boolean
  onToggleCollapse: () => void
  onSelectItem?: (item: ContentItem) => void
  selectedItemId?: string | null
}

function CategorizedGroup({ group, isCollapsed, onToggleCollapse, onSelectItem, selectedItemId }: CategorizedGroupProps) {
  const Icon = group.icon ?? FileText
  const ChevronIcon = isCollapsed ? ChevronRight : ChevronDown

  return (
    <Collapsible.Root open={!isCollapsed} onOpenChange={() => onToggleCollapse()}>
      <Collapsible.Trigger asChild>
        <button className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors">
          <ChevronIcon size={14} className="flex-shrink-0 text-warm-400" />
          <Icon size={14} className="flex-shrink-0 text-warm-500 dark:text-warm-400" />
          <span className="flex-1 text-sm font-medium text-warm-800 dark:text-warm-200">
            {group.label}
          </span>
          <span className="flex-shrink-0 rounded-full bg-warm-200 px-1.5 py-0.5 text-xs font-medium text-warm-600 dark:bg-warm-700 dark:text-warm-400">
            {group.items.length}
          </span>
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <div className="pb-2 pl-3 pr-3 space-y-2">
          {group.items.map(item => (
            <ContentCard
              key={item.id}
              item={item}
              onClick={onSelectItem ? () => onSelectItem(item) : undefined}
              isSelected={item.id === selectedItemId}
            />
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

interface CategorizedFeedProps {
  items: FeedItem[]
  context: string  // 'feed' or project slug
  onSelectItem?: (item: ContentItem) => void
  selectedItemId?: string | null
  sections?: Array<{ id: string; title: string }>
}

export function CategorizedFeed({ items, context, onSelectItem, selectedItemId, sections = [] }: CategorizedFeedProps) {
  const { users } = useMockStore()
  const [groupBy, setGroupBy] = useState<GroupBy>('type')
  const [collapsed, setCollapsed] = useState<Set<string>>(() => loadCollapseState(context))

  // Only content items (no messages)
  const contentItems = items
    .filter((item): item is ContentItem & { _sourceTable: 'content_item' } => item._sourceTable === 'content_item')

  const groups = buildGroups(contentItems, groupBy, { sections, users })

  useEffect(() => {
    saveCollapseState(context, collapsed)
  }, [context, collapsed])

  function toggleCollapse(key: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  if (contentItems.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-warm-400 dark:text-warm-500">
        No content items to display.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Group by dropdown */}
      <div className="flex items-center justify-end px-3 py-2 border-b border-warm-200 dark:border-warm-800 flex-shrink-0">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-warm-500 hover:bg-warm-100 hover:text-warm-700 dark:text-warm-400 dark:hover:bg-warm-800 dark:hover:text-warm-200 transition-colors">
              <LayoutGrid size={12} />
              Group by {GROUP_BY_LABELS[groupBy]}
              <ChevronUp size={12} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-36 rounded-lg border border-warm-200 bg-white p-1 shadow-lg dark:border-warm-700 dark:bg-warm-900"
              sideOffset={4}
              align="end"
            >
              {(Object.keys(GROUP_BY_LABELS) as GroupBy[]).map(option => (
                <DropdownMenu.Item
                  key={option}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none transition-colors',
                    groupBy === option
                      ? 'bg-warm-100 font-medium text-warm-900 dark:bg-warm-800 dark:text-warm-100'
                      : 'text-warm-700 hover:bg-warm-100 hover:text-warm-900 dark:text-warm-300 dark:hover:bg-warm-800 dark:hover:text-warm-100'
                  )}
                  onSelect={() => setGroupBy(option)}
                >
                  {GROUP_BY_LABELS[option]}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto divide-y divide-warm-100 dark:divide-warm-800">
        {groups.map(group => (
          <CategorizedGroup
            key={group.key}
            group={group}
            isCollapsed={collapsed.has(group.key)}
            onToggleCollapse={() => toggleCollapse(group.key)}
            onSelectItem={onSelectItem}
            selectedItemId={selectedItemId}
          />
        ))}
      </div>
    </div>
  )
}
