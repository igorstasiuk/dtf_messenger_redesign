import { computed, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useLocalStorage, useEventListener } from "@vueuse/core";

/**
 * Authentication composable for DTF Messenger
 * Handles authentication state and BroadcastChannel integration
 */
export function useAuth() {
  const authStore = useAuthStore();

  // Local storage for persistence
  const persistedUser = useLocalStorage("dtf-messenger-user", null);
  const persistedToken = useLocalStorage("dtf-messenger-token", null, {
    serializer: {
      read: (value: string) => {
        try {
          return value ? JSON.parse(value) : null;
        } catch {
          return null;
        }
      },
      write: (value: any) => {
        return value ? JSON.stringify(value) : "";
      },
    },
  });

  // Computed properties
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);
  const token = computed(() => authStore.token);
  const authError = computed(() => authStore.error);
  const isLoading = computed(() => authStore.loading);

  // Listen for authentication changes from main DTF site
  useEventListener("storage", (e) => {
    if (e.key === "dtf-auth-token" && e.newValue) {
      // User logged in on main site
      handleExternalAuth(e.newValue);
    } else if (e.key === "dtf-auth-token" && !e.newValue) {
      // User logged out on main site
      logout();
    }
  });

  // Initialize authentication state from storage
  function initAuth() {
    if (persistedUser.value && persistedToken.value) {
      authStore.setUser(persistedUser.value);
      authStore.setToken(persistedToken.value);
    }

    // Start BroadcastChannel listener
    authStore.initBroadcastChannel();

    // Check current DTF authentication
    checkDTFAuth();
  }

  // Check DTF authentication status
  async function checkDTFAuth() {
    try {
      authStore.setLoading(true);
      await authStore.checkAuthentication();
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      authStore.setLoading(false);
    }
  }

  // Handle external authentication (from DTF site)
  function handleExternalAuth(tokenData: string) {
    try {
      const parsed = JSON.parse(tokenData);
      authStore.setToken(parsed);
      authStore.fetchUserProfile();
    } catch (error) {
      console.error("Failed to parse external auth data:", error);
    }
  }

  // Login function
  async function login(credentials?: { username: string; password: string }) {
    try {
      authStore.setLoading(true);
      authStore.clearError();

      if (credentials) {
        // Direct login (if supported)
        await authStore.login(credentials);
      } else {
        // Redirect to DTF login
        redirectToDTFLogin();
      }
    } catch (error) {
      console.error("Login failed:", error);
      authStore.setError(
        error instanceof Error ? error.message : "Login failed"
      );
    } finally {
      authStore.setLoading(false);
    }
  }

  // Logout function
  function logout() {
    authStore.logout();
    persistedUser.value = null;
    persistedToken.value = null;
  }

  // Redirect to DTF login page
  function redirectToDTFLogin() {
    const loginUrl = "https://dtf.ru/login";
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${loginUrl}?return_url=${returnUrl}`;
  }

  // Refresh token
  async function refreshToken() {
    try {
      await authStore.refreshToken();
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
    }
  }

  // Watch for authentication changes and persist to storage
  watch(
    () => authStore.user,
    (newUser) => {
      persistedUser.value = newUser;
    },
    { deep: true }
  );

  watch(
    () => authStore.token,
    (newToken) => {
      persistedToken.value = newToken;
    },
    { deep: true }
  );

  // Auto-refresh token before expiration
  watch(
    () => authStore.token?.expires_at,
    (expiresAt) => {
      if (expiresAt) {
        const now = Date.now();
        const expirationTime = new Date(expiresAt).getTime();
        const timeUntilExpiration = expirationTime - now;

        // Refresh 5 minutes before expiration
        const refreshTime = timeUntilExpiration - 5 * 60 * 1000;

        if (refreshTime > 0) {
          setTimeout(refreshToken, refreshTime);
        }
      }
    }
  );

  return {
    // State
    isAuthenticated,
    user,
    token,
    authError,
    isLoading,

    // Actions
    initAuth,
    login,
    logout,
    refreshToken,
    checkDTFAuth,
    redirectToDTFLogin,

    // Store access for advanced usage
    authStore,
  };
}
