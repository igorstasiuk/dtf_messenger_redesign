<template>
  <div class="loading-spinner" :class="{ 'loading-spinner--small': small }">
    <div class="loading-spinner__circle"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  small?: boolean;
}

// @ts-ignore Vue SFC macro - defineProps is available globally in <script setup>
const { small = false } = defineProps<Props>();
</script>

<style scoped>
.loading-spinner {
  @apply inline-block;
}

.loading-spinner__circle {
  @apply w-8 h-8 border-4 border-solid border-gray-200 border-t-dtf-orange rounded-full animate-spin;
}

.loading-spinner--small .loading-spinner__circle {
  @apply w-4 h-4 border-2;
}

/* Dark mode */
.dark .loading-spinner__circle {
  @apply border-gray-600 border-t-dtf-orange;
}
</style>
