// components/cotisation-adherent-table/cotisation-adherent-table.component.ts

import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { CotisationAdherent } from '../../models/cotisation-adherent.model';

@Component({
  selector: 'app-cotisation-adherent-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cotisation-adherent-table.component.html',
  styleUrls: ['./cotisation-adherent-table.component.css'],
})
export class CotisationAdherentTableComponent {
  readonly cotisations = input<CotisationAdherent[]>([]);

  readonly edit = output<CotisationAdherent>();

  readonly delete = output<CotisationAdherent>();

  onEdit(item: CotisationAdherent): void {
    this.edit.emit(item);
  }

  onDelete(item: CotisationAdherent): void {
    this.delete.emit(item);
  }

  trackById(index: number, item: CotisationAdherent): string | number {
    return item.id ?? index;
  }
}
