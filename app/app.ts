import { Application } from '@nativescript/core';
import { initializeApp } from '@nativescript/firebase-core';

const firebaseConfig = {
    // Firebase config would go here
};

initializeApp(firebaseConfig);
Application.run({ moduleName: 'app-root' });