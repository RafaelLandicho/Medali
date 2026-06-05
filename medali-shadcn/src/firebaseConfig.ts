// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHOwbFfspQ19A1VCdEM9ZfXzhVkdbSsrM",
  authDomain: "medalidata.firebaseapp.com",
  databaseURL: "https://medalidata-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "medalidata",
  storageBucket: "medalidata.firebasestorage.app",
  messagingSenderId: "1023001379038",
  appId: "1:1023001379038:web:769eb544188faa8b59024f",
  measurementId: "G-YMZ1EV0YQ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);
export { auth , db };