export function resolveTarget(
  target: string | null
): HTMLElement | null {
  if (!target) return null;

  if (typeof window === "undefined") return null;

  const el = document.querySelector<HTMLElement>(
    `[data-genie="${target}"]`
  );

  if (!el) return null;

  return el;
}