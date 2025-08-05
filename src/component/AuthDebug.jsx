"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthDebug() {
  const [authState, setAuthState] = useState("checking");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setAuthState("authenticated");
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setAuthState("unauthenticated");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-yellow-100 p-4 rounded border mb-4">
      <h3 className="font-bold mb-2">🔍 Authentication Debug</h3>
      <p><strong>Status:</strong> {authState}</p>
      {user && (
        <div>
          <p><strong>UID:</strong> {user.uid}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.displayName}</p>
        </div>
      )}
    </div>
  );
} 