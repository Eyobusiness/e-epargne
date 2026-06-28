// components/affectation-adherent-table/affectation-adherent-table.component.ts

import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { AffectationAdherent } from '../../models/affectation-adherent.model';
import { getGroupStatusLabel, isGroupActive } from '../../utils/group-status.utils';
import { AvatarBgPipe } from '../../../../shared/pipes/avatar-bg.pipe';

@Component({
  selector: 'app-affectation-adherent-table',
  standalone: true,
  imports: [CommonModule, AvatarBgPipe],
  templateUrl: './affectation-adherent-table.component.html',
  styleUrls: ['./affectation-adherent-table.component.css'],
})
export class AffectationAdherentTableComponent {
  readonly affectations = input<AffectationAdherent[]>([]);

  readonly edit = output<AffectationAdherent>();

  readonly delete = output<AffectationAdherent>();

  onEdit(item: AffectationAdherent): void {
    this.edit.emit(item);
  }

  onDelete(item: AffectationAdherent): void {
    this.delete.emit(item);
  }

  getDisplayIndex(index: number): number {
    return index + 1;
  }

  isActive(status?: string): boolean {
    return isGroupActive(status);
  }

  statusLabel(status?: string): string {
    return getGroupStatusLabel(status);
  }

  trackById(index: number, item: AffectationAdherent): string | number {
    return item.id ?? index;
  }
}
