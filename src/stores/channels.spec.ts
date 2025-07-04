import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useChannelsStore } from "./channels";

describe("useChannelsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should set channels and update lastFetch", () => {
    const store = useChannelsStore();
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);
    store.setChannels([{ id: 1, title: "A", picture: "", unreadCount: 2 }]);
    expect(store.channels.length).toBe(1);
    expect(store.channels[0].title).toBe("A");
    expect(store.lastFetch).toBe(now);
  });

  it("should add channel", () => {
    const store = useChannelsStore();
    store.setChannels([]);
    store.addChannel({ id: 2, title: "B", picture: "", unreadCount: 1 });
    expect(store.channels.length).toBe(1);
    expect(store.channels[0].id).toBe(2);
  });

  it("should set error", () => {
    const store = useChannelsStore();
    store.setError("fail");
    expect(store.error).toBe("fail");
  });

  it("should clear channels", () => {
    const store = useChannelsStore();
    store.setChannels([{ id: 1, title: "A", picture: "", unreadCount: 2 }]);
    store.clearChannels();
    expect(store.channels.length).toBe(0);
  });

  it("should compute sortedChannels", () => {
    const store = useChannelsStore();
    store.setChannels([
      {
        id: 1,
        title: "A",
        picture: "",
        unreadCount: 2,
        lastMessage: {
          id: 1,
          text: "a",
          dtCreated: 2,
          author: { id: 1, title: "A", picture: "" },
          channelId: 1,
        },
      },
      {
        id: 2,
        title: "B",
        picture: "",
        unreadCount: 1,
        lastMessage: {
          id: 2,
          text: "b",
          dtCreated: 3,
          author: { id: 2, title: "B", picture: "" },
          channelId: 2,
        },
      },
    ]);
    const sorted = store.sortedChannels;
    expect(sorted[0].id).toBe(2);
    expect(sorted[1].id).toBe(1);
  });

  it("should compute totalUnreadCount", () => {
    const store = useChannelsStore();
    store.setChannels([
      { id: 1, title: "A", picture: "", unreadCount: 2 },
      { id: 2, title: "B", picture: "", unreadCount: 1 },
    ]);
    expect(store.totalUnreadCount).toBe(3);
  });
});
