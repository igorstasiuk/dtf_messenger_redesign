import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useMessages } from "./useMessages";
import { useMessagesStore } from "@/stores/messages";

vi.mock("@/stores/channels", () => ({
  useChannelsStore: vi.fn(() => ({
    setActiveChannel: vi.fn(),
    updateChannel: vi.fn(),
    activeChannel: null,
  })),
}));

describe("useMessages", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should reflect store state in computed values", () => {
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
    const messages = useMessages();
    expect(messages.messages.value.length).toBe(1);
    expect(messages.messages.value[0].text).toBe("hi");
  });

  it("should set channel id and call loadMessages", async () => {
    const store = useMessagesStore();
    store.fetchMessages = vi.fn().mockResolvedValue(true);
    const messages = useMessages();
    await messages.setChannelId(42);
    expect(messages.currentChannelId.value).toBe(42);
    expect(store.fetchMessages).toHaveBeenCalledWith(42, undefined);
  });

  it("should call sendMessage on store", async () => {
    const store = useMessagesStore();
    store.sendMessage = vi.fn().mockResolvedValue({
      id: 2,
      text: "sent",
      dtCreated: 2,
      author: { id: 1, title: "A", picture: "" },
      channelId: 1,
    });
    const messages = useMessages(1);
    const result = await messages.sendMessage("sent");
    expect(store.sendMessage).toHaveBeenCalled();
    if (result) expect(result.text).toBe("sent");
  });

  it("should set and clear draft text", () => {
    const messages = useMessages();
    messages.setDraftText("draft");
    expect(messages.draftText.value).toBe("draft");
    messages.clearDraft();
    expect(messages.draftText.value).toBe("");
  });

  it("should add typing user", () => {
    const store = useMessagesStore();
    store.addTypingUser = vi.fn();
    const messages = useMessages();
    messages.addTypingUser({ id: 1, name: "A" });
    expect(store.addTypingUser).toHaveBeenCalledWith({ id: 1, name: "A" });
  });
});
