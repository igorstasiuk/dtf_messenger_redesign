<template>
  <transition-group name="notif-fade" tag="div">
    <div
      v-for="notif in notifications"
      :key="notif.id"
      class="fixed top-8 right-8 z-[1000000] w-full max-w-sm mb-4 last:mb-0 shadow-xl rounded-xl bg-white border border-gray-200 flex items-start p-4 gap-3 notif-item"
      :class="{
        'border-green-400': notif.type === 'success',
        'border-red-400': notif.type === 'error',
        'border-blue-400': notif.type === 'info',
        'border-yellow-400': notif.type === 'warning',
      }"
      style="pointer-events: auto"
    >
      <div class="flex-shrink-0 mt-1">
        <svg
          v-if="notif.type === 'success'"
          class="w-6 h-6 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <svg
          v-else-if="notif.type === 'error'"
          class="w-6 h-6 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <svg
          v-else-if="notif.type === 'info'"
          class="w-6 h-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01"
          />
        </svg>
        <svg
          v-else
          class="w-6 h-6 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01"
          />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-gray-900 mb-1">{{ notif.title }}</div>
        <div class="text-gray-700 text-sm">{{ notif.message }}</div>
      </div>
      <button
        class="ml-2 text-gray-400 hover:text-gray-700 focus:outline-none"
        @click="removeNotification(notif.id)"
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
  </transition-group>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUIStore } from "@/stores/ui";

// Stores
const uiStore = useUIStore();

// Computed
const notifications = computed(() => uiStore.notifications);

// Methods
function removeNotification(id: string) {
  uiStore.removeNotification(id);
}
</script>

<style scoped>
.notif-fade-enter-active,
.notif-fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.notif-fade-enter-from,
.notif-fade-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.98);
}
.notif-fade-enter-to,
.notif-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
