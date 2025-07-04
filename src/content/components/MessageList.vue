<template>
  <div ref="messagesContainer" class="chat-sidebar__messages">
    <div
      v-for="message in messages"
      :key="message.id"
      class="chat-sidebar__message"
      :class="{
        'chat-sidebar__message--own': isOwnMessage(message),
      }"
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
    <div v-if="typingUsers.length > 0" class="chat-sidebar__typing">
      <div class="flex items-center space-x-2 p-3">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
        <span class="text-sm text-gray-500">{{
          getTypingText(typingUsers)
        }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import type { Message } from "@/types/api";
import type { TypingUser } from "@/types/message";
const {
  messages,
  typingUsers,
  isOwnMessage,
  getUserInitials,
  formatMessageTime,
  getTypingText,
} = defineProps<{
  messages: Message[];
  typingUsers: TypingUser[];
  isOwnMessage: (msg: Message) => boolean;
  getUserInitials: (name: string) => string;
  formatMessageTime: (date: number) => string;
  getTypingText: (users: TypingUser[]) => string;
}>();
const messagesContainer = ref<HTMLElement | null>(null);
onMounted(() => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
});
</script>
