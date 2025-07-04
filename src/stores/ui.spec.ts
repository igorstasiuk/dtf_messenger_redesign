import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useUIStore } from "./ui";

describe("useUIStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should set channels list open", () => {
    const store = useUIStore();
    store.setChannelsListOpen(true);
    expect(store.isChannelsListOpen).toBe(true);
  });

  it("should set chat sidebar open", () => {
    const store = useUIStore();
    store.setChatSidebarOpen(true);
    expect(store.isChatSidebarOpen).toBe(true);
  });

  it("should set global error", () => {
    const store = useUIStore();
    store.setGlobalError("fail");
    expect(store.globalError).toBe("fail");
  });

  it("should set theme and compute currentTheme", () => {
    const store = useUIStore();
    store.setTheme("dark");
    expect(store.theme).toBe("dark");
    expect(store.currentTheme).toBe("dark");
  });

  it("should compute isDarkMode", () => {
    const store = useUIStore();
    store.setTheme("dark");
    expect(store.isDarkMode).toBe(true);
    store.setTheme("light");
    expect(store.isDarkMode).toBe(false);
  });
});
