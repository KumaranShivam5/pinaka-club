// Shared Firebase initialization for pages that read/write Firestore
// (news, athletes/Shooters, contact messages, admin dashboard).
//
// Deliberately Firestore-only — Cloud Storage for Firebase now requires
// the paid Blaze plan to even enable, so athlete/news photos are plain
// URLs (pasted by the admin) instead of uploaded files.
//
// The phone/Google registration flow (OTP.html / firebase-auth.js) keeps its
// own separate init call — this file is intentionally independent of it so
// neither page can accidentally double-initialize the same Firebase app.

const firebaseConfig = {
    apiKey: "AIzaSyDaDICXfy_gTSFdy0bcjwARN7kHzCcbevc",
    authDomain: "pinaka-b8df8.firebaseapp.com",
    projectId: "pinaka-b8df8",
    storageBucket: "pinaka-b8df8.appspot.com",
    messagingSenderId: "400999335359",
    appId: "1:400999335359:web:2b5226ce3a4cd64f324d0a",
    measurementId: "G-WN5KYC9W3B"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
