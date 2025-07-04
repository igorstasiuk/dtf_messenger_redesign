import { computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { dtfAPI } from "@/utils/api";
import type { AuthUser } from "@/types/api";

/**
 * Authentication composable with DTF.ru BroadcastChannel integration
 * Based on tampermonkey script authentication flow
 */
export function useAuth() {
  const authStore = useAuthStore();

  // Computed
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);
  const accessToken = computed(() => authStore.accessToken);
  const isLoading = computed(() => authStore.isLoading);
  const error = computed(() => authStore.error);
  const timeUntilExpiry = computed(() => authStore.timeUntilExpiry);
  const isTokenExpired = computed(() => authStore.isTokenExpired);

  // Actions
  function initialize() {
    authStore.initialize();
  }

  function clearAuth() {
    authStore.clearAuth();
  }

  function clearError() {
    authStore.setError(null);
  }

  function updateToken(token: string) {
    authStore.setAccessToken(token);
    dtfAPI.setAccessToken(token);
  }

  function updateUser(userData: AuthUser) {
    authStore.setUser(userData);
  }

  // Auto-initialization
  onMounted(() => {
    initialize();

    // Set token in API client if available
    const token = authStore.accessToken;
    if (token) {
      dtfAPI.setAccessToken(token);
    }
  });

  // Cleanup
  onUnmounted(() => {
    authStore.destroy();
  });

  return {
    // State
    isAuthenticated,
    user,
    accessToken,
    isLoading,
    error,
    timeUntilExpiry,
    isTokenExpired,

    // Actions
    initialize,
    clearAuth,
    clearError,
    updateToken,
    updateUser,
  };
}
