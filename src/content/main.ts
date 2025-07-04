import { createApp } from "vue";
import { pinia } from "@/stores";
import App from "./App.vue";
import "./content.css";

// Initialize DTF Messenger content script
// DTF Messenger initialization

// Check if we're on DTF.ru and initialize
if (window.location.hostname === "dtf.ru") {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp, {
      once: true,
    });
  } else {
    initializeApp();
  }
}

function initializeApp() {
  try {
    // Create container for our Vue app
    const appContainer = document.createElement("div");
    appContainer.id = "dtf-messenger-root";
    appContainer.style.cssText = `
      position: relative;
      z-index: 999999;
    `;
    document.body.appendChild(appContainer);

    // Create Vue app
    const app = createApp(App);
    app.use(pinia);

    // Add error handler
    app.config.errorHandler = (err) => {
      console.error("DTF Messenger error:", err);
    };

    // Mount app
    app.mount("#dtf-messenger-root");
  } catch (error) {
    console.error("DTF Messenger initialization failed:", error);
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
    setTimeout(() => {
      initializeApp();
    }, 100);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
