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
              class="chat-sidebar__message"
              :class="{ 'chat-sidebar__message--own': isOwnMessage(message) }"
            >
              <div class="chat-sidebar__message-avatar">
                <img
                  v-if="message.author.avatar_url"
                  :src="message.author.avatar_url"
                  :alt="message.author.name || 'User'"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm"
                >
                  {{ getUserInitials(message.author.name || "User") }}
                </div>
              </div>

              <div class="chat-sidebar__message-content">
                <div class="chat-sidebar__message-header">
                  <span class="chat-sidebar__message-author">{{
                    message.author.name
                  }}</span>
                  <span class="chat-sidebar__message-time">{{
                    formatMessageTime(message.dtCreated)
                  }}</span>
                </div>

                <div class="chat-sidebar__message-body">
                  <p
                    v-if="message.type === 'text' || !message.type"
                    class="chat-sidebar__message-text"
                  >
                    {{ message.text }}
                  </p>
                  <div
                    v-else-if="
                      message.type === 'media' &&
                      message.media &&
                      message.media[0]?.type === 'image'
                    "
                    class="chat-sidebar__message-image"
                  >
                    <img
                      :src="message.media[0]?.data?.url"
                      :alt="message.text"
                      class="max-w-xs rounded-lg"
                    />
                    <p v-if="message.text" class="mt-1">{{ message.text }}</p>
                  </div>
                  <div
                    v-else-if="message.type === 'media' && message.media"
                    class="chat-sidebar__message-file"
                  >
                    <div class="flex items-center p-3 bg-gray-100 rounded-lg">
                      <svg
                        class="w-6 h-6 text-gray-600 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <span>{{
                        message.text || message.media[0]?.data?.name || "Файл"
                      }}</span>
                    </div>
                  </div>
                </div>
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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useChannelsStore } from "@/stores/channels";
import { useMessagesStore } from "@/stores/messages";
import { useUIStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { formatMessageTime } from "@/utils/date";
import LoadingSpinner from "./LoadingSpinner.vue";

// Stores
const channelsStore = useChannelsStore();
const messagesStore = useMessagesStore();
const uiStore = useUIStore();
const authStore = useAuthStore();

// Refs
const messagesContainer = ref<HTMLElement>();
const messageInput = ref<HTMLTextAreaElement>();

// State
const messageText = ref("");
const isSending = ref(false);

// Computed
const activeChannel = computed(() => channelsStore.activeChannel);
const messages = computed(() => messagesStore.messages);
const typingUsers = computed(() => messagesStore.typingUsers);

const canSendMessage = computed(() => {
  return messageText.value.trim().length > 0 && !isSending.value;
});

// Methods
function getUserInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function isOwnMessage(message: any): boolean {
  return message.author.id === authStore.user?.id;
}

function getTypingText(
  users: readonly {
    readonly id: number;
    readonly name: string;
    readonly avatar: string;
    readonly startedAt: number;
  }[]
): string {
  if (users.length === 1) {
    return `${users[0].name} печатает...`;
  } else if (users.length === 2) {
    return `${users[0].name} и ${users[1].name} печатают...`;
  } else {
    return `${users[0].name} и еще ${users.length - 1} печатают...`;
  }
}

function closeChatSidebar() {
  uiStore.setChatSidebarOpen(false);
}

function toggleMediaUpload() {
  uiStore.setMediaUploadOpen(!uiStore.isMediaUploadOpen);
}

function toggleEmojiPicker() {
  uiStore.setEmojiPickerOpen(!uiStore.isEmojiPickerOpen);
}

function handleInput() {
  // Auto-resize textarea
  if (messageInput.value) {
    messageInput.value.style.height = "auto";
    messageInput.value.style.height = messageInput.value.scrollHeight + "px";
  }

  // Handle typing indicator
  messagesStore.setTyping(true);
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

async function sendMessage() {
  if (!canSendMessage.value || !activeChannel.value) {
    return;
  }

  const text = messageText.value.trim();
  messageText.value = "";
  isSending.value = true;

  try {
    await messagesStore.sendMessage({
      channelId: activeChannel.value.id,
      text,
      type: "text",
    });

    // Reset textarea height
    if (messageInput.value) {
      messageInput.value.style.height = "auto";
    }
  } catch (error) {
    console.error("Failed to send message:", error);
    uiStore.addNotification({
      type: "error",
      title: "Ошибка",
      message: "Не удалось отправить сообщение",
    });

    // Restore message text on error
    messageText.value = text;
  } finally {
    isSending.value = false;
    messagesStore.setTyping(false);
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    nextTick(() => {
      messagesContainer.value!.scrollTop =
        messagesContainer.value!.scrollHeight;
    });
  }
}

// Watch for new messages and scroll to bottom
watch(
  messages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

// Watch for active channel changes
watch(activeChannel, (newChannel) => {
  if (newChannel) {
    messagesStore.loadMessages(newChannel.id);
    scrollToBottom();
  }
});

// Focus input when opening
onMounted(() => {
  if (messageInput.value) {
    messageInput.value.focus();
  }
});

onUnmounted(() => {
  messagesStore.setTyping(false);
});
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
  @apply flex items-start space-x-3;
}

.chat-sidebar__message--own {
  @apply flex-row-reverse space-x-reverse;
}

.chat-sidebar__message-content {
  @apply flex-1 min-w-0;
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
</style>
