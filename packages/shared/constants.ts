export const FEED_DISCUSSION_ID = 'disc-feed-00000000-0000-0000-0000-000000000001';
export const CURRENT_USER_ID = 'user-jm';

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  idea: 'Idea',
  drawing: 'Drawing',
  sketch: 'Sketch',
  document: 'Document',
  link: 'Link',
  voice: 'Voice',
  photo: 'Photo',
  research: 'Research',
  file: 'File',
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  note: 'Note',
  prd: 'PRD',
  blueprint: 'Blueprint',
  'work-orders': 'Work Orders',
  'research-summary': 'Research Summary',
  'meeting-notes': 'Meeting Notes',
  freeform: 'Freeform',
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  archived: 'Archived',
  completed: 'Completed',
};

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  active: 'green',
  paused: 'yellow',
  archived: 'gray',
  completed: 'blue',
};

export const ROUTES = {
  HOME: '/',
  FEED: '/feed',
  PROJECT_FEED: (slug: string) => `/feed/${slug}`,
  PROJECT_DOC: (slug: string, id: string) => `/feed/${slug}/doc/${id}`,
  PROJECT_ITEM: (slug: string, id: string) => `/feed/${slug}/item/${id}`,
  SEARCH: '/search',
} as const;
