export const toISODateTime = (value: string | undefined): string | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const getCalendarPeriodBounds = (
  value: string,
  period: "date" | "month",
  timeZone: string,
): { timeMin: string; timeMax: string } | null => {
  const pattern =
    period === "date" ? /^(\d{4})-(\d{2})-(\d{2})$/ : /^(\d{4})-(\d{2})$/;
  const match = pattern.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = period === "date" ? Number(match[3]) : 1;
  const start = new Date(0);
  start.setUTCFullYear(year, month - 1, day);
  start.setUTCHours(0, 0, 0, 0);
  if (
    year < 1 ||
    start.getUTCFullYear() !== year ||
    start.getUTCMonth() !== month - 1 ||
    start.getUTCDate() !== day
  ) {
    return null;
  }

  const next = new Date(start);
  if (period === "date") {
    next.setUTCDate(next.getUTCDate() + 1);
  } else {
    next.setUTCMonth(next.getUTCMonth() + 1);
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const toUTC = (localDate: Date) => {
    const target = localDate.getTime();
    let timestamp = target;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const parts = Object.fromEntries(
        formatter
          .formatToParts(new Date(timestamp))
          .map(({ type, value }) => [type, value]),
      );
      const represented = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second),
      );
      const adjustment = target - represented;
      timestamp += adjustment;
      if (adjustment === 0) break;
    }

    return new Date(timestamp).toISOString();
  };

  return { timeMin: toUTC(start), timeMax: toUTC(next) };
};
