import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  // State
  const accessToken = ref<string | null>(null);
  const isInitialized = ref(false);
  const authPromise = ref<Promise<void> | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value);

  // Actions
  const initialize = async (): Promise<void> => {
    if (isInitialized.value) {
      return;
    }

    if (authPromise.value) {
      return authPromise.value;
    }

    authPromise.value = setupAuthListener();
    await authPromise.value;
    isInitialized.value = true;
  };

  const setupAuthListener = (): Promise<void> => {
    return new Promise((resolve) => {
      const bc = new BroadcastChannel("osnova-events");

      bc.onmessage = ({ data: { type, detail } }) => {
        if (type === "auth session updated") {
          accessToken.value = detail.session.accessToken;
          console.log("DTF Messenger: Auth token updated");
          resolve();
        }
      };

      // Check if token is already available in DOM or localStorage
      checkExistingAuth()
        .then((token) => {
          if (token) {
            accessToken.value = token;
            resolve();
          }
        })
        .catch(() => {
          // No existing auth found, wait for broadcast
        });
    });
  };

  const checkExistingAuth = async (): Promise<string | null> => {
    // Try to get token from existing DTF.ru session
    // This is a fallback method if BroadcastChannel doesn't work immediately

    try {
      // Check for existing API calls in network to extract token
      const response = await fetch("https://api.dtf.ru/v2.5/user/me", {
        credentials: "include",
      });

      if (response.ok) {
        // Token is available in cookies, trigger a BroadcastChannel event
        // This is a workaround to get the token
        return null; // Will be set via BroadcastChannel
      }
    } catch (error) {
      console.log("No existing DTF.ru session found");
    }

    return null;
  };

  const getToken = async (): Promise<string> => {
    await initialize();

    if (!accessToken.value) {
      throw new Error("User not authenticated");
    }

    return accessToken.value;
  };

  const logout = () => {
    accessToken.value = null;
    console.log("DTF Messenger: User logged out");
  };

  const refreshToken = async (): Promise<void> => {
    // DTF.ru handles token refresh automatically
    // We just need to listen for the updated token
    return setupAuthListener();
  };

  return {
    // State
    accessToken,
    isInitialized,

    // Getters
    isAuthenticated,

    // Actions
    initialize,
    getToken,
    logout,
    refreshToken,
  };
});
