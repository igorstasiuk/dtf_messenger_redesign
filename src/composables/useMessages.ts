import { ref, computed, watch, nextTick } from "vue";
import { useMessagesStore } from "@/stores/messages";
import { useChannelsStore } from "@/stores/channels";
import { useAPI } from "./useAPI";
import { useDebounce, useIntersectionObserver } from "@vueuse/core";
import type { Message, SendMessageRequest } from "@/types/api";

/**
 * Messages composable for DTF Messenger
 * Handles message loading, sending, and UI interactions
 */
export function useMessages(channelId?: string) {
  const messagesStore = useMessagesStore();
  const channelsStore = useChannelsStore();
  const { useMessages: useMessagesAPI } = useAPI();
  const messagesAPI = useMessagesAPI();

  // Local state
  const messageInput = ref("");
  const isTyping = ref(false);
  const typingUsers = ref<Set<string>>(new Set());
  const loadMoreTrigger = ref<HTMLElement>();
  const messageListContainer = ref<HTMLElement>();

  // Debounced typing indicator
  const debouncedTyping = useDebounce(isTyping, 1000);

  // Computed properties
  const currentChannelId = computed(
    () => channelId || channelsStore.activeChannelId
  );
  const messages = computed(() => {
    if (!currentChannelId.value) return [];
    return messagesStore.getMessages(currentChannelId.value);
  });
  const hasMoreMessages = computed(() => {
    if (!currentChannelId.value) return false;
    return messagesStore.hasMore(currentChannelId.value);
  });
  const isLoadingMessages = computed(() => messagesStore.loading);
  const isSendingMessage = computed(() => messagesAPI.messagesLoading.value);

  // Intersection observer for lazy loading
  useIntersectionObserver(
    loadMoreTrigger,
    ([{ isIntersecting }]) => {
      if (isIntersecting && hasMoreMessages.value && !isLoadingMessages.value) {
        loadMoreMessages();
      }
    },
    {
      threshold: 0.1,
    }
  );

  // Load initial messages when channel changes
  watch(
    currentChannelId,
    async (newChannelId) => {
      if (newChannelId) {
        await loadMessages(newChannelId, true);
        await nextTick();
        scrollToBottom();
      }
    },
    { immediate: true }
  );

  // Watch typing state
  watch(debouncedTyping, (typing) => {
    if (!typing) {
      isTyping.value = false;
    }
  });

  // Load messages for a channel
  async function loadMessages(channelId: string, reset: boolean = false) {
    if (reset) {
      messagesStore.clearMessages(channelId);
    }

    const messages = await messagesAPI.getMessages(channelId, {
      limit: 50,
      before: reset ? undefined : messagesStore.getOldestMessageId(channelId),
    });

    if (messages?.data) {
      messagesStore.addMessages(channelId, messages.data, !reset);

      // Update channel last read
      if (messages.data.length > 0) {
        const latestMessage = messages.data[messages.data.length - 1];
        channelsStore.updateLastRead(channelId, latestMessage.id);
      }
    }
  }

  // Load more messages (for pagination)
  async function loadMoreMessages() {
    if (
      !currentChannelId.value ||
      !hasMoreMessages.value ||
      isLoadingMessages.value
    ) {
      return;
    }

    await loadMessages(currentChannelId.value, false);
  }

  // Send a message
  async function sendMessage(content?: string) {
    const channelId = currentChannelId.value;
    const messageText = content || messageInput.value.trim();

    if (!channelId || !messageText) return;

    const messageData: SendMessageRequest = {
      content: messageText,
      type: "text",
    };

    // Optimistically add message to store
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageText,
      type: "text",
      author: {
        id: "current-user", // Will be replaced with actual user data
        name: "You",
        avatar_url: "",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_read: true,
      media_files: [],
    };

    messagesStore.addMessage(channelId, optimisticMessage);
    messageInput.value = "";

    // Scroll to bottom
    await nextTick();
    scrollToBottom();

    try {
      const result = await messagesAPI.sendMessage(channelId, messageData);

      if (result) {
        // Replace optimistic message with real one
        messagesStore.replaceMessage(channelId, optimisticMessage.id, result);

        // Update channel last message
        channelsStore.updateLastMessage(channelId, result);
      } else {
        // Remove optimistic message on failure
        messagesStore.removeMessage(channelId, optimisticMessage.id);
      }
    } catch (error) {
      // Remove optimistic message on error
      messagesStore.removeMessage(channelId, optimisticMessage.id);
      console.error("Failed to send message:", error);
    }
  }

  // Send media message
  async function sendMediaMessage(file: File) {
    const channelId = currentChannelId.value;
    if (!channelId) return;

    // Upload media first
    const { uploadMedia } = useAPI().useMedia();
    const mediaResult = await uploadMedia(file);

    if (!mediaResult) {
      throw new Error("Failed to upload media");
    }

    const messageData: SendMessageRequest = {
      content: "",
      type: "media",
      media_files: [mediaResult],
    };

    await messagesAPI.sendMessage(channelId, messageData);
    await loadMessages(channelId, true);
  }

  // Mark messages as read
  async function markAsRead(messageId?: string) {
    const channelId = currentChannelId.value;
    if (!channelId) return;

    const targetMessageId =
      messageId || messagesStore.getLatestMessageId(channelId);
    if (!targetMessageId) return;

    await messagesAPI.markAsRead(channelId, targetMessageId);
    messagesStore.markAsRead(channelId, targetMessageId);
    channelsStore.updateLastRead(channelId, targetMessageId);
  }

  // Scroll to bottom of message list
  function scrollToBottom(smooth: boolean = true) {
    if (messageListContainer.value) {
      messageListContainer.value.scrollTo({
        top: messageListContainer.value.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }

  // Handle typing indicator
  function handleTyping() {
    isTyping.value = true;
    // TODO: Send typing event to other users via WebSocket or polling
  }

  // Get unread count for channel
  function getUnreadCount(channelId: string): number {
    return messagesStore.getUnreadCount(channelId);
  }

  // Search messages in current channel
  function searchMessages(query: string): Message[] {
    if (!currentChannelId.value) return [];
    return messagesStore.searchMessages(currentChannelId.value, query);
  }

  // Get message by ID
  function getMessageById(messageId: string): Message | undefined {
    if (!currentChannelId.value) return undefined;
    return messagesStore.getMessage(currentChannelId.value, messageId);
  }

  // Retry failed message
  async function retryMessage(messageId: string) {
    if (!currentChannelId.value) return;

    const message = getMessageById(messageId);
    if (!message) return;

    // Remove failed message and resend
    messagesStore.removeMessage(currentChannelId.value, messageId);
    await sendMessage(message.content);
  }

  // Clear all messages for current channel
  function clearMessages() {
    if (currentChannelId.value) {
      messagesStore.clearMessages(currentChannelId.value);
    }
  }

  return {
    // State
    messageInput,
    isTyping,
    typingUsers,
    messages,
    hasMoreMessages,
    isLoadingMessages,
    isSendingMessage,
    currentChannelId,

    // Refs for templates
    loadMoreTrigger,
    messageListContainer,

    // Actions
    loadMessages,
    loadMoreMessages,
    sendMessage,
    sendMediaMessage,
    markAsRead,
    scrollToBottom,
    handleTyping,
    retryMessage,
    clearMessages,

    // Getters
    getUnreadCount,
    searchMessages,
    getMessageById,

    // Store access
    messagesStore,
  };
}
