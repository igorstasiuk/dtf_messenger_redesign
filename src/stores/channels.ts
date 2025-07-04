import { defineStore } from "pinia";
import { ref, computed, readonly } from "vue";
import { dtfAPI } from "@/utils/api";
import type { Channel } from "@/types/api";
import { useAuthStore } from "./auth";

export const useChannelsStore = defineStore("channels", () => {
  // State
  const channels = ref<Channel[]>([]);
  const activeChannelId = ref<number | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastFetch = ref<number | null>(null);
  const unreadTotal = ref(0);

  // Computed
  const activeChannel = computed(() => {
    if (!activeChannelId.value) return null;
    return (
      channels.value.find((channel) => channel.id === activeChannelId.value) ||
      null
    );
  });

  const sortedChannels = computed(() => {
    return [...channels.value].sort((a, b) => {
      // Sort by last message time, then by unread count
      const aTime = a.lastMessage?.dtCreated || 0;
      const bTime = b.lastMessage?.dtCreated || 0;

      if (aTime !== bTime) {
        return bTime - aTime; // Most recent first
      }

      return b.unreadCount - a.unreadCount; // More unread first
    });
  });

  const totalUnreadCount = computed(() => {
    return channels.value.reduce(
      (total, channel) => total + channel.unreadCount,
      0
    );
  });

  const hasUnreadMessages = computed(() => {
    return totalUnreadCount.value > 0;
  });

  // Actions
  function setChannels(newChannels: Channel[]) {
    channels.value = newChannels;
    updateUnreadTotal();
    lastFetch.value = Date.now();
  }

  function addChannel(channel: Channel) {
    const existingIndex = channels.value.findIndex((c) => c.id === channel.id);

    if (existingIndex >= 0) {
      channels.value[existingIndex] = channel;
    } else {
      channels.value.unshift(channel);
    }

    updateUnreadTotal();
  }

  function updateChannel(channelId: number, updates: Partial<Channel>) {
    const index = channels.value.findIndex((c) => c.id === channelId);

    if (index >= 0) {
      channels.value[index] = { ...channels.value[index], ...updates };
      updateUnreadTotal();
    }
  }

  function removeChannel(channelId: number) {
    const index = channels.value.findIndex((c) => c.id === channelId);

    if (index >= 0) {
      channels.value.splice(index, 1);

      if (activeChannelId.value === channelId) {
        activeChannelId.value = null;
      }

      updateUnreadTotal();
    }
  }

  function setActiveChannel(channelId: number | null) {
    activeChannelId.value = channelId;

    // Mark active channel as read
    if (channelId) {
      markChannelAsRead(channelId);
    }
  }

  function markChannelAsRead(channelId: number) {
    updateChannel(channelId, { unreadCount: 0 });
  }

  function updateUnreadCount(channelId: number, count: number) {
    updateChannel(channelId, { unreadCount: count });
  }

  function updateUnreadTotal() {
    unreadTotal.value = totalUnreadCount.value;
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setError(newError: string | null) {
    error.value = newError;
  }

  function clearChannels() {
    channels.value = [];
    activeChannelId.value = null;
    unreadTotal.value = 0;
    lastFetch.value = null;
  }

  // API Actions
  async function fetchChannels() {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      setError("Not authenticated");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await dtfAPI.getChannels();

      if (response.success && response.result) {
        setChannels(response.result.channels);
        return true;
      } else {
        setError(response.error?.message || "Failed to load channels");
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function fetchChannel(channelId: number) {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      setError("Not authenticated");
      return null;
    }

    try {
      const response = await dtfAPI.getChannel(channelId);

      if (response.success && response.result) {
        const channel = response.result.channel;
        addChannel(channel);
        return channel;
      } else {
        setError(response.error?.message || "Failed to load channel");
        return null;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      return null;
    }
  }

  async function createChannelWithUser(userId: number) {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      setError("Not authenticated");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await dtfAPI.getOrCreateChannelWithUser(userId);

      if (response.success && response.result) {
        const channel = response.result.channel;
        addChannel(channel);
        setActiveChannel(channel.id);
        return channel;
      } else {
        setError(response.error?.message || "Failed to create channel");
        return null;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function createChannel(data: {
    name: string;
    type: "group" | "direct";
  }) {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      setError("Not authenticated");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, create a mock channel since we don't have the actual API endpoint
      const mockChannel: Channel = {
        id: Date.now(), // temporary ID
        title: data.name,
        picture: "",
        lastMessage: undefined,
        unreadCount: 0,
        type: data.type === "group" ? "group" : "private",
        members: [],
        isActive: false,
      };

      addChannel(mockChannel);
      setActiveChannel(mockChannel.id);
      return mockChannel;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Utility Functions
  function getChannelById(channelId: number): Channel | null {
    return channels.value.find((c) => c.id === channelId) || null;
  }

  function findChannelByUserId(userId: number): Channel | null {
    return channels.value.find((c) => c.id === userId) || null;
  }

  function isChannelActive(channelId: number): boolean {
    return activeChannelId.value === channelId;
  }

  // Auto-refresh channels periodically
  let refreshInterval: number | null = null;

  function startAutoRefresh(intervalMs = 60000) {
    // 1 minute
    if (refreshInterval) {
      stopAutoRefresh();
    }

    refreshInterval = window.setInterval(() => {
      if (useAuthStore().isAuthenticated) {
        fetchChannels();
      }
    }, intervalMs);
  }

  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  // Initialization
  function initialize() {
    // Load channels if authenticated
    const authStore = useAuthStore();
    if (authStore.isAuthenticated) {
      fetchChannels();
    }

    // Start auto-refresh
    startAutoRefresh();
  }

  function destroy() {
    stopAutoRefresh();
    clearChannels();
  }

  // Call initialize automatically when store is created
  initialize();

  // Public API
  return {
    // State
    channels: readonly(channels),
    activeChannelId: readonly(activeChannelId),
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastFetch: readonly(lastFetch),
    unreadTotal: readonly(unreadTotal),

    // Computed
    activeChannel,
    sortedChannels,
    totalUnreadCount,
    hasUnreadMessages,

    // Actions
    setChannels,
    addChannel,
    updateChannel,
    removeChannel,
    setActiveChannel,
    markChannelAsRead,
    updateUnreadCount,
    setLoading,
    setError,
    clearChannels,

    // API Actions
    fetchChannels,
    fetchChannel,
    createChannelWithUser,
    createChannel,

    // Utilities
    getChannelById,
    findChannelByUserId,
    isChannelActive,
    startAutoRefresh,
    stopAutoRefresh,
    initialize,
    destroy,
  };
});
