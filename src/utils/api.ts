import type {
  APIResponse,
  Channel,
  Message,
  MediaFile,
  AuthUser,
  SendMessageRequest,
  GetMessagesParams,
  HealthCheckResponse,
  GetChannelsResponse,
  GetMessagesResponse,
  SendMessageResponse,
  MessagesCounterResponse,
} from "@/types/api";
import { getCurrentTimestamp } from "./date";

/**
 * DTF Messenger API Service
 * Handles all API interactions with DTF.ru backend
 * Based on the original Tampermonkey script functionality
 */
export class DTFMessengerAPI {
  private baseURL = "https://api.dtf.ru/v2.5";
  private accessToken: string | null = null;

  constructor(accessToken?: string) {
    if (accessToken) {
      this.setAccessToken(accessToken);
    }
  }

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Clear access token
   */
  clearAccessToken(): void {
    this.accessToken = null;
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    if (this.accessToken) {
      headers["JWTAuthorization"] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = {
        ...this.getAuthHeaders(),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      return {
        success: response.ok,
        result: data.result,
        error:
          data.error ||
          (!response.ok
            ? {
                code: response.status,
                message: response.statusText,
              }
            : undefined),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 0,
          message: error instanceof Error ? error.message : "Network error",
        },
      };
    }
  }

  // ==================== Auth Methods ====================

  /**
   * Check if user is authenticated (health check)
   */
  async checkAuthentication(): Promise<APIResponse<HealthCheckResponse>> {
    return this.makeRequest<HealthCheckResponse>("/health");
  }

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<APIResponse<AuthUser>> {
    return this.makeRequest<AuthUser>("/user/me");
  }

  // ==================== Channel Methods ====================

  /**
   * Get user's channels list
   * Based on api__channels() from tampermonkey script
   */
  async getChannels(): Promise<APIResponse<GetChannelsResponse>> {
    return this.makeRequest<GetChannelsResponse>("/m/channels");
  }

  /**
   * Get specific channel information
   * Based on api__channel() from tampermonkey script
   */
  async getChannel(
    channelId: number
  ): Promise<APIResponse<{ channel: Channel }>> {
    return this.makeRequest<{ channel: Channel }>(`/m/channel?id=${channelId}`);
  }

  /**
   * Create new channel with user
   */
  async createChannel(
    userId: number
  ): Promise<APIResponse<{ channel: Channel }>> {
    const formData = new FormData();
    formData.append("userId", userId.toString());

    return this.makeRequest<{ channel: Channel }>("/m/create", {
      method: "POST",
      body: formData,
    });
  }

  /**
   * Get or create channel with specific user (for profile button)
   */
  async getOrCreateChannelWithUser(
    userId: number
  ): Promise<APIResponse<{ channel: Channel }>> {
    // First try to find existing channel
    const channelsResponse = await this.getChannels();
    if (channelsResponse.success && channelsResponse.result) {
      const existingChannel = channelsResponse.result.channels.find(
        (channel) => channel.id === userId
      );

      if (existingChannel) {
        return {
          success: true,
          result: { channel: existingChannel },
        };
      }
    }

    // Create new channel if not found
    return this.createChannel(userId);
  }

  // ==================== Message Methods ====================

  /**
   * Get messages for a channel
   * Based on api__messages() from tampermonkey script
   */
  async getMessages(
    params: GetMessagesParams
  ): Promise<APIResponse<GetMessagesResponse>> {
    const { channelId, beforeTime, limit = 50 } = params;
    let url = `/m/messages?channelId=${channelId}`;

    if (beforeTime) {
      url += `&beforeTime=${beforeTime}`;
    }

    if (limit) {
      url += `&limit=${limit}`;
    }

    return this.makeRequest<GetMessagesResponse>(url);
  }

  /**
   * Send message to channel
   * Based on api__message_send() from tampermonkey script
   */
  async sendMessage(
    params: SendMessageRequest
  ): Promise<APIResponse<SendMessageResponse>> {
    const { channelId, text, media = [], ts, idTmp } = params;

    const formData = new FormData();
    formData.append("channelId", channelId.toString());
    formData.append("text", text);
    formData.append("ts", (ts || getCurrentTimestamp()).toString());
    formData.append("idTmp", (idTmp || getCurrentTimestamp()).toString());
    formData.append("media", JSON.stringify(media));

    return this.makeRequest<SendMessageResponse>("/m/send", {
      method: "POST",
      body: formData,
    });
  }

  /**
   * Mark messages as read
   */
  async markAsRead(
    channelId: number,
    messageIds: number[]
  ): Promise<APIResponse<void>> {
    const formData = new FormData();
    formData.append("channelId", channelId.toString());
    formData.append("messageIds", JSON.stringify(messageIds));

    return this.makeRequest<void>("/m/read", {
      method: "POST",
      body: formData,
    });
  }

  // ==================== Media Methods ====================

  /**
   * Upload media file
   * Based on api__message_uploader() from tampermonkey script
   */
  async uploadFile(file: File): Promise<APIResponse<MediaFile>> {
    const formData = new FormData();
    formData.append("file", file);

    return this.makeRequest<MediaFile>("/uploader/upload", {
      method: "POST",
      body: formData,
    });
  }

  // ==================== Counter Methods ====================

  /**
   * Get unread messages counter
   * Based on api__messages_counter() from tampermonkey script
   */
  async getMessagesCounter(): Promise<APIResponse<MessagesCounterResponse>> {
    return this.makeRequest<MessagesCounterResponse>("/m/counter");
  }

  // ==================== User Methods ====================

  /**
   * Search users by query
   */
  async searchUsers(
    query: string,
    limit = 10
  ): Promise<APIResponse<{ users: AuthUser[] }>> {
    return this.makeRequest<{ users: AuthUser[] }>(
      `/users/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  // ==================== DTF.ru Integration Methods ====================

  /**
   * Extract user ID from DTF profile URL
   * Based on profile button logic from tampermonkey script
   */
  static getUserIdFromProfile(): number | null {
    const urlParts = window.location.href
      .replace("https://dtf.ru/u/", "")
      .split("-");
    const userId = urlParts[0];

    if (Number.isInteger(Number(userId))) {
      return Number(userId);
    }

    return null;
  }

  /**
   * Extract media from message content (for rendering)
   */
  static extractMediaFromContent(content: string): {
    text: string;
    media: MediaFile[];
  } {
    // This would parse content and extract media URLs
    // For now, return as-is
    return {
      text: content,
      media: [],
    };
  }

  /**
   * Format message content for display
   */
  static formatMessageContent(message: Message): string {
    let content = message.text || "";

    // Escape HTML to prevent XSS (like in tampermonkey script)
    content = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return content;
  }

  /**
   * Get media preview URL
   */
  static getMediaPreviewUrl(media: MediaFile, size = "100x"): string {
    if (media.type === "image" && media.data.type !== "gif") {
      return `https://leonardo.osnova.io/${media.data.uuid}/-/preview/${size}/`;
    }

    if (media.type === "video" || media.data.type === "gif") {
      return `https://leonardo.osnova.io/${media.data.uuid}/-/format/mp4#t=0.1`;
    }

    return `https://leonardo.osnova.io/${media.data.uuid}/`;
  }

  /**
   * Get full media URL
   */
  static getMediaUrl(media: MediaFile): string {
    return `https://leonardo.osnova.io/${media.data.uuid}/`;
  }

  // ==================== Utility Methods ====================

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<APIResponse<HealthCheckResponse>> {
    return this.makeRequest<HealthCheckResponse>("/health");
  }

  /**
   * Get API version
   */
  getAPIVersion(): string {
    return "v2.5";
  }
}

// Export singleton instance
export const dtfAPI = new DTFMessengerAPI();

// Export class for custom instances
export default DTFMessengerAPI;
