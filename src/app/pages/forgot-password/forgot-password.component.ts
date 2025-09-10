import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
selector: 'app-forgot-password',
templateUrl: './forgot-password.component.html',
styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
    loading = false;
    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });


    constructor(private fb: FormBuilder, private auth: AuthService, private msg: NzMessageService) {}


    submit() {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        const { email } = this.form.value;
        this.loading = true;
        this.auth.requestPasswordReset(email!)
        .subscribe({
            next: () => {
                this.loading = false;
                this.msg.success('Đã gửi hướng dẫn đặt lại mật khẩu.');
            },
            error: (err) => {
                this.loading = false;
                this.msg.error(typeof err === 'string' ? err : 'Có lỗi xảy ra');
            }
        });
    }
}