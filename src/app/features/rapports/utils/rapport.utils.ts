export function isInDateRange(dateValue?: string, startDate?: string, endDate?: string): boolean {
  if (!dateValue) {
    return false;
  }

  const date = new Date(dateValue);

  if (startDate) {
    const start = new Date(startDate);

    if (date < start) {
      return false;
    }
  }

  if (endDate) {
    const end = new Date(endDate);

    end.setHours(23, 59, 59, 999);

    if (date > end) {
      return false;
    }
  }

  return true;
}

export function sumBy<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((total, item) => total + (selector(item) || 0), 0);
}

export function calculateRate(value: number, total: number): number {
  if (!total) {
    return 0;
  }

  return Number(((value / total) * 100).toFixed(2));
}

export function calculateRemaining(expected: number, paid: number): number {
  return Math.max(0, expected - paid);
}
