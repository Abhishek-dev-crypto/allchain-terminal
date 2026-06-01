import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export const loginWithGoogle = async () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const logout = async () => {
  const auth = getAuth();
  await signOut(auth);
};