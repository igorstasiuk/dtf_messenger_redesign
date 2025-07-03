<template>
  <div class="chat-button-container">
    <button
      type="button"
      class="chat-button"
      :class="{ 'chat-button--active': isActive }"
      @click="handleClick"
      :title="tooltipText"
    >
      <!-- Chat Icon -->
      <svg 
        class="chat-button__icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.761 20 11.5 20C10.454 20 9.448 19.848 8.5 19.571L3 21L4.429 15.5C4.152 14.552 4 13.546 4 12.5C4 8.082 8.239 4.5 13.5 4.5C18.761 4.5 23 8.082 23 12.5Z"
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </svg>
      
      <!-- Unread Badge -->
      <div 
        v-if="unreadCount > 0"
        class="chat-button__badge"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChannelsStore } from '@/stores/channels'
import { useUIStore } from '@/stores/ui'

// Emits
const emit = defineEmits<{
  click: []
}>()

// Stores
const channelsStore = useChannelsStore()
const uiStore = useUIStore()

// Computed
const isActive = computed(() => uiStore.isChatSidebarOpen)

const unreadCount = computed(() => {
  return channelsStore.channels.reduce((total, channel) => {
    return total + (channel.unreadCount || 0)
  }, 0)
})

const tooltipText = computed(() => {
  if (unreadCount.value > 0) {
    return `DTF Messenger (${unreadCount.value} непрочитанных)`
  }
  return 'DTF Messenger'
})

// Methods
function handleClick() {
  emit('click')
}
</script>

<style scoped>
.chat-button-container {
  @apply relative inline-flex items-center;
}

.chat-button {
  @apply relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200;
  @apply text-gray-600 hover:text-dtf-orange hover:bg-gray-100;
  @apply focus:outline-none focus:ring-2 focus:ring-dtf-orange focus:ring-opacity-50;
  
  /* Match DTF header button styles */
  background: transparent;
  border: none;
  cursor: pointer;
}

.chat-button--active {
  @apply text-dtf-orange bg-gray-100;
}

.chat-button__icon {
  @apply w-5 h-5;
}

.chat-button__badge {
  @apply absolute -top-1 -right-1 min-w-[16px] h-4 px-1;
  @apply bg-dtf-red text-white text-xs font-medium rounded-full;
  @apply flex items-center justify-center leading-none;
}

/* Dark mode */
.dark .chat-button {
  @apply text-gray-400 hover:text-dtf-orange hover:bg-gray-800;
}

.dark .chat-button--active {
  @apply text-dtf-orange bg-gray-800;
}

/* High specificity to override DTF styles */
.dtf-messenger-button-container .chat-button {
  all: unset;
  @apply relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200;
  @apply text-gray-600 hover:text-dtf-orange hover:bg-gray-100;
  @apply focus:outline-none focus:ring-2 focus:ring-dtf-orange focus:ring-opacity-50;
  cursor: pointer;
}

.dtf-messenger-button-container .chat-button--active {
  @apply text-dtf-orange bg-gray-100;
}

/* Ensure proper spacing in DTF header */
.dtf-messenger-button-container {
  @apply mr-2;
}
</style> 