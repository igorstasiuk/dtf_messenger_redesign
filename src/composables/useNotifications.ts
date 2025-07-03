import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'

export function useNotifications() {
  const uiStore = useUIStore()

  const notifications = computed(() => uiStore.notifications)

  function showSuccess(title: string, message: string, duration?: number) {
    return uiStore.addNotification({
      type: 'success',
      title,
      message,
      duration
    })
  }

  function showError(title: string, message: string, duration?: number) {
    return uiStore.addNotification({
      type: 'error',
      title,
      message,
      duration
    })
  }

  function showWarning(title: string, message: string, duration?: number) {
    return uiStore.addNotification({
      type: 'warning',
      title,
      message,
      duration
    })
  }

  function showInfo(title: string, message: string, duration?: number) {
    return uiStore.addNotification({
      type: 'info',
      title,
      message,
      duration
    })
  }

  function clearAll() {
    uiStore.clearNotifications()
  }

  function remove(id: string) {
    uiStore.removeNotification(id)
  }

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
    remove,
    addNotification: uiStore.addNotification
  }
} 