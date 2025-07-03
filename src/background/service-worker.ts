// Chrome Extension Service Worker
// Handles background tasks, notifications, and communication between content scripts

// Extension lifecycle
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("DTF Messenger Extension installed/updated:", details.reason);

  if (details.reason === "install") {
    // First time installation
    await setupInitialSettings();
  } else if (details.reason === "update") {
    // Extension updated
    console.log(
      "Extension updated to version:",
      chrome.runtime.getManifest().version
    );
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log("DTF Messenger Extension started");
});

// Setup initial settings
async function setupInitialSettings() {
  const defaultSettings = {
    notifications: true,
    soundNotifications: false,
    notificationDuration: 5000,
    theme: "auto", // 'light', 'dark', 'auto'
    chatPosition: "right",
    autoMarkAsRead: true,
  };

  await chrome.storage.sync.set({ settings: defaultSettings });
  console.log("Initial settings configured");
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "SHOW_NOTIFICATION":
      handleNotification(message.data);
      break;

    case "UPDATE_BADGE":
      updateExtensionBadge(message.data.count);
      break;

    case "GET_SETTINGS":
      getSettings().then(sendResponse);
      return true; // Keep the message channel open for async response

    case "UPDATE_SETTINGS":
      updateSettings(message.data).then(() => sendResponse({ success: true }));
      return true;

    default:
      console.warn("Unknown message type:", message.type);
  }
});

// Handle notifications
async function handleNotification(data: {
  title: string;
  message: string;
  channelId?: string;
  userId?: string;
}) {
  const settings = await getSettings();

  if (!settings.notifications) {
    return;
  }

  // Create notification
  chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/icon-48.png"),
    title: data.title,
    message: data.message,
  });

  // Auto-clear notification after specified duration
  setTimeout(() => {
    chrome.notifications.clear(data.channelId || "default");
  }, settings.notificationDuration);
}

// Update extension badge (unread count)
function updateExtensionBadge(count: number) {
  const text = count > 0 ? count.toString() : "";
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: "#8000ff" });
}

// Get user settings
async function getSettings() {
  const result = await chrome.storage.sync.get("settings");
  return result.settings || {};
}

// Update user settings
async function updateSettings(newSettings: Record<string, any>) {
  const currentSettings = await getSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  await chrome.storage.sync.set({ settings: updatedSettings });
}

// Handle notification clicks
chrome.notifications.onClicked.addListener(async (notificationId) => {
  // Focus or create DTF.ru tab
  const tabs = await chrome.tabs.query({ url: "https://dtf.ru/*" });

  if (tabs.length > 0) {
    // Focus existing DTF.ru tab
    await chrome.tabs.update(tabs[0].id!, { active: true });
    await chrome.windows.update(tabs[0].windowId!, { focused: true });
  } else {
    // Create new DTF.ru tab
    await chrome.tabs.create({ url: "https://dtf.ru" });
  }

  // Clear the notification
  chrome.notifications.clear(notificationId);
});

// Handle tab updates to inject content script on DTF.ru
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.includes("dtf.ru")) {
    // Inject content script if not already injected
    chrome.scripting
      .executeScript({
        target: { tabId },
        files: ["content/main.js"],
      })
      .catch(() => {
        // Content script already injected or injection failed
        // This is expected behavior, so we silently catch the error
      });
  }
});

// Periodic tasks (check for new messages, etc.)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "checkMessages") {
    // This would typically send a message to content scripts to check for new messages
    const tabs = await chrome.tabs.query({ url: "https://dtf.ru/*" });

    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "CHECK_NEW_MESSAGES" });
      }
    });
  }
});

// Setup periodic message checking
chrome.alarms.create("checkMessages", { periodInMinutes: 1 });

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url?.includes("dtf.ru")) {
    // Send message to content script to toggle chat
    chrome.tabs.sendMessage(tab.id!, { type: "TOGGLE_CHAT" });
  } else {
    // Navigate to DTF.ru
    chrome.tabs.update({ url: "https://dtf.ru" });
  }
});

// Export types for TypeScript
export interface NotificationData {
  title: string;
  message: string;
  channelId?: string;
  userId?: string;
}

export interface ExtensionSettings {
  notifications: boolean;
  soundNotifications: boolean;
  notificationDuration: number;
  theme: "light" | "dark" | "auto";
  chatPosition: "left" | "right";
  autoMarkAsRead: boolean;
}
