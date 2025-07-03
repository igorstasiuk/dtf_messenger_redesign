import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'

export function useTheme() {
  const uiStore = useUIStore()

  const theme = computed({
    get: () => uiStore.theme,
    set: (value: 'light' | 'dark' | 'auto') => uiStore.setTheme(value)
  })

  const isDarkMode = computed(() => uiStore.isDarkMode)
  const currentTheme = computed(() => uiStore.currentTheme)

  function toggleTheme() {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    uiStore.setTheme(newTheme)
  }

  return {
    theme,
    isDarkMode,
    currentTheme,
    toggleTheme,
    setTheme: uiStore.setTheme
  }
} 