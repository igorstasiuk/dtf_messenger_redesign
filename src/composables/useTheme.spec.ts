import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTheme } from "./useTheme";

const uiStoreMock = {
  theme: "light",
  isDarkMode: false,
  currentTheme: "light",
  setTheme: vi.fn(),
};

vi.mock("@/stores/ui", () => ({
  useUIStore: vi.fn(() => uiStoreMock),
}));

describe("useTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uiStoreMock.theme = "light";
    uiStoreMock.isDarkMode = false;
    uiStoreMock.currentTheme = "light";
  });

  it("should reflect theme from store", () => {
    uiStoreMock.theme = "dark";
    const { theme } = useTheme();
    expect(theme.value).toBe("dark");
  });

  it("should reflect isDarkMode from store", () => {
    uiStoreMock.isDarkMode = true;
    const { isDarkMode } = useTheme();
    expect(isDarkMode.value).toBe(true);
  });

  it("should reflect currentTheme from store", () => {
    uiStoreMock.currentTheme = "auto";
    const { currentTheme } = useTheme();
    expect(currentTheme.value).toBe("auto");
  });

  it("should call setTheme when theme is set", () => {
    const { theme } = useTheme();
    theme.value = "dark";
    expect(uiStoreMock.setTheme).toHaveBeenCalledWith("dark");
  });

  it("should toggle theme from light to dark", () => {
    uiStoreMock.theme = "light";
    const { toggleTheme } = useTheme();
    toggleTheme();
    expect(uiStoreMock.setTheme).toHaveBeenCalledWith("dark");
  });

  it("should toggle theme from dark to light", () => {
    uiStoreMock.theme = "dark";
    const { toggleTheme } = useTheme();
    toggleTheme();
    expect(uiStoreMock.setTheme).toHaveBeenCalledWith("light");
  });
});
