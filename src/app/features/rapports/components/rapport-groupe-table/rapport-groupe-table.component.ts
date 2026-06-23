import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { FormatMontantPipe } from '../../../../shared/pipes/pipe.component';

import { RapportGroupe } from '../../models/rapport-groupe.model';

@Component({
  selector: 'app-rapport-groupe-table',
  standalone: true,
  imports: [CommonModule, FormatMontantPipe],
  templateUrl: './rapport-groupe-table.component.html',
  styleUrls: ['./rapport-groupe-table.component.css'],
})
export class RapportGroupeTableComponent {
  readonly items = input<RapportGroupe[]>([]);

  readonly exportExcel = output<void>();

  readonly exportPdf = output<void>();

  onExportExcel(): void {
    this.exportExcel.emit();
  }

  onExportPdf(): void {
    this.exportPdf.emit();
  }
}
