import { Component, Input } from '@angular/core';


@Component({
selector: 'app-card-auth',
templateUrl: './card-auth.component.html',
styleUrls: ['./card-auth.component.scss']
})
export class CardAuthComponent {
    @Input() title = '';
    @Input() subtitle = '';
}