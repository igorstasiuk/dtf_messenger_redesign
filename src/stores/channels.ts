import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { dtfApi } from "@/utils/api";
import type { Channel } from "@/types/api";

export const useChannelsStore = defineStore("channels", () => {
  // State
  const channels = ref<Channel[]>([]);
  const isLoading = ref(false);
  const isVisible = ref(false);
  const searchQuery = ref("");
  const lastUpdate = ref<number>(0);
  const newMessagesCount = ref(0);

  // Getters
  const filteredChannels = computed(() => {
    if (!searchQuery.value) {
      return channels.value;
    }

    const query = searchQuery.value.toLowerCase();
    return channels.value.filter(
      (channel) =>
        channel.title.toLowerCase().includes(query) ||
        channel.lastMessage?.text?.toLowerCase().includes(query)
    );
  });

  const totalUnreadCount = computed(() => {
    return channels.value.reduce(
      (total, channel) => total + channel.unreadCount,
      0
    );
  });

  const sortedChannels = computed(() => {
    return [...filteredChannels.value].sort((a, b) => {
      // Sort by last message time, most recent first
      const aTime = a.lastMessage?.dtCreated || 0;
      const bTime = b.lastMessage?.dtCreated || 0;
      return bTime - aTime;
    });
  });

  // Actions
  const loadChannels = async (): Promise<void> => {
    if (isLoading.value) {
      return;
    }

    try {
      isLoading.value = true;
      const fetchedChannels = await dtfApi.getChannels();
      channels.value = fetchedChannels;
      lastUpdate.value = Date.now();

      console.log(`Loaded ${fetchedChannels.length} channels`);
    } catch (error) {
      console.error("Failed to load channels:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const refreshChannels = async (): Promise<void> => {
    await loadChannels();
  };

  const loadMessagesCounter = async (): Promise<void> => {
    try {
      const counter = await dtfApi.getMessagesCounter();
      newMessagesCount.value = counter.counter;
    } catch (error) {
      console.error("Failed to load messages counter:", error);
    }
  };

  const loadChannelByUserId = async (userId: string): Promise<void> => {
    try {
      // Load specific channel for direct messaging
      const channel = await dtfApi.getChannel(userId);

      // Add or update channel in the list
      const existingIndex = channels.value.findIndex(
        (c) => c.id === channel.id
      );
      if (existingIndex >= 0) {
        channels.value[existingIndex] = channel;
      } else {
        channels.value.unshift(channel);
      }
    } catch (error) {
      console.error("Failed to load channel for user:", userId, error);
      throw error;
    }
  };

  const getChannelById = (channelId: string): Channel | undefined => {
    return channels.value.find((channel) => channel.id === channelId);
  };

  const getChannelByUserId = (userId: string): Channel | undefined => {
    // In DTF.ru, user ID and channel ID are the same for direct messages
    return getChannelById(userId);
  };

  const updateChannelLastMessage = (channelId: string, message: any): void => {
    const channel = getChannelById(channelId);
    if (channel) {
      channel.lastMessage = message;
      // Move channel to top of the list
      const index = channels.value.indexOf(channel);
      if (index > 0) {
        channels.value.splice(index, 1);
        channels.value.unshift(channel);
      }
    }
  };

  const markChannelAsRead = (channelId: string): void => {
    const channel = getChannelById(channelId);
    if (channel) {
      channel.unreadCount = 0;
    }
  };

  const incrementUnreadCount = (channelId: string): void => {
    const channel = getChannelById(channelId);
    if (channel) {
      channel.unreadCount++;
    }
  };

  const toggleVisibility = (): void => {
    isVisible.value = !isVisible.value;
  };

  const setVisibility = (visible: boolean): void => {
    isVisible.value = visible;
  };

  const setSearchQuery = (query: string): void => {
    searchQuery.value = query;
  };

  const clearSearch = (): void => {
    searchQuery.value = "";
  };

  // Auto-refresh channels periodically
  const startAutoRefresh = (): void => {
    setInterval(async () => {
      if (Date.now() - lastUpdate.value > 60000) {
        // Refresh every minute
        await loadMessagesCounter();

        // Only refresh channels list if it's been more than 5 minutes
        if (Date.now() - lastUpdate.value > 300000) {
          await refreshChannels();
        }
      }
    }, 30000); // Check every 30 seconds
  };

  return {
    // State
    channels,
    isLoading,
    isVisible,
    searchQuery,
    newMessagesCount,

    // Getters
    filteredChannels,
    totalUnreadCount,
    sortedChannels,

    // Actions
    loadChannels,
    refreshChannels,
    loadMessagesCounter,
    loadChannelByUserId,
    getChannelById,
    getChannelByUserId,
    updateChannelLastMessage,
    markChannelAsRead,
    incrementUnreadCount,
    toggleVisibility,
    setVisibility,
    setSearchQuery,
    clearSearch,
    startAutoRefresh,
  };
});
