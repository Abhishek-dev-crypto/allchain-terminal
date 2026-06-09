import Link from "next/link";

export default function Warning() {
  return (
    <div className="bg-yellow-500 text-black text-center py-1 px-3 text-xs font-medium flex items-center justify-center gap-2">
  
  <span>
    ⚠️ AllChain is in simulation mode. No real funds are used.
  </span>

  <Link
    href="/warning"
    className="underline text-blue-800 hover:text-blue-600"
  >
    Learn more
  </Link>

</div>
  );
}