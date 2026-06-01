"use client";

type Props = {
  title: string;
  message: string;
  severity?: "warning" | "error";
};

export default function IntelFallback({
  title,
  message,
  severity = "warning",
}: Props) {
  const color =
    severity === "error"
      ? "border-red-500/20 text-red-300"
      : "border-yellow-500/20 text-yellow-300";

  return (
    <div
      className={`
        rounded-xl
        border
        bg-white/[0.03]
        p-4
        ${color}
      `}
    >
      <div className="flex items-center gap-2">
        <span>⚠</span>

        <div className="font-semibold">
          {title}
        </div>
      </div>

      <div className="mt-2 text-sm text-white/60">
        {message}
      </div>

      <div className="mt-3 text-xs text-white/30">
        System will retry automatically.
      </div>
    </div>
  );
}