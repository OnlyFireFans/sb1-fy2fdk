import { Observable, Frame } from '@nativescript/core';
import { getFirestore } from '@nativescript/firebase-firestore';
import { getAuth } from '@nativescript/firebase-auth';
import { MediaService } from '../services/media-service';

export class PerformerProfileModel extends Observable {
    private name: string = '';
    private talent: string = '';
    private rate: number = 0;
    private duration: number = 0;
    private photos: string[] = [];
    private videos: string[] = [];
    private mediaService: MediaService;
    private errorMessage: string = '';

    constructor() {
        super();
        this.mediaService = new MediaService();
    }

    async onAddPhoto() {
        try {
            if (this.photos.length >= 3) {
                this.set('errorMessage', 'Maximum 3 photos allowed');
                return;
            }

            const photoUrl = await this.mediaService.pickImage();
            if (photoUrl) {
                this.photos.push(photoUrl);
                this.notifyPropertyChange('photos', this.photos);
            }
        } catch (error) {
            this.set('errorMessage', 'Error uploading photo');
            console.error('Error:', error);
        }
    }

    async onAddVideo() {
        try {
            if (this.videos.length >= 3) {
                this.set('errorMessage', 'Maximum 3 videos allowed');
                return;
            }

            const videoUrl = await this.mediaService.pickVideo();
            if (videoUrl) {
                this.videos.push(videoUrl);
                this.notifyPropertyChange('videos', this.videos);
            }
        } catch (error) {
            this.set('errorMessage', 'Error uploading video');
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
            await db.collection('performers').doc(user.uid).set({
                name: this.name,
                talent: this.talent,
                rate: this.rate,
                duration: this.duration,
                photos: this.photos,
                videos: this.videos,
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
        if (!this.name || !this.talent) {
            this.set('errorMessage', 'Name and talent are required');
            return false;
        }

        if (this.rate <= 0) {
            this.set('errorMessage', 'Please set a valid rate');
            return false;
        }

        if (this.duration <= 0) {
            this.set('errorMessage', 'Please set a valid duration');
            return false;
        }

        return true;
    }
}