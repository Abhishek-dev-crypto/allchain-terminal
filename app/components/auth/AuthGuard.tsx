"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
    console.log("ALLCHAIN DEVELOPER UID:", currentUser.uid);
    console.log("ALLCHAIN DEVELOPER EMAIL:", currentUser.email);
  }

      if (!currentUser) {
        router.replace("/");
      }
    });

    return () => unsub();
  }, [router]);

 
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}