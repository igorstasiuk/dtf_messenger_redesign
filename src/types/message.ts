import type { Message } from "./api";

// Message state management
export interface MessageState {
  messages: Message[];
  isLoading: boolean;
  hasMoreMessages: boolean;
  error: string | null;
  lastFetch: number | null;
  typingUsers: { id: number; name: string }[];
  scrollPosition: number;
  unreadCount: number;
}

export type TypingUser = {
  id: number;
  name: string;
  avatar?: string;
  startedAt?: number;
};
