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
        min-width: 400px;
        max-width: 98vw;
        min-height: 400px;
        max-height: 90vh;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.18);
        padding: 0;
        opacity: 1;
        pointer-events: auto;
        overflow: hidden;
      "
      class="shadow-2xl ring-1 ring-black/10 transition-opacity transition-transform duration-300 flex flex-col"
    >
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-2xl"
      >
        <h2 class="text-lg font-semibold text-gray-900">Чат</h2>
        <button
          type="button"
          class="p-2 rounded-md text-gray-400 hover:text-gray-700 focus:outline-none"
          @click="closeChatSidebar"
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

      <!-- Messages Area -->
      <div class="chat-sidebar__content">
        <div v-if="!activeChannel" class="chat-sidebar__empty">
          <div class="text-center py-12">
            <svg
              class="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"
              />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Выберите канал
            </h3>
            <p class="text-gray-500">
              Выберите канал из списка, чтобы начать общение
            </p>
          </div>
        </div>

        <div v-else class="chat-sidebar__messages-container">
          <!-- Loading -->
          <div
            v-if="messagesStore.isLoading"
            class="chat-sidebar__loading"
            aria-live="polite"
          >
            <LoadingSpinner />
            <span class="ml-2">Загрузка сообщений...</span>
          </div>

          <!-- Messages -->
          <div v-else ref="messagesContainer" class="chat-sidebar__messages">
            <div
              v-for="message in messages"
              :key="message.id"
              class="channel__popover__messages__message"
            >
              <div class="channel__popover__messages__message__image">
                <div
                  v-if="!message.sameAuthor"
                  class="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--has-preview andropov-image"
                  style="
                    aspect-ratio: 1 / 1;
                    width: 36px;
                    height: 36px;
                    max-width: none;
                    --background-color: #dddddd;
                  "
                  data-loaded="true"
                >
                  <picture>
                    <source
                      v-if="message.author.picture"
                      :srcset="`${message.author.picture}-/format/jpeg/-/scale_crop/72x72/-/format/webp, ${message.author.picture}-/format/jpeg/-/scale_crop/72x72/-/format/webp 2x`"
                      type="image/webp"
                    />
                    <img
                      v-if="message.author.picture"
                      :src="`${message.author.picture}-/format/jpeg/-/scale_crop/72x72/`"
                      :srcset="`${message.author.picture}-/format/jpeg/-/scale_crop/72x72/, ${message.author.picture}/-/format/jpeg/-/scale_crop/72x72/ 2x`"
                      alt=""
                      loading="lazy"
                    />
                  </picture>
                </div>
              </div>
              <div class="channel__popover__messages__message__body">
                <b>{{ message.author.title }}</b>
                <div v-if="message.text">{{ message.text }}</div>
                <div
                  v-if="message.media"
                  class="channel__popover__messages__message__media"
                >
                  <template v-if="message.media[0]">
                    <a
                      v-if="
                        message.media[0].type === 'image' &&
                        message.media[0].data.type !== 'gif'
                      "
                      :href="`https://leonardo.osnova.io/${message.media[0].data.uuid}/`"
                      target="_blank"
                    >
                      <img
                        :src="`https://leonardo.osnova.io/${message.media[0].data.uuid}/-/preview/100x/`"
                      />
                    </a>
                    <a
                      v-if="
                        message.media[0].type === 'video' ||
                        message.media[0].data.type === 'gif'
                      "
                      :href="`https://leonardo.osnova.io/${message.media[0].data.uuid}/`"
                      target="_blank"
                    >
                      <video
                        preload="auto"
                        autoplay
                        playsinline
                        loop
                        :src="`https://leonardo.osnova.io/${message.media[0].data.uuid}/-/format/mp4#t=0.1`"
                      ></video>
                    </a>
                  </template>
                </div>
              </div>
              <div class="channel__popover__messages__message__date">
                <p>{{ formatMessageTime(message.dtCreated) }}</p>
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="typingUsers.length > 0" class="chat-sidebar__typing">
              <div class="flex items-center space-x-2 p-3">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span class="text-sm text-gray-500">
                  {{ getTypingText(typingUsers) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div v-if="activeChannel" class="chat-sidebar__input">
        <div class="chat-sidebar__input-container">
          <button
            type="button"
            class="chat-sidebar__attach-btn"
            @click="toggleMediaUpload"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <textarea
            ref="messageInput"
            v-model="messageText"
            rows="1"
            placeholder="Написать сообщение..."
            class="chat-sidebar__input-field"
            @keydown="handleKeyDown"
            @input="handleInput"
          />

          <button
            type="button"
            class="chat-sidebar__emoji-btn"
            @click="toggleEmojiPicker"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            class="chat-sidebar__send-btn"
            :disabled="!canSendMessage"
            @click="sendMessage"
          >
            <LoadingSpinner v-if="isSending" small class="mr-2" />
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, toRaw } from "vue";
import { useChannelsStore } from "@/stores/channels";
import { useMessagesStore } from "@/stores/messages";
import { useUIStore } from "@/stores/ui";
import LoadingSpinner from "./LoadingSpinner.vue";
import type { Message } from "@/types/api";
import { formatMessageTime } from "@/utils/date";

const channelsStore = useChannelsStore();
const messagesStore = useMessagesStore();
const uiStore = useUIStore();

const activeChannel = computed(() => channelsStore.activeChannel);
const typingUsers = computed(() => messagesStore.typingUsers);
const isSending = ref(false);
const messageText = ref("");
const messageInput = ref<HTMLTextAreaElement | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);

// Fetch messages when activeChannel changes
watch(
  () => activeChannel.value?.id,
  async (channelId) => {
    if (channelId) {
      await messagesStore.fetchMessages(channelId);
    }
  },
  { immediate: true }
);

function closeChatSidebar() {
  uiStore.setChatSidebarOpen(false);
}

function getTypingText(users: typeof typingUsers.value) {
  if (!users.length) return "";
  // Use .title if present, else .name
  const getDisplayName = (u: any) => u.title || u.name || "Пользователь";
  if (users.length === 1) return `${getDisplayName(users[0])} печатает...`;
  return `${users.map(getDisplayName).join(", ")} печатают...`;
}

function toggleMediaUpload() {
  // TODO: реализовать загрузку медиа
}

function toggleEmojiPicker() {
  // TODO: реализовать emoji picker
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function handleInput() {
  // TODO: обработка ввода (например, resize textarea)
}

const canSendMessage = computed(
  () => messageText.value.trim().length > 0 && !isSending.value
);

async function sendMessage() {
  if (!canSendMessage.value || !activeChannel.value) return;
  isSending.value = true;
  try {
    await messagesStore.sendMessage({
      channelId: activeChannel.value.id,
      text: messageText.value.trim(),
    });
    messageText.value = "";
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      }
    });
  } finally {
    isSending.value = false;
  }
}

function deepToRawMessage(msg: any): Message {
  // toRaw снимает только верхний уровень readonly, media может быть тоже readonly
  return {
    ...toRaw(msg),
    media: msg.media
      ? msg.media.map((m: any) => ({ ...toRaw(m), data: { ...toRaw(m.data) } }))
      : undefined,
  };
}
const messages = computed(() => messagesStore.messages.map(deepToRawMessage));
</script>

<style scoped>
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

.chat-sidebar {
  @apply h-full bg-white flex flex-col;
}

.chat-sidebar__header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.chat-sidebar__channel-info {
  @apply flex items-center space-x-3;
}

.chat-sidebar__channel-details {
  @apply min-w-0;
}

.chat-sidebar__channel-name {
  @apply text-lg font-semibold text-gray-900 truncate;
}

.chat-sidebar__channel-meta {
  @apply text-sm text-gray-500;
}

.chat-sidebar__close {
  @apply p-1 rounded-md text-gray-400 hover:text-gray-600 focus:outline-none;
}

.chat-sidebar__content {
  @apply flex-1 overflow-hidden;
}

.chat-sidebar__empty {
  @apply h-full flex items-center justify-center;
}

.chat-sidebar__messages-container {
  @apply h-full flex flex-col;
}

.chat-sidebar__loading {
  @apply flex items-center justify-center p-8 text-gray-500;
}

.chat-sidebar__messages {
  @apply flex-1 overflow-y-auto p-4 space-y-4;
}

.chat-sidebar__message {
  @apply flex w-full mb-2;
}

.chat-sidebar__message--own {
  @apply flex-row;
}

.chat-sidebar__message:not(.chat-sidebar__message--own) {
  @apply flex-row;
}

.chat-sidebar__message-content {
  @apply flex flex-col max-w-xl;
}

.chat-sidebar__message-header {
  @apply flex items-center space-x-2 mb-1;
}

.chat-sidebar__message-author {
  @apply text-sm font-medium text-gray-900;
}

.chat-sidebar__message-time {
  @apply text-xs text-gray-500;
}

.chat-sidebar__message-text {
  @apply text-sm text-gray-800 whitespace-pre-wrap;
}

.chat-sidebar__typing {
  @apply px-4 py-2;
}

.chat-sidebar__input {
  @apply border-t border-gray-200 p-4;
}

.chat-sidebar__input-container {
  @apply flex items-end space-x-2;
}

.chat-sidebar__input-field {
  @apply flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2;
  @apply focus:outline-none focus:ring-2 focus:ring-dtf-orange focus:border-transparent;
  @apply max-h-32;
}

.chat-sidebar__attach-btn,
.chat-sidebar__emoji-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 focus:outline-none;
}

.chat-sidebar__send-btn {
  @apply p-2 bg-dtf-orange text-white rounded-lg hover:bg-dtf-orange/90;
  @apply focus:outline-none focus:ring-2 focus:ring-dtf-orange focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Typing indicator animation */
.typing-indicator {
  @apply flex space-x-1;
}

.typing-indicator span {
  @apply w-2 h-2 bg-gray-400 rounded-full animate-pulse;
  animation: typing 1.4s ease-in-out infinite both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Dark mode */
.dark .chat-sidebar {
  @apply bg-gray-800;
}

.dark .chat-sidebar__channel-name {
  @apply text-gray-100;
}

.dark .chat-sidebar__message-author {
  @apply text-gray-100;
}

.dark .chat-sidebar__message-text {
  @apply text-gray-200;
}

.dark .chat-sidebar__input-field {
  @apply bg-gray-700 border-gray-600 text-gray-100;
}

.chat-sidebar__message-bubble {
  @apply px-4 py-2 rounded-2xl max-w-xl break-words transition-colors duration-200;
}
.chat-sidebar__message--own .chat-sidebar__message-bubble {
  @apply bg-dtf-orange text-white rounded-br-md rounded-tl-2xl rounded-bl-2xl;
}
.chat-sidebar__message:not(.chat-sidebar__message--own)
  .chat-sidebar__message-bubble {
  @apply bg-gray-100 text-gray-900 rounded-bl-md rounded-tr-2xl rounded-br-2xl;
}
.dark
  .chat-sidebar__message:not(.chat-sidebar__message--own)
  .chat-sidebar__message-bubble {
  @apply bg-gray-700 text-gray-100;
}

.channel__popover__messages {
  height: 320px;
  overflow-x: hidden;
  overflow-y: auto;
  min-width: 0;
  max-width: 100%;
}
.channel__popover__messages__content {
}
.channel__popover__messages__message {
  display: flex;
  align-items: flex-start;
  padding: 6px 10px;
  margin: 4px 0;
  background: #fafbfc;
  border-radius: 10px;
  border: 1px solid #ececec;
  font-size: 14px;
  min-width: 0;
  max-width: 100%;
  word-break: break-word;
}
.channel__popover__messages__message__image {
  display: flex;
  align-items: flex-start;
  margin-right: 8px;
}
.channel__popover__messages__message__image img,
.channel__popover__messages__message__image picture {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  object-fit: cover;
  background: #eee;
}
.channel__popover__messages__message__body {
  flex: 1 1 auto;
  min-width: 0;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.4;
  color: #222;
}
.channel__popover__messages__message__body b {
  font-weight: 600;
  font-size: 14px;
}
.channel__popover__messages__message__body div {
  line-height: 1.4;
}
.channel__popover__messages__message__media {
  margin: 5px 0 0 0;
}
.channel__popover__messages__message__media img,
.channel__popover__messages__message__media video {
  max-width: 160px;
  max-height: 100px;
  border-radius: 8px;
  margin-top: 2px;
}
.channel__popover__messages__message__date {
  align-self: flex-end;
  margin-left: 8px;
  white-space: nowrap;
  font-size: 12px;
  color: #888;
  line-height: 1;
}
</style>
