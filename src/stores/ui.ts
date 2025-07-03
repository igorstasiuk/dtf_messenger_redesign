import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // Main UI state
  const isChannelsListOpen = ref(false)
  const isChatSidebarOpen = ref(false)
  const isEmojiPickerOpen = ref(false)
  const isMediaUploadOpen = ref(false)
  const isSettingsOpen = ref(false)

  // Theme management
  const theme = ref<'light' | 'dark' | 'auto'>('auto')
  const systemTheme = ref<'light' | 'dark'>('light')

  // Notification state
  const notifications = ref<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
    timestamp: number
  }>>([])

  // Loading states
  const isGlobalLoading = ref(false)
  const loadingMessage = ref<string | null>(null)

  // Window/viewport state
  const windowWidth = ref(window.innerWidth)
  const windowHeight = ref(window.innerHeight)
  const isMobile = ref(window.innerWidth < 768)

  // Error state
  const globalError = ref<string | null>(null)

  // Computed
  const currentTheme = computed(() => {
    if (theme.value === 'auto') {
      return systemTheme.value
    }
    return theme.value
  })

  const isDarkMode = computed(() => {
    return currentTheme.value === 'dark'
  })

  const isSidebarMode = computed(() => {
    return windowWidth.value >= 1024 // lg breakpoint
  })

  const canShowChannelsList = computed(() => {
    return !isMobile.value || !isChatSidebarOpen.value
  })

  const canShowChatSidebar = computed(() => {
    return !isMobile.value || !isChannelsListOpen.value
  })

  // Actions
  function setChannelsListOpen(open: boolean) {
    isChannelsListOpen.value = open
    
    // On mobile, close chat sidebar when opening channels list
    if (isMobile.value && open) {
      isChatSidebarOpen.value = false
    }
  }

  function setChatSidebarOpen(open: boolean) {
    isChatSidebarOpen.value = open
    
    // On mobile, close channels list when opening chat sidebar
    if (isMobile.value && open) {
      isChannelsListOpen.value = false
    }
  }

  function toggleChannelsList() {
    setChannelsListOpen(!isChannelsListOpen.value)
  }

  function toggleChatSidebar() {
    setChatSidebarOpen(!isChatSidebarOpen.value)
  }

  function setEmojiPickerOpen(open: boolean) {
    isEmojiPickerOpen.value = open
  }

  function setMediaUploadOpen(open: boolean) {
    isMediaUploadOpen.value = open
  }

  function setSettingsOpen(open: boolean) {
    isSettingsOpen.value = open
  }

  function closeAllModals() {
    isEmojiPickerOpen.value = false
    isMediaUploadOpen.value = false
    isSettingsOpen.value = false
  }

  // Theme management
  function setTheme(newTheme: 'light' | 'dark' | 'auto') {
    theme.value = newTheme
    applyTheme()
    persistTheme()
  }

  function setSystemTheme(newSystemTheme: 'light' | 'dark') {
    systemTheme.value = newSystemTheme
    applyTheme()
  }

  function applyTheme() {
    const effectiveTheme = currentTheme.value
    
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#202124' : '#ffffff')
    }
  }

  function persistTheme() {
    try {
      localStorage.setItem('dtf-messenger-theme', theme.value)
    } catch (error) {
      console.warn('DTF Messenger: Failed to persist theme preference:', error)
    }
  }

  function loadTheme() {
    try {
      const stored = localStorage.getItem('dtf-messenger-theme')
      if (stored && ['light', 'dark', 'auto'].includes(stored)) {
        theme.value = stored as 'light' | 'dark' | 'auto'
      }
    } catch (error) {
      console.warn('DTF Messenger: Failed to load theme preference:', error)
    }
  }

  // Notification management
  function addNotification(notification: {
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }) {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const duration = notification.duration || 5000

    const newNotification = {
      id,
      ...notification,
      timestamp: Date.now()
    }

    notifications.value.push(newNotification)

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index >= 0) {
      notifications.value.splice(index, 1)
    }
  }

  function clearNotifications() {
    notifications.value = []
  }

  // Loading state
  function setGlobalLoading(loading: boolean, message?: string) {
    isGlobalLoading.value = loading
    loadingMessage.value = message || null
  }

  // Error handling
  function setGlobalError(error: string | null) {
    globalError.value = error
    
    if (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: error,
        duration: 8000
      })
    }
  }

  // Window size management
  function updateWindowSize() {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
    isMobile.value = window.innerWidth < 768
  }

  function setupWindowListeners() {
    window.addEventListener('resize', updateWindowSize)
    
    // System theme detection
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    
    mediaQuery.addEventListener('change', (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    })
  }

  function removeWindowListeners() {
    window.removeEventListener('resize', updateWindowSize)
  }

  // Keyboard shortcuts
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Escape key - close modals
      if (e.key === 'Escape') {
        closeAllModals()
      }
      
      // Ctrl/Cmd + K - toggle channels list
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        toggleChannelsList()
      }
      
      // Ctrl/Cmd + Shift + T - toggle theme
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
      }
    })
  }

  // Initialization
  function initialize() {
    loadTheme()
    applyTheme()
    setupWindowListeners()
    setupKeyboardShortcuts()
    updateWindowSize()
  }

  function destroy() {
    removeWindowListeners()
    clearNotifications()
  }

  // Public API
  return {
    // UI State
    isChannelsListOpen: readonly(isChannelsListOpen),
    isChatSidebarOpen: readonly(isChatSidebarOpen),
    isEmojiPickerOpen: readonly(isEmojiPickerOpen),
    isMediaUploadOpen: readonly(isMediaUploadOpen),
    isSettingsOpen: readonly(isSettingsOpen),
    
    // Theme
    theme: readonly(theme),
    systemTheme: readonly(systemTheme),
    currentTheme,
    isDarkMode,
    
    // Layout
    windowWidth: readonly(windowWidth),
    windowHeight: readonly(windowHeight),
    isMobile: readonly(isMobile),
    isSidebarMode,
    canShowChannelsList,
    canShowChatSidebar,
    
    // Notifications
    notifications: readonly(notifications),
    
    // Loading & Errors
    isGlobalLoading: readonly(isGlobalLoading),
    loadingMessage: readonly(loadingMessage),
    globalError: readonly(globalError),
    
    // Actions
    setChannelsListOpen,
    setChatSidebarOpen,
    toggleChannelsList,
    toggleChatSidebar,
    setEmojiPickerOpen,
    setMediaUploadOpen,
    setSettingsOpen,
    closeAllModals,
    
    // Theme Actions
    setTheme,
    setSystemTheme,
    applyTheme,
    
    // Notification Actions
    addNotification,
    removeNotification,
    clearNotifications,
    
    // Loading Actions
    setGlobalLoading,
    
    // Error Actions
    setGlobalError,
    
    // Utilities
    updateWindowSize,
    initialize,
    destroy
  }
}) 