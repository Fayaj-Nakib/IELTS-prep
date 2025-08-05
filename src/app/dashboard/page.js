"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Leaderboard from "@/component/Leaderboard.js";
import Navbar from "@/component/Navbar.js";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photo: firebaseUser.photoURL,
        };
        setUser(userData);
        // Also update localStorage for backward compatibility
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem("user");
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
          </div>

          {/* Leaderboard display */}
          <Leaderboard />
        </div>
      </main>
    </div>
  );
}
