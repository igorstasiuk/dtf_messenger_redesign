<template>
  <div id="dtf-messenger-app">
    <!-- Main Chat Interface -->
    <Teleport to="body">
      <div
        v-if="uiStore.isChannelsListOpen || uiStore.isChatSidebarOpen"
        style="position: fixed; inset: 0; z-index: 999999; pointer-events: none"
      >
        <!-- Channels List -->
        <div v-if="uiStore.isChannelsListOpen" style="pointer-events: auto">
          <ChannelsList />
        </div>
        <!-- Chat Sidebar -->
        <div v-if="uiStore.isChatSidebarOpen" style="pointer-events: auto">
          <ChatSidebar />
        </div>
      </div>
    </Teleport>
    <!-- Global Notifications -->
    <NotificationContainer />
    <!-- Global Loading -->
    <transition name="fade-slide">
      <div
        v-if="uiStore.isGlobalLoading"
        class="fixed inset-0 z-[1000000] flex flex-col items-center justify-center bg-black/20"
        style="pointer-events: auto"
        role="alertdialog"
        aria-modal="true"
      >
        <LoadingSpinner />
        <div
          v-if="uiStore.loadingMessage"
          class="mt-4 text-white text-lg font-medium drop-shadow"
        >
          {{ uiStore.loadingMessage }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useUIStore } from "@/stores/ui";
// import { useChannelsStore } from "@/stores/channels";
import ChannelsList from "./components/ChannelsList.vue";
import ChatSidebar from "./components/ChatSidebar.vue";
import NotificationContainer from "./components/NotificationContainer.vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";

const uiStore = useUIStore();
// const channelsStore = useChannelsStore();

function injectChatButton() {
  // Remove existing injected button
  const existing = document.querySelector(".dtf-messenger-chat-button");
  if (existing) existing.remove();

  // Find the header right container using correct DTF.ru selectors
  const selectors = [
    ".header__right",
    ".header .header__right",
    ".header__layout .header__right",
  ];
  let headerRight = null;
  for (const selector of selectors) {
    headerRight = document.querySelector(selector);
    if (headerRight) break;
  }
  if (!headerRight) return false;

  // Create chat button HTML
  const chatButton = document.createElement("div");
  chatButton.className = "dtf-messenger-chat-button";
  chatButton.style.cssText = `
    display: inline-flex;
    align-items: center;
    margin-left: 8px;
    cursor: pointer;
  `;
  chatButton.innerHTML = `
    <button type="button" class="button button--size-l button--type-transparent button--icon-only button--circle" 
            style="position: relative;" 
            title="DTF Messenger">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.761 20 11.5 20C10.454 20 9.448 19.848 8.5 19.571L3 21L4.429 15.5C4.152 14.552 4 13.546 4 12.5C4 8.082 8.239 4.5 13.5 4.5C18.761 4.5 23 8.082 23 12.5Z" 
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;
  chatButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    uiStore.setChannelsListOpen(true);
  });
  // Insert before search or at the end
  const searchElement = headerRight.querySelector(".search");
  if (searchElement) {
    headerRight.insertBefore(chatButton, searchElement);
  } else {
    headerRight.appendChild(chatButton);
  }
  return true;
}

onMounted(() => {
  setTimeout(() => {
    injectChatButton();
  }, 1000);
  // SPA: re-inject on DOM mutations
  let debounceTimer: number | null = null;
  const observer = new MutationObserver(() => {
    const hasButton = document.querySelector(".dtf-messenger-chat-button");
    const hasHeader = document.querySelector(".header__right");
    if (hasHeader && !hasButton) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        injectChatButton();
        debounceTimer = null;
      }, 1000);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
</script>
