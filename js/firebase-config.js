// js/firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyD58sImRZH27TS_qZGMT92sb5q8T8zdIdA",
    authDomain: "projeto-au.firebaseapp.com",
    projectId: "projeto-au",
    storageBucket: "projeto-au.firebasestorage.app",
    messagingSenderId: "447254280326",
    appId: "1:447254280326:web:374f8bfed54ea188d83907"
  };

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Referências aos serviços
const auth = firebase.auth();
const database = firebase.database(); // Realtime Database