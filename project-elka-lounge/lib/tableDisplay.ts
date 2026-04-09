export const DISPLAY_NUMBER_MAP: Record<string, string> = {
  '13': '11.5',
};

export const DISPLAY_TO_DB_NUMBER: Record<string, number> = {
  '11.5': 13,
};

export function toDisplayNumber(num: number | string): string {
  return DISPLAY_NUMBER_MAP[String(num)] ?? String(num);
}
