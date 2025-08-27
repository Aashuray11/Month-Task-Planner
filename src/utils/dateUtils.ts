// Lightweight date utilities; when installing deps, prefer date-fns imports

export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseISO(d: string): Date {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, (m || 1) - 1, day || 1, 0, 0, 0, 0);
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

// Monday = 1, Sunday = 7
export function getISODay(d: Date): number {
  const wd = d.getDay();
  return wd === 0 ? 7 : wd;
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

export function differenceInCalendarDays(a: Date, b: Date): number {
  const A = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const B = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((A - B) / (1000 * 60 * 60 * 24));
}

export function eachDayOfInterval(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function getMonthGrid(currentMonth: Date): Date[] {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  // find Monday of the first week cell
  const startOffset = getISODay(start) - 1; // 0..6
  const gridStart = addDays(start, -startOffset);
  // total cells: 35 or 42; compute 6 rows when needed
  const totalDays = differenceInCalendarDays(end, gridStart) + 1; // days until last day
  const cells = totalDays <= 35 ? 35 : 42;
  return Array.from({ length: cells }, (_, i) => addDays(gridStart, i));
}
