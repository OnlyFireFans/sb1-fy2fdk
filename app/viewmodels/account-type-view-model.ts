import { Observable, Frame } from '@nativescript/core';
import { getAuth } from '@nativescript/firebase-auth';
import { getFirestore } from '@nativescript/firebase-firestore';

export class AccountTypeViewModel extends Observable {
    private db = getFirestore();
    private auth = getAuth();

    async onPerformerSelect() {
        await this.updateAccountType('performer');
        Frame.topmost().navigate({
            moduleName: 'views/performer-profile',
            clearHistory: true,
            transition: {
                name: 'fade'
            }
        });
    }

    async onOrganizerSelect() {
        await this.updateAccountType('organizer');
        Frame.topmost().navigate({
            moduleName: 'views/organizer-profile',
            clearHistory: true,
            transition: {
                name: 'fade'
            }
        });
    }

    private async updateAccountType(type: string) {
        const user = this.auth.currentUser;
        if (user) {
            await this.db.collection('users').doc(user.uid).update({
                accountType: type
            });
        }
    }
}