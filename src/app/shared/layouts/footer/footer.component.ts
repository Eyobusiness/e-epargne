import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = input<number>(new Date().getFullYear());
  appName = input<string>('E-TONTINE');
  version = input<string>('1.0.0');
  poweredBy = input<string>('Ferdinand');
}