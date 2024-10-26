import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function createUserDocument(userId: string, email: string | null) {
  try {
    const userData = {
      email,
      uid: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      emailVerified: true
    };

    await setDoc(doc(db, 'users', userId), userData);
    return true;
  } catch (error) {
    console.error('Error creating user document:', error);
    return false;
  }
}

export async function addToWaitlist(userId: string, email: string | null) {
  try {
    const waitlistData = {
      email,
      uid: userId,
      verifiedAt: serverTimestamp(),
      status: 'verified'
    };

    await setDoc(doc(db, 'waitinglist', userId), waitlistData);
    return true;
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return false;
  }
}