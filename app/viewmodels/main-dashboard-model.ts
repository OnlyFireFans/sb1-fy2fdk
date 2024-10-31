import { Observable } from '@nativescript/core';
import { getFirestore } from '@nativescript/firebase-firestore';

export class MainDashboardModel extends Observable {
    private featuredEvents = [];
    private trendingPerformers = [];

    constructor() {
        super();
        this.loadData();
    }

    async loadData() {
        const db = getFirestore();
        
        // Load featured events
        const eventsSnapshot = await db.collection('events')
            .where('featured', '==', true)
            .limit(5)
            .get();
        
        this.featuredEvents = eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Load trending performers
        const performersSnapshot = await db.collection('performers')
            .orderBy('rating', 'desc')
            .limit(10)
            .get();
        
        this.trendingPerformers = performersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        this.notifyPropertyChange('featuredEvents', this.featuredEvents);
        this.notifyPropertyChange('trendingPerformers', this.trendingPerformers);
    }

    onCategoryTap(args) {
        const category = args.object.text;
        // Implement category filtering
    }

    onFilter() {
        // Implement filter dialog
    }
}