import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function updateLeaderboardStats(user, tasks) {
  if (!user || !tasks) {
    console.warn("Missing user or tasks data for leaderboard update");
    return;
  }

  try {
    const ref = doc(db, "leaderboard", user.uid);
    const docSnap = await getDoc(ref);

    let total = 0;
    const increments = {};

    for (const skill of ["listening", "reading", "writing", "speaking"]) {
      if (tasks[skill]) {
        increments[skill] = increment(1);
        total++;
      }
    }
    increments.total = increment(total);

    if (docSnap.exists()) {
      await updateDoc(ref, increments);
    } else {
      await setDoc(ref, {
        name: user.name || "Anonymous",
        photo: user.photo || "",
        listening: tasks.listening ? 1 : 0,
        reading: tasks.reading ? 1 : 0,
        writing: tasks.writing ? 1 : 0,
        speaking: tasks.speaking ? 1 : 0,
        total,
      });
    }
  } catch (error) {
    console.error("Error updating leaderboard stats:", error);
    // Don't throw the error to prevent breaking the UI
  }
}
