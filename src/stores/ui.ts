import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useColorMode } from "@vueuse/core";

export const useUIStore = defineStore("ui", () => {
  // State
  const isChatSidebarVisible = ref(false);
  const isChannelsListVisible = ref(false);
  const sidebarWidth = ref(400); // Default sidebar width
  const chatPosition = ref<"left" | "right">("right");
  const isCompactMode = ref(false);
  const showNotifications = ref(true);
  const soundEnabled = ref(false);

  // Theme management using VueUse
  const colorMode = useColorMode({
    modes: {
      light: "light",
      dark: "dark",
      auto: "auto",
    },
  });

  // Loading states
  const isGlobalLoading = ref(false);
  const loadingMessage = ref("");

  // Error states
  const globalError = ref<string | null>(null);
  const errorTimeout = ref<NodeJS.Timeout | null>(null);

  // Notification state
  const notifications = ref<Notification[]>([]);

  // Interface for notifications
  interface Notification {
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    duration?: number;
    persistent?: boolean;
  }

  // Getters
  const isDarkMode = computed(() => {
    return (
      colorMode.value === "dark" ||
      (colorMode.value === "auto" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const sidebarClasses = computed(() => {
    return {
      "right-0": chatPosition.value === "right",
      "left-0": chatPosition.value === "left",
      "w-80": !isCompactMode.value,
      "w-64": isCompactMode.value,
    };
  });

  const hasActiveNotifications = computed(() => notifications.value.length > 0);

  // Actions
  const toggleChatSidebar = (): void => {
    isChatSidebarVisible.value = !isChatSidebarVisible.value;

    // Close channels list when opening chat sidebar
    if (isChatSidebarVisible.value) {
      isChannelsListVisible.value = false;
    }
  };

  const setChatSidebarVisible = (visible: boolean): void => {
    isChatSidebarVisible.value = visible;
  };

  const toggleChannelsList = (): void => {
    isChannelsListVisible.value = !isChannelsListVisible.value;
  };

  const setChannelsListVisible = (visible: boolean): void => {
    isChannelsListVisible.value = visible;
  };

  const setSidebarWidth = (width: number): void => {
    const minWidth = 300;
    const maxWidth = 600;
    sidebarWidth.value = Math.max(minWidth, Math.min(maxWidth, width));
  };

  const setChatPosition = (position: "left" | "right"): void => {
    chatPosition.value = position;
  };

  const toggleCompactMode = (): void => {
    isCompactMode.value = !isCompactMode.value;
  };

  const setTheme = (theme: "light" | "dark" | "auto"): void => {
    colorMode.value = theme;
  };

  const setGlobalLoading = (loading: boolean, message = ""): void => {
    isGlobalLoading.value = loading;
    loadingMessage.value = message;
  };

  const setGlobalError = (error: string | null, duration = 5000): void => {
    globalError.value = error;

    // Clear existing timeout
    if (errorTimeout.value) {
      clearTimeout(errorTimeout.value);
    }

    // Auto-clear error after duration
    if (error && duration > 0) {
      errorTimeout.value = setTimeout(() => {
        globalError.value = null;
      }, duration);
    }
  };

  const addNotification = (notification: Omit<Notification, "id">): string => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000,
      persistent: false,
      ...notification,
    };

    notifications.value.push(newNotification);

    // Auto-remove notification if not persistent
    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id: string): void => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index >= 0) {
      notifications.value.splice(index, 1);
    }
  };

  const clearAllNotifications = (): void => {
    notifications.value = [];
  };

  const showSuccessNotification = (title: string, message: string): string => {
    return addNotification({ type: "success", title, message });
  };

  const showErrorNotification = (
    title: string,
    message: string,
    persistent = false
  ): string => {
    return addNotification({
      type: "error",
      title,
      message,
      persistent,
      duration: persistent ? 0 : 7000,
    });
  };

  const showWarningNotification = (title: string, message: string): string => {
    return addNotification({ type: "warning", title, message });
  };

  const showInfoNotification = (title: string, message: string): string => {
    return addNotification({ type: "info", title, message });
  };

  const toggleNotifications = (): void => {
    showNotifications.value = !showNotifications.value;
  };

  const toggleSound = (): void => {
    soundEnabled.value = !soundEnabled.value;
  };

  // Close overlays when clicking outside
  const closeAllOverlays = (): void => {
    isChannelsListVisible.value = false;
    // Don't auto-close chat sidebar as it's the main interface
  };

  // Keyboard shortcuts
  const handleKeyboardShortcut = (event: KeyboardEvent): void => {
    // Ctrl/Cmd + M: Toggle chat sidebar
    if ((event.ctrlKey || event.metaKey) && event.key === "m") {
      event.preventDefault();
      toggleChatSidebar();
    }

    // Ctrl/Cmd + Shift + C: Toggle channels list
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key === "C"
    ) {
      event.preventDefault();
      toggleChannelsList();
    }

    // Escape: Close overlays
    if (event.key === "Escape") {
      closeAllOverlays();
    }
  };

  // Save UI preferences to storage
  const savePreferences = async (): Promise<void> => {
    const preferences = {
      chatPosition: chatPosition.value,
      sidebarWidth: sidebarWidth.value,
      isCompactMode: isCompactMode.value,
      showNotifications: showNotifications.value,
      soundEnabled: soundEnabled.value,
      theme: colorMode.value,
    };

    try {
      await chrome.storage.sync.set({ uiPreferences: preferences });
    } catch (error) {
      console.error("Failed to save UI preferences:", error);
    }
  };

  // Load UI preferences from storage
  const loadPreferences = async (): Promise<void> => {
    try {
      const result = await chrome.storage.sync.get("uiPreferences");
      const preferences = result.uiPreferences;

      if (preferences) {
        chatPosition.value = preferences.chatPosition || "right";
        sidebarWidth.value = preferences.sidebarWidth || 400;
        isCompactMode.value = preferences.isCompactMode || false;
        showNotifications.value = preferences.showNotifications !== false;
        soundEnabled.value = preferences.soundEnabled || false;
        colorMode.value = preferences.theme || "auto";
      }
    } catch (error) {
      console.error("Failed to load UI preferences:", error);
    }
  };

  // Watch for changes and save preferences
  watch(
    [
      chatPosition,
      sidebarWidth,
      isCompactMode,
      showNotifications,
      soundEnabled,
      colorMode,
    ],
    () => {
      savePreferences();
    }
  );

  return {
    // State
    isChatSidebarVisible,
    isChannelsListVisible,
    sidebarWidth,
    chatPosition,
    isCompactMode,
    showNotifications,
    soundEnabled,
    colorMode,
    isGlobalLoading,
    loadingMessage,
    globalError,
    notifications,

    // Getters
    isDarkMode,
    sidebarClasses,
    hasActiveNotifications,

    // Actions
    toggleChatSidebar,
    setChatSidebarVisible,
    toggleChannelsList,
    setChannelsListVisible,
    setSidebarWidth,
    setChatPosition,
    toggleCompactMode,
    setTheme,
    setGlobalLoading,
    setGlobalError,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showInfoNotification,
    toggleNotifications,
    toggleSound,
    closeAllOverlays,
    handleKeyboardShortcut,
    savePreferences,
    loadPreferences,
  };
});
