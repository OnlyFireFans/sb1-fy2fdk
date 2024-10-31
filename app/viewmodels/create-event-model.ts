import { Observable, Frame } from '@nativescript/core';
import { getFirestore } from '@nativescript/firebase-firestore';
import { getAuth } from '@nativescript/firebase-auth';
import { MediaService } from '../services/media-service';

export class CreateEventModel extends Observable {
    private title: string = '';
    private location: string = '';
    private eventDate: Date = new Date();
    private budget: number = 0;
    private description: string = '';
    private requiredPerformers: string = '';
    private venuePhotos: string[] = [];
    private mediaService: MediaService;
    private errorMessage: string = '';

    constructor() {
        super();
        this.mediaService = new MediaService();
    }

    get photoCount(): number {
        return this.venuePhotos.length;
    }

    async onAddVenuePhoto() {
        try {
            if (this.venuePhotos.length >= 5) {
                this.set('errorMessage', 'Maximum 5 venue photos allowed');
                return;
            }

            const photoUrl = await this.mediaService.pickImage();
            if (photoUrl) {
                this.venuePhotos.push(photoUrl);
                this.notifyPropertyChange('photoCount', this.photoCount);
            }
        } catch (error) {
            this.set('errorMessage', 'Error uploading photo');
            console.error('Error:', error);
        }
    }

    async onCreateEvent() {
        try {
            if (!this.validateEvent()) {
                return;
            }

            const auth = getAuth();
            const user = auth.currentUser;
            
            if (!user) {
                this.set('errorMessage', 'User not authenticated');
                return;
            }

            const db = getFirestore();
            const eventRef = await db.collection('events').add({
                title: this.title,
                location: this.location,
                eventDate: this.eventDate,
                budget: this.budget,
                description: this.description,
                requiredPerformers: this.requiredPerformers,
                venuePhotos: this.venuePhotos,
                organizerId: user.uid,
                status: 'open',
                createdAt: new Date(),
                applications: []
            });
            
            Frame.topmost().navigate({
                moduleName: 'views/event-details',
                context: { eventId: eventRef.id },
                transition: {
                    name: 'slide'
                }
            });
        } catch (error) {
            this.set('errorMessage', 'Error creating event');
            console.error('Error:', error);
        }
    }

    private validateEvent(): boolean {
        if (!this.title || !this.location || !this.description || !this.requiredPerformers) {
            this.set('errorMessage', 'All fields are required');
            return false;
        }

        if (this.budget <= 0) {
            this.set('errorMessage', 'Please set a valid budget');
            return false;
        }

        if (this.venuePhotos.length === 0) {
            this.set('errorMessage', 'Please add at least one venue photo');
            return false;
        }

        return true;
    }
}