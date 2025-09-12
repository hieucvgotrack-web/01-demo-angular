import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';
import { Driver, DriverService } from 'src/app/core/driver/driver.service';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { AuthService } from 'src/app/core/auth/auth.service';
import { User } from 'src/app/core/models/user';

@Component({
    selector: 'app-driver',
    templateUrl: './driver.component.html',
    styleUrls: ['./driver.component.scss']
})
export class DriverComponent implements OnInit {
    drivers: Driver[] = [];
    loading = false;

    // search form
    searchForm: FormGroup;

    // add/edit modal
    visible = false;
    isSaving = false;
    form: FormGroup;
    editing: Driver | null = null;

    constructor(
        private driverSrv: DriverService,
        private fb: FormBuilder,
        private modal: NzModalService,
        private msg: NzMessageService,
        private auth: AuthService
    ) {
        this.searchForm = this.fb.group({
            name: [''],
            licenseNumber: [''],
            account: [''],
            status: ['all']
        });

        this.form = this.fb.group({
            account: [{ value: this.auth.currentUser?.name, disabled: true }],
            name: [null, [Validators.required]],
            phone: [null],
            licenseNumber: [null, [Validators.required]],
            licenseClass: [null],
            licenseIssueDate: [null],
            licenseExpiryDate: [null],
            address: [null],
            description: [null],
            status: ['active']
        });
    }

    ngOnInit(): void {
        this.loadAll();
    }

    loadAll() {
        this.driverSrv.list().subscribe(data => {
            this.drivers = data;
        });
    }

    onSearch() {
        const q = this.searchForm.value;
        this.loading = true;
        this.driverSrv.search(q).pipe(finalize(() => this.loading = false)).subscribe(res => {
            this.drivers = res;
        });
    }

    onReset() {
        this.searchForm.reset({ name: '', licenseNumber: '', account: '', status: 'all' });
        this.loadAll();
    }

    openAdd() {
        this.editing = null;
        this.form.reset({ account: this.auth.currentUser?.name, status: 'active' });
        this.visible = true;
    }

    openEdit(d: Driver) {
        this.editing = d;
        this.form.patchValue({
            account: d.account || this.auth.currentUser?.name,
            name: d.name,
            phone: d.phone,
            licenseNumber: d.licenseNumber,
            licenseClass: d.licenseClass,
            licenseIssueDate: d.licenseIssueDate ? new Date(d.licenseIssueDate) : null,
            licenseExpiryDate: d.licenseExpiryDate ? new Date(d.licenseExpiryDate) : null,
            address: d.address,
            description: d.description,
            status: d.status || 'active'
        });
        this.visible = true;
    }

    save() {
        for (const i of Object.keys(this.form.controls)) {
            this.form.controls[i].markAsDirty();
            this.form.controls[i].updateValueAndValidity();
        }
        if (this.form.invalid) return;
        this.isSaving = true;

        // build payload
        const raw = this.form.getRawValue();
        const payload: Partial<Driver> = {
            account: raw.account,
            name: raw.name,
            phone: raw.phone,
            licenseNumber: raw.licenseNumber,
            licenseClass: raw.licenseClass,
            licenseIssueDate: raw.licenseIssueDate ? new Date(raw.licenseIssueDate).toISOString().slice(0, 10) : undefined,
            licenseExpiryDate: raw.licenseExpiryDate ? new Date(raw.licenseExpiryDate).toISOString().slice(0, 10) : undefined,
            address: raw.address,
            description: raw.description,
            status: raw.status
        };

        if (this.editing) {
            this.driverSrv.update(this.editing.id, payload).pipe(finalize(() => this.isSaving = false)).subscribe(() => {
                this.msg.success('Cập nhật lái xe thành công');
                this.visible = false;
                this.loadAll();
            });
        } else {
            this.driverSrv.add(payload as Driver).pipe(finalize(() => this.isSaving = false)).subscribe(() => {
                this.msg.success('Thêm lái xe thành công');
                this.visible = false;
                this.loadAll();
            });
        }
    }

    remove(d: Driver) {
        this.modal.confirm({
            nzTitle: 'Xác nhận xoá',
            nzContent: `Bạn có muốn xoá lái xe "${d.name}"?`,
            nzOnOk: () => {
                this.driverSrv.remove(d.id).subscribe(() => {
                    this.msg.success('Đã xoá');
                    this.loadAll();
                });
            }
        });
    }

    // handle upload: convert to base64 for preview
    handleBeforeUpload = (file: NzUploadFile): boolean => {
        const f = file as any as File;
        const reader = new FileReader();
        reader.readAsDataURL(f);
        return false;
    };
}
