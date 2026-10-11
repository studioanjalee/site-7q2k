/* Kasaade.lk – Firebase settings
   These web keys are not secrets (they are visible in every web app).
   Real protection comes from firestore.rules / storage.rules.
   If login says "invalid-api-key", copy the config again from
   Firebase console → Project settings → Your apps → kasade Web → Config. */
export const firebaseConfig = {
  apiKey: "AIzaSyAu1ZBsj47lkJUwZq3PsHdvMtUGb4DE29w",
  authDomain: "kasade-app.firebaseapp.com",
  projectId: "kasade-app",
  storageBucket: "kasade-app.firebasestorage.app",
  messagingSenderId: "1005442215572",
  appId: "1:1005442215572:web:c7e6de6f7fc483af6a4e81"
};

/* Where vendor photos are kept:
   'firestore' = free Spark plan (small compressed photos inside Firestore)
   'storage'   = Cloud Storage (needs Blaze plan). Change this ONE word after you upgrade. */
export const PHOTO_MODE = 'firestore';

/* Show the 28 sample vendors for previewing? Keep false for the real app. */
export const SHOW_SAMPLES = false;
