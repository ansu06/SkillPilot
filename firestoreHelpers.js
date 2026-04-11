// firestoreHelpers.js
// Simple functions to load and save user data to Firestore
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Load user data (progress, streak, selectedCareer) from Firestore.
 * Returns the data object, or null if no document exists yet.
 */
export async function loadUserData(userId) {
  if (!userId) return null;
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data(); // { progress, streak, selectedCareer }
    }
    return null; // No data saved yet
  } catch (error) {
    console.error("Error loading user data from Firestore:", error);
    return null;
  }
}

/**
 * Save user data to Firestore. Uses merge so only changed fields are updated.
 * data should be: { progress: {...}, streak: {...}, selectedCareer: "..." }
 */
export async function saveUserData(userId, data) {
  if (!userId) return;
  try {
    await setDoc(doc(db, "users", userId), data, { merge: true });
  } catch (error) {
    console.error("Error saving user data to Firestore:", error);
  }
}
