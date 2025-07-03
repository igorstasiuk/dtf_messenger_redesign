import { ref, computed, unref } from "vue";
import type { MaybeRef } from "@vueuse/core";
import { DTFMessengerAPI } from "@/utils/api";
import { useAuthStore } from "@/stores/auth";
import type {
  APIResponse,
  Channel,
  Message,
  SendMessageRequest,
  GetMessagesParams,
  CreateChannelRequest,
} from "@/types/api";

/**
 * API composable for DTF Messenger
 * Provides reactive API calls with error handling and loading states
 */
export function useAPI() {
  const authStore = useAuthStore();
  const api = new DTFMessengerAPI();

  // Global loading state
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Get authorization header
  const authHeader = computed(() => {
    return authStore.token ? `Bearer ${authStore.token.access_token}` : "";
  });

  // Generic API call wrapper
  async function apiCall<T>(
    apiMethod: () => Promise<APIResponse<T>>,
    options: {
      loadingRef?: MaybeRef<boolean>;
      errorRef?: MaybeRef<string | null>;
      onSuccess?: (data: T) => void;
      onError?: (error: string) => void;
    } = {}
  ): Promise<T | null> {
    const {
      loadingRef = isLoading,
      errorRef = error,
      onSuccess,
      onError,
    } = options;

    try {
      // Set loading state
      if (typeof loadingRef === "object" && "value" in loadingRef) {
        loadingRef.value = true;
      }

      // Clear previous error
      if (typeof errorRef === "object" && "value" in errorRef) {
        errorRef.value = null;
      }

      const response = await apiMethod();

      if (response.success && response.data) {
        onSuccess?.(response.data);
        return response.data;
      } else {
        const errorMessage = response.error || "API call failed";
        if (typeof errorRef === "object" && "value" in errorRef) {
          errorRef.value = errorMessage;
        }
        onError?.(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      if (typeof errorRef === "object" && "value" in errorRef) {
        errorRef.value = errorMessage;
      }
      onError?.(errorMessage);
      return null;
    } finally {
      // Clear loading state
      if (typeof loadingRef === "object" && "value" in loadingRef) {
        loadingRef.value = false;
      }
    }
  }

  // Channels API
  function useChannels() {
    const channelsLoading = ref(false);
    const channelsError = ref<string | null>(null);

    const getChannels = () =>
      apiCall(() => api.getChannels(), {
        loadingRef: channelsLoading,
        errorRef: channelsError,
      });

    const createChannel = (data: CreateChannelRequest) =>
      apiCall(() => api.createChannel(data), {
        loadingRef: channelsLoading,
        errorRef: channelsError,
      });

    const getChannel = (channelId: string) =>
      apiCall(() => api.getChannel(channelId), {
        loadingRef: channelsLoading,
        errorRef: channelsError,
      });

    return {
      channelsLoading,
      channelsError,
      getChannels,
      createChannel,
      getChannel,
    };
  }

  // Messages API
  function useMessages() {
    const messagesLoading = ref(false);
    const messagesError = ref<string | null>(null);

    const getMessages = (channelId: string, params?: GetMessagesParams) =>
      apiCall(() => api.getMessages(channelId, params), {
        loadingRef: messagesLoading,
        errorRef: messagesError,
      });

    const sendMessage = (channelId: string, data: SendMessageRequest) =>
      apiCall(() => api.sendMessage(channelId, data), {
        loadingRef: messagesLoading,
        errorRef: messagesError,
      });

    const getMessage = (channelId: string, messageId: string) =>
      apiCall(() => api.getMessage(channelId, messageId), {
        loadingRef: messagesLoading,
        errorRef: messagesError,
      });

    const markAsRead = (channelId: string, messageId: string) =>
      apiCall(() => api.markAsRead(channelId, messageId), {
        loadingRef: messagesLoading,
        errorRef: messagesError,
      });

    return {
      messagesLoading,
      messagesError,
      getMessages,
      sendMessage,
      getMessage,
      markAsRead,
    };
  }

  // Media API
  function useMedia() {
    const mediaLoading = ref(false);
    const mediaError = ref<string | null>(null);

    const uploadMedia = (file: File) =>
      apiCall(() => api.uploadMedia(file), {
        loadingRef: mediaLoading,
        errorRef: mediaError,
      });

    return {
      mediaLoading,
      mediaError,
      uploadMedia,
    };
  }

  // User API
  function useUsers() {
    const usersLoading = ref(false);
    const usersError = ref<string | null>(null);

    const getUserProfile = (userId?: string) =>
      apiCall(() => api.getUserProfile(userId), {
        loadingRef: usersLoading,
        errorRef: usersError,
      });

    const searchUsers = (query: string) =>
      apiCall(() => api.searchUsers(query), {
        loadingRef: usersLoading,
        errorRef: usersError,
      });

    return {
      usersLoading,
      usersError,
      getUserProfile,
      searchUsers,
    };
  }

  // Utility functions
  function clearError() {
    error.value = null;
  }

  function clearAllErrors() {
    error.value = null;
    // Clear specific API errors if needed
  }

  // Helper to check if request should be retried
  function shouldRetry(statusCode?: number): boolean {
    return statusCode === 429 || (statusCode && statusCode >= 500);
  }

  // Retry wrapper
  async function withRetry<T>(
    apiMethod: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiMethod();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retry with exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, attempt - 1))
        );
      }
    }

    throw lastError!;
  }

  return {
    // Global state
    isLoading,
    error,
    authHeader,

    // API groups
    useChannels,
    useMessages,
    useMedia,
    useUsers,

    // Utilities
    apiCall,
    clearError,
    clearAllErrors,
    withRetry,
    shouldRetry,

    // Direct API access
    api,
  };
}
