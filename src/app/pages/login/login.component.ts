import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
selector: 'app-login',
templateUrl: './login.component.html',
styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    loading = false;
    form = this.fb.group({
        email: ['',[Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        remember: [true]
    });


    constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private msg: NzMessageService
    ) {}


    submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
        return;
        }
        const { email, password, remember } = this.form.value;
        this.loading = true;
        this.auth
        .login(email!, password!, remember!)
        .subscribe({
        next: () => {
            this.loading = false;
            this.msg.success('Đăng nhập thành công');
            this.router.navigateByUrl('/account');
        },
        error: (err) => {
            this.loading = false;
            this.msg.error(typeof err === 'string' ? err : 'Lỗi đăng nhập');
        }
        });
    }
}