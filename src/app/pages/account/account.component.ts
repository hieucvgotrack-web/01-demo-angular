import { Component } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';


@Component({
selector: 'app-account',
templateUrl: './account.component.html',
styleUrls: ['./account.component.scss']
})
export class AccountComponent {
    user$ = this.auth.user$;
    constructor(private auth: AuthService) {}
    logout() { this.auth.logout(); }
}