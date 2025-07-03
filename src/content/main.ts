import { createApp } from "vue";
import { pinia } from "@/stores";
import App from "./App.vue";
import "./styles.css";

// Initialize DTF Messenger content script
console.log("DTF Messenger: Content script loaded");

// Check if we're on DTF.ru
if (window.location.hostname !== "dtf.ru") {
  console.log("DTF Messenger: Not on DTF.ru, skipping initialization");
} else {
  console.log("DTF Messenger: Initializing on DTF.ru");
  
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
  } else {
    initializeApp();
  }
}

function initializeApp() {
  try {
    // Create container for our Vue app
    const appContainer = document.createElement("div");
    appContainer.id = "dtf-messenger-root";
    document.body.appendChild(appContainer);

    // Create Vue app
    const app = createApp(App);
    app.use(pinia);
    
    // Mount app
    app.mount("#dtf-messenger-root");
    
    console.log("DTF Messenger: Successfully mounted Vue app");
  } catch (error) {
    console.error("DTF Messenger: Failed to initialize app:", error);
  }
}

// Handle hot reload in development
if (import.meta.hot) {
  import.meta.hot.accept();
}

// Re-initialize on navigation (SPA behavior)
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    // Small delay to ensure new content is loaded
    setTimeout(initializeApp, 100);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
