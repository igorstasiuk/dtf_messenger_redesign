import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNotifications } from "./useNotifications";

const uiStoreMock = {
  notifications: [],
  addNotification: vi.fn(),
  clearNotifications: vi.fn(),
  removeNotification: vi.fn(),
};

vi.mock("@/stores/ui", () => ({
  useUIStore: vi.fn(() => uiStoreMock),
}));

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uiStoreMock.notifications = [];
  });

  it("should call addNotification with type success", () => {
    const { showSuccess } = useNotifications();
    showSuccess("Title", "Message", 1000);
    expect(uiStoreMock.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        title: "Title",
        message: "Message",
        duration: 1000,
      })
    );
  });

  it("should call addNotification with type error", () => {
    const { showError } = useNotifications();
    showError("Err", "Fail", 2000);
    expect(uiStoreMock.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        title: "Err",
        message: "Fail",
        duration: 2000,
      })
    );
  });

  it("should call addNotification with type warning", () => {
    const { showWarning } = useNotifications();
    showWarning("Warn", "WarnMsg");
    expect(uiStoreMock.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "warning",
        title: "Warn",
        message: "WarnMsg",
      })
    );
  });

  it("should call addNotification with type info", () => {
    const { showInfo } = useNotifications();
    showInfo("Info", "InfoMsg");
    expect(uiStoreMock.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "info",
        title: "Info",
        message: "InfoMsg",
      })
    );
  });

  it("should call clearNotifications", () => {
    const { clearAll } = useNotifications();
    clearAll();
    expect(uiStoreMock.clearNotifications).toHaveBeenCalled();
  });

  it("should call removeNotification", () => {
    const { remove } = useNotifications();
    remove("id-123");
    expect(uiStoreMock.removeNotification).toHaveBeenCalledWith("id-123");
  });
});
