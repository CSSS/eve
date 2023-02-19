import { credential } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import { IClass, IUser } from '../typing';

var serviceAccount = require(path.resolve('firebase.json'));

initializeApp({
  credential: credential.cert(serviceAccount),
  databaseURL: "https://heimdallr41.firebaseio.com"
});

namespace EVEBase {
    export const Database = getFirestore();

    export async function SetUser(id: string, prop: keyof IUser, value: any) {
        const updateObj: Partial<IUser> = {};
        updateObj[prop] = value;
        const data = await Database.collection('Users').doc(id).get()
        return data.exists?
            Database.collection('Users').doc(id).update(updateObj):
            Database.collection('Users').doc(id).set(Object.assign(updateObj, {}) as IUser);
    }

    export async function GetUser(id: string): Promise<Partial<IUser> | null> {
        const snapshot = await Database.collection('Users').doc(id).get()
        if (snapshot.exists) {
            const data = snapshot.data()!;
            return {
                class: data.class
            };
        }
        else {
            return null;
        }
    }

    export async function GetClass(className:string): Promise<IClass | null> {
        const snapshot = await Database.collection('Classes').doc(className).get();
        if (snapshot.exists) {
            return snapshot.data() as IClass;
        }
        else {
            return null;
        }
    }

    export async function GetClasses(): Promise<Record<string, IClass>> {
        const snapshot = await Database.collection('Classes').get();
        const classNames: Record<string, IClass> = {};
        snapshot.forEach(d => {
            classNames[d.id] = d.data() as IClass;
        });
        return classNames;
    }
}

export default EVEBase;