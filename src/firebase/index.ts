import {initializeApp, getApp, getApps, FirebaseApp} from 'firebase/app';
import {getAuth, Auth} from 'firebase/auth';
import {getFirestore, Firestore} from 'firebase/firestore';
import {firebaseConfig} from './config';

export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  console.log('initializeFirebase: Initializing Firebase app...');
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  console.log('initializeFirebase: Firebase app initialized.');
  return {app, auth, firestore};
}

export {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
} from './provider';

export {FirebaseClientProvider} from './client-provider';
export {useUser} from './auth/use-user';
