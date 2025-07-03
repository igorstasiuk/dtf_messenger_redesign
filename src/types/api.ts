// DTF.ru API Types for Messenger Extension

// Base API Response
export interface APIResponse<T = any> {
  result?: T
  error?: {
    code: number
    message: string
  }
  success: boolean
}

// User/Author types
export interface Author {
  id: number
  title: string
  picture: string
  avatar_url?: string
  name?: string
  url?: string
}

export interface AuthUser extends Author {
  email?: string
  settings?: UserSettings
  permissions?: string[]
  created_at?: string
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  notifications: boolean
  sound: boolean
  language: string
}

// Media types
export interface MediaFile {
  uuid: string
  type: 'image' | 'video' | 'document' | 'audio'
  data: {
    uuid: string
    type: string
    size?: number
    width?: number
    height?: number
    duration?: number
    name?: string
    url?: string
  }
  preview_url?: string
}

// Message types
export interface Message {
  id: number
  text: string
  dtCreated: number // Unix timestamp
  author: Author
  media?: MediaFile[]
  channelId: number
  sameAuthor?: boolean // For UI grouping
  isRead?: boolean
  isOwn?: boolean
  type?: 'text' | 'media' | 'system'
}

export interface MessageReaction {
  id: number
  messageId: number
  userId: number
  emoji: string
  created_at: string
}

// Channel types
export interface Channel {
  id: number
  title: string
  picture: string
  lastMessage?: Message
  unreadCount: number
  dtCreated?: number
  dtUpdated?: number
  type?: 'private' | 'group'
  members?: Author[]
  isActive?: boolean
}

// API Request/Response types
export interface GetChannelsResponse {
  channels: Channel[]
}

export interface GetMessagesResponse {
  messages: Message[]
  hasMore?: boolean
  nextCursor?: string
}

export interface GetMessagesParams {
  channelId: number
  beforeTime?: number
  limit?: number
  offset?: number
}

export interface SendMessageRequest {
  channelId: number
  text: string
  media?: MediaFile[]
  ts?: number
  idTmp?: string
}

export interface SendMessageResponse {
  message: Message
}

export interface CreateChannelRequest {
  userId: number
  title?: string
  type?: 'private' | 'group'
}

export interface CreateChannelResponse {
  channel: Channel
}

export interface UploadFileResponse {
  file: MediaFile
}

export interface MessagesCounterResponse {
  counter: number
}

// Auth types
export interface AuthToken {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  tokenType: 'Bearer'
}

export interface AuthSession {
  user: AuthUser
  token: AuthToken
  isAuthenticated: boolean
}

// Notification types
export interface NotificationData {
  title: string
  body: string
  icon?: string
  tag?: string
  channelId?: number
  messageId?: number
  timestamp: number
}

// DTF.ru specific types
export interface DTFProfile {
  id: number
  name: string
  avatar: string
  url: string
  isVerified?: boolean
}

export interface DTFSiteSettings {
  theme: 'light' | 'dark'
  language: string
  userId?: number
}

// Health check
export interface HealthCheckResponse {
  status: 'ok' | 'error'
  timestamp: number
  version?: string
}

// WebSocket event types (for future real-time support)
export interface WebSocketEvent {
  type: 'message' | 'channel_update' | 'user_status' | 'typing'
  data: any
  timestamp: number
  channelId?: number
}

// Error types
export interface APIError {
  code: number
  message: string
  details?: any
  timestamp: number
}

// Export types for external use
export type {
  // Re-export commonly used types
  Channel as DTFChannel,
  Message as DTFMessage,
  AuthUser as DTFUser,
  MediaFile as DTFMediaFile,
};
