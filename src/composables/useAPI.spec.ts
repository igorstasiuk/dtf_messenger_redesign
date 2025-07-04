import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAPI } from "./useAPI";
import { dtfAPI } from "@/utils/api";

const uiStoreMock = { setGlobalLoading: vi.fn(), addNotification: vi.fn() };

vi.mock("@/utils/api", () => ({
  dtfAPI: {
    getChannels: vi.fn(),
    getChannel: vi.fn(),
    getOrCreateChannelWithUser: vi.fn(),
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
    markAsRead: vi.fn(),
    uploadFile: vi.fn(),
    searchUsers: vi.fn(),
  },
}));

vi.mock("@/stores/auth", () => ({ useAuthStore: vi.fn(() => ({})) }));
vi.mock("@/stores/ui", () => ({
  useUIStore: vi.fn(() => uiStoreMock),
}));

describe("useAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call dtfAPI.getChannels and return result", async () => {
    const { channelsAPI } = useAPI();
    const mockResult = [{ id: 1, title: "Test", picture: "", unreadCount: 0 }];
    (dtfAPI.getChannels as any).mockResolvedValue({
      success: true,
      result: mockResult,
    });
    const result = await channelsAPI.getChannels();
    expect(result).toEqual(mockResult);
    expect(dtfAPI.getChannels).toHaveBeenCalled();
  });

  it("should handle API error and call addNotification", async () => {
    const { channelsAPI } = useAPI();
    (dtfAPI.getChannels as any).mockResolvedValue({
      success: false,
      error: { code: 500, message: "fail" },
    });
    const result = await channelsAPI.getChannels();
    expect(result).toBeNull();
    expect(uiStoreMock.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error", message: "fail" })
    );
  });

  it("should set isLoading during request", async () => {
    const { channelsAPI, isLoading } = useAPI();
    let resolve: any = undefined;
    (dtfAPI.getChannels as any).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );
    const promise = channelsAPI.getChannels();
    expect(isLoading.value).toBe(true);
    if (resolve) (resolve as Function)({ success: true, result: [] });
    await promise;
    expect(isLoading.value).toBe(false);
  });
});
