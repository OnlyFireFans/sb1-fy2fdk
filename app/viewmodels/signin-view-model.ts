import { Observable, Frame } from '@nativescript/core';
import { getAuth, signInWithEmailAndPassword } from '@nativescript/firebase-auth';
import { AuthService } from '../services/auth-service';

export class SignInViewModel extends Observable {
    private email: string = '';
    private password: string = '';
    private errorMessage: string = '';
    private authService: AuthService;

    constructor() {
        super();
        this.authService = new AuthService();
    }

    async onSignIn() {
        try {
            if (!this.email || !this.password) {
                this.set('errorMessage', 'Please fill in all fields');
                return;
            }

            const user = await this.authService.signIn(this.email, this.password);
            
            // Navigate to account type selection
            Frame.topmost().navigate({
                moduleName: 'views/account-type-select',
                clearHistory: true,
                transition: {
                    name: 'fade'
                }
            });
        } catch (error) {
            this.set('errorMessage', error.message);
        }
    }

    onBack() {
        Frame.topmost().goBack();
    }
}