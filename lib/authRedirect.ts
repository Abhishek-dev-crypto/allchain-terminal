import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "./firebaseConfig";

export const handleStartTrading = async (router: any) => {
  try {
    const user = auth.currentUser;

    // If already logged in → go to trade
    if (user) {
      router.push("/trade");
      return;
    }

    // Not logged in → trigger Google login
    const result = await signInWithPopup(auth, googleProvider);

    if (result.user) {
      router.push("/trade");
    }
  } catch (error) {
    console.error("Auth error:", error);
  }
};