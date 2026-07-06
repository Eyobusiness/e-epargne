// components/categorie-depense-table/categorie-depense-table.component.ts

import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { CategorieDepense } from '../../models/categorie-depense.model';
import { ResolveUserPipe } from '../../../../shared/pipes/resolve-user.pipe';

@Component({
  selector: 'app-categorie-depense-table',
  standalone: true,
  imports: [CommonModule, ResolveUserPipe],
  templateUrl: './categorie-depense-table.component.html',
  styleUrls: ['./categorie-depense-table.component.css'],
})
export class CategorieDepenseTableComponent {
  readonly categories = input<CategorieDepense[]>([]);

  readonly edit = output<CategorieDepense>();

  readonly delete = output<CategorieDepense>();

  onEdit(item: CategorieDepense): void {
    this.edit.emit(item);
  }

  onDelete(item: CategorieDepense): void {
    this.delete.emit(item);
  }

  trackById(index: number, item: CategorieDepense): number | string {
    return item.id ?? index;
  }
}
