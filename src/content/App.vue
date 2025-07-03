<template>
  <div id="dtf-messenger-app">
    <!-- Chat Button in DTF Header -->
    <ChatButton 
      v-if="showChatButton"
      @click="handleChatButtonClick"
    />
    
    <!-- Main Chat Interface -->
    <Teleport to="body">
      <div 
        v-if="uiStore.isChatSidebarOpen"
        class="fixed inset-0 z-[9999] pointer-events-none"
      >
        <!-- Backdrop for mobile -->
        <div 
          v-if="uiStore.isMobile && (uiStore.isChannelsListOpen || uiStore.isChatSidebarOpen)"
          class="absolute inset-0 bg-black/50 pointer-events-auto"
          @click="closeMobileOverlays"
        />
        
        <!-- Channels List -->
        <div 
          v-if="uiStore.canShowChannelsList && uiStore.isChannelsListOpen"
          class="absolute top-0 left-0 h-full w-80 pointer-events-auto"
        >
          <ChannelsList @select-channel="handleChannelSelect" />
        </div>
        
        <!-- Chat Sidebar -->
        <div 
          v-if="uiStore.canShowChatSidebar && uiStore.isChatSidebarOpen"
          class="absolute top-0 right-0 h-full w-96 pointer-events-auto"
        >
          <ChatSidebar />
        </div>
      </div>
    </Teleport>
    
    <!-- Global Notifications -->
    <NotificationContainer />
    
    <!-- Global Loading -->
    <div 
      v-if="uiStore.isGlobalLoading"
      class="fixed inset-0 z-[10000] bg-black/20 flex items-center justify-center pointer-events-auto"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <div class="flex items-center space-x-3">
          <LoadingSpinner />
          <span class="text-gray-700 dark:text-gray-300">
            {{ uiStore.loadingMessage || 'Загрузка...' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChannelsStore } from '@/stores/channels'
import { useUIStore } from '@/stores/ui'
import { useAuth } from '@/composables/useAuth'
import { useDTFIntegration } from '@/composables/useDTFIntegration'

// Components
import ChatButton from './components/ChatButton.vue'
import ChannelsList from './components/ChannelsList.vue'
import ChatSidebar from './components/ChatSidebar.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

// Stores
const authStore = useAuthStore()
const channelsStore = useChannelsStore()
const uiStore = useUIStore()

// Composables
const { initialize: initAuth } = useAuth()
const dtfIntegration = useDTFIntegration()

// Computed
const showChatButton = computed(() => {
  // Only show button if we're on DTF.ru and user is authenticated
  return window.location.hostname === 'dtf.ru' && authStore.isAuthenticated
})

// Methods
function handleChatButtonClick() {
  if (uiStore.isChatSidebarOpen) {
    uiStore.setChatSidebarOpen(false)
    uiStore.setChannelsListOpen(false)
  } else {
    uiStore.setChatSidebarOpen(true)
    
    // Auto-open channels list if no active channel
    if (!channelsStore.activeChannelId) {
      uiStore.setChannelsListOpen(true)
    }
  }
}

function handleChannelSelect(channelId: number) {
  channelsStore.setActiveChannel(channelId)
  
  // On mobile, close channels list and ensure chat sidebar is open
  if (uiStore.isMobile) {
    uiStore.setChannelsListOpen(false)
    uiStore.setChatSidebarOpen(true)
  }
}

function closeMobileOverlays() {
  if (uiStore.isMobile) {
    uiStore.setChannelsListOpen(false)
    uiStore.setChatSidebarOpen(false)
  }
}

// Initialize DTF Messenger Button in Header
function injectChatButton() {
  // Use the improved DTF integration
  dtfIntegration.injectChatButton()
}

// Initialize extension
async function initialize() {
  console.log('DTF Messenger: Initializing...')
  
  try {
    // Initialize UI store
    uiStore.initialize()
    
    // Initialize authentication
    await initAuth()
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true })
      })
    }
    
    // Inject chat button into DTF header
    injectChatButton()
    
    // Initialize channels if authenticated
    if (authStore.isAuthenticated) {
      channelsStore.initialize()
    }
    
    console.log('DTF Messenger: Successfully initialized')
  } catch (error) {
    console.error('DTF Messenger: Initialization failed:', error)
    uiStore.setGlobalError('Ошибка инициализации DTF Messenger')
  }
}

// Lifecycle
onMounted(initialize)

onUnmounted(() => {
  // Cleanup
  authStore.destroy()
  channelsStore.destroy()
  uiStore.destroy()
})

// Handle page navigation (SPA support)
let currentUrl = window.location.href

function handleUrlChange() {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href
    
    // Re-inject button if needed
    setTimeout(() => {
      const existingContainer = document.getElementById('dtf-messenger-button-container')
      if (!existingContainer) {
        injectChatButton()
      }
    }, 1000)
  }
}

// Listen for navigation changes
const observer = new MutationObserver(handleUrlChange)
observer.observe(document.body, { childList: true, subtree: true })

onUnmounted(() => {
  observer.disconnect()
})
</script>

<style scoped>
/* DTF-specific styling */
.dtf-messenger-button-container {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
}

/* Ensure our overlays appear above DTF content */
#dtf-messenger-app {
  position: relative;
  z-index: 9999;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .w-80 {
    width: 100vw;
  }
  
  .w-96 {
    width: 100vw;
  }
}
</style>
