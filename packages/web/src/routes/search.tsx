import { createFileRoute } from '@tanstack/react-router'
import { FeedShell } from '@/components/feed/FeedShell'
import { SearchColumn } from '@/components/feed/SearchColumn'

interface SearchRouteSearch {
  q?: string
  type?: string
  author?: string
}

function SearchRoute() {
  const { q, type, author } = Route.useSearch()

  const initialTypes = type ? type.split(',').filter(Boolean) : []

  return (
    <FeedShell>
      <SearchColumn
        initialQuery={q ?? ''}
        initialTypes={initialTypes}
        initialAuthor={author}
      />
    </FeedShell>
  )
}

export const Route = createFileRoute('/search')({
  component: SearchRoute,
  validateSearch: (search: Record<string, unknown>): SearchRouteSearch => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    type: typeof search.type === 'string' ? search.type : undefined,
    author: typeof search.author === 'string' ? search.author : undefined,
  }),
})
