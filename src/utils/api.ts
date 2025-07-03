import type {
  DTFApiClient,
  ApiResponse,
  MessagesCounter,
  Channel,
  Message,
  MediaFile,
  ChannelsResponse,
  ChannelResponse,
  MessagesResponse,
} from "@/types/api";

export class DTFMessengerAPI implements DTFApiClient {
  private baseURL = "https://api.dtf.ru/v2.5";
  private token: string | null = null;
  private tokenPromise: Promise<void> | null = null;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    this.tokenPromise = this.listenForAuthToken();
  }

  private async listenForAuthToken(): Promise<void> {
    return new Promise((resolve) => {
      const bc = new BroadcastChannel("osnova-events");

      bc.onmessage = ({ data: { type, detail } }) => {
        if (type === "auth session updated") {
          this.token = detail.session.accessToken;
          resolve();
        }
      };

      // Check if token is already available
      if (this.token) {
        resolve();
      }
    });
  }

  async getAccessToken(): Promise<string> {
    if (!this.token && this.tokenPromise) {
      await this.tokenPromise;
    }

    if (!this.token) {
      throw new Error("Access token not available");
    }

    return this.token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        Accept: "application/json",
        JWTAuthorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data: ApiResponse<T> = await response.json();

    if (!data.result) {
      throw new Error(data.error || "API request failed");
    }

    return data.result;
  }

  async getMessagesCounter(): Promise<MessagesCounter> {
    return this.makeRequest<MessagesCounter>("/m/counter");
  }

  async getChannels(): Promise<Channel[]> {
    const response = await this.makeRequest<ChannelsResponse>("/m/channels");
    return response.channels;
  }

  async getChannel(channelId: string): Promise<Channel> {
    const response = await this.makeRequest<ChannelResponse>(
      `/m/channel?id=${channelId}`
    );
    return response.channel;
  }

  async getMessages(
    channelId: string,
    beforeTime?: number
  ): Promise<Message[]> {
    const beforeParam = beforeTime ? `&beforeTime=${beforeTime}` : "";
    const response = await this.makeRequest<MessagesResponse>(
      `/m/messages?channelId=${channelId}${beforeParam}`
    );
    return response.messages;
  }

  async sendMessage(
    channelId: string,
    text: string,
    media?: MediaFile[]
  ): Promise<void> {
    const formData = new FormData();
    formData.append("channelId", channelId);
    formData.append("text", text);
    formData.append("ts", (Date.now() / 1000).toString());
    formData.append("idTmp", (Date.now() / 1000).toString());
    formData.append("media", JSON.stringify(media || []));

    await this.makeRequest<void>("/m/send", {
      method: "POST",
      body: formData,
    });
  }

  async uploadMedia(file: File): Promise<MediaFile> {
    const formData = new FormData();
    formData.append("file", file);

    return this.makeRequest<MediaFile>("/uploader/upload", {
      method: "POST",
      body: formData,
    });
  }
}

// Export singleton instance
export const dtfApi = new DTFMessengerAPI();
