import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp, onSnapshot, orderBy, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOjbUa99WcMROIWsaGbvFBoLoYPEE2_KY",
  authDomain: "smart-crop-advisor-ai.firebaseapp.com",
  projectId: "smart-crop-advisor-ai",
  storageBucket: "smart-crop-advisor-ai.firebasestorage.app",
  messagingSenderId: "571496941665",
  appId: "1:571496941665:web:a545774e624564f4c34220",
  measurementId: "G-Z9NVY4JR04"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ── Firestore Helper Functions ──────────────────────────────────────

// Save new user to Firestore
export async function saveUserToFirestore(userData) {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      ...userData,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isOnline: true
    });
    return docRef.id;
  } catch (e) {
    console.error("Error saving user:", e);
    return null;
  }
}

// Update user login status
export async function updateUserLogin(phone) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        lastLogin: serverTimestamp(),
        isOnline: true
      });
    }
  } catch (e) {
    console.error("Error updating login:", e);
  }
}

// Set user offline
export async function setUserOffline(phone) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        isOnline: false
      });
    }
  } catch (e) {
    console.error("Error setting offline:", e);
  }
}

// Log signup/signin events
export async function logAuthEvent(type, phone, name) {
  try {
    await addDoc(collection(db, "auth_logs"), {
      type: type, // 'signup' or 'signin'
      phone: phone,
      name: name || '',
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("Error logging auth event:", e);
  }
}

// Get total user count
export async function getTotalUsers() {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.size;
  } catch (e) {
    console.error("Error getting user count:", e);
    return 0;
  }
}

// Get online users count
export async function getOnlineUsers() {
  try {
    const q = query(collection(db, "users"), where("isOnline", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (e) {
    console.error("Error getting online users:", e);
    return 0;
  }
}

// Check if phone already exists in Firestore
export async function checkPhoneExists(phone) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (e) {
    console.error("Error checking phone:", e);
    return false;
  }
}

// Find user by phone for sign-in
export async function findUserByPhone(phone) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  } catch (e) {
    console.error("Error finding user:", e);
    return null;
  }
}

// Find user by email for sign-in
export async function findUserByEmail(email) {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  } catch (e) {
    console.error("Error finding user:", e);
    return null;
  }
}

// Get recent auth logs
export async function getRecentAuthLogs(count = 10) {
  try {
    const q = query(collection(db, "auth_logs"), orderBy("timestamp", "desc"), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Error getting auth logs:", e);
    return [];
  }
}
