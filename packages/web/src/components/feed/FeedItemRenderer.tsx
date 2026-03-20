import type { FeedItem } from '@csf-live/shared'
import { CURRENT_USER_ID } from '@csf-live/shared/constants'
import { MessageBubble } from './MessageBubble'
import { ContentCard } from './cards/ContentCard'

interface FeedItemRendererProps {
  item: FeedItem
}

export function FeedItemRenderer({ item }: FeedItemRendererProps) {
  if (item._sourceTable === 'message') {
    const isOwn = item.authorId === CURRENT_USER_ID
    return <MessageBubble message={item} isOwn={isOwn} />
  }
  return <ContentCard item={item} />
}
