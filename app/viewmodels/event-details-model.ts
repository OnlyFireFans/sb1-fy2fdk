import { Observable, Frame } from '@nativescript/core';
import { getFirestore } from '@nativescript/firebase-firestore';
import { getAuth } from '@nativescript/firebase-auth';
import { Share } from '@nativescript/core';

export class EventDetailsModel extends Observable {
    private event: any = null;
    private errorMessage: string = '';
    private auth = getAuth();
    private db = getFirestore();

    constructor(private eventId: string) {
        super();
        this.loadEvent();
    }

    get formattedDate(): string {
        return this.event?.eventDate.toLocaleDateString();
    }

    get isOrganizer(): boolean {
        return this.event?.organizerId === this.auth.currentUser?.uid;
    }

    private async loadEvent() {
        try {
            const doc = await this.db.collection('events').doc(this.eventId).get();
            this.event = { id: doc.id, ...doc.data() };
            this.notifyPropertyChange('event', this.event);
            this.notifyPropertyChange('formattedDate', this.formattedDate);
            this.notifyPropertyChange('isOrganizer', this.isOrganizer);
        } catch (error) {
            this.set('errorMessage', 'Error loading event');
            console.error('Error:', error);
        }
    }

    async onApply() {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                this.set('errorMessage', 'Please sign in to apply');
                return;
            }

            // Get performer profile
            const performerDoc = await this.db.collection('performers').doc(user.uid).get();
            if (!performerDoc.exists) {
                this.set('errorMessage', 'Performer profile required to apply');
                return;
            }

            // Add application
            await this.db.collection('events').doc(this.eventId).update({
                applications: [...this.event.applications, {
                    performerId: user.uid,
                    status: 'pending',
                    appliedAt: new Date()
                }]
            });

            // Navigate to application confirmation
            Frame.topmost().navigate({
                moduleName: 'views/application-confirmation',
                context: { eventId: this.eventId }
            });
        } catch (error) {
            this.set('errorMessage', 'Error applying to event');
            console.error('Error:', error);
        }
    }

    onViewApplications() {
        Frame.topmost().navigate({
            moduleName: 'views/applications-list',
            context: { eventId: this.eventId }
        });
    }

    onMessage() {
        Frame.topmost().navigate({
            moduleName: 'views/chat',
            context: { 
                recipientId: this.event.organizerId,
                eventId: this.eventId
            }
        });
    }

    async onShare() {
        try {
            await Share.share({
                title: this.event.title,
                text: `Check out this event: ${this.event.title} at ${this.event.location}`,
                url: `onlyfirefans://event/${this.eventId}`
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }
}