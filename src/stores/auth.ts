import { defineStore } from "pinia";
import { ref, computed, readonly } from "vue";
import type { AuthUser } from "@/types/api";
import type { BroadcastChannelEvent } from "@/types/auth";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<AuthUser | null>(null);
  const accessToken = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastActivity = ref<number | null>(null);
  const sessionExpiry = ref<number | null>(null);

  // BroadcastChannel for DTF.ru integration
  const broadcastChannel = ref<BroadcastChannel | null>(null);
  const isListening = ref(false);

  // Computed
  const isAuthenticated = computed(() => {
    return !!user.value && !!accessToken.value && !isTokenExpired.value;
  });

  const isTokenExpired = computed(() => {
    if (!sessionExpiry.value) return false;
    return Date.now() > sessionExpiry.value;
  });

  const timeUntilExpiry = computed(() => {
    if (!sessionExpiry.value) return null;
    const remaining = sessionExpiry.value - Date.now();
    return remaining > 0 ? remaining : 0;
  });

  // Actions
  function setUser(newUser: AuthUser | null) {
    user.value = newUser;
    if (newUser) {
      updateLastActivity();
    }
  }

  function setAccessToken(token: string | null) {
    accessToken.value = token;
    
    if (token) {
      // Calculate expiry time (DTF tokens typically last 30 minutes)
      sessionExpiry.value = Date.now() + (30 * 60 * 1000);
      updateLastActivity();
      persistSession();
    } else {
      sessionExpiry.value = null;
      clearSession();
    }
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setError(newError: string | null) {
    error.value = newError;
  }

  function updateLastActivity() {
    lastActivity.value = Date.now();
  }

  function clearAuth() {
    user.value = null;
    accessToken.value = null;
    error.value = null;
    lastActivity.value = null;
    sessionExpiry.value = null;
    clearSession();
  }

  // BroadcastChannel Methods (based on tampermonkey script)
  function initBroadcastChannel() {
    try {
      broadcastChannel.value = new BroadcastChannel("osnova-events");
      
      broadcastChannel.value.onmessage = ({ data }: { data: BroadcastChannelEvent }) => {
        handleBroadcastMessage(data);
      };
      
      isListening.value = true;
      console.log("DTF Messenger: BroadcastChannel initialized");
    } catch (error) {
      console.error("DTF Messenger: Failed to initialize BroadcastChannel:", error);
      setError("Failed to connect to DTF.ru authentication");
    }
  }

  function handleBroadcastMessage(data: BroadcastChannelEvent) {
    const { type, detail } = data;
    
    switch (type) {
      case "auth session updated":
        if (detail.session?.accessToken) {
          console.log("DTF Messenger: Token received from DTF.ru");
          setAccessToken(detail.session.accessToken);
          
          if (detail.session.user) {
            setUser(detail.session.user);
          }
          
          setError(null);
        }
        break;
        
      case "auth logout":
        console.log("DTF Messenger: Logout received from DTF.ru");
        clearAuth();
        break;
        
      case "auth error":
        console.error("DTF Messenger: Auth error from DTF.ru:", detail.error);
        setError(detail.error || "Authentication error");
        break;
    }
  }

  function closeBroadcastChannel() {
    if (broadcastChannel.value) {
      broadcastChannel.value.close();
      broadcastChannel.value = null;
      isListening.value = false;
    }
  }

  // Session Persistence
  function persistSession() {
    if (!user.value || !accessToken.value) return;

    try {
      const sessionData = {
        user: user.value,
        accessToken: accessToken.value,
        expiresAt: sessionExpiry.value,
        lastActivity: lastActivity.value
      };
      
      localStorage.setItem("dtf-messenger-session", JSON.stringify(sessionData));
    } catch (error) {
      console.warn("DTF Messenger: Failed to persist session:", error);
    }
  }

  function loadPersistedSession() {
    try {
      const stored = localStorage.getItem("dtf-messenger-session");
      if (!stored) return false;

      const sessionData = JSON.parse(stored);
      
      // Check if session is still valid
      if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
        clearSession();
        return false;
      }

      if (sessionData.user && sessionData.accessToken) {
        user.value = sessionData.user;
        accessToken.value = sessionData.accessToken;
        sessionExpiry.value = sessionData.expiresAt;
        lastActivity.value = sessionData.lastActivity;
        return true;
      }
    } catch (error) {
      console.warn("DTF Messenger: Failed to load persisted session:", error);
      clearSession();
    }
    
    return false;
  }

  function clearSession() {
    try {
      localStorage.removeItem("dtf-messenger-session");
    } catch (error) {
      console.warn("DTF Messenger: Failed to clear session:", error);
    }
  }

  // Auto-refresh token before expiry
  function setupAutoRefresh() {
    // Check every 5 minutes
    setInterval(() => {
      if (timeUntilExpiry.value !== null && timeUntilExpiry.value < 5 * 60 * 1000) {
        console.log("DTF Messenger: Token expiring soon, requesting refresh");
        // The tampermonkey script doesn't implement refresh, so we just wait for new token
        setError("Session expiring soon. Please refresh DTF.ru page.");
      }
    }, 5 * 60 * 1000);
  }

  // Initialization
  function initialize() {
    setLoading(true);
    
    // Try to load persisted session first
    const hasPersistedSession = loadPersistedSession();
    
    if (hasPersistedSession) {
      console.log("DTF Messenger: Loaded persisted session");
    }
    
    // Initialize BroadcastChannel for live updates
    initBroadcastChannel();
    
    // Setup auto-refresh
    setupAutoRefresh();
    
    setLoading(false);
  }

  // Cleanup
  function destroy() {
    closeBroadcastChannel();
    clearSession();
  }

  // Public API
  return {
    // State
    user: readonly(user),
    accessToken: readonly(accessToken),
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastActivity: readonly(lastActivity),
    sessionExpiry: readonly(sessionExpiry),
    isListening: readonly(isListening),
    
    // Computed
    isAuthenticated,
    isTokenExpired,
    timeUntilExpiry,
    
    // Actions
    setUser,
    setAccessToken,
    setLoading,
    setError,
    updateLastActivity,
    clearAuth,
    initBroadcastChannel,
    closeBroadcastChannel,
    initialize,
    destroy,
    
    // Utilities
    persistSession,
    loadPersistedSession,
    clearSession
  };
});
