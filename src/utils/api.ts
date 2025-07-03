import type {
  APIResponse,
  Channel,
  Message,
  MediaFile,
  AuthUser,
  SendMessageRequest,
  GetMessagesParams,
  CreateChannelRequest,
  MessagesCounter,
  HealthCheckResponse,
} from "@/types/api";

/**
 * DTF Messenger API Service
 * Handles all API interactions with DTF.ru backend
 * Based on the original Tampermonkey script functionality
 */
export class DTFMessengerAPI {
  private baseURL = "https://api.dtf.ru/v2.5";
  private authToken: string | null = null;

  constructor(token?: string) {
    this.authToken = token || null;
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token;
  }

  // Get authorization headers
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        credentials: "include", // Important for DTF.ru cookies
      });

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      let data: any = null;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        return {
          success: false,
          error:
            data?.message ||
            data ||
            `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      return {
        success: true,
        data: data as T,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        status: 0,
      };
    }
  }

  // Authentication Methods
  async checkAuthentication(): Promise<APIResponse<AuthUser>> {
    return this.request<AuthUser>("/user/me");
  }

  async getUserProfile(userId?: string): Promise<APIResponse<AuthUser>> {
    const endpoint = userId ? `/user/${userId}` : "/user/me";
    return this.request<AuthUser>(endpoint);
  }

  async searchUsers(query: string): Promise<APIResponse<AuthUser[]>> {
    return this.request<AuthUser[]>(
      `/user/search?q=${encodeURIComponent(query)}`
    );
  }

  // Channels Methods
  async getChannels(): Promise<APIResponse<Channel[]>> {
    return this.request<Channel[]>("/messenger/channels");
  }

  async getChannel(channelId: string): Promise<APIResponse<Channel>> {
    return this.request<Channel>(`/messenger/channels/${channelId}`);
  }

  async createChannel(
    data: CreateChannelRequest
  ): Promise<APIResponse<Channel>> {
    return this.request<Channel>("/messenger/channels", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMessagesCounter(): Promise<APIResponse<MessagesCounter>> {
    return this.request<MessagesCounter>("/messenger/counter");
  }

  // Messages Methods
  async getMessages(
    channelId: string,
    params: GetMessagesParams = {}
  ): Promise<APIResponse<{ data: Message[]; has_more: boolean }>> {
    const queryParams = new URLSearchParams();

    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.before) queryParams.append("before", params.before);
    if (params.after) queryParams.append("after", params.after);
    if (params.since) queryParams.append("since", params.since);

    const query = queryParams.toString();
    const endpoint = `/messenger/channels/${channelId}/messages${
      query ? `?${query}` : ""
    }`;

    return this.request<{ data: Message[]; has_more: boolean }>(endpoint);
  }

  async getMessage(
    channelId: string,
    messageId: string
  ): Promise<APIResponse<Message>> {
    return this.request<Message>(
      `/messenger/channels/${channelId}/messages/${messageId}`
    );
  }

  async sendMessage(
    channelId: string,
    data: SendMessageRequest
  ): Promise<APIResponse<Message>> {
    return this.request<Message>(`/messenger/channels/${channelId}/messages`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async markAsRead(
    channelId: string,
    messageId: string
  ): Promise<APIResponse<void>> {
    return this.request<void>(
      `/messenger/channels/${channelId}/messages/${messageId}/read`,
      {
        method: "POST",
      }
    );
  }

  async deleteMessage(
    channelId: string,
    messageId: string
  ): Promise<APIResponse<void>> {
    return this.request<void>(
      `/messenger/channels/${channelId}/messages/${messageId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Media Upload Methods
  async uploadMedia(file: File): Promise<APIResponse<MediaFile>> {
    const formData = new FormData();
    formData.append("file", file);

    // Don't set Content-Type header, let browser set it with boundary
    return this.request<MediaFile>("/media/upload", {
      method: "POST",
      body: formData,
      headers: {
        // Remove Content-Type to let browser set multipart/form-data boundary
        Authorization: this.authToken ? `Bearer ${this.authToken}` : "",
      },
    });
  }

  // Special DTF.ru Integration Methods

  /**
   * Get user ID from DTF.ru profile page
   * Used when clicking "Write" button on user profiles
   */
  async getUserIdFromProfile(profileUrl: string): Promise<string | null> {
    try {
      const response = await fetch(profileUrl, {
        credentials: "include",
      });
      const html = await response.text();

      // Extract user ID from page HTML (DTF.ru specific)
      const match =
        html.match(/data-user-id="(\d+)"/) ||
        html.match(/"user_id":(\d+)/) ||
        html.match(/user\/(\d+)/);

      return match ? match[1] : null;
    } catch (error) {
      console.error("Failed to extract user ID from profile:", error);
      return null;
    }
  }

  /**
   * Create or get existing channel with user
   * Based on user ID from profile page
   */
  async getOrCreateChannelWithUser(
    userId: string
  ): Promise<APIResponse<Channel>> {
    // Try to get existing channel first
    const existingChannel = await this.getChannel(userId);
    if (existingChannel.success) {
      return existingChannel;
    }

    // Create new channel if doesn't exist
    return this.createChannel({
      user_id: userId,
      type: "direct",
    });
  }

  /**
   * Get current authenticated user info from DTF.ru
   * Uses the same method as the Tampermonkey script
   */
  async getCurrentUser(): Promise<APIResponse<AuthUser>> {
    try {
      // Try multiple endpoints to get user info
      const endpoints = ["/user/me", "/auth/check", "/profile"];

      for (const endpoint of endpoints) {
        const result = await this.request<AuthUser>(endpoint);
        if (result.success && result.data) {
          return result;
        }
      }

      return {
        success: false,
        error: "Unable to get current user information",
        status: 401,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication error",
        status: 401,
      };
    }
  }

  /**
   * Check if user has messenger access
   * Some DTF.ru users might not have messenger enabled
   */
  async checkMessengerAccess(): Promise<APIResponse<{ hasAccess: boolean }>> {
    try {
      const response = await this.getChannels();
      return {
        success: true,
        data: { hasAccess: response.success },
        status: response.status,
      };
    } catch (error) {
      return {
        success: true,
        data: { hasAccess: false },
        status: 200,
      };
    }
  }

  /**
   * Get DTF.ru site settings that affect messenger
   * Like theme, language, etc.
   */
  async getSiteSettings(): Promise<
    APIResponse<{ theme: "light" | "dark"; language: string }>
  > {
    try {
      // Check document for theme class or user preferences
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark-theme") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      return {
        success: true,
        data: {
          theme: isDark ? "dark" : "light",
          language: document.documentElement.lang || "ru",
        },
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to get site settings",
        status: 500,
      };
    }
  }

  // Utility Methods

  /**
   * Extract media URLs from DTF.ru content
   * Handles DTF.ru specific media formats
   */
  extractMediaFromContent(content: string): string[] {
    const mediaUrls: string[] = [];

    // DTF.ru image patterns
    const imagePatterns = [
      /https:\/\/dtf\.ru\/[^"\s]+\.(jpg|jpeg|png|gif|webp)/gi,
      /https:\/\/leonardo\.osnova\.io\/[^"\s]+/gi,
      /data-image-src="([^"]+)"/gi,
    ];

    imagePatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        mediaUrls.push(...matches);
      }
    });

    return [...new Set(mediaUrls)]; // Remove duplicates
  }

  /**
   * Format message content for DTF.ru display
   * Handles links, mentions, etc.
   */
  formatMessageContent(content: string): string {
    return (
      content
        // Convert URLs to links
        .replace(
          /(https?:\/\/[^\s]+)/g,
          '<a href="$1" target="_blank" rel="noopener">$1</a>'
        )
        // Convert @mentions to user links
        .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
        // Basic HTML escaping for security
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Re-enable links after escaping
        .replace(
          /&lt;a href="([^"]+)" target="_blank" rel="noopener"&gt;([^&]+)&lt;\/a&gt;/g,
          '<a href="$1" target="_blank" rel="noopener">$2</a>'
        )
        .replace(
          /&lt;span class="mention"&gt;(@\w+)&lt;\/span&gt;/g,
          '<span class="mention">$1</span>'
        )
    );
  }

  /**
   * Check if API is available and working
   */
  async healthCheck(): Promise<APIResponse<HealthCheckResponse>> {
    try {
      const startTime = Date.now();
      const response = await this.request<any>("/ping");
      const responseTime = Date.now() - startTime;

      if (response.success) {
        return {
          success: true,
          data: {
            status: "ok",
            timestamp: Date.now(),
            responseTime,
          },
          status: 200,
        };
      } else {
        return {
          success: false,
          error: "API health check failed",
          status: response.status || 500,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Health check failed",
        status: 0,
      };
    }
  }
}

// Export singleton instance
export const dtfAPI = new DTFMessengerAPI();

// Export default instance for convenience
export default dtfAPI;
