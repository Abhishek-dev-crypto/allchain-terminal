type MetricProps = {
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon?: string;
};

export default function Metric({
  label,
  value,
  change,
  positive = true,
  icon,
}: MetricProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-all duration-300">

      {/* Top */}
      <div className="flex items-start justify-between">

        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">
            {label}
          </p>

          <h3 className="mt-2 text-xl font-semibold text-white">
            {value}
          </h3>
        </div>

        {icon && (
          <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-sm text-gray-300">
            {icon}
          </div>
        )}

      </div>

      {/* Bottom */}
      {change && (
        <div className="mt-4 flex items-center gap-2">

          <div
            className={`h-2 w-2 rounded-full ${
              positive
                ? 'bg-emerald-400'
                : 'bg-red-400'
            }`}
          />

          <p
            className={`text-xs font-medium ${
              positive
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          >
            {change}
          </p>

        </div>
      )}

    </div>
  );
}