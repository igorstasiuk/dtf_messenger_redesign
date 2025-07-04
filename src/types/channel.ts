import type { Channel } from "./api";
import type { Author } from "./api";

// Channel state management
export interface ChannelState {
  channels: Channel[];
  activeChannelId: number | null;
  activeChannel: Channel | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  unreadTotal: number;
}

// Channel UI states
export interface ChannelUIState {
  isChannelsListOpen: boolean;
  isChatSidebarOpen: boolean;
  selectedChannelId: number | null;
  searchQuery: string;
  filteredChannels: Channel[];
  sortBy: "lastMessage" | "name" | "unreadCount";
  sortOrder: "asc" | "desc";
}

// Channel list item view model
export interface ChannelListItem {
  id: number;
  title: string;
  picture: string;
  lastMessage?: {
    text: string;
    author: string;
    timestamp: number;
    hasMedia: boolean;
  };
  unreadCount: number;
  isOnline?: boolean;
  isTyping?: boolean;
  lastActivity: number;
}

// Channel creation flow
export interface CreateChannelFlow {
  step: "search_user" | "confirm" | "creating" | "completed" | "error";
  searchQuery: string;
  selectedUser: Author | null;
  searchResults: Author[];
  isSearching: boolean;
  error: string | null;
}

// Channel filtering and sorting
export interface ChannelFilters {
  showUnreadOnly: boolean;
  showOnlineOnly: boolean;
  hideEmptyChannels: boolean;
  searchQuery: string;
}

export interface ChannelSortOptions {
  field: "name" | "lastActivity" | "unreadCount" | "created";
  direction: "asc" | "desc";
}

// Channel permissions (for future group chat support)
export interface ChannelPermissions {
  canSendMessages: boolean;
  canSendMedia: boolean;
  canAddMembers: boolean;
  canRemoveMembers: boolean;
  canEditChannel: boolean;
  canDeleteChannel: boolean;
}

// Channel member management
export interface ChannelMember extends Author {
  joinedAt: number;
  role: "owner" | "admin" | "member";
  permissions: ChannelPermissions;
  isOnline: boolean;
  lastSeen?: number;
}

// Channel settings
export interface ChannelSettings {
  notifications: boolean;
  sound: boolean;
  vibration: boolean;
  muteUntil?: number;
  customNotificationSound?: string;
  showPreviews: boolean;
}

// Channel actions for store
export type ChannelAction =
  | { type: "SET_CHANNELS"; payload: Channel[] }
  | { type: "ADD_CHANNEL"; payload: Channel }
  | { type: "UPDATE_CHANNEL"; payload: Partial<Channel> & { id: number } }
  | { type: "REMOVE_CHANNEL"; payload: number }
  | { type: "SET_ACTIVE_CHANNEL"; payload: number | null }
  | {
      type: "UPDATE_UNREAD_COUNT";
      payload: { channelId: number; count: number };
    }
  | { type: "MARK_AS_READ"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_LAST_FETCH"; payload: number };

// Channel events for real-time updates
export type ChannelEvent =
  | {
      type: "channel_created";
      channelId: number;
      data: Channel;
      timestamp: number;
      userId?: number;
    }
  | {
      type: "channel_updated";
      channelId: number;
      data: Partial<Channel>;
      timestamp: number;
      userId?: number;
    }
  | {
      type: "channel_deleted";
      channelId: number;
      data: { reason?: string };
      timestamp: number;
      userId?: number;
    }
  | {
      type: "member_joined";
      channelId: number;
      data: Author;
      timestamp: number;
      userId?: number;
    }
  | {
      type: "member_left";
      channelId: number;
      data: Author;
      timestamp: number;
      userId?: number;
    };
