// Base API response wrapper
export interface ApiResponse<T> {
  result: T;
  success: boolean;
  error?: string;
}

// Counter API
export interface MessagesCounter {
  counter: number;
}

// Channel types
export interface Channel {
  id: string;
  title: string;
  picture: string;
  lastMessage?: Message;
  unreadCount: number;
}

export interface ChannelsResponse {
  channels: Channel[];
}

export interface ChannelResponse {
  channel: Channel;
}

// Message types
export interface Message {
  id: string;
  text?: string;
  media?: MediaFile[];
  author: Author;
  dtCreated: number;
  sameAuthor?: boolean;
}

export interface MessagesResponse {
  messages: Message[];
}

// Author types
export interface Author {
  id: string;
  title: string;
  picture: string;
}

// Media types
export interface MediaFile {
  type: "image" | "video" | "gif" | "document";
  data: MediaData;
}

export interface MediaData {
  uuid: string;
  type?: string;
  width?: number;
  height?: number;
  size?: number;
  name?: string;
}

// Request types
export interface SendMessageRequest {
  channelId: string;
  text: string;
  ts: string;
  idTmp: string;
  media?: string; // JSON stringified MediaFile[]
}

// API client interface
export interface DTFApiClient {
  getAccessToken(): Promise<string>;
  getMessagesCounter(): Promise<MessagesCounter>;
  getChannels(): Promise<Channel[]>;
  getChannel(channelId: string): Promise<Channel>;
  getMessages(channelId: string, beforeTime?: number): Promise<Message[]>;
  sendMessage(
    channelId: string,
    text: string,
    media?: MediaFile[]
  ): Promise<void>;
  uploadMedia(file: File): Promise<MediaFile>;
}
