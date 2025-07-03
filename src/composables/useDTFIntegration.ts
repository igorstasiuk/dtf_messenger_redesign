import { ref, computed, readonly, onMounted, onUnmounted, watch } from 'vue'
import { useChannelsStore } from '@/stores/channels'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { DTFMessengerAPI } from '@/utils/api'

/**
 * DTF.ru specific integration composable
 * Handles DOM injection and site-specific functionality
 */
export function useDTFIntegration() {
  const channelsStore = useChannelsStore()
  const uiStore = useUIStore()
  const authStore = useAuthStore()
  
  // State
  const isInjected = ref(false)
  const profileButtonElement = ref<HTMLElement | null>(null)
  const isProfilePage = ref(false)
  
  // Computed
  const canShowProfileButton = computed(() => {
    return isProfilePage.value && authStore.isAuthenticated && !profileButtonElement.value
  })
  
  // Profile page detection
  function checkProfilePage(): boolean {
    const url = window.location.href
    const isProfile = url.includes('/u/') && !!url.match(/\/u\/\d+/)
    isProfilePage.value = isProfile
    return isProfile
  }
  
  // Extract user ID from profile URL
  function getUserIdFromProfile(): number | null {
    const url = window.location.href
    const match = url.match(/\/u\/(\d+)/)
    return match ? parseInt(match[1], 10) : null
  }
  
  // Chat button injection into header
  function injectChatButton(): HTMLElement | null {
    // Find DTF header notifications area
    const headerControls = document.querySelector('.site-header__user-actions, .site-header__controls')
    if (!headerControls) {
      console.warn('DTF Messenger: Header controls not found')
      return null
    }
    
    // Check if already injected
    if (document.getElementById('dtf-messenger-button')) {
      return document.getElementById('dtf-messenger-button')
    }
    
    // Create container for Vue component
    const container = document.createElement('div')
    container.id = 'dtf-messenger-button'
    container.className = 'dtf-messenger-button-container'
    
    // Insert before notifications (bell icon)
    const notificationButton = headerControls.querySelector('[data-module="notifications"]')
    if (notificationButton) {
      headerControls.insertBefore(container, notificationButton)
    } else {
      headerControls.appendChild(container)
    }
    
    console.log('DTF Messenger: Chat button container injected')
    return container
  }
  
  // Profile button injection
  function injectProfileButton(): HTMLElement | null {
    if (!canShowProfileButton.value) return null
    
    // Find profile header controls
    const profileControls = document.querySelector('.subsite-header__controls, .user-header__controls')
    if (!profileControls) {
      console.warn('DTF Messenger: Profile controls not found')
      return null
    }
    
    // Check if already injected
    if (document.getElementById('dtf-messenger-profile-button')) {
      return document.getElementById('dtf-messenger-profile-button')
    }
    
    // Get user ID from URL
    const userId = getUserIdFromProfile()
    if (!userId) {
      console.warn('DTF Messenger: Cannot extract user ID from profile URL')
      return null
    }
    
    // Create button element
    const button = document.createElement('button')
    button.id = 'dtf-messenger-profile-button'
    button.className = 'button button--size-m button--type-primary'
    button.style.background = '#8000ff'
    button.style.marginRight = '8px'
    button.textContent = 'Написать'
    
    // Add click handler
    button.addEventListener('click', async () => {
      await handleProfileButtonClick(userId)
    })
    
    // Insert at the beginning of controls
    profileControls.insertBefore(button, profileControls.firstChild)
    
    profileButtonElement.value = button
    console.log(`DTF Messenger: Profile button injected for user ${userId}`)
    return button
  }
  
  // Handle profile button click
  async function handleProfileButtonClick(userId: number) {
    if (!authStore.isAuthenticated) {
      uiStore.addNotification({
        type: 'warning',
        title: 'Авторизация',
        message: 'Необходимо войти в аккаунт для отправки сообщений'
      })
      return
    }
    
    try {
      uiStore.setGlobalLoading(true, 'Создание чата...')
      
      // Get or create channel with user
      const api = new DTFMessengerAPI(authStore.accessToken!)
      const response = await api.getOrCreateChannelWithUser(userId)
      
      if (response.success && response.result) {
        const channel = response.result.channel
        
        // Set active channel and open chat
        channelsStore.setActiveChannel(channel.id)
        uiStore.setChatSidebarOpen(true)
        
        uiStore.addNotification({
          type: 'success',
          title: 'Чат открыт',
          message: `Чат с пользователем создан`
        })
      } else {
        throw new Error(response.error?.message || 'Failed to create channel')
      }
    } catch (error) {
      console.error('DTF Messenger: Error creating channel:', error)
      uiStore.addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось создать чат с пользователем'
      })
    } finally {
      uiStore.setGlobalLoading(false)
    }
  }
  
  // Remove profile button
  function removeProfileButton() {
    if (profileButtonElement.value) {
      profileButtonElement.value.remove()
      profileButtonElement.value = null
    }
  }
  
  // Initialize on page load
  function initialize() {
    checkProfilePage()
    
    // Inject profile button if on profile page
    if (isProfilePage.value) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        injectProfileButton()
      }, 100)
    }
    
    isInjected.value = true
  }
  
  // Cleanup
  function destroy() {
    removeProfileButton()
    isInjected.value = false
  }
  
  // Watch for URL changes (SPA navigation)
  function watchUrlChanges() {
    let currentUrl = window.location.href
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href
        
        // Remove old profile button
        removeProfileButton()
        
        // Check new page
        checkProfilePage()
        
        // Re-inject if needed
        if (isProfilePage.value) {
          setTimeout(() => {
            injectProfileButton()
          }, 500) // Longer delay for SPA navigation
        }
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    return observer
  }
  
  // Auto-initialization
  onMounted(() => {
    initialize()
    const urlObserver = watchUrlChanges()
    
    onUnmounted(() => {
      destroy()
      urlObserver.disconnect()
    })
  })
  
  // Watch auth state changes
  watch(() => authStore.isAuthenticated, (isAuth) => {
    if (isAuth && isProfilePage.value && !profileButtonElement.value) {
      setTimeout(() => {
        injectProfileButton()
      }, 100)
    }
  })
  
  return {
    // State
    isInjected: readonly(isInjected),
    isProfilePage: readonly(isProfilePage),
    
    // Methods
    injectChatButton,
    injectProfileButton,
    removeProfileButton,
    getUserIdFromProfile,
    checkProfilePage,
    initialize,
    destroy
  }
} 