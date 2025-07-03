import type { Message, MediaFile } from "./api";

// Message display state
export interface MessageDisplayState {
  message: Message;
  isMediaLoaded: boolean;
  isExpanded: boolean;
  formattedTime: string;
  showAvatar: boolean;
}

// Message input state
export interface MessageInputState {
  text: string;
  attachedFiles: File[];
  isUploading: boolean;
  uploadProgress: number;
  maxLength: number;
  placeholder: string;
}

// Message input actions
export interface MessageInputActions {
  updateText: (text: string) => void;
  attachFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  sendMessage: () => Promise<void>;
  clearInput: () => void;
}

// Message list state
export interface MessageListState {
  messages: MessageDisplayState[];
  isLoading: boolean;
  isAtBottom: boolean;
  showScrollToBottom: boolean;
  virtualization: {
    startIndex: number;
    endIndex: number;
    itemHeight: number;
  };
}

// Message list actions
export interface MessageListActions {
  scrollToBottom: () => void;
  loadMoreMessages: () => Promise<void>;
  handleScroll: (event: Event) => void;
  toggleMessageExpansion: (messageId: string) => void;
}

// Media preview types
export interface MediaPreview {
  type: "image" | "video" | "gif" | "document";
  url: string;
  thumbnail?: string;
  alt?: string;
  size?: number;
  name?: string;
}
