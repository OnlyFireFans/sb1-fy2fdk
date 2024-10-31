import { Observable, Frame } from '@nativescript/core';

export class WelcomeViewModel extends Observable {
    constructor() {
        super();
    }

    onNewAccount() {
        Frame.topmost().navigate({
            moduleName: 'views/account-type-page',
            transition: {
                name: 'fade'
            }
        });
    }

    onSignIn() {
        Frame.topmost().navigate({
            moduleName: 'views/signin-page',
            transition: {
                name: 'fade'
            }
        });
    }
}