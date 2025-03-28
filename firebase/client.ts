import { initializeApp,getApp,getApps } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzBnykj4wG4T5bq3w3krwJ8onDo5Vdz2c",
  authDomain: "practice-pitch.firebaseapp.com",
  projectId: "practice-pitch",
  storageBucket: "practice-pitch.firebasestorage.app",
  messagingSenderId: "39704769120",
  appId: "1:39704769120:web:1d80db0bc2f3520be4c905",
  measurementId: "G-9SBYP8DJYY"
};

// Initialize Firebase
const app =!getApps.length? initializeApp(firebaseConfig):getApp();
export const auth=getAuth(app);
export const db=getFirestore(app);