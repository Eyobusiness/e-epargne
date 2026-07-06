// components/groupe-table/groupe-table.component.ts

import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Groupe } from '../../models/groupe.model';
import { getGroupStatusLabel, isGroupActive } from '../../utils/group-status.utils';
import { AvatarBgPipe } from '../../../../shared/pipes/avatar-bg.pipe';
import { ResolveUserPipe } from '../../../../shared/pipes/resolve-user.pipe';

@Component({
  selector: 'app-groupe-table',
  standalone: true,
  imports: [CommonModule, AvatarBgPipe, ResolveUserPipe],
  templateUrl: './groupe-table.component.html',
  styleUrls: ['./groupe-table.component.css'],
})
export class GroupeTableComponent {
  readonly groupes = input<Groupe[]>([]);
  readonly startIndex = input(0);

  readonly edit = output<Groupe>();

  readonly delete = output<Groupe>();

  readonly detail = output<Groupe>();

  onEdit(item: Groupe): void {
    this.edit.emit(item);
  }

  onDelete(item: Groupe): void {
    this.delete.emit(item);
  }

  onDetail(item: Groupe): void {
    this.detail.emit(item);
  }

  getDisplayIndex(index: number): number {
    return this.startIndex() + index + 1;
  }

  isActive(status?: string): boolean {
    return isGroupActive(status);
  }

  statusLabel(status?: string): string {
    return getGroupStatusLabel(status);
  }

  trackById(index: number, item: Groupe): string | number {
    return item.id ?? index;
  }
}
