import firebase from "firebase/app";

import "firebase/firestore";

const firebaseConfig = {
  // your firebase config key value
};

firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();

export default db;
