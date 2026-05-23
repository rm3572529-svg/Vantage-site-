import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, User as FirebaseUser } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { User } from "@workspace/api-client-react";
import { toast } from "sonner";

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function syncUserWithApi(uid: string, email: string, displayName: string, photoURL: string): Promise<User> {
  const res = await fetch(`/api/users/${uid}`);
  if (!res.ok) throw new Error("Failed to sync user");
  const user: User = await res.json();

  // Update email/displayName/photoURL if they changed
  if (user.email !== email || user.displayName !== displayName) {
    const patch = await fetch(`/api/users/${uid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, displayName, photoURL }),
    });
    if (patch.ok) return patch.json();
  }
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await syncUserWithApi(
            currentUser.uid,
            currentUser.email || "",
            currentUser.displayName || "",
            currentUser.photoURL || ""
          );

          const wasNewUser = !userProfile;
          setUserProfile(profile);

          // Show admin toast if first-time admin promotion
          if (wasNewUser && profile.role === "admin") {
            toast.success("👑 You've been granted Admin access!", {
              description: "You're the first user — go to /admin to manage your platform.",
              duration: 6000,
            });
          }
        } catch (e) {
          // Fallback: create minimal profile in Firestore
          const fallback: User = {
            uid: currentUser.uid,
            email: currentUser.email || "",
            displayName: currentUser.displayName || "",
            photoURL: currentUser.photoURL || "",
            role: "user",
            linksUsed: 0,
            linksLimit: 25,
            tasksCompleted: [],
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, "users", currentUser.uid), fallback, { merge: true });
          setUserProfile(fallback);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    // Let the onAuthStateChanged handler + API sync handle the profile creation
    // so the first-admin logic runs server-side
    await setDoc(doc(db, "users", newUser.uid), {
      uid: newUser.uid,
      email: newUser.email || email,
      displayName,
      photoURL: "",
      createdAt: new Date().toISOString(),
    }, { merge: true });
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
