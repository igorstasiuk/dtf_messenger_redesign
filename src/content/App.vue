<template>
  <div class="dtf-messenger-extension">
    <!-- Chat Button in header -->
    <ChatButton v-if="showChatButton" @toggle-channels="toggleChannelsList" />

    <!-- Channels List Popover -->
    <ChannelsList
      v-if="channelsStore.isVisible"
      @select-channel="selectChannel"
      @close="closeChannelsList"
    />

    <!-- Chat Sidebar -->
    <ChatSidebar
      v-if="currentChannelId"
      :channel-id="currentChannelId"
      @close="closeChat"
    />

    <!-- Profile Write Button -->
    <ProfileWriteButton v-if="showProfileButton" @open-chat="openDirectChat" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useChannelsStore } from "@/stores/channels";
import { useAuthStore } from "@/stores/auth";
import ChatButton from "@/components/ChatButton/ChatButton.vue";
import ChannelsList from "@/components/ChannelsList/ChannelsList.vue";
import ChatSidebar from "@/components/ChatSidebar/ChatSidebar.vue";
import ProfileWriteButton from "@/components/ProfileWriteButton/ProfileWriteButton.vue";

const channelsStore = useChannelsStore();
const authStore = useAuthStore();

const currentChannelId = ref<string | null>(null);

// Check if we should show chat button (near bell icon in header)
const showChatButton = computed(() => {
  return document.querySelector(".header__right .bell") !== null;
});

// Check if we should show profile write button (on user profile pages)
const showProfileButton = computed(() => {
  const isProfilePage = window.location.pathname.startsWith("/u/");
  const hasProfileControls =
    document.querySelector(".subsite-header__controls") !== null;
  return isProfilePage && hasProfileControls;
});

const toggleChannelsList = () => {
  channelsStore.toggleVisibility();
};

const closeChannelsList = () => {
  channelsStore.setVisibility(false);
};

const selectChannel = (channelId: string) => {
  currentChannelId.value = channelId;
  closeChannelsList();
};

const closeChat = () => {
  currentChannelId.value = null;
};

const openDirectChat = async (userId: string) => {
  try {
    // Load channel for direct chat with user
    await channelsStore.loadChannelByUserId(userId);
    const channel = channelsStore.getChannelByUserId(userId);
    if (channel) {
      selectChannel(channel.id);
    }
  } catch (error) {
    console.error("Failed to open direct chat:", error);
  }
};

// Close overlays on outside click
const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as Element;
  if (!target.closest(".dtf-messenger-extension")) {
    closeChannelsList();
  }
};

onMounted(async () => {
  // Initialize auth
  await authStore.initialize();

  // Load channels if authenticated
  if (authStore.isAuthenticated) {
    await channelsStore.loadChannels();
  }

  // Add outside click listener
  document.addEventListener("click", handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick);
});
</script>

<style scoped>
.dtf-messenger-extension {
  /* Container for all extension components */
  position: relative;
  pointer-events: none;
}

.dtf-messenger-extension > * {
  pointer-events: auto;
}
</style>
