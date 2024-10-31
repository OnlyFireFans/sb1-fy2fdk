import { Observable } from '@nativescript/core';
import { getFirestore } from '@nativescript/firebase-firestore';
import { getAuth } from '@nativescript/firebase-auth';

export class ChatViewModel extends Observable {
    private messages: any[] = [];
    private newMessage: string = '';
    private chatId: string;
    private db = getFirestore();
    private auth = getAuth();
    private unsubscribe: () => void;

    constructor(private recipientId: string, private eventId: string) {
        super();
        this.setupChat();
    }

    async setupChat() {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return;

        // Create or get chat ID
        this.chatId = [currentUser.uid, this.recipientId].sort().join('_');

        // Listen for messages
        this.unsubscribe = this.db.collection('chats')
            .doc(this.chatId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                const messages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    isCurrentUser: doc.data().senderId === currentUser.uid,
                    timestamp: doc.data().timestamp.toDate().toLocaleTimeString()
                }));
                this.set('messages', messages);
            });
    }

    async onSendMessage() {
        if (!this.newMessage.trim()) return;

        const currentUser = this.auth.currentUser;
        if (!currentUser) return;

        try {
            await this.db.collection('chats')
                .doc(this.chatId)
                .collection('messages')
                .add({
                    message: this.newMessage,
                    senderId: currentUser.uid,
                    timestamp: new Date(),
                    eventId: this.eventId
                });

            this.set('newMessage', '');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    onUnloaded() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}