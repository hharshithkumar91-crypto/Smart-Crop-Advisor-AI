import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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
