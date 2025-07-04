import { describe, it, expect } from "vitest";
import { formatMessageTime, getTimeAgo } from "./date";

// Мокаем Date.now для стабильных тестов
const fixedNow = new Date("2024-06-01T12:00:00Z").getTime();
const nowSec = Math.floor(fixedNow / 1000);

// @ts-ignore
Date.now = () => fixedNow;

describe("formatMessageTime", () => {
  it("should format today as HH:MM", () => {
    const ts = nowSec - 60 * 60; // 1 час назад
    const result = formatMessageTime(ts);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it("should format old date as full date", () => {
    const ts = Math.floor(new Date("2023-01-01T10:00:00Z").getTime() / 1000);
    const result = formatMessageTime(ts);
    expect(result).toMatch(/2023/);
  });
});

describe("getTimeAgo", () => {
  it('should return "только что" for <1 мин', () => {
    const ts = nowSec - 10;
    expect(getTimeAgo(ts)).toBe("только что");
  });
  it("should return minutes ago", () => {
    const ts = nowSec - 60 * 5;
    expect(getTimeAgo(ts)).toMatch(/5 минут назад/);
  });
  it("should return hours ago", () => {
    const ts = nowSec - 60 * 60 * 2;
    expect(getTimeAgo(ts)).toMatch(/2 часов назад/);
  });
  it("should return days ago", () => {
    const ts = nowSec - 60 * 60 * 24 * 3;
    expect(getTimeAgo(ts)).toMatch(/3 дней назад/);
  });
});
