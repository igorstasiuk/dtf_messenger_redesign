import { ref, computed, watch, nextTick } from "vue";
import { useMessagesStore } from "@/stores/messages";
import { useChannelsStore } from "@/stores/channels";

/**
 * Messages composable with lazy loading and optimistic updates
 */
export function useMessages(channelId?: number) {
  const messagesStore = useMessagesStore();
  const channelsStore = useChannelsStore();

  // Local state
  const currentChannelId = ref<number | null>(channelId || null);
  const isIntersecting = ref(false);
  const hasInitialized = ref(false);

  // Computed
  const messages = computed(() => messagesStore.sortedMessages);
  const isLoading = computed(() => messagesStore.isLoading);
  const hasMoreMessages = computed(() => messagesStore.hasMoreMessages);
  const error = computed(() => messagesStore.error);
  const draftText = computed(() => messagesStore.draftText);
  const isUploading = computed(() => messagesStore.isUploading);
  const typingUsers = computed(() => messagesStore.typingUsers);

  // Actions
  function setChannelId(newChannelId: number | null) {
    if (currentChannelId.value !== newChannelId) {
      currentChannelId.value = newChannelId;
      if (newChannelId) {
        loadMessages(newChannelId);
      } else {
        messagesStore.clearMessages();
      }
    }
  }

  async function loadMessages(channelId: number, beforeTime?: number) {
    if (!channelId) return false;

    try {
      const success = await messagesStore.fetchMessages(channelId, beforeTime);
      
      if (success && !beforeTime) {
        // Mark channel as active and read
        channelsStore.setActiveChannel(channelId);
        await markAsRead();
      }
      
      return success;
    } catch (error) {
      console.error('DTF Messenger: Error loading messages:', error);
      return false;
    }
  }

  async function loadMoreMessages() {
    if (!currentChannelId.value || !hasMoreMessages.value || isLoading.value) {
      return false;
    }

    const oldestMessage = messagesStore.oldestMessage;
    if (!oldestMessage) return false;

    return loadMessages(currentChannelId.value, oldestMessage.dtCreated);
  }

  async function sendMessage(text: string, files: File[] = []) {
    if (!currentChannelId.value || (!text.trim() && files.length === 0)) {
      return null;
    }

    try {
      const message = await messagesStore.sendMessage({
        channelId: currentChannelId.value,
        text,
        media: files
      });
      
      if (message) {
        // Scroll to bottom after sending
        await nextTick();
        scrollToBottom();
        
        // Update channel last activity
        if (channelsStore.activeChannel) {
          channelsStore.updateChannel(currentChannelId.value, {
            lastMessage: message
          });
        }
      }
      
      return message;
    } catch (error) {
      console.error('DTF Messenger: Error sending message:', error);
      return null;
    }
  }

  async function markAsRead() {
    if (!currentChannelId.value) return;

    try {
      await messagesStore.markChannelAsRead(currentChannelId.value);
    } catch (error) {
      console.error('DTF Messenger: Error marking messages as read:', error);
    }
  }

  function setDraftText(text: string) {
    messagesStore.setDraftText(text);
  }

  function clearDraft() {
    messagesStore.clearDraft();
  }

  function clearError() {
    messagesStore.setError(null);
  }

  // Typing indicators
  function addTypingUser(user: any) {
    messagesStore.addTypingUser(user);
  }

  function removeTypingUser(userId: number) {
    messagesStore.removeTypingUser(userId);
  }

  // Scroll management
  function setScrollPosition(position: number) {
    messagesStore.setScrollPosition(position);
  }

  function scrollToBottom() {
    setScrollPosition(0)
  }

  function shouldAutoScroll(): boolean {
    // Auto-scroll if user is near the bottom (within 100px)
    return messagesStore.scrollPosition <= 100
  }

  // Intersection Observer for lazy loading
  function setupIntersectionObserver(element: HTMLElement) {
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isIntersecting.value = entry.isIntersecting;
        
        // Load more messages when scrolling to top
        if (entry.isIntersecting && hasMoreMessages.value && !isLoading.value) {
          loadMoreMessages();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observer.observe(element);
    
    return () => observer.disconnect();
  }

  // Auto-mark as read when channel becomes active
  watch(
    () => channelsStore.activeChannelId,
    (newChannelId) => {
      if (newChannelId && newChannelId === currentChannelId.value) {
        markAsRead();
      }
    }
  );

  // Auto-scroll to bottom for new messages (if user is at bottom)
  watch(
    () => messages.value.length,
    async (newLength, oldLength) => {
      if (newLength > oldLength && shouldAutoScroll()) {
        await nextTick();
        scrollToBottom();
      }
    }
  );

  // Initialize messages when channelId changes
  watch(
    () => currentChannelId.value,
    (newChannelId) => {
      if (newChannelId && !hasInitialized.value) {
        loadMessages(newChannelId);
        hasInitialized.value = true;
      }
    },
    { immediate: true }
  );

  // Utility functions
  function getMessageById(messageId: number) {
    return messages.value.find(m => m.id === messageId) || null
  }

  function getMessagesByAuthor(authorId: number) {
    return messages.value.filter(m => m.author.id === authorId)
  }

  function getLatestMessages(count = 10) {
    return messages.value.slice(-count)
  }

  // Refresh messages
  async function refresh() {
    if (!currentChannelId.value) return false;

    messagesStore.clearMessages();
    return loadMessages(currentChannelId.value);
  }

  // Initialize if channelId is provided
  if (channelId) {
    setChannelId(channelId);
  }

  return {
    // State
    messages,
    isLoading,
    hasMoreMessages,
    error,
    draftText,
    isUploading,
    typingUsers,
    currentChannelId: computed(() => currentChannelId.value),
    isIntersecting: computed(() => isIntersecting.value),

    // Actions
    setChannelId,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    markAsRead,
    refresh,

    // Draft management
    setDraftText,
    clearDraft,

    // Error handling
    clearError,

    // Typing indicators
    addTypingUser,
    removeTypingUser,

    // Scroll management
    setScrollPosition,
    scrollToBottom,
    shouldAutoScroll,
    setupIntersectionObserver,

    // Utilities
    getMessageById,
    getMessagesByAuthor,
    getLatestMessages
  };
}
