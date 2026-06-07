import { Component, inject } from '@angular/core';

import {
  RouterOutlet
} from '@angular/router';
import { AppToastComponent } from './shared/ui/app-toast/app-toast.component';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AppToastComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  constructor(public readonly toastService: ToastService) {}
}
