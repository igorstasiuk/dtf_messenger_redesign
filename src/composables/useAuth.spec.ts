import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuth } from "./useAuth";
import { useAuthStore } from "@/stores/auth";
import * as apiModule from "@/utils/api";

vi.mock("@/utils/api", () => {
  return {
    dtfAPI: {
      setAccessToken: vi.fn(),
    },
  };
});

describe("useAuth", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Reset mocks
    vi.clearAllMocks();
  });

  it("should reflect store state in computed values", () => {
    const auth = useAuth();
    const store = useAuthStore();
    store.setUser({ id: 1, title: "Test", picture: "" });
    store.setAccessToken("token");
    expect(auth.isAuthenticated.value).toBe(true);
    expect(auth.user.value?.id).toBe(1);
    expect(auth.accessToken.value).toBe("token");
  });

  it("should clear error", () => {
    const auth = useAuth();
    const store = useAuthStore();
    store.setError("fail");
    auth.clearError();
    expect(auth.error.value).toBeNull();
  });

  it("should update token and call dtfAPI.setAccessToken", () => {
    const auth = useAuth();
    auth.updateToken("new-token");
    expect(auth.accessToken.value).toBe("new-token");
    expect(apiModule.dtfAPI.setAccessToken).toHaveBeenCalledWith("new-token");
  });

  it("should call store.initialize on initialize()", () => {
    const auth = useAuth();
    const store = useAuthStore();
    store.initialize = vi.fn();
    auth.initialize();
    expect(store.initialize).toHaveBeenCalled();
  });
});
