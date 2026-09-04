"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";

export function usePremiumEntitlement() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;
    let unsubscribePremium: (() => void) | undefined;

    unsubscribeUser = onAuthStateChanged(auth, (user) => {
      unsubscribePremium?.();

      if (!user) {
        setIsPremium(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      const userRef = doc(db, "users", user.uid);

      unsubscribePremium = onSnapshot(
        userRef,
        (snapshot) => {
          const data = snapshot.data();

          setIsPremium(data?.premiumStatus === "premium");
          setLoading(false);
        },
        (error) => {
          console.error("Premium entitlement listener:", error);
          setIsPremium(false);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeUser?.();
      unsubscribePremium?.();
    };
  }, []);

  return {
    isPremium,
    premiumLoading: loading,
  };
}
