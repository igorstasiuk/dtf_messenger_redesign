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
