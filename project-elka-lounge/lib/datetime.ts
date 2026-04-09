export const LOCAL_TZ = "Asia/Novosibirsk";

export function formatTimeLocal(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Ошибка формата";
    return d.toLocaleTimeString("ru-RU", {
      timeZone: LOCAL_TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "Ошибка формата";
  }
}

export function formatDateLocal(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Ошибка формата";
    return d.toLocaleDateString("ru-RU", {
      timeZone: LOCAL_TZ,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "Ошибка формата";
  }
}

export function formatDateTimeLocal(isoString: string | null | undefined): { date: string; time: string } {
  if (!isoString) return { date: "—", time: "—" };
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { date: "Ошибка", time: "Ошибка" };
    const dateStr = d.toLocaleDateString("ru-RU", {
      timeZone: LOCAL_TZ,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("ru-RU", {
      timeZone: LOCAL_TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return { date: dateStr, time: timeStr };
  } catch {
    return { date: "Ошибка", time: "Ошибка" };
  }
}

export function parseToLocalDateTime(isoString: string | null | undefined): Date | null {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function getLocalNow(): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: LOCAL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const year = Number(parts.find((p) => p.type === "year")?.value ?? 0);
  const month = Number(parts.find((p) => p.type === "month")?.value ?? 1);
  const day = Number(parts.find((p) => p.type === "day")?.value ?? 1);
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return new Date(year, month - 1, day, hours, minutes);
}

export function getHoursDiff(arrivalTimeISO: string | null | undefined): number {
  const localNow = getLocalNow();
  const arrivalLocal = parseToLocalDateTime(arrivalTimeISO ?? null);
  if (!arrivalLocal) return -999;
  const arrivalFormatted = arrivalLocal.toLocaleString("en-CA", {
    timeZone: LOCAL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const [y, m, d, h, min] = arrivalFormatted.split(/[/\s:]/).map(Number);
  const arrivalDate = new Date(y, m - 1, d, h, min);
  return (localNow.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60);
}

export function getCurrentTimeInLocalTZ(): { hours: number; minutes: number } {
  const now = new Date();
  const formatted = now.toLocaleTimeString("ru-RU", {
    timeZone: LOCAL_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [h, m] = formatted.split(":").map(Number);
  return { hours: h, minutes: m };
}
