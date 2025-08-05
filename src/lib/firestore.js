import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy
} from "firebase/firestore";

// IELTS Band Score Rounding Function
// Rounds scores to nearest 0.5 or whole number
// Examples: 6.2 → 6.0, 6.7 → 7.0, 6.5 → 6.5
export function roundIELTSBand(score) {
  if (score === null || score === undefined || score === "") return null;
  
  const numScore = parseFloat(score);
  if (isNaN(numScore)) return null;
  
  // Get the decimal part
  const decimal = numScore - Math.floor(numScore);
  
  if (decimal === 0) {
    // Already a whole number
    return numScore;
  } else if (decimal <= 0.25) {
    // Round down to whole number
    return Math.floor(numScore);
  } else if (decimal >= 0.75) {
    // Round up to whole number
    return Math.ceil(numScore);
  } else {
    // Round to 0.5
    return Math.floor(numScore) + 0.5;
  }
}

// Get daily tasks and scores for a specific date
export async function getDailyTasks(uid, date) {
  try {
    const ref = doc(db, "users", uid, "tasks", date);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      // Return both tasks and scores (if present)
      const data = docSnap.data();
      return {
        tasks: data.tasks || {},
        scores: data.scores || {},
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching daily tasks:", error);
    return null;
  }
}

// Save daily task, scores, and update leaderboard stats
export async function saveDailyTasks(uid, date, tasks, scores, userInfo) {
  try {
    const ref = doc(db, "users", uid, "tasks", date);
    await setDoc(ref, { date, tasks, scores }, { merge: true });

    // Update stats (optional: you may want to update leaderboard based on scores)
    const statRef = doc(db, "leaderboard", uid);
    const statSnap = await getDoc(statRef);

    const increments = {};
    let total = 0;
    for (let key in tasks) {
      if (tasks[key]) {
        increments[key] = increment(1);
        total += 1;
      }
    }

    if (statSnap.exists()) {
      await updateDoc(statRef, {
        ...increments,
        total: increment(total),
      });
    } else {
      await setDoc(statRef, {
        name: userInfo.name,
        photo: userInfo.photo,
        total,
        ...taskKeysToZeroExcept(tasks),
      });
    }
  } catch (error) {
    console.error("Error saving daily tasks:", error);
    throw error;
  }
}

// Get all exams
export async function getAllExams() {
  const examsRef = collection(db, "exams");
  const snap = await getDocs(examsRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get all user results for a given examId
export async function getExamResults(examId) {
  const resultsRef = collection(db, "exams", examId, "results");
  const snap = await getDocs(resultsRef);
  return snap.docs.map(doc => ({ userId: doc.id, ...doc.data() }));
}

// Get all exam results for a given userId (across all exams)
export async function getUserExamResults(userId) {
  const examsRef = collection(db, "exams");
  const examsSnap = await getDocs(examsRef);
  const results = [];
  for (const examDoc of examsSnap.docs) {
    const examId = examDoc.id;
    const resultRef = doc(db, "exams", examId, "results", userId);
    const resultSnap = await getDoc(resultRef);
    if (resultSnap.exists()) {
      results.push({ examId, exam: examDoc.data(), ...resultSnap.data() });
    }
  }
  return results;
}

// Save/update a user's result for a given examId (partial update allowed)
export async function saveUserExamResult(examId, userId, result, userInfo) {
  const ref = doc(db, "exams", examId, "results", userId);
  await setDoc(ref, { ...result, name: userInfo.name, photo: userInfo.photo, timestamp: serverTimestamp() }, { merge: true });
}

// Set an exam as current (unset previous)
export async function setCurrentExam(examId) {
  // Unset previous current
  const examsRef = collection(db, "exams");
  const snap = await getDocs(examsRef);
  for (const docSnap of snap.docs) {
    if (docSnap.data().isCurrent && docSnap.id !== examId) {
      await updateDoc(doc(db, "exams", docSnap.id), { isCurrent: false });
    }
  }
  // Set new current
  await updateDoc(doc(db, "exams", examId), { isCurrent: true });
}

// Get the current exam
export async function getCurrentExam() {
  const examsRef = collection(db, "exams");
  const q = query(examsRef, where("isCurrent", "==", true));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

function taskKeysToZeroExcept(tasks) {
  const obj = {};
  for (const key of ["listening", "reading", "writing", "speaking"]) {
    obj[key] = tasks[key] ? 1 : 0;
  }
  return obj;
}
