import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "./auth";

describe("useAuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should set user and update lastActivity", () => {
    const store = useAuthStore();
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);
    store.setUser({ id: 1, title: "Test", picture: "" });
    expect(store.user?.id).toBe(1);
    expect(store.lastActivity).toBe(now);
  });

  it("should set accessToken and sessionExpiry", () => {
    const store = useAuthStore();
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);
    store.setAccessToken("token");
    expect(store.accessToken).toBe("token");
    expect(store.sessionExpiry).toBe(now + 30 * 60 * 1000);
  });

  it("should set error", () => {
    const store = useAuthStore();
    store.setError("fail");
    expect(store.error).toBe("fail");
  });

  it("should clear all state on clearAuth", async () => {
    const store = useAuthStore();
    store.setUser({ id: 1, title: "Test", picture: "" });
    store.setAccessToken("token");
    store.setError("fail");
    await store.clearAuth();
    expect(store.user).toBeNull();
    expect(store.accessToken).toBeNull();
    expect(store.error).toBeNull();
    expect(store.lastActivity).toBeNull();
    expect(store.sessionExpiry).toBeNull();
  });

  it("should compute isAuthenticated correctly", () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    store.setUser({ id: 1, title: "Test", picture: "" });
    store.setAccessToken("token");
    expect(store.isAuthenticated).toBe(true);
  });
});
