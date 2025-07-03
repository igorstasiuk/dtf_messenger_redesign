import type { Message, MediaFile, Author } from './api'

// Message state management
export interface MessageState {
  messages: Message[]
  isLoading: boolean
  hasMoreMessages: boolean
  error: string | null
  lastFetch: number | null
  typingUsers: TypingUser[]
  scrollPosition: number
  unreadCount: number
}

// Message UI states
export interface MessageUIState {
  isInputFocused: boolean
  showEmojiPicker: boolean
  showMediaUpload: boolean
  isComposing: boolean
  draftText: string
  selectedMessages: Set<number>
  replyToMessage: Message | null
  editingMessage: Message | null
}

// Message composition
export interface MessageComposition {
  text: string
  mediaFiles: File[]
  uploadedMedia: MediaFile[]
  isUploading: boolean
  uploadProgress: Record<string, number> // filename -> progress
  replyTo: Message | null
  mentions: Author[]
  isDraft: boolean
}

// Message display options
export interface MessageDisplayOptions {
  showTimestamps: boolean
  showAvatars: boolean
  groupByAuthor: boolean
  showDeliveryStatus: boolean
  showReadReceipts: boolean
  messageSize: 'compact' | 'normal' | 'large'
  theme: 'light' | 'dark'
}

// Message list view model for efficient rendering
export interface MessageListItem {
  id: number
  text: string
  timestamp: number
  author: {
    id: number
    name: string
    avatar: string
  }
  media: {
    count: number
    types: string[]
    previews: string[]
  }
  isOwn: boolean
  isRead: boolean
  showAvatar: boolean
  showTimestamp: boolean
  groupedWithPrevious: boolean
  groupedWithNext: boolean
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
}

// Typing indicator
export interface TypingUser {
  id: number
  name: string
  avatar: string
  startedAt: number
}

// Message sending states
export interface MessageSendState {
  tempId: string
  status: 'composing' | 'uploading' | 'sending' | 'sent' | 'failed'
  progress?: number
  error?: string
  retryCount: number
}

// Message loading states
export interface MessageLoadState {
  direction: 'older' | 'newer' | 'around'
  isLoading: boolean
  hasMore: boolean
  error: string | null
}

// Message filtering and search
export interface MessageFilters {
  searchQuery: string
  mediaOnly: boolean
  authorId: number | null
  dateRange: {
    start: Date | null
    end: Date | null
  }
  messageTypes: ('text' | 'media' | 'system')[]
}

export interface MessageSearchResult {
  message: Message
  channelId: number
  channelName: string
  contextBefore: Message[]
  contextAfter: Message[]
  highlightIndices: [number, number][]
}

// Message actions for store
export type MessageAction = 
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: Partial<Message> & { id: number } }
  | { type: 'REMOVE_MESSAGE'; payload: number }
  | { type: 'PREPEND_MESSAGES'; payload: Message[] }
  | { type: 'APPEND_MESSAGES'; payload: Message[] }
  | { type: 'MARK_AS_READ'; payload: number[] }
  | { type: 'SET_TYPING'; payload: TypingUser[] }
  | { type: 'ADD_TYPING'; payload: TypingUser }
  | { type: 'REMOVE_TYPING'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SCROLL_POSITION'; payload: number }
  | { type: 'CLEAR_MESSAGES' }

// Message events for real-time updates
export interface MessageEvent {
  type: 'message_sent' | 'message_updated' | 'message_deleted' | 'message_read' | 'typing_start' | 'typing_stop'
  messageId?: number
  channelId: number
  userId: number
  data: any
  timestamp: number
}

// Message validation
export interface MessageValidation {
  isValid: boolean
  errors: {
    text?: string
    media?: string
    length?: string
  }
  warnings: {
    media?: string
    mentions?: string
  }
}

// Message formatting
export interface MessageFormat {
  type: 'plain' | 'markdown' | 'html'
  options: {
    allowLinks: boolean
    allowMentions: boolean
    allowEmoji: boolean
    maxLength: number
  }
}

// Lazy loading configuration
export interface MessagePagination {
  limit: number
  beforeTime?: number
  afterTime?: number
  hasMore: boolean
  isLoading: boolean
  loadDirection: 'up' | 'down' | 'both'
}

// Auto-scroll behavior
export interface AutoScrollConfig {
  enabled: boolean
  threshold: number // pixels from bottom
  behavior: 'smooth' | 'instant'
  maintainPosition: boolean
}
