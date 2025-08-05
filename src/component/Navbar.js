// ✅ Navbar.jsx
"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-gray-100 p-4 flex justify-between items-center">
      <div className="space-x-4">
        <Link href="/dashboard" className="font-semibold text-blue-600">
          Dashboard
        </Link>
        <Link href="/profile" className="text-blue-600">
          Profile
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
      >
        Log out
      </button>
    </nav>
  );
}