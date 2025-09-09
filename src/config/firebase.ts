import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA_gF145hC1fbJJ4prwPXnUKaLCUCAy3Lo",
    authDomain: "automatedinvoicegenerator.firebaseapp.com",
    projectId: "automatedinvoicegenerator",
    storageBucket: "portfolio-1952e.appspot.com",
    messagingSenderId: "405163662354",
    appId: "1:405163662354:web:464be1163fc1ca42584ccb",
    measurementId: "G-B9827S2GKV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
