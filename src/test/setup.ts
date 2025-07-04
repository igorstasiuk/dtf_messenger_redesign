import { vi } from "vitest";

// Mock Chrome APIs for testing
const chrome = {
  runtime: {
    getManifest: vi.fn(() => ({
      name: "DTF Messenger",
      version: "1.0.0",
      manifest_version: 3,
    })),
    getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    sendMessage: vi.fn(),
  },
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
  notifications: {
    create: vi.fn(),
    clear: vi.fn(),
    onClicked: {
      addListener: vi.fn(),
    },
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
  tabs: {
    query: vi.fn(),
    update: vi.fn(),
    sendMessage: vi.fn(),
  },
};

// Mock global chrome object
Object.defineProperty(global, "chrome", {
  value: chrome,
  writable: true,
});

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string;
  onmessage: ((event: unknown) => void) | null = null;

  constructor(name: string) {
    this.name = name;
  }

  postMessage(_data: unknown) {
    // Mock implementation
  }

  close() {
    // Mock implementation
  }
}

Object.defineProperty(global, "BroadcastChannel", {
  value: MockBroadcastChannel,
  writable: true,
});

// Mock fetch for API tests
global.fetch = vi.fn();

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "https://dtf.ru",
    hostname: "dtf.ru",
    pathname: "/",
    search: "",
    hash: "",
  },
  writable: true,
});

// Mock matchMedia for theme detection
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
