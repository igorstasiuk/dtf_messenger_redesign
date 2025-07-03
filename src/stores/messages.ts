import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { dtfApi } from "@/utils/api";
import { useChannelsStore } from "./channels";
import type { Message, Channel } from "@/types/api";

export const useMessagesStore = defineStore("messages", () => {
  // State
  const currentChannelId = ref<string | null>(null);
  const currentChannel = ref<Channel | null>(null);
  const messages = ref<Message[]>([]);
  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const hasMoreMessages = ref(true);
  const lastMessageTime = ref<number>(0);

  // Message input state
  const messageText = ref("");
  const attachedFiles = ref<File[]>([]);
  const isUploading = ref(false);
  const uploadProgress = ref(0);

  // Getters
  const sortedMessages = computed(() => {
    return [...messages.value].sort((a, b) => a.dtCreated - b.dtCreated);
  });

  const hasMessages = computed(() => messages.value.length > 0);

  const canSendMessage = computed(() => {
    return (
      (messageText.value.trim().length > 0 || attachedFiles.value.length > 0) &&
      !isUploading.value &&
      currentChannelId.value !== null
    );
  });

  // Actions
  const setCurrentChannel = async (channelId: string): Promise<void> => {
    if (currentChannelId.value === channelId) {
      return;
    }

    try {
      isLoading.value = true;
      currentChannelId.value = channelId;

      // Load channel info
      currentChannel.value = await dtfApi.getChannel(channelId);

      // Load messages
      await loadMessages(channelId);

      // Mark channel as read
      const channelsStore = useChannelsStore();
      channelsStore.markChannelAsRead(channelId);
    } catch (error) {
      console.error("Failed to set current channel:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const loadMessages = async (
    channelId: string,
    beforeTime?: number
  ): Promise<void> => {
    try {
      const fetchedMessages = await dtfApi.getMessages(channelId, beforeTime);

      if (beforeTime) {
        // Loading older messages (pagination)
        messages.value = [...fetchedMessages, ...messages.value];
      } else {
        // Loading latest messages
        messages.value = fetchedMessages;
        if (fetchedMessages.length > 0) {
          lastMessageTime.value = Math.max(
            ...fetchedMessages.map((m) => m.dtCreated)
          );
        }
      }

      // Check if there are more messages to load
      hasMoreMessages.value = fetchedMessages.length >= 20; // Assuming 20 is the page size

      console.log(
        `Loaded ${fetchedMessages.length} messages for channel ${channelId}`
      );
    } catch (error) {
      console.error("Failed to load messages:", error);
      throw error;
    }
  };

  const loadMoreMessages = async (): Promise<void> => {
    if (
      !currentChannelId.value ||
      isLoadingMore.value ||
      !hasMoreMessages.value
    ) {
      return;
    }

    try {
      isLoadingMore.value = true;
      const oldestMessage = messages.value[0];
      const beforeTime = oldestMessage ? oldestMessage.dtCreated : undefined;

      await loadMessages(currentChannelId.value, beforeTime);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      isLoadingMore.value = false;
    }
  };

  const sendMessage = async (): Promise<void> => {
    if (!canSendMessage.value || !currentChannelId.value) {
      return;
    }

    try {
      isUploading.value = true;
      uploadProgress.value = 0;

      let mediaFiles = [];

      // Upload attached files
      if (attachedFiles.value.length > 0) {
        uploadProgress.value = 20;

        for (const file of attachedFiles.value) {
          const mediaFile = await dtfApi.uploadMedia(file);
          mediaFiles.push(mediaFile);
          uploadProgress.value += 60 / attachedFiles.value.length;
        }
      }

      uploadProgress.value = 90;

      // Send message
      await dtfApi.sendMessage(
        currentChannelId.value,
        messageText.value,
        mediaFiles
      );

      uploadProgress.value = 100;

      // Clear input
      clearMessageInput();

      // Reload messages to get the new message
      await loadMessages(currentChannelId.value);

      // Update channel's last message
      const channelsStore = useChannelsStore();
      const newMessage = messages.value[messages.value.length - 1];
      if (newMessage) {
        channelsStore.updateChannelLastMessage(
          currentChannelId.value,
          newMessage
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    } finally {
      isUploading.value = false;
      uploadProgress.value = 0;
    }
  };

  const addAttachedFile = (file: File): void => {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("Файл слишком большой. Максимальный размер: 10MB");
    }

    // Check file type
    const allowedTypes = ["image/", "video/", "audio/", "application/pdf"];
    const isAllowed = allowedTypes.some((type) => file.type.startsWith(type));
    if (!isAllowed) {
      throw new Error("Неподдерживаемый тип файла");
    }

    attachedFiles.value.push(file);
  };

  const removeAttachedFile = (index: number): void => {
    attachedFiles.value.splice(index, 1);
  };

  const clearMessageInput = (): void => {
    messageText.value = "";
    attachedFiles.value = [];
  };

  const setMessageText = (text: string): void => {
    messageText.value = text;
  };

  const addNewMessage = (message: Message): void => {
    // Add new message to the current conversation
    if (currentChannelId.value === message.author.id) {
      messages.value.push(message);
      lastMessageTime.value = message.dtCreated;

      // Update channel's last message and unread count
      const channelsStore = useChannelsStore();
      channelsStore.updateChannelLastMessage(currentChannelId.value, message);

      // Don't increment unread count if this is the current channel and user is actively viewing it
      // This would typically be managed by a focus/visibility detection system
    }
  };

  const clearCurrentChannel = (): void => {
    currentChannelId.value = null;
    currentChannel.value = null;
    messages.value = [];
    hasMoreMessages.value = true;
    lastMessageTime.value = 0;
    clearMessageInput();
  };

  const refreshCurrentChannel = async (): Promise<void> => {
    if (currentChannelId.value) {
      await loadMessages(currentChannelId.value);
    }
  };

  return {
    // State
    currentChannelId,
    currentChannel,
    messages,
    isLoading,
    isLoadingMore,
    hasMoreMessages,
    messageText,
    attachedFiles,
    isUploading,
    uploadProgress,

    // Getters
    sortedMessages,
    hasMessages,
    canSendMessage,

    // Actions
    setCurrentChannel,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    addAttachedFile,
    removeAttachedFile,
    clearMessageInput,
    setMessageText,
    addNewMessage,
    clearCurrentChannel,
    refreshCurrentChannel,
  };
});
