/// <reference types="vite/client" />
/// <reference types="chrome" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_VERSION: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Chrome Extension API types
declare global {
  namespace chrome {
    namespace storage {
      interface StorageArea {
        get(keys?: string | string[] | object): Promise<any>;
        set(items: object): Promise<void>;
        remove(keys: string | string[]): Promise<void>;
        clear(): Promise<void>;
      }
    }
  }
}

// Tampermonkey script types for reference
declare global {
  interface TampermonkeyGlobals {
    access_token?: string;
    channels?: any[];
    messages?: any[];
    new_messages_counter?: number | null;
  }
}

export {};
