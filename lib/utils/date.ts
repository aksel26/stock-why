import { format, subDays, isWeekend } from "date-fns";

/** YYYY-MM-DD 형식으로 반환 */
export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** YYYYMMDD 형식으로 반환 (KIS API용) */
export function formatDateCompact(date: Date): string {
  return format(date, "yyyyMMdd");
}

/** 오늘 날짜를 YYYY-MM-DD로 반환 */
export function today(): string {
  return formatDate(new Date());
}

/** 한국 장 운영 시간 여부 (09:00~15:30 KST) */
export function isMarketOpen(): boolean {
  const now = new Date();
  const kstOffset = 9 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const kstMinutes = utcMinutes + kstOffset;

  const marketOpen = 9 * 60;       // 09:00
  const marketClose = 15 * 60 + 30; // 15:30

  const kstDay = new Date(now.getTime() + kstOffset * 60 * 1000);
  if (isWeekend(kstDay)) return false;

  return kstMinutes >= marketOpen && kstMinutes <= marketClose;
}

/** N 영업일 전 날짜 계산 (주말 제외, 공휴일 미반영) */
export function getBusinessDaysAgo(days: number, from: Date = new Date()): Date {
  let count = 0;
  let current = from;
  while (count < days) {
    current = subDays(current, 1);
    if (!isWeekend(current)) {
      count++;
    }
  }
  return current;
}
