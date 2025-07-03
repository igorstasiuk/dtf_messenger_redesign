import { ref } from 'vue'

export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): T {
  const timeoutId = ref<NodeJS.Timeout | null>(null)

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timeoutId.value !== null) {
      clearTimeout(timeoutId.value)
    }

    timeoutId.value = setTimeout(() => {
      fn(...args)
      timeoutId.value = null
    }, delay)
  }) as T

  return debouncedFn
}

export function useDebouncedRef<T>(initialValue: T, delay: number = 300) {
  const value = ref<T>(initialValue)
  const debouncedValue = ref<T>(initialValue)
  const timeoutId = ref<NodeJS.Timeout | null>(null)

  function updateDebouncedValue(newValue: T) {
    value.value = newValue

    if (timeoutId.value !== null) {
      clearTimeout(timeoutId.value)
    }

    timeoutId.value = setTimeout(() => {
      debouncedValue.value = newValue
      timeoutId.value = null
    }, delay)
  }

  return {
    value,
    debouncedValue,
    updateValue: updateDebouncedValue
  }
} 