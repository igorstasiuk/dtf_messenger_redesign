// Composables index - exports all Vue composables

export { useAuth } from "./useAuth";
export { useAPI } from "./useAPI";
export { useMessages } from "./useMessages";
export { useNotifications } from "./useNotifications";
export { useTheme } from "./useTheme";

// Additional utility composables
export { useDTFIntegration } from "./useDTFIntegration";
export { useKeyboardShortcuts } from "./useKeyboardShortcuts";
export { useDebounce } from "./useDebounce";

// Re-export commonly used VueUse composables for convenience
export {
  useLocalStorage,
  useSessionStorage,
  useDark,
  useToggle,
  useEventListener,
  useDebounce as useVueUseDebounce,
  useThrottle,
  useAsyncState,
  useCounter,
  useClipboard,
  usePermission,
  useMediaQuery,
  useOnline,
  useWindowSize,
  useDocumentVisibility,
  useFocusWithin,
  useIntersectionObserver,
  useMutationObserver,
  useResizeObserver,
} from "@vueuse/core";
