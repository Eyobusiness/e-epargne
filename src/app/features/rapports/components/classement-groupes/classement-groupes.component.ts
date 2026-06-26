import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import { ClassementGroupe } from '../../models/classement-groupe.model';
import { FormatMontantPipe } from '@shared/pipes/pipe.component';

@Component({
  selector: 'app-classement-groupes',
  standalone: true,
  imports: [CommonModule, FormatMontantPipe],
  templateUrl: './classement-groupes.component.html',
  styleUrls: ['./classement-groupes.component.css'],
})
export class ClassementGroupesComponent {
  readonly items = input<ClassementGroupe[]>([]);

  readonly showExports = input<boolean>(true);

  readonly podium = computed(() => this.items().slice(0, 3));

  readonly autres = computed(() => this.items().slice(3));

  readonly exportExcel = output<void>();

  readonly exportPdf = output<void>();

  onExportExcel(): void {
    this.exportExcel.emit();
  }

  onExportPdf(): void {
    this.exportPdf.emit();
  }
}
