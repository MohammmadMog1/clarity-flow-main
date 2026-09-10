/**
 * "Today" and other date keys must be computed from the viewer's local
 * calendar date, not UTC — `new Date().toISOString().slice(0, 10)` silently
 * rolls over to tomorrow several hours early for anyone west of UTC.
 */
export function toLocalDateKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toLocalDateKey(new Date());
}

export function currentMonthKey(): string {
  return todayKey().slice(0, 7);
}
