<template>
  <div class="chat-sidebar__input-container">
    <button
      type="button"
      class="chat-sidebar__attach-btn"
      @click="props.onAttach"
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
      :value="props.modelValue"
      rows="1"
      placeholder="Написать сообщение..."
      class="chat-sidebar__input-field"
      @keydown="handleKeyDown"
      @input="handleInput"
    />
    <button
      type="button"
      class="chat-sidebar__emoji-btn"
      @click="props.onEmoji"
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
      :disabled="!props.canSendMessage"
      @click="props.onSend"
    >
      <LoadingSpinner v-if="props.isSending" small class="mr-2" />
      <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
        />
      </svg>
    </button>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import LoadingSpinner from "./LoadingSpinner.vue";

const props = defineProps<{
  modelValue: string;
  isSending: boolean;
  canSendMessage: boolean;
  onSend: () => void;
  onAttach: () => void;
  onEmoji: () => void;
  onInput: (e: Event) => void;
  onKeyDown: (e: KeyboardEvent) => void;
}>();
const emit = defineEmits(["update:modelValue"]);
const messageInput = ref<HTMLTextAreaElement | null>(null);

watch(
  () => props.modelValue,
  () => {
    if (messageInput.value) {
      messageInput.value.style.height = "auto";
      messageInput.value.style.height = messageInput.value.scrollHeight + "px";
    }
  }
);

function handleInput(e: Event) {
  const target = e.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
  props.onInput(e);
}

function handleKeyDown(e: KeyboardEvent) {
  props.onKeyDown(e);
}
</script>
