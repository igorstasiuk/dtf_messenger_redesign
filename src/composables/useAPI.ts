import { ref, computed, onMounted } from 'vue'
import { dtfAPI } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import type { APIResponse } from '@/types/api'

/**
 * API composable with error handling and retry logic
 */
export function useAPI() {
  const authStore = useAuthStore()
  const uiStore = useUIStore()

  // Local state for request tracking
  const activeRequests = ref(new Set<string>())
  const requestErrors = ref<Record<string, string>>({})

  // Computed
  const isLoading = computed(() => activeRequests.value.size > 0)
  const hasErrors = computed(() => Object.keys(requestErrors.value).length > 0)

  // Helper to track requests
  function trackRequest(key: string) {
    activeRequests.value.add(key)
  }

  function untrackRequest(key: string) {
    activeRequests.value.delete(key)
    delete requestErrors.value[key]
  }

  function setRequestError(key: string, error: string) {
    requestErrors.value[key] = error
  }

  // Generic API call wrapper with error handling and retry
  async function makeAPICall<T>(
    requestKey: string,
    apiCall: () => Promise<APIResponse<T>>,
    options: {
      retries?: number
      showErrorNotification?: boolean
      showLoadingIndicator?: boolean
    } = {}
  ): Promise<T | null> {
    const { 
      retries = 2, 
      showErrorNotification = true,
      showLoadingIndicator = false
    } = options

    trackRequest(requestKey)
    
    if (showLoadingIndicator) {
      uiStore.setGlobalLoading(true, `Выполняется ${requestKey}...`)
    }

    let lastError: string = ''

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await apiCall()
        
        if (response.success && response.result) {
          untrackRequest(requestKey)
          
          if (showLoadingIndicator) {
            uiStore.setGlobalLoading(false)
          }
          
          return response.result
        } else {
          lastError = response.error?.message || 'Неизвестная ошибка'
          
          // Check if it's an auth error
          if (response.error && (response.error.code === 401 || response.error.code === 403)) {
            console.warn('DTF Messenger: Authentication error, clearing session')
            authStore.clearAuth()
            break // Don't retry auth errors
          }
          
          // Retry on network errors
          if (attempt < retries && response.error && (response.error.code === 0 || response.error.code >= 500)) {
            const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
          
          break
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Ошибка сети'
        
        // Retry on network errors
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        break
      }
    }

    // Handle final error
    setRequestError(requestKey, lastError)
    
    if (showErrorNotification) {
      uiStore.addNotification({
        type: 'error',
        title: 'Ошибка запроса',
        message: lastError,
        duration: 5000
      })
    }

    if (showLoadingIndicator) {
      uiStore.setGlobalLoading(false)
    }

    untrackRequest(requestKey)
    return null
  }

  // Channel API methods
  const channelsAPI = {
    getChannels: () => makeAPICall(
      'channels-list',
      () => dtfAPI.getChannels(),
      { showErrorNotification: true }
    ),

    getChannel: (id: number) => makeAPICall(
      `channel-${id}`,
      () => dtfAPI.getChannel(id),
      { showErrorNotification: true }
    ),

    createChannelWithUser: (userId: number) => makeAPICall(
      `create-channel-${userId}`,
      () => dtfAPI.getOrCreateChannelWithUser(userId),
      { showErrorNotification: true, showLoadingIndicator: true }
    )
  }

  // Messages API methods
  const messagesAPI = {
    getMessages: (channelId: number, beforeTime?: number, limit?: number) => makeAPICall(
      `messages-${channelId}`,
      () => dtfAPI.getMessages({ channelId, beforeTime, limit }),
      { showErrorNotification: true }
    ),

    sendMessage: (channelId: number, text: string, _media: File[] = []) => makeAPICall(
      `send-message-${channelId}`,
      () => dtfAPI.sendMessage({ 
        channelId, 
        text, 
        media: [],
        ts: Math.floor(Date.now() / 1000),
        idTmp: Date.now().toString()
      }),
      { showErrorNotification: true, retries: 1 }
    ),

    markAsRead: (channelId: number, messageIds: number[]) => makeAPICall(
      `mark-read-${channelId}`,
      () => dtfAPI.markAsRead(channelId, messageIds),
      { showErrorNotification: false, retries: 1 }
    )
  }

  // Media API methods
  const mediaAPI = {
    uploadFile: (file: File) => makeAPICall(
      `upload-${file.name}`,
      () => dtfAPI.uploadFile(file),
      { showErrorNotification: true, showLoadingIndicator: true, retries: 1 }
    )
  }

  // User API methods
  const userAPI = {
    searchUsers: (query: string, limit = 10) => makeAPICall(
      `search-users-${query}`,
      () => dtfAPI.searchUsers(query, limit),
      { showErrorNotification: false }
    ),

    getUserProfile: () => makeAPICall(
      'user-profile',
      () => dtfAPI.getUserProfile(),
      { showErrorNotification: true }
    )
  }

  // Utility methods
  function clearErrors() {
    requestErrors.value = {}
  }

  function clearError(requestKey: string) {
    delete requestErrors.value[requestKey]
  }

  function getError(requestKey: string): string | null {
    return requestErrors.value[requestKey] || null
  }

  function isRequestLoading(requestKey: string): boolean {
    return activeRequests.value.has(requestKey)
  }

  // Health check
  async function healthCheck() {
    return makeAPICall(
      'health-check',
      () => dtfAPI.healthCheck(),
      { showErrorNotification: false, retries: 0 }
    )
  }

  // Initialize API client with auth token
  onMounted(() => {
    const token = authStore.accessToken
    if (token) {
      dtfAPI.setAccessToken(token)
    }
  })

  return {
    // State
    isLoading,
    hasErrors,
    requestErrors: computed(() => requestErrors.value),

    // API groups
    channelsAPI,
    messagesAPI,
    mediaAPI,
    userAPI,

    // Utilities
    makeAPICall,
    clearErrors,
    clearError,
    getError,
    isRequestLoading,
    healthCheck,

    // Direct API access
    api: dtfAPI
  }
}
