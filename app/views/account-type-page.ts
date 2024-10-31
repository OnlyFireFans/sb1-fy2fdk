import { EventData, Page } from '@nativescript/core';
import { AccountTypeViewModel } from '../viewmodels/account-type-view-model';

export function onNavigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new AccountTypeViewModel();
}