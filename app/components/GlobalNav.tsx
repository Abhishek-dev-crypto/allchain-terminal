'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../../lib/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

export default function GlobalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [navLoading, setNavLoading] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [balance, setBalance] = useState(0);
  const [equity, setEquity] = useState(0);

  const navigateWithLoading = (path: string) => {
  setNavLoading(true);

  setTimeout(() => {
    router.push(path);
    setNavLoading(false);
  }, 500);
};

  /* ================= AUTH ================= */
  useEffect(() => {
    setIsClient(true);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  /* ================= PORTFOLIO (REAL-TIME) ================= */
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, 'portfolios', user.uid);

    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      const trades = data?.trades || [];

      let balance = 1000000;
      let positions: Record<string, { qty: number; avgPrice: number }> = {};

      trades.forEach((t: any) => {
        const coin = t.coin;

        if (!positions[coin]) {
          positions[coin] = { qty: 0, avgPrice: 0 };
        }

        if (t.type === 'buy') {
          const totalCost =
            positions[coin].avgPrice * positions[coin].qty +
            t.price * t.qty;

          positions[coin].qty += t.qty;
          positions[coin].avgPrice =
            totalCost / positions[coin].qty;

          balance -= t.price * t.qty;
        } else {
          positions[coin].qty -= t.qty;
          balance += t.price * t.qty;
        }
      });

      let portfolioValue = 0;

      Object.values(positions).forEach((p) => {
        portfolioValue += p.qty * p.avgPrice;
      });

      setBalance(balance);
      setEquity(balance + portfolioValue);
    });

    return () => unsub();
  }, [user]);

  /* ================= UI ================= */
  const toggleMenu = () => setMenuOpen(!menuOpen);

 const handleSignOut = () => {
  setNavLoading(true);

  signOut(auth)
    .then(() => {

      localStorage.setItem(
      "allchain_logout",
      Date.now().toString()
    );

      setTimeout(() => {
        router.push('/');
        setNavLoading(false);
      }, 500);
    })
    .catch((err) => {
      console.error(err);
      setNavLoading(false);
    });
};

  if (!isClient) return null;

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-[100] w-full border-b border-white/10 h-12">
      <div className="flex items-center justify-between px-4 py-3 flex-wrap md:flex-nowrap">

        {navLoading && (
  <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
    <div className="animate-spin h-10 w-10 border-b-2 border-white mb-4 rounded-full" />

    <p className="text-sm tracking-[0.2em] uppercase text-gray-300">
      Switching modules...
    </p>
  </div>
)}

        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">
          <button
  onClick={() => navigateWithLoading('/intel')}
  className="text-lg font-bold hover:text-blue-400 whitespace-nowrap"
>
  AllChain
</button>

          {user && (
            <div className="flex">
              <NavLinks
  pathname={pathname}
  mobile
  navigateWithLoading={navigateWithLoading}
/>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="hidden md:flex items-center gap-6">

          {user && (
            <div className="flex items-center gap-2 text-[11px] whitespace-nowrap">

  {/* Portfolio */}
  

  <span className="text-gray-600">•</span>

  {/* Balance */}
  <span className="text-gray-300">
    Demo Bal: <span className="text-white font-medium">
      ₹{balance.toFixed(0)}
    </span>
  </span>

  <span className="text-gray-600">•</span>

  {/* Equity */}
  <span className="text-gray-300">
    Eq: <span className="text-white font-medium">
      ₹{equity.toFixed(0)}
    </span>
  </span>

  <button
  onClick={() => navigateWithLoading('/tools/portfolio')}
  className={`${
    pathname === '/tools/portfolio'
      ? 'text-blue-400 font-semibold'
      : 'text-gray-300 hover:text-white'
  }`}
>
  Portfolio
</button>

</div>
          )}

          {/* AUTH */}
          {user && (
            <AuthSection user={user} onSignOut={handleSignOut} />
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden"
          onClick={toggleMenu}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full bg-gray-900 border-t border-white/10 px-4 py-3 flex flex-col space-y-3 md:hidden z-[100]">

          {user && <NavLinks
  pathname={pathname}
  mobile
  navigateWithLoading={navigateWithLoading}
/>}

          {/* MOBILE BAL/EQ */}
          {user && (
            <div className="px-2 text-sm text-gray-300">
              <p>💰 ₹{balance.toFixed(0)}</p>
              <p>📊 ₹{equity.toFixed(0)}</p>
            </div>
          )}

          {user && (
            <AuthSection
              user={user}
              onSignOut={handleSignOut}
              mobile
            />
          )}
        </div>
      )}
    </nav>
  );
}

/* ================= NAV LINKS ================= */
function NavLinks({
  pathname,
  mobile = false,
  navigateWithLoading,
}: {
  pathname: string;
  mobile?: boolean;
  navigateWithLoading: (path: string) => void;
}) {
  const linkClass = (path: string) =>
    pathname === path
      ? 'text-blue-400 font-semibold'
      : 'hover:text-blue-400';

  const links = [
  { name: 'Trade', href: '/trade' },
  { name: 'Market', href: '/market' },
  { name: 'NFT', href: '/nft' },
  { name: 'Learn', href: '/learn' },
];

  return (
    <div
      className="flex items-center gap-3 text-sm whitespace-nowrap"
    >
      {links.map(({ name, href }) => (
        <button
  key={href}
  onClick={() => navigateWithLoading(href)}
  className={linkClass(href)}
>
  {name}
</button>
      ))}
    </div>
  );
}

/* ================= AUTH SECTION ================= */
function AuthSection({
  user,
  onSignOut,
  mobile = false,
}: {
  user: User;
  onSignOut: () => void;
  mobile?: boolean;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

if (mobile) {
  return (
    <div className="flex flex-col space-y-2 px-2">

      <Link href="/profile" className="flex items-center gap-2">
        <UserIcon size={18} />
        Profile
      </Link>

      <div className="border-t border-white/10 my-2" />

      <Link href="/help">Help Center</Link>
      <Link href="/support">Support</Link>
      <Link href="/security">Security</Link>
      <Link href="/terms">Terms of Service</Link>
      <Link href="/privacy">Privacy Policy</Link>
      <Link href="/pages/legal">Legal Notice</Link>

      <div className="border-t border-white/10 my-2" />

      <button
        onClick={onSignOut}
        className="text-red-400 flex items-center gap-2"
      >
        <LogOut size={18} />
        Sign Out
      </button>

    </div>
  );
}

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            className="w-8 h-8 rounded-full border-2 border-blue-500"
          />
        ) : (
          <UserIcon size={24} />
        )}
      </button>

      {dropdownOpen && (
  <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-lg shadow-xl overflow-hidden">

    <Link
      href="/profile"
      className="block px-4 py-2 hover:bg-gray-100"
    >
      Profile
    </Link>

    <div className="border-t border-gray-200" />

    <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
      Resources
    </div>

    <Link
      href="/help"
      className="block px-4 py-2 hover:bg-gray-100"
    >
      Help Center
    </Link>

    <Link
      href="/support"
      className="block px-4 py-2 hover:bg-gray-100"
    >
      Support
    </Link>

    <Link
      href="/security"
      className="block px-4 py-2 hover:bg-gray-100"
    >
      Security
    </Link>

    <Link
      href="/terms"
      className="block px-4 py-2 hover:bg-gray-100"
    >
      Terms of Service
    </Link>

    <Link
  href="/privacy"
  className="block px-4 py-2 hover:bg-gray-100"
>
  Privacy Policy
</Link>

    <Link
      href="/legal"
      className="block px-4 py-2 hover:bg-gray-100"
    >
      Legal
    </Link>

    <div className="border-t border-gray-200" />

    <button
      onClick={onSignOut}
      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
    >
      Sign Out
    </button>

  </div>
)}
    </div>
  );
}