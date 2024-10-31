import { Observable, Frame } from '@nativescript/core';
import { AuthService } from '../services/auth-service';

export class SignUpViewModel extends Observable {
    private email: string = '';
    private password: string = '';
    private confirmPassword: string = '';
    private errorMessage: string = '';
    private authService: AuthService;

    constructor() {
        super();
        this.authService = new AuthService();
    }

    async onSignUp() {
        try {
            if (!this.email || !this.password || !this.confirmPassword) {
                this.set('errorMessage', 'Please fill in all fields');
                return;
            }

            if (this.password !== this.confirmPassword) {
                this.set('errorMessage', 'Passwords do not match');
                return;
            }

            await this.authService.signUp(this.email, this.password, 'pending');
            
            // Navigate to account type selection
            Frame.topmost().navigate({
                moduleName: 'views/account-type-page',
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