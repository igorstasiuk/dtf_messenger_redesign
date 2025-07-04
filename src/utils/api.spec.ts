import { describe, it, expect, beforeEach } from "vitest";
import DTFMessengerAPI from "./api";

const testToken = "test-token";

describe("DTFMessengerAPI", () => {
  let api: DTFMessengerAPI;

  beforeEach(() => {
    api = new DTFMessengerAPI();
  });

  it("should set and get access token", () => {
    api.setAccessToken(testToken);
    expect(api.getAccessToken()).toBe(testToken);
  });

  it("should clear access token", () => {
    api.setAccessToken(testToken);
    api.clearAccessToken();
    expect(api.getAccessToken()).toBeNull();
  });

  it("should generate correct media preview url for image", () => {
    const media = {
      uuid: "abc",
      type: "image" as const,
      data: { uuid: "abc", type: "jpg" },
    };
    const url = DTFMessengerAPI.getMediaPreviewUrl(media, "200x");
    expect(url).toContain("/preview/200x/");
  });

  it("should generate correct media url", () => {
    const media = {
      uuid: "abc",
      type: "image" as const,
      data: { uuid: "abc", type: "jpg" },
    };
    const url = DTFMessengerAPI.getMediaUrl(media);
    expect(url).toContain("leonardo.osnova.io/abc/");
  });
});
