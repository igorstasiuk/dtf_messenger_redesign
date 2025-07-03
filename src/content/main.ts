import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./styles.css";

// Wait for DOM to be ready
const initExtension = () => {
  // Check if we're on DTF.ru
  if (!window.location.hostname.includes("dtf.ru")) {
    return;
  }

  // Check if extension is already initialized
  if (document.getElementById("dtf-messenger-extension")) {
    return;
  }

  // Create container for Vue app
  const container = document.createElement("div");
  container.id = "dtf-messenger-extension";
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 999999;
  `;

  document.body.appendChild(container);

  // Create Pinia instance
  const pinia = createPinia();

  // Initialize Vue app
  const app = createApp(App);
  app.use(pinia);
  app.mount(container);

  console.log("DTF Messenger Extension initialized");
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initExtension);
} else {
  initExtension();
}

// Re-initialize on navigation (SPA behavior)
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    // Small delay to ensure new content is loaded
    setTimeout(initExtension, 100);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
