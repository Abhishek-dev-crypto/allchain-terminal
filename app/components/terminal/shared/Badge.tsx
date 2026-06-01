type BadgeProps = {
  text: string;
  variant?: 'success' | 'danger' | 'neutral' | 'premium';
};

export default function Badge({
  text,
  variant = 'neutral',
}: BadgeProps) {
  const variants = {
    success:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',

    danger:
      'border-red-500/20 bg-red-500/10 text-red-300',

    neutral:
      'border-white/10 bg-white/[0.05] text-gray-300',

    premium:
      'border-violet-500/20 bg-violet-500/10 text-violet-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm ${variants[variant]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />

      {text}
    </span>
  );
}