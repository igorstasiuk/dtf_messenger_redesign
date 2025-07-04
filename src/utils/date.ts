/**
 * Format message timestamp with adaptive formatting
 */
export function formatMessageTime(date: number): string {
  const now = new Date();
  const messageDate = new Date(date * 1000);
  if (
    now.getDate() === messageDate.getDate() &&
    now.getMonth() === messageDate.getMonth() &&
    now.getFullYear() === messageDate.getFullYear()
  ) {
    return messageDate.toLocaleTimeString("ru", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return messageDate.toLocaleString("ru", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

/**
 * Get relative time for channel list (compact format)
 */
export function formatChannelTime(date: number): string {
  const minutesPast = Math.floor((Date.now() / 1000 - date) / 60);
  if (minutesPast < 1) {
    return "Сейчас";
  } else if (minutesPast < 60) {
    return `${minutesPast}м`;
  } else if (minutesPast < 24 * 60) {
    const hours = Math.floor(minutesPast / 60);
    return `${hours}ч`;
  } else if (minutesPast < 7 * 24 * 60) {
    const days = Math.floor(minutesPast / (24 * 60));
    return `${days}д`;
  } else {
    return new Date(date * 1000).toLocaleDateString("ru", {
      day: "numeric",
      month: "short",
    });
  }
}

/**
 * Get time ago text (e.g., "2 минуты назад", "1 час назад")
 */
export function getTimeAgo(timestamp: number): string {
  const minutesPast = Math.floor((Date.now() / 1000 - timestamp) / 60);
  if (minutesPast < 1) {
    return "только что";
  } else if (minutesPast < 60) {
    return `${minutesPast} минут назад`;
  } else if (minutesPast < 24 * 60) {
    const hours = Math.floor(minutesPast / 60);
    return `${hours} часов назад`;
  } else if (minutesPast < 24 * 7 * 60) {
    const days = Math.floor(minutesPast / 60 / 24);
    return `${days} дней назад`;
  } else {
    return formatChannelTime(timestamp);
  }
}

/**
 * Check if two timestamps are on the same day
 */
export function isSameDay(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1 * 1000);
  const date2 = new Date(timestamp2 * 1000);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Convert milliseconds timestamp to seconds (DTF API uses seconds)
 */
export function msToSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}

/**
 * Convert seconds timestamp to milliseconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Get current timestamp in seconds (for API calls)
 */
export function getCurrentTimestamp(): number {
  return msToSeconds(Date.now());
}
