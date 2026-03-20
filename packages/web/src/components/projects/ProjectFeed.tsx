import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useProject } from '@/hooks/useProjects'
import { useSections } from '@/hooks/useSections'
import { useProjectFeedItems } from '@/hooks/useFeed'
import { useMockStore } from '@/mocks/store'
import { FeedItemRenderer } from '@/components/feed/FeedItemRenderer'
import { ComposeInput } from '@/components/feed/ComposeInput'
import { SectionChips } from './SectionChips'
import type { FeedItem } from '@csf-live/shared'

interface ProjectFeedProps {
  slug: string
  selectedItemId?: string | null
}

export function ProjectFeed({ slug, selectedItemId }: ProjectFeedProps) {
  const navigate = useNavigate()
  const { data: project, isLoading: projectLoading } = useProject(slug)
  const { data: sections = [] } = useSections(project?.id ?? '')
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const { data: feedItems = [], isLoading: feedLoading } = useProjectFeedItems(
    project?.id ?? '',
    activeSectionId
  )
  const { discussions } = useMockStore()

  // Find the project discussion for ComposeInput
  const projectDiscussion = discussions.find(
    d => d.contextType === 'project' && d.contextId === project?.id
  )

  function handleSelectItem(item: FeedItem) {
    if (!project) return
    if (item._sourceTable === 'content_item') {
      if (item.type === 'document') {
        navigate({ to: '/feed/$slug/doc/$id', params: { slug, id: item.id } })
      } else {
        navigate({ to: '/feed/$slug/item/$id', params: { slug, id: item.id } })
      }
    } else {
      // Message — navigate to item detail
      navigate({ to: '/feed/$slug/item/$id', params: { slug, id: item.id } })
    }
  }

  if (projectLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-warm-400 dark:text-warm-500">Loading project…</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-warm-400 dark:text-warm-500">Project not found</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col pt-12">
      {/* Project title header */}
      <div className="px-3 py-2 border-b border-warm-200 dark:border-warm-800 flex-shrink-0">
        <h1 className="text-sm font-semibold text-warm-900 dark:text-warm-100 truncate">
          {project.title}
        </h1>
      </div>

      {/* Section chips */}
      {sections.length > 0 && (
        <div className="border-b border-warm-200 dark:border-warm-800">
          <SectionChips
            sections={sections}
            activeSectionId={activeSectionId}
            onSelect={setActiveSectionId}
          />
        </div>
      )}

      {/* Feed items — newest first (already sorted by API) */}
      <div className="flex-1 overflow-y-auto">
        {feedLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-warm-400">
            Loading…
          </div>
        ) : feedItems.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-warm-400 dark:text-warm-500 px-6 text-center">
            Add a section or drop content here to get started.
          </div>
        ) : (
          <div className="px-3 py-4 space-y-2">
            {feedItems.map(item => (
              <FeedItemRenderer
                key={item.id}
                item={item}
                onSelect={handleSelectItem}
                isSelected={item.id === selectedItemId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Compose input */}
      {projectDiscussion && (
        <ComposeInput
          discussionId={projectDiscussion.id}
          projectId={project.id}
        />
      )}
    </div>
  )
}
