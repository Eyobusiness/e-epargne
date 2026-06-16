import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Depense } from '../../models/depense.model';
import { getCategorieLabel, isDepenseActive } from '../../utils/depense-api.utils';

@Component({
  selector: 'app-depense-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './depense-table.component.html',
  styleUrls: ['./depense-table.component.css'],
})
export class DepenseTableComponent {
  readonly depenses = input<Depense[]>([]);

  readonly edit = output<Depense>();

  readonly delete = output<Depense>();

  readonly view = output<Depense>();
  readonly documentsMap = input<Record<string, boolean>>({});



  onEdit(item: Depense): void {
    this.edit.emit(item);
  }

  onDelete(item: Depense): void {
    this.delete.emit(item);
  }

  onView(item: Depense): void {
    this.view.emit(item);
  }

  trackById(index: number, item: Depense): number | string {
    return item.id ?? index;
  }

  formatAmount(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  getCategorieNom(item: Depense): string {
    return getCategorieLabel(item);
  }

  isActive(status?: string): boolean {
    return isDepenseActive(status);
  }

 hasDocument(item: Depense): boolean {
  return !!this.documentsMap()[item.id ?? ''];
}

}
