// ✅ TaskSelector.jsx
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const skills = ["listening", "reading", "writing", "speaking"];

export default function TaskSelector({ user }) {
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const ref = doc(db, "users", user.uid, "tasks", new Date().toISOString().split("T")[0]);
        const snap = await getDoc(ref);
        if (snap.exists()) setSelected(snap.data().tasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const toggleSkill = async (skill) => {
    try {
      const newSelection = {
        ...selected,
        [skill]: !selected[skill],
      };
      setSelected(newSelection);

      const today = new Date().toISOString().split("T")[0];
      const ref = doc(db, "users", user.uid, "tasks", today);
      await setDoc(ref, {
        date: today,
        tasks: newSelection,
      });
    } catch (err) {
      console.error("Error saving task:", err);
      setError("Failed to save task");
    }
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-2 gap-4">
      {skills.map((skill) => (
        <button
          key={skill}
          onClick={() => toggleSkill(skill)}
          className={`p-4 rounded border font-medium text-center ${
            selected[skill] ? "bg-green-400 text-white" : "bg-gray-200"
          }`}
        >
          {skill.charAt(0).toUpperCase() + skill.slice(1)}
        </button>
      ))}
    </div>
  );
}