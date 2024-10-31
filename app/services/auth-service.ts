import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@nativescript/firebase-auth';
import { getFirestore } from '@nativescript/firebase-firestore';

export class AuthService {
    private auth = getAuth();
    private db = getFirestore();

    async signUp(email: string, password: string, accountType: string) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            
            // Create user profile in Firestore
            await this.db.collection('users').doc(userCredential.user.uid).set({
                email,
                accountType,
                createdAt: new Date()
            });

            return userCredential.user;
        } catch (error) {
            throw error;
        }
    }

    async signIn(email: string, password: string) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    }

    async getUserProfile(uid: string) {
        try {
            const doc = await this.db.collection('users').doc(uid).get();
            return doc.data();
        } catch (error) {
            throw error;
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
        } catch (error) {
            throw error;
        }
    }
}