import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useMessagesStore } from "./messages";

describe("useMessagesStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should set messages and update lastFetch", () => {
    const store = useMessagesStore();
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);
    store.setMessages([
      {
        id: 1,
        text: "hi",
        dtCreated: 1,
        author: { id: 1, title: "A", picture: "" },
        channelId: 1,
      },
    ]);
    expect(store.messages.length).toBe(1);
    expect(store.messages[0].text).toBe("hi");
    expect(store.lastFetch).toBe(now);
  });

  it("should add message", () => {
    const store = useMessagesStore();
    store.setMessages([]);
    store.addMessage({
      id: 2,
      text: "msg",
      dtCreated: 2,
      author: { id: 2, title: "B", picture: "" },
      channelId: 1,
    });
    expect(store.messages.length).toBe(1);
    expect(store.messages[0].id).toBe(2);
  });

  it("should set error", () => {
    const store = useMessagesStore();
    store.setError("fail");
    expect(store.error).toBe("fail");
  });

  it("should clear messages", () => {
    const store = useMessagesStore();
    store.setMessages([
      {
        id: 1,
        text: "hi",
        dtCreated: 1,
        author: { id: 1, title: "A", picture: "" },
        channelId: 1,
      },
    ]);
    store.clearMessages();
    expect(store.messages.length).toBe(0);
  });

  it("should compute sortedMessages", () => {
    const store = useMessagesStore();
    store.setMessages([
      {
        id: 1,
        text: "a",
        dtCreated: 2,
        author: { id: 1, title: "A", picture: "" },
        channelId: 1,
      },
      {
        id: 2,
        text: "b",
        dtCreated: 1,
        author: { id: 2, title: "B", picture: "" },
        channelId: 1,
      },
    ]);
    const sorted = store.sortedMessages;
    expect(sorted[0].dtCreated).toBe(1);
    expect(sorted[1].dtCreated).toBe(2);
  });

  it("should compute unreadCount", () => {
    const store = useMessagesStore();
    store.setMessages([
      {
        id: 1,
        text: "a",
        dtCreated: 1,
        author: { id: 1, title: "A", picture: "" },
        channelId: 1,
        isRead: false,
      },
      {
        id: 2,
        text: "b",
        dtCreated: 2,
        author: { id: 2, title: "B", picture: "" },
        channelId: 1,
        isRead: true,
      },
    ]);
    expect(store.unreadCount).toBe(1);
  });
});
