import { credential } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

var serviceAccount = require(path.resolve('firebase.json'));

initializeApp({
  credential: credential.cert(serviceAccount),
  databaseURL: "https://heimdallr41.firebaseio.com"
});

namespace EVEBase {
    export const Database = getFirestore();

    export async function GetUser(id: string) {
        const snapshot = await Database.collection('Users').doc(id).get()
        if (snapshot.exists) {
            return snapshot.data()!;
        }
        else {
            return null;
        }
    }

    export async function GetClasses() {
        const snapshot = await Database.collection('Classes').get();
        const classNames: string[] = [];
        snapshot.forEach(d => classNames.push(d.id));
        return classNames;
    }
}

export default EVEBase;