import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FeedShell } from '@/components/feed/FeedShell'
import { FeedColumn } from '@/components/feed/FeedColumn'
import { DetailColumn } from '@/components/feed/detail/DetailColumn'
import type { FeedItem } from '@csf-live/shared'

function FeedIndex() {
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null)

  return (
    <FeedShell
      col3={
        selectedItem
          ? <DetailColumn item={selectedItem} onClose={() => setSelectedItem(null)} />
          : null
      }
    >
      <FeedColumn
        onSelectItem={setSelectedItem}
        selectedItemId={selectedItem?.id ?? null}
      />
    </FeedShell>
  )
}

export const Route = createFileRoute('/feed/')({
  component: FeedIndex,
})
