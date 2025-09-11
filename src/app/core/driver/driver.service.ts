import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface Driver {
    id: string;
    account?: string;
    name: string;
    phone?: string;
    licenseNumber: string;
    licenseClass?: string;
    licenseIssueDate?: string; // ISO string
    licenseExpiryDate?: string; // ISO string
    address?: string;
    description?: string;
    avatar?: string; // base64 or url
    status?: 'active' | 'inactive' | 'all';
}

@Injectable({
    providedIn: 'root'
})
export class DriverService {
    private data: Driver[] = [
        {
            id: 'd1', account: 'E-TRACK (mygpsapp)', name: 'Nguyễn Văn A',
            phone: '0912345678', licenseNumber: '123456', licenseClass: 'B',
            licenseIssueDate: '2020-01-01', licenseExpiryDate: '2025-01-01',
            address: 'Hà Nội', description: 'Lái xe chính', avatar: '', status: 'active'
        },
        {
            id: 'd2', account: 'E-TRACK (mygpsapp)', name: 'Trần Thị B',
            phone: '0987654321', licenseNumber: '654321', licenseClass: 'C',
            licenseIssueDate: '2018-05-10', licenseExpiryDate: '2023-05-10',
            address: 'Hồ Chí Minh', description: '', avatar: '', status: 'inactive'
        }
    ];

    private subj = new BehaviorSubject<Driver[]>(this.data);

    list(): Observable<Driver[]> {
        // simulate api
        return this.subj.asObservable();
    }

    search(filters: Partial<Driver>): Observable<Driver[]> {
        // naive filter on name, licenseNumber, status, account
        return of(this.data).pipe(delay(200), map(items => {
            return items.filter(i => {
                if (filters.name && !i.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
                if (filters.licenseNumber && !i.licenseNumber.includes(filters.licenseNumber)) return false;
                if (filters.account && !i.account?.toLowerCase().includes((filters.account as string).toLowerCase())) return false;
                if (filters.status && filters.status !== 'all' && i.status !== filters.status) return false;
                return true;
            });
        }));
    }

    add(driver: Driver): Observable<Driver> {
        const id = 'd' + (Math.floor(Math.random() * 10000));
        const newD = { ...driver, id };
        this.data = [...this.data, newD];
        this.subj.next(this.data);
        return of(newD).pipe(delay(200));
    }

    update(id: string, patch: Partial<Driver>): Observable<Driver> {
        this.data = this.data.map(d => d.id === id ? { ...d, ...patch } : d);
        const found = this.data.find(d => d.id === id)!;
        this.subj.next(this.data);
        return of(found).pipe(delay(200));
    }

    remove(id: string): Observable<{ ok: boolean }> {
        this.data = this.data.filter(d => d.id !== id);
        this.subj.next(this.data);
        return of({ ok: true }).pipe(delay(200));
    }

    getById(id: string): Observable<Driver | undefined> {
        return of(this.data.find(d => d.id === id)).pipe(delay(200));
    }
}
