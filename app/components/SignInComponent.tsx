import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "lib/firebaseConfig";
import { trackEvent } from "lib/analytics";

export const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    // Analytics Event
    trackEvent("login_success");

    const user = result.user;
    console.log("Signed in user:", user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error signing in with Google:", error.message);
    } else {
      console.error("Unknown error during Google sign-in:", error);
    }
  }
};