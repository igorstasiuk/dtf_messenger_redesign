// Main stores index - exports all stores and Pinia setup
import { createPinia } from "pinia";
import type { App } from "vue";

// Import all stores
export { useAuthStore } from "./auth";
export { useChannelsStore } from "./channels";
export { useMessagesStore } from "./messages";
export { useUIStore } from "./ui";

// Create and export pinia instance
export const pinia = createPinia();

// Plugin setup function for Vue app
export function setupStores(app: App) {
  app.use(pinia);
}

// Development helpers
if (import.meta.env.DEV) {
  // Enable Pinia devtools
  pinia.use(({ store }) => {
    // Add store name for better debugging
    Object.defineProperty(store, "__storeId", {
      value: store.$id,
      writable: false,
      enumerable: false,
    });
  });
}

// Store types for better TypeScript support
export type StoreIds = "auth" | "channels" | "messages" | "ui";

// Helper function to get store by id (useful for testing)
export function getStoreById(id: StoreIds) {
  switch (id) {
    case "auth":
      return useAuthStore(pinia);
    case "channels":
      return useChannelsStore(pinia);
    case "messages":
      return useMessagesStore(pinia);
    case "ui":
      return useUIStore(pinia);
    default:
      throw new Error(`Store with id "${id}" not found`);
  }
}

// Store reset helper for testing
export function resetAllStores() {
  const authStore = useAuthStore(pinia);
  const channelsStore = useChannelsStore(pinia);
  const messagesStore = useMessagesStore(pinia);
  const uiStore = useUIStore(pinia);

  authStore.$reset();
  channelsStore.$reset();
  messagesStore.$reset();
  uiStore.$reset();
}
