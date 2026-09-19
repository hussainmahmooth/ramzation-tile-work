import type { Bill } from '../types/index.ts';

/**
 * Generates the next sequential unique bill number in format: RTW-YYYY-XXXX
 * e.g., RTW-2026-0001
 */
export function generateNextBillNumber(existingBills: Bill[] = []): string {
  const currentYear = new Date().getFullYear();
  const prefix = `RTW-${currentYear}-`;

  // Filter bills belonging to the current year
  const currentYearNumbers = existingBills
    .map((b) => b.bill_number)
    .filter((num) => num && num.startsWith(prefix))
    .map((num) => {
      const parts = num.split('-');
      const seq = parseInt(parts[2], 10);
      return isNaN(seq) ? 0 : seq;
    });

  const maxSeq = currentYearNumbers.length > 0 ? Math.max(...currentYearNumbers) : 0;
  const nextSeq = maxSeq + 1;
  const paddedSeq = String(nextSeq).padStart(4, '0');

  return `${prefix}${paddedSeq}`;
}

/**
 * Validates if a bill number has a valid format (RTW-YYYY-XXXX)
 */
export function isValidBillNumber(billNumber: string): boolean {
  const regex = /^RTW-\d{4}-\d{4,}$/;
  return regex.test(billNumber.trim());
}

/**
 * Generates default project number e.g. PRJ-2026-001
 */
export function generateNextProjectNumber(existingProjectsCount: number = 0): string {
  const currentYear = new Date().getFullYear();
  const nextSeq = existingProjectsCount + 1;
  const paddedSeq = String(nextSeq).padStart(3, '0');
  return `PRJ-${currentYear}-${paddedSeq}`;
}
