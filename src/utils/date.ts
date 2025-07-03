/**
 * Format timestamp to human-readable relative time
 * Based on the date_format function from tampermonkey script
 */
export function formatRelativeTime(timestamp: number): string {
  const minutesPast = Math.floor((Date.now() / 1000 - timestamp) / 60);

  if (minutesPast < 60) {
    return `${minutesPast}м`;
  } else if (minutesPast < 24 * 60) {
    return `${Math.floor(minutesPast / 60)}ч`;
  } else if (minutesPast < 24 * 7 * 60) {
    return `${Math.floor(minutesPast / 60 / 24)}д`;
  } else if (minutesPast < 24 * 180 * 60) {
    return new Date(timestamp * 1000).toLocaleString("ru", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } else {
    const date = new Date(timestamp * 1000);
    const dateStr = date.toLocaleString("ru", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    return `${dateStr}<br/>${date.getFullYear()}`;
  }
}

/**
 * Format timestamp to full date and time
 */
export function formatFullDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString("ru", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
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
 * Get time ago text (e.g., "2 minutes ago", "1 hour ago")
 */
export function getTimeAgo(timestamp: number): string {
  const minutesPast = Math.floor((Date.now() / 1000 - timestamp) / 60);

  if (minutesPast < 1) {
    return "только что";
  } else if (minutesPast < 60) {
    return `${minutesPast} ${getPluralForm(
      minutesPast,
      "минуту",
      "минуты",
      "минут"
    )} назад`;
  } else if (minutesPast < 24 * 60) {
    const hours = Math.floor(minutesPast / 60);
    return `${hours} ${getPluralForm(hours, "час", "часа", "часов")} назад`;
  } else if (minutesPast < 24 * 7 * 60) {
    const days = Math.floor(minutesPast / 60 / 24);
    return `${days} ${getPluralForm(days, "день", "дня", "дней")} назад`;
  } else {
    return formatRelativeTime(timestamp);
  }
}

/**
 * Get correct plural form for Russian language
 */
function getPluralForm(
  number: number,
  form1: string,
  form2: string,
  form5: string
): string {
  const mod10 = number % 10;
  const mod100 = number % 100;

  if (mod100 >= 11 && mod100 <= 14) {
    return form5;
  }

  switch (mod10) {
    case 1:
      return form1;
    case 2:
    case 3:
    case 4:
      return form2;
    default:
      return form5;
  }
}

/**
 * Date formatting utilities based on DTF tampermonkey script
 */

/**
 * Format date similar to the tampermonkey script date_format function
 * @param date Unix timestamp in seconds
 * @returns Formatted time string
 */
export function formatTimeAgo(date: number): string {
  const minutesPast = Math.floor(((Date.now() / 1000) - date) / 60)
  
  if (minutesPast < 60) {
    return minutesPast + 'м'
  } else if (minutesPast < 24 * 60) {
    return Math.floor(minutesPast / 60) + 'ч'
  } else if (minutesPast < 24 * 7 * 60) {
    return Math.floor(minutesPast / 60 / 24) + 'д'
  } else if (minutesPast < 24 * 180 * 60) {
    return new Date(date * 1000).toLocaleString('ru', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    })
  } else {
    const formatted = new Date(date * 1000).toLocaleString('ru', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    })
    const year = new Date(date * 1000).getFullYear()
    return `${formatted}<br/>${year}`
  }
}

/**
 * Format absolute time for message timestamps
 */
export function formatAbsoluteTime(date: number): string {
  return new Date(date * 1000).toLocaleString('ru', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Format just time (HH:MM) for recent messages
 */
export function formatTimeOnly(date: number): string {
  return new Date(date * 1000).toLocaleString('ru', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Check if date is today
 */
export function isToday(date: number): boolean {
  const today = new Date()
  const messageDate = new Date(date * 1000)
  
  return today.getDate() === messageDate.getDate() &&
         today.getMonth() === messageDate.getMonth() &&
         today.getFullYear() === messageDate.getFullYear()
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: number): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const messageDate = new Date(date * 1000)
  
  return yesterday.getDate() === messageDate.getDate() &&
         yesterday.getMonth() === messageDate.getMonth() &&
         yesterday.getFullYear() === messageDate.getFullYear()
}

/**
 * Format message timestamp with adaptive formatting
 */
export function formatMessageTime(date: number): string {
  if (isToday(date)) {
    return formatTimeOnly(date)
  } else if (isYesterday(date)) {
    return `Вчера ${formatTimeOnly(date)}`
  } else {
    return formatAbsoluteTime(date)
  }
}

/**
 * Get relative time for channel list (compact format)
 */
export function formatChannelTime(date: number): string {
  const minutesPast = Math.floor(((Date.now() / 1000) - date) / 60)
  
  if (minutesPast < 1) {
    return 'Сейчас'
  } else if (minutesPast < 60) {
    return `${minutesPast}м`
  } else if (minutesPast < 24 * 60) {
    const hours = Math.floor(minutesPast / 60)
    return `${hours}ч`
  } else if (minutesPast < 7 * 24 * 60) {
    const days = Math.floor(minutesPast / (24 * 60))
    return `${days}д`
  } else {
    return new Date(date * 1000).toLocaleDateString('ru', {
      day: 'numeric',
      month: 'short'
    })
  }
}

/**
 * Convert milliseconds timestamp to seconds (DTF API uses seconds)
 */
export function msToSeconds(ms: number): number {
  return Math.floor(ms / 1000)
}

/**
 * Convert seconds timestamp to milliseconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000
}

/**
 * Get current timestamp in seconds (for API calls)
 */
export function getCurrentTimestamp(): number {
  return msToSeconds(Date.now())
}
