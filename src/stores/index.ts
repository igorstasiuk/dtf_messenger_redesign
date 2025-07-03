import { createPinia } from 'pinia'

// Create Pinia instance
export const pinia = createPinia()

// Enable devtools in development
if (import.meta.env.DEV) {
  console.log('Pinia devtools enabled')
}

// Re-export stores
export { useAuthStore } from './auth'
export { useChannelsStore } from './channels' 
export { useMessagesStore } from './messages'
export { useUIStore } from './ui'

// Export Pinia instance as default
export default pinia 