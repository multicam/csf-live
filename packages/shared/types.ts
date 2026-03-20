export type UserRole = 'owner' | 'collaborator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = 'active' | 'paused' | 'archived' | 'completed';

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  order: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  role: UserRole;
  invitedBy: string;
  joinedAt: Date;
}

export type ContentType = 'idea' | 'drawing' | 'sketch' | 'document' | 'link' | 'voice' | 'photo' | 'research' | 'file';
export type DocumentType = 'note' | 'prd' | 'blueprint' | 'work-orders' | 'research-summary' | 'meeting-notes' | 'freeform';
export type ContentSource = 'human' | 'claude' | 'agent' | 'import';
export type ContentStatus = 'active' | 'archived' | 'merged';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string | null;
  body: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  metadata: Record<string, unknown>;
  source: ContentSource;
  sourceDetail: string | null;
  projectId: string | null;
  sectionId: string | null;
  parentId: string | null;
  authorId: string;
  status: ContentStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ContentVersion {
  id: string;
  contentItemId: string;
  versionNumber: number;
  body: string | null;
  mediaData: unknown;
  authorId: string;
  changeSummary: string | null;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
}

export type DiscussionContextType = 'feed' | 'project' | 'section';

export interface Discussion {
  id: string;
  contextType: DiscussionContextType;
  contextId: string | null;
  createdAt: Date;
}

export type MessageContentType = 'text' | 'voice' | 'image' | 'file' | 'claude-response';
export type MessageSource = 'web' | 'mobile' | 'claude-code' | 'agent';

export interface Message {
  id: string;
  discussionId: string;
  authorId: string;
  content: string;
  contentType: MessageContentType;
  mediaUrl: string | null;
  metadata: Record<string, unknown>;
  source: MessageSource;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  referenceType: string;
  referenceId: string;
  read: boolean;
  createdAt: Date;
}

export type PresenceStatus = 'online' | 'offline';

export interface Presence {
  userId: string;
  status: PresenceStatus;
  currentLocation: string;
  lastHeartbeat: Date;
}

export type FeedItem =
  | (Message & { _sourceTable: 'message' })
  | (ContentItem & { _sourceTable: 'content_item' });
