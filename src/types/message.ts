import type { Message } from "./api";

// Message state management
export interface MessageState {
  messages: Message[];
  isLoading: boolean;
  hasMoreMessages: boolean;
  error: string | null;
  lastFetch: number | null;
  typingUsers: any[];
  scrollPosition: number;
  unreadCount: number;
}
