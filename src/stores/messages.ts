import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { Message } from '@/types/api'
import type { TypingUser } from '@/types/message'
import { dtfAPI } from '@/utils/api'
import { useAuthStore } from './auth'
import { useChannelsStore } from './channels'
import { getCurrentTimestamp } from '@/utils/date'

export const useMessagesStore = defineStore('messages', () => {
  // State
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const hasMoreMessages = ref(true)
  const error = ref<string | null>(null)
  const lastFetch = ref<number | null>(null)
  const typingUsers = ref<TypingUser[]>([])
  const scrollPosition = ref(0)

  // Message composition state
  const draftText = ref('')
  const uploadingFiles = ref<File[]>([])
  const isUploading = ref(false)
  const uploadProgress = ref<Record<string, number>>({})

  // Computed
  const sortedMessages = computed(() => {
    return [...messages.value].sort((a, b) => a.dtCreated - b.dtCreated)
  })

  const unreadCount = computed(() => {
    return messages.value.filter(message => !message.isRead).length
  })

  const latestMessage = computed(() => {
    const sorted = sortedMessages.value
    return sorted.length > 0 ? sorted[sorted.length - 1] : null
  })

  const oldestMessage = computed(() => {
    const sorted = sortedMessages.value
    return sorted.length > 0 ? sorted[0] : null
  })

  // Actions
  function setMessages(newMessages: Message[]) {
    messages.value = newMessages
    lastFetch.value = Date.now()
  }

  function addMessage(message: Message) {
    const existingIndex = messages.value.findIndex(m => m.id === message.id)
    
    if (existingIndex >= 0) {
      messages.value[existingIndex] = message
    } else {
      messages.value.push(message)
    }
  }

  function prependMessages(newMessages: Message[]) {
    const uniqueMessages = newMessages.filter(
      newMsg => !messages.value.some(existing => existing.id === newMsg.id)
    )
    messages.value.unshift(...uniqueMessages)
  }

  function appendMessages(newMessages: Message[]) {
    const uniqueMessages = newMessages.filter(
      newMsg => !messages.value.some(existing => existing.id === newMsg.id)
    )
    messages.value.push(...uniqueMessages)
  }

  function updateMessage(messageId: number, updates: Partial<Message>) {
    const index = messages.value.findIndex(m => m.id === messageId)
    if (index >= 0) {
      messages.value[index] = { ...messages.value[index], ...updates }
    }
  }

  function removeMessage(messageId: number) {
    const index = messages.value.findIndex(m => m.id === messageId)
    if (index >= 0) {
      messages.value.splice(index, 1)
    }
  }

  function markAsRead(messageIds: number[]) {
    messageIds.forEach(id => {
      const message = messages.value.find(m => m.id === id)
      if (message) {
        message.isRead = true
      }
    })
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setError(newError: string | null) {
    error.value = newError
  }

  function clearMessages() {
    messages.value = []
    hasMoreMessages.value = true
    lastFetch.value = null
    clearTyping()
    clearDraft()
  }

  // Typing indicators
  function addTypingUser(user: TypingUser) {
    const existingIndex = typingUsers.value.findIndex(u => u.id === user.id)
    if (existingIndex >= 0) {
      typingUsers.value[existingIndex] = user
    } else {
      typingUsers.value.push(user)
    }

    setTimeout(() => {
      removeTypingUser(user.id)
    }, 5000)
  }

  function removeTypingUser(userId: number) {
    const index = typingUsers.value.findIndex(u => u.id === userId)
    if (index >= 0) {
      typingUsers.value.splice(index, 1)
    }
  }

  function clearTyping() {
    typingUsers.value = []
  }

  // Typing management helpers
  function setTyping(isTyping: boolean) {
    const authStore = useAuthStore()
    if (!authStore.user) return
    
    if (isTyping) {
      addTypingUser({
        id: authStore.user.id,
        name: authStore.user.name || 'User',
        avatar: authStore.user.avatar_url || '',
        startedAt: Date.now()
      })
    } else {
      removeTypingUser(authStore.user.id)
    }
  }

  // Draft management
  function setDraftText(text: string) {
    draftText.value = text
  }

  function clearDraft() {
    draftText.value = ''
    uploadingFiles.value = []
    uploadProgress.value = {}
  }

  function setScrollPosition(position: number) {
    scrollPosition.value = position
  }

  // API Actions
  async function fetchMessages(channelId: number, beforeTime?: number, limit = 50) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      setError('Not authenticated')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const response = await dtfAPI.getMessages({
        channelId,
        beforeTime,
        limit
      })
      
      if (response.success && response.result) {
        const newMessages = response.result.messages
        
        if (beforeTime) {
          prependMessages(newMessages)
        } else {
          setMessages(newMessages)
        }
        
        hasMoreMessages.value = newMessages.length === limit
        
        console.log(`DTF Messenger: Loaded ${newMessages.length} messages for channel ${channelId}`)
        return true
      } else {
        setError(response.error?.message || 'Failed to load messages')
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      console.error('DTF Messenger: Error fetching messages:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage(params: { channelId: number, text: string, media?: File[], type?: string }) {
    const { channelId, text, media = [], type: _type = 'text' } = params
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      setError('Not authenticated')
      return null
    }

    if (!text.trim() && media.length === 0) {
      setError('Message cannot be empty')
      return null
    }

    setError(null)

    try {
      let uploadedMedia: any[] = []
      
      if (media.length > 0) {
        isUploading.value = true
        
        for (const file of media) {
          try {
            const uploadResponse = await dtfAPI.uploadFile(file)
            if (uploadResponse.success && uploadResponse.result) {
              uploadedMedia.push(uploadResponse.result)
            }
          } catch (uploadError) {
            console.error('DTF Messenger: Failed to upload file:', uploadError)
          }
        }
        
        isUploading.value = false
      }

      const response = await dtfAPI.sendMessage({
        channelId,
        text: text.trim(),
        media: uploadedMedia,
        ts: getCurrentTimestamp(),
        idTmp: getCurrentTimestamp().toString()
      })
      
      if (response.success && response.result) {
        const newMessage = response.result.message
        addMessage(newMessage)
        
        const channelsStore = useChannelsStore()
        channelsStore.updateChannel(channelId, {
          lastMessage: newMessage
        })
        
        clearDraft()
        console.log('DTF Messenger: Message sent successfully')
        return newMessage
      } else {
        setError(response.error?.message || 'Failed to send message')
        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      console.error('DTF Messenger: Error sending message:', error)
      return null
    }
  }

  async function markChannelAsRead(channelId: number) {
    const unreadMessages = messages.value.filter(m => !m.isRead)
    if (unreadMessages.length === 0) return

    const messageIds = unreadMessages.map(m => m.id)
    
    try {
      const response = await dtfAPI.markAsRead(channelId, messageIds)
      if (response.success) {
        markAsRead(messageIds)
        
        const channelsStore = useChannelsStore()
        channelsStore.updateUnreadCount(channelId, 0)
      }
    } catch (error) {
      console.error('DTF Messenger: Error marking messages as read:', error)
    }
  }

  // Alias for component compatibility
  function loadMessages(channelId: number) {
    return fetchMessages(channelId)
  }

  // Public API
  return {
    // State
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    hasMoreMessages: readonly(hasMoreMessages),
    error: readonly(error),
    lastFetch: readonly(lastFetch),
    typingUsers: readonly(typingUsers),
    scrollPosition: readonly(scrollPosition),
    draftText: readonly(draftText),
    uploadingFiles: readonly(uploadingFiles),
    isUploading: readonly(isUploading),
    uploadProgress: readonly(uploadProgress),
    
    // Computed
    sortedMessages,
    unreadCount,
    latestMessage,
    oldestMessage,
    
    // Actions
    setMessages,
    addMessage,
    prependMessages,
    appendMessages,
    updateMessage,
    removeMessage,
    markAsRead,
    setLoading,
    setError,
    clearMessages,
    
    // Typing
    addTypingUser,
    removeTypingUser,
    clearTyping,
    setTyping,
    
    // Draft
    setDraftText,
    clearDraft,
    setScrollPosition,
    
    // API Actions
    fetchMessages,
    loadMessages,
    sendMessage,
    markChannelAsRead
  }
}) 