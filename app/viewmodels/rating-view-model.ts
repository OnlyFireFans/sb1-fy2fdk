import { Observable, Frame } from '@nativescript/core';
import { getFirestore } from '@nativescript/firebase-firestore';
import { getAuth } from '@nativescript/firebase-auth';

export class RatingViewModel extends Observable {
    private rating: number = 0;
    private review: string = '';
    private errorMessage: string = '';
    private targetUser: any = null;
    private db = getFirestore();
    private auth = getAuth();

    constructor(private targetUserId: string, private eventId: string) {
        super();
        this.loadTargetUser();
    }

    private async loadTargetUser() {
        try {
            const doc = await this.db.collection('users').doc(this.targetUserId).get();
            this.targetUser = { id: doc.id, ...doc.data() };
            this.notifyPropertyChange('targetUser', this.targetUser);
        } catch (error) {
            this.set('errorMessage', 'Error loading user');
            console.error('Error:', error);
        }
    }

    onRatingTap(args) {
        const button = args.object;
        this.rating = parseInt(button.data.rating);
        this.updateStarDisplay();
    }

    private updateStarDisplay() {
        const parent = Frame.topmost().currentPage.getViewById('starsContainer');
        const stars = parent.getChildrenByClassName('star-button');
        
        stars.forEach((star, index) => {
            star.color = index < this.rating ? '#FFD700' : '#808080';
        });
    }

    async onSubmitRating() {
        if (this.rating === 0) {
            this.set('errorMessage', 'Please select a rating');
            return;
        }

        const currentUser = this.auth.currentUser;
        if (!currentUser) return;

        try {
            // Add rating to user's profile
            const userRef = this.db.collection('users').doc(this.targetUserId);
            await this.db.runTransaction(async (transaction) => {
                const doc = await transaction.get(userRef);
                const data = doc.data();
                
                const newRating = (data.rating * data.totalRatings + this.rating) / (data.totalRatings + 1);
                
                transaction.update(userRef, {
                    rating: newRating,
                    totalRatings: data.totalRatings + 1
                });
            });

            // Add rating details
            await this.db.collection('ratings').add({
                fromUserId: currentUser.uid,
                toUserId: this.targetUserId,
                eventId: this.eventId,
                rating: this.rating,
                review: this.review,
                timestamp: new Date()
            });

            Frame.topmost().goBack();
        } catch (error) {
            this.set('errorMessage', 'Error submitting rating');
            console.error('Error:', error);
        }
    }
}