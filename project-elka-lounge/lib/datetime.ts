export const NOVOSIBIRSK_TZ = "Asia/Novosibirsk";

export function formatTimeLocal(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Ошибка формата";
    return d.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: NOVOSIBIRSK_TZ,
    });
  } catch {
    return "Ошибка формата";
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
    timeZone: NOVOSIBIRSK_TZ,
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
    timeZone: NOVOSIBIRSK_TZ,
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
