import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { User } from '../models/user';


@Injectable({ providedIn: 'root' })
export class AuthService {
    private _user$ = new BehaviorSubject<User | null>(null);
    user$ = this._user$.asObservable();


    // giữ token trong localStorage để demo
    private set token(val: string | null) {
        if (val) localStorage.setItem('demo_token', val);
        else localStorage.removeItem('demo_token');
    }
    private get token(): string | null {
        return localStorage.getItem('demo_token');
    }


    get isLoggedIn(): boolean {
        return !!this.token && !!this._user$.value;
    }


    login(email: string, password: string, remember = false): Observable<User> {
    
        if (!email || !password) return throwError('Thiếu thông tin');


        return of({
            id: 'u_1',
            email,
            name: email.split('@')[0]
        } as User).pipe(
        delay(700), // giả lập network
        tap(user => {
        this._user$.next(user);
        this.token = 'dummy-token';
        if (!remember) {
        // session-only: không làm gì đặc biệt cho demo
        }
        })
        );
    }


    logout(): void {
        this._user$.next(null);
        this.token = null;
    }


    requestPasswordReset(email: string): Observable<boolean> {
        if (!email) return throwError('Email không hợp lệ');
        return of(true).pipe(delay(600));
    }
}