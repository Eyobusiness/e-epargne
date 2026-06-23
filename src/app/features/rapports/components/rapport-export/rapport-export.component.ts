import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-rapport-export',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rapport-export.component.html',
  styleUrls: ['./rapport-export.component.css'],
})
export class RapportExportComponent {
  readonly exportPdf = output<void>();

  readonly exportExcel = output<void>();

  onPdf(): void {
    this.exportPdf.emit();
  }

  onExcel(): void {
    this.exportExcel.emit();
  }
}
