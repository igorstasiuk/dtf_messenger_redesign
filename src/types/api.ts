// DTF.ru API Types for Messenger Extension

// Base API Response
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

// Authentication Types
export interface AuthUser {
  id: string;
  name: string;
  avatar_url: string;
  email?: string;
  is_verified?: boolean;
  created_at: string;
  last_seen?: string;
  settings?: UserSettings;
}

export interface UserSettings {
  theme: "light" | "dark" | "auto";
  language: string;
  notifications_enabled: boolean;
  sound_enabled: boolean;
}

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  expires_at: string;
  token_type: "Bearer";
}

// Channel Types
export interface Channel {
  id: string;
  title: string;
  type: "direct" | "group";
  participants: AuthUser[];
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count: number;
  is_muted?: boolean;
  settings?: ChannelSettings;
}

export interface ChannelSettings {
  notifications_enabled: boolean;
  sound_enabled: boolean;
}

export interface CreateChannelRequest {
  user_id?: string;
  user_ids?: string[];
  title?: string;
  type: "direct" | "group";
}

// Message Types
export interface Message {
  id: string;
  content: string;
  type: "text" | "media" | "system";
  author: MessageAuthor;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  media_files: MediaFile[];
  reply_to?: Message;
  reactions?: MessageReaction[];
}

export interface MessageAuthor {
  id: string;
  name: string;
  avatar_url: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // User IDs
}

export interface SendMessageRequest {
  content: string;
  type: "text" | "media";
  media_files?: MediaFile[];
  reply_to_id?: string;
}

export interface GetMessagesParams {
  limit?: number;
  before?: string; // Message ID
  after?: string; // Message ID
  since?: string; // ISO timestamp
}

// Media Types
export interface MediaFile {
  id: string;
  url: string;
  thumbnail_url?: string;
  filename: string;
  size: number;
  mime_type: string;
  width?: number;
  height?: number;
  duration?: number; // For videos
}

// API Response Types
export interface ChannelResponse {
  data: Channel[];
  has_more: boolean;
  total_count: number;
}

export interface MessagesResponse {
  data: Message[];
  has_more: boolean;
  total_count: number;
}

export interface MessagesCounter {
  counter: number;
  last_updated: string;
}

// Search Types
export interface SearchUsersResponse {
  data: AuthUser[];
  has_more: boolean;
  total_count: number;
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

// DTF.ru Specific Types (from Tampermonkey script)
export interface DTFProfile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  profile_url: string;
}

export interface DTFSiteSettings {
  theme: "light" | "dark";
  language: string;
  user_id?: string;
  is_authenticated: boolean;
}

// WebSocket Event Types (for future real-time support)
export interface WebSocketEvent {
  type:
    | "message"
    | "channel_update"
    | "user_typing"
    | "user_online"
    | "user_offline";
  data: any;
  timestamp: string;
}

export interface TypingEvent {
  channel_id: string;
  user_id: string;
  is_typing: boolean;
}

export interface UserPresenceEvent {
  user_id: string;
  status: "online" | "offline" | "away";
  last_seen?: string;
}

// Notification Types
export interface NotificationData {
  id: string;
  type: "new_message" | "mention" | "channel_invite";
  title: string;
  message: string;
  channel_id?: string;
  user_id?: string;
  timestamp: string;
  is_read: boolean;
}

// Health Check Types
export interface HealthCheckResponse {
  status: "ok" | "error";
  timestamp: number;
  responseTime?: number;
  version?: string;
  uptime?: number;
}

// Export types for external use
export type {
  // Re-export commonly used types
  Channel as DTFChannel,
  Message as DTFMessage,
  AuthUser as DTFUser,
  MediaFile as DTFMediaFile,
};
