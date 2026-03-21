import {
  BaseBoxShapeUtil,
  HTMLContainer,
  T,
  type TLShape,
} from 'tldraw'
import { router } from '../../main'

// Register the custom shape with tldraw's type system so TLShape includes 'project-node'
declare module '@tldraw/tlschema' {
  interface TLGlobalShapePropsMap {
    'project-node': TLProjectNodeProps
  }
}

export type TLProjectNodeProps = {
  projectId: string
  title: string
  slug: string
  status: string
  unreadCount: number
  w: number
  h: number
}

export type TLProjectNodeShape = TLShape<'project-node'>

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  paused: '#f59e0b',
  archived: '#6b7280',
  completed: '#3b82f6',
}

function ProjectNodeComponent({ shape }: { shape: TLProjectNodeShape }) {
  const { title, slug, status, unreadCount, w, h } = shape.props
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.active

  return (
    <div
      style={{
        width: w,
        height: h,
        background: '#292524',
        border: '1.5px solid #44403c',
        borderRadius: 8,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        userSelect: 'none',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() =>
        router.navigate({ to: '/feed/$slug', params: { slug } })
      }
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#fafaf9',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </span>
      {unreadCount > 0 && (
        <span
          style={{
            background: '#ef4444',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 10,
            padding: '1px 6px',
            flexShrink: 0,
          }}
        >
          {unreadCount}
        </span>
      )}
    </div>
  )
}

export class ProjectNodeShapeUtil extends BaseBoxShapeUtil<TLProjectNodeShape> {
  static override type = 'project-node' as const
  static override props = {
    projectId: T.string,
    title: T.string,
    slug: T.string,
    status: T.string,
    unreadCount: T.number,
    w: T.nonZeroNumber,
    h: T.nonZeroNumber,
  }

  override getDefaultProps(): TLProjectNodeProps {
    return {
      projectId: '',
      title: 'Project',
      slug: '',
      status: 'active',
      unreadCount: 0,
      w: 180,
      h: 52,
    }
  }

  override component(shape: TLProjectNodeShape) {
    return (
      <HTMLContainer id={shape.id} style={{ pointerEvents: 'all' }}>
        <ProjectNodeComponent shape={shape} />
      </HTMLContainer>
    )
  }

  override indicator(shape: TLProjectNodeShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} />
  }
}
