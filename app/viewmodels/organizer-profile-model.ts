import { Observable, Frame } from '@nativescript/core';
import { getFirestore } from '@nativescript/firebase-firestore';
import { getAuth } from '@nativescript/firebase-auth';
import { MediaService } from '../services/media-service';

export class OrganizerProfileModel extends Observable {
    private location: string = '';
    private eventTime: string = '';
    private performerTypes: string = '';
    private budget: number = 0;
    private venuePhotos: string[] = [];
    private mediaService: MediaService;
    private errorMessage: string = '';

    constructor() {
        super();
        this.mediaService = new MediaService();
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
                this.notifyPropertyChange('venuePhotos', this.venuePhotos);
            }
        } catch (error) {
            this.set('errorMessage', 'Error uploading venue photo');
            console.error('Error:', error);
        }
    }

    async onCreateProfile() {
        try {
            if (!this.validateProfile()) {
                return;
            }

            const auth = getAuth();
            const user = auth.currentUser;
            
            if (!user) {
                this.set('errorMessage', 'User not authenticated');
                return;
            }

            const db = getFirestore();
            await db.collection('organizers').doc(user.uid).set({
                location: this.location,
                eventTime: this.eventTime,
                performerTypes: this.performerTypes,
                budget: this.budget,
                venuePhotos: this.venuePhotos,
                userId: user.uid,
                createdAt: new Date(),
                rating: 0,
                totalRatings: 0
            });
            
            Frame.topmost().navigate({
                moduleName: 'views/main-dashboard',
                clearHistory: true,
                transition: {
                    name: 'fade'
                }
            });
        } catch (error) {
            this.set('errorMessage', 'Error creating profile');
            console.error('Error:', error);
        }
    }

    private validateProfile(): boolean {
        if (!this.location || !this.eventTime || !this.performerTypes) {
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