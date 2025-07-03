import type { AuthUser, AuthToken } from './api'
import type { Ref } from 'vue'

// Authentication state
export interface AuthState {
  user: AuthUser | null
  token: AuthToken | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  lastActivity: number | null
  sessionExpiry: number | null
}

// BroadcastChannel event types (based on tampermonkey script)
export interface BroadcastChannelEvent {
  type: 'auth session updated' | 'auth logout' | 'auth error'
  detail: {
    session?: {
      accessToken: string
      user?: AuthUser
      expiresAt?: number
    }
    error?: string
    timestamp: number
  }
}

// Authentication flow states
export interface AuthFlow {
  step: 'checking' | 'waiting_for_dtf' | 'authenticated' | 'failed' | 'expired'
  message: string
  canRetry: boolean
  retryCount: number
  lastCheck: number | null
}

// Token management
export interface TokenManager {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  tokenType: 'Bearer'
  isExpired: boolean
  shouldRefresh: boolean
  timeUntilExpiry: number | null
}

// Session persistence
export interface SessionStorage {
  user: AuthUser | null
  token: string | null
  expiresAt: number | null
  lastActivity: number
  deviceId: string
  browserSession: boolean
}

// Authentication actions for store
export type AuthAction = 
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_TOKEN'; payload: AuthToken | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_LAST_ACTIVITY'; payload: number }
  | { type: 'SET_SESSION_EXPIRY'; payload: number | null }
  | { type: 'CLEAR_AUTH' }
  | { type: 'UPDATE_USER'; payload: Partial<AuthUser> }

// DTF.ru integration
export interface DTFAuthIntegration {
  broadcastChannel: BroadcastChannel | null
  isListening: boolean
  lastEvent: BroadcastChannelEvent | null
  reconnectAttempts: number
  maxReconnectAttempts: number
}

// Authentication events
export interface AuthEvent {
  type: 'login' | 'logout' | 'token_refresh' | 'session_expire' | 'auth_error'
  timestamp: number
  details?: any
  source: 'broadcast' | 'manual' | 'auto'
}

// User profile update
export interface ProfileUpdate {
  name?: string
  avatar?: string
  settings?: {
    theme?: 'light' | 'dark' | 'auto'
    notifications?: boolean
    sound?: boolean
    language?: string
  }
}

// Authentication validation
export interface AuthValidation {
  isTokenValid: boolean
  isUserValid: boolean
  hasRequiredPermissions: boolean
  errors: string[]
  warnings: string[]
}

// Auto-refresh configuration
export interface AutoRefreshConfig {
  enabled: boolean
  refreshThreshold: number // seconds before expiry
  maxRetries: number
  retryDelay: number // milliseconds
  backoffMultiplier: number
}

// Authentication hooks return types
export interface UseAuthReturn {
  // State
  user: Ref<AuthUser | null>
  token: Ref<AuthToken | null>
  isAuthenticated: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  
  // Actions
  checkAuth: () => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  updateProfile: (updates: ProfileUpdate) => Promise<void>
  
  // Utilities
  hasPermission: (permission: string) => boolean
  getTimeUntilExpiry: () => number | null
  isTokenExpired: () => boolean
} 