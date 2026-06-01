// /lib/intel/formatters.ts

export function formatPercentage(value: number) {
  if (Number.isNaN(value)) return "0.00%";

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatConfidence(value: number) {
  return `${Math.round(value)}%`;
}

export function formatBillions(value: number) {
  return `$${(value / 1_000_000_000).toFixed(2)}B`;
}