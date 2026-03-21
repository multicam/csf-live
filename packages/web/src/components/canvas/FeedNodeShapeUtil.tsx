import {
  BaseBoxShapeUtil,
  HTMLContainer,
  T,
  type TLShape,
} from 'tldraw'
import { router } from '../../main'

// Register the custom shape with tldraw's type system so TLShape includes 'feed-node'
declare module '@tldraw/tlschema' {
  interface TLGlobalShapePropsMap {
    'feed-node': TLFeedNodeProps
  }
}

export type TLFeedNodeProps = {
  w: number
  h: number
}

export type TLFeedNodeShape = TLShape<'feed-node'>

export class FeedNodeShapeUtil extends BaseBoxShapeUtil<TLFeedNodeShape> {
  static override type = 'feed-node' as const
  static override props = {
    w: T.nonZeroNumber,
    h: T.nonZeroNumber,
  }

  override getDefaultProps(): TLFeedNodeProps {
    return { w: 140, h: 48 }
  }

  override component(shape: TLFeedNodeShape) {
    const { w, h } = shape.props
    return (
      <HTMLContainer id={shape.id} style={{ pointerEvents: 'all' }}>
        <div
          style={{
            width: w,
            height: h,
            background: '#1c1917',
            border: '2px solid #78716c',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            userSelect: 'none',
            boxSizing: 'border-box',
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => router.navigate({ to: '/feed' })}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: '#d6d3d1', letterSpacing: 0.3 }}>
            General Feed
          </span>
        </div>
      </HTMLContainer>
    )
  }

  override indicator(shape: TLFeedNodeShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} />
  }
}
