import type { Channel, Message } from "./api";

// Channel state
export interface ChannelState {
  id: string;
  channel: Channel | null;
  messages: Message[];
  isLoading: boolean;
  hasMoreMessages: boolean;
  lastMessageTime?: number;
}

// Channels list state
export interface ChannelsListState {
  channels: Channel[];
  isLoading: boolean;
  isVisible: boolean;
  searchQuery: string;
  filteredChannels: Channel[];
}

// Channel actions
export interface ChannelActions {
  loadChannel: (channelId: string) => Promise<void>;
  loadMessages: (channelId: string, beforeTime?: number) => Promise<void>;
  sendMessage: (text: string, media?: File[]) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
}

// Channels list actions
export interface ChannelsListActions {
  loadChannels: () => Promise<void>;
  toggleVisibility: () => void;
  searchChannels: (query: string) => void;
  selectChannel: (channelId: string) => Promise<void>;
}
