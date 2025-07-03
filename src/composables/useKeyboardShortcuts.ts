import { onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  handler: (event: KeyboardEvent) => void
  description: string
}

export function useKeyboardShortcuts() {
  const uiStore = useUIStore()

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'Escape',
      handler: handleEscape,
      description: 'Закрыть модальные окна и панели'
    },
    {
      key: 'm',
      ctrl: true,
      handler: toggleMessenger,
      description: 'Открыть/закрыть мессенджер'
    },
    {
      key: 'c',
      ctrl: true,
      shift: true,
      handler: toggleChannelsList,
      description: 'Открыть/закрыть список каналов'
    },
    {
      key: '/',
      ctrl: true,
      handler: focusSearch,
      description: 'Фокус на поиск каналов'
    }
  ]

  function handleEscape() {
    // Close modals and panels in order of priority
    if (uiStore.isEmojiPickerOpen) {
      uiStore.setEmojiPickerOpen(false)
    } else if (uiStore.isMediaUploadOpen) {
      uiStore.setMediaUploadOpen(false)
    } else if (uiStore.isSettingsOpen) {
      uiStore.setSettingsOpen(false)
    } else if (uiStore.isChannelsListOpen) {
      uiStore.setChannelsListOpen(false)
    } else if (uiStore.isChatSidebarOpen) {
      uiStore.setChatSidebarOpen(false)
    }
  }

  function toggleMessenger() {
    uiStore.toggleChatSidebar()
  }

  function toggleChannelsList() {
    uiStore.toggleChannelsList()
  }

  function focusSearch() {
    // Focus on channel search input if channels list is open
    if (uiStore.isChannelsListOpen) {
      const searchInput = document.querySelector('.channels-list__search-input') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    }
  }

  function matchesShortcut(event: KeyboardEvent, config: ShortcutConfig): boolean {
    if (event.key !== config.key) return false
    
    return (
      !!event.ctrlKey === !!config.ctrl &&
      !!event.altKey === !!config.alt &&
      !!event.shiftKey === !!config.shift &&
      !!event.metaKey === !!config.meta
    )
  }

  function handleKeyDown(event: KeyboardEvent) {
    // Skip if user is typing in an input
    const target = event.target as HTMLElement
    if (target.matches('input, textarea, [contenteditable]')) {
      return
    }

    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault()
        event.stopPropagation()
        shortcut.handler(event)
        break
      }
    }
  }

  function addShortcut(config: ShortcutConfig) {
    shortcuts.push(config)
  }

  function removeShortcut(key: string) {
    const index = shortcuts.findIndex(s => s.key === key)
    if (index >= 0) {
      shortcuts.splice(index, 1)
    }
  }

  function getShortcuts() {
    return [...shortcuts]
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    shortcuts: getShortcuts(),
    addShortcut,
    removeShortcut,
    handleEscape,
    toggleMessenger,
    toggleChannelsList,
    focusSearch
  }
} 