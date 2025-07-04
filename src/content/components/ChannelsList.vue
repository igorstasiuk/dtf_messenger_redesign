<template>
  <transition name="fade-slide" appear>
    <div
      style="
        position: fixed;
        top: 80px;
        right: 40px;
        z-index: 999999;
        background: #fff;
        border-radius: 16px;
        min-width: 340px;
        max-width: 96vw;
        min-height: 320px;
        max-height: 80vh;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.18);
        padding: 0;
        opacity: 1;
        pointer-events: auto;
        overflow: hidden;
      "
      class="shadow-2xl ring-1 ring-black/10 transition-opacity transition-transform duration-300"
    >
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-2xl"
      >
        <h2 class="text-lg font-semibold text-gray-900">Каналы</h2>
        <button
          type="button"
          class="p-2 rounded-md text-gray-400 hover:text-gray-700 focus:outline-none"
          @click="closeChannelsList"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div class="channels-list">
        <div class="channels-list__content">
          <div
            v-if="isLoading"
            class="channels-list__loading"
            aria-live="polite"
          >
            <LoadingSpinner />
            <span class="ml-2">Загрузка каналов...</span>
          </div>
          <div v-else-if="channels.length === 0" class="channels-list__empty">
            <div class="text-center py-8">
              <svg
                class="w-12 h-12 mx-auto text-gray-400 mb-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"
                />
              </svg>
              <p class="text-gray-500">Нет доступных каналов</p>
            </div>
          </div>
          <div v-else class="channels-list__items">
            <div
              v-for="channel in channels"
              :key="channel.id"
              class="channel-item"
              :class="{
                'channel-item--active': channel.id === activeChannelId,
              }"
              @click="selectChannel(channel.id)"
            >
              <div class="channel-item__avatar">
                <img
                  v-if="channel.picture"
                  :src="channel.picture"
                  :alt="channel.title"
                  class="channel-item__avatar-img"
                />
                <div v-else class="channel-item__avatar-fallback">
                  {{ getChannelInitials(channel.title) }}
                </div>
              </div>
              <div class="channel-item__content">
                <div class="channel-item__header">
                  <h3 class="channel-item__name">{{ channel.title }}</h3>
                  <div
                    v-if="channel.unreadCount && channel.unreadCount > 0"
                    class="channel-item__badge"
                  >
                    {{ channel.unreadCount > 99 ? "99+" : channel.unreadCount }}
                  </div>
                </div>
                <p
                  v-if="channel.lastMessage"
                  class="channel-item__last-message"
                >
                  {{ getLastMessagePreview(channel.lastMessage) }}
                </p>
                <div class="channel-item__meta">
                  <span
                    v-if="channel.lastMessage?.dtCreated"
                    class="channel-item__time"
                  >
                    {{
                      formatTime(new Date(channel.lastMessage.dtCreated * 1000))
                    }}
                  </span>
                  <span class="channel-item__participants">
                    {{ channel.members?.length || 0 }} участников
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useChannelsStore } from "@/stores/channels";
import { useUIStore } from "@/stores/ui";
import LoadingSpinner from "./LoadingSpinner.vue";
import type { Message, Channel } from "@/types/api";

const channelsStore = useChannelsStore();
const uiStore = useUIStore();

const isLoading = computed(() => channelsStore.isLoading);
const channels = computed(() => channelsStore.channels as Channel[]);
const activeChannelId = computed(() => channelsStore.activeChannelId);

function closeChannelsList() {
  uiStore.setChatSidebarOpen(false);
}

function getChannelInitials(title: string) {
  return title
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getLastMessagePreview(message?: Message): string {
  if (!message) return "";
  if (message.type === "text") {
    return message.text.length > 50
      ? message.text.substring(0, 50) + "..."
      : message.text;
  } else if (message.type === "media") {
    return "📷 Медиа";
  } else if (message.type === "system") {
    return "Системное сообщение";
  }
  return "Сообщение";
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function selectChannel(channelId: number) {
  channelsStore.setActiveChannel(channelId);
  uiStore.setChatSidebarOpen(true);
}
</script>

<style scoped>
.channels-list {
  @apply h-full max-h-full bg-white border-r border-gray-200 flex flex-col;
}

.channels-list__header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.channels-list__title {
  @apply text-lg font-semibold text-gray-900;
}

.channels-list__close {
  @apply p-1 rounded-md text-gray-400 hover:text-gray-600 focus:outline-none;
}

.channels-list__search {
  @apply p-4 border-b border-gray-200;
}

.channels-list__search-input {
  @apply w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md;
  @apply focus:outline-none focus:ring-2 focus:ring-dtf-orange focus:border-transparent;
}

.channels-list__search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400;
}

.channels-list__actions {
  @apply p-4 border-b border-gray-200;
}

.channels-list__create-btn {
  @apply w-full flex items-center justify-center px-4 py-2;
  @apply bg-dtf-orange text-white rounded-md hover:bg-dtf-orange/90;
  @apply focus:outline-none focus:ring-2 focus:ring-dtf-orange focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.channels-list__content {
  @apply flex-1 overflow-y-auto h-full max-h-full;
}

.channels-list__loading {
  @apply flex items-center justify-center p-8 text-gray-500;
}

.channels-list__empty {
  @apply p-4;
}

.channels-list__items {
  @apply divide-y divide-gray-200;
}

.channel-item {
  @apply flex items-start p-4 hover:bg-gray-50 cursor-pointer transition-colors;
}

.channel-item--active {
  @apply bg-dtf-orange/10 border-r-2 border-dtf-orange;
}

.channel-item__avatar {
  @apply flex-shrink-0 mr-3;
}

.channel-item__avatar-img {
  @apply w-10 h-10 rounded-full object-cover;
}

.channel-item__avatar-fallback {
  @apply w-10 h-10 rounded-full bg-dtf-orange text-white;
  @apply flex items-center justify-center text-sm font-medium;
}

.channel-item__content {
  @apply flex-1 min-w-0;
}

.channel-item__header {
  @apply flex items-center justify-between mb-1;
}

.channel-item__name {
  @apply text-sm font-medium text-gray-900 truncate;
}

.channel-item__badge {
  @apply ml-2 min-w-[20px] h-5 px-2 bg-dtf-red text-white text-xs;
  @apply rounded-full flex items-center justify-center;
}

.channel-item__last-message {
  @apply text-sm text-gray-500 truncate mb-1;
}

.channel-item__meta {
  @apply flex justify-between text-xs text-gray-400;
}

.channel-item__time {
  @apply truncate;
}

.channel-item__participants {
  @apply ml-2 flex-shrink-0;
}

/* Dialog */
.channels-list__dialog-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
}

.channels-list__dialog {
  @apply bg-white rounded-lg p-6 max-w-md w-full mx-4;
}

.channels-list__dialog-title {
  @apply text-lg font-semibold mb-4;
}

/* Dark mode */
.dark .channels-list {
  @apply bg-gray-800 border-gray-600;
}

.dark .channels-list__title {
  @apply text-gray-100;
}

.dark .channels-list__search-input {
  @apply bg-gray-700 border-gray-600 text-gray-100;
}

.dark .channel-item {
  @apply hover:bg-gray-700;
}

.dark .channel-item--active {
  @apply bg-dtf-orange/20;
}

.dark .channel-item__name {
  @apply text-gray-100;
}

.dark .channel-item__last-message {
  @apply text-gray-400;
}

.dark .channels-list__dialog {
  @apply bg-gray-800;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(32px) scale(0.98);
}
.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
