<template>
  <div
    class="loading-spinner flex items-center justify-center"
    :class="{ 'loading-spinner--small': small }"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span class="sr-only">Загрузка...</span>
    <div class="loading-spinner__circle"></div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
const { small = false } = defineProps<{ small?: boolean }>();
</script>

<style scoped>
.loading-spinner {
  @apply inline-flex items-center justify-center;
}

.loading-spinner__circle {
  @apply w-8 h-8 border-4 border-solid border-gray-200 border-t-dtf-orange rounded-full;
  animation: spin 0.8s linear infinite;
}

.loading-spinner--small .loading-spinner__circle {
  @apply w-4 h-4 border-2;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode */
.dark .loading-spinner__circle {
  @apply border-gray-600 border-t-dtf-orange;
}
</style>
