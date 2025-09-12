import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  isLoginPage = false;

  constructor(
    private router: Router,
    public  auth: AuthService ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isLoginPage = event.urlAfterRedirects.includes('/login');
      });
  }
user$ = this.auth.user$;
  logout() {
  this.auth.logout();
  this.router.navigate(['/login']); // <-- chuyển sang login
}
}
