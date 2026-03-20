import type { FeedItem } from '@csf-live/shared'
import { CURRENT_USER_ID } from '@csf-live/shared/constants'
import { MessageBubble } from './MessageBubble'
import { ContentCard } from './cards/ContentCard'

interface FeedItemRendererProps {
  item: FeedItem
  onSelect?: (item: FeedItem) => void
  isSelected?: boolean
}

export function FeedItemRenderer({ item, onSelect, isSelected }: FeedItemRendererProps) {
  if (item._sourceTable === 'message') {
    const isOwn = item.authorId === CURRENT_USER_ID
    return (
      <MessageBubble
        message={item}
        isOwn={isOwn}
        onClick={onSelect ? () => onSelect(item) : undefined}
        isSelected={isSelected}
      />
    )
  }
  return (
    <ContentCard
      item={item}
      onClick={onSelect ? () => onSelect(item) : undefined}
      isSelected={isSelected}
    />
  )
}
