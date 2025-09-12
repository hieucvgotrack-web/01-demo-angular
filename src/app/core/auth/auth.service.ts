import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _user$ = new BehaviorSubject<User | null>(null);
    user$ = this._user$.asObservable();

    constructor() {
        // Khi app load lại, khôi phục user từ localStorage nếu có
        const token = this.token;
        const userRaw = localStorage.getItem('demo_user');
        if (token && userRaw) {
            try {
                this._user$.next(JSON.parse(userRaw));
            } catch {
                localStorage.removeItem('demo_user');
            }
        }
    }
    // Token quản lý bằng localStorage
    private set token(val: string | null) {
        if (val) localStorage.setItem('demo_token', val);
        else localStorage.removeItem('demo_token');
    }
    private get token(): string | null {
        return localStorage.getItem('demo_token');
    }
    // Check trạng thái đăng nhập
    get isLoggedIn(): boolean {
        return !!this.token; // chỉ cần có token là coi như login
    }
    get currentUser(): User | null {
        return this._user$.getValue();
    }
    // Login demo
    login(email: string, password: string, remember = false): Observable<User> {
        if (!email || !password) return throwError(() => 'Thiếu thông tin');

        return of({
            id: 'u_1',
            email,
            name: email.split('@')[0]
        } as User).pipe(
            delay(700), // giả lập network
            tap(user => {
                this._user$.next(user);
                this.token = 'dummy-token';
                localStorage.setItem('demo_user', JSON.stringify(user));
            })
        );
    }
    // Logout
    logout(): void {
        this._user$.next(null);
        this.token = null;
        localStorage.removeItem('demo_user');
    }
    // Quên mật khẩu demo
    requestPasswordReset(email: string): Observable<boolean> {
        if (!email) return throwError(() => 'Email không hợp lệ');
        return of(true).pipe(delay(600));
    }
}
