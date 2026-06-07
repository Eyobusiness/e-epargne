import { Component, EventEmitter, Output, input } from '@angular/core';

import { CommonModule } from '@angular/common';

/* =====================================================
MODELS
===================================================== */

import { Parametre } from '../../models/parametre.models';

@Component({
  selector: 'app-parametre-table',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './parametre-table.component.html',

  styleUrls: ['./parametre-table.component.css'],
})
export class ParametreTableComponent {
  /* =====================================================
  INPUTS
  ===================================================== */

  readonly parametres = input<Parametre[]>([]);

  /* =====================================================
  OUTPUTS
  ===================================================== */

  @Output()
  readonly edit = new EventEmitter<Parametre>();

  @Output()
  readonly detail = new EventEmitter<Parametre>();

  @Output()
  readonly delete = new EventEmitter<Parametre>();

  /* =====================================================
  ACTIONS
  ===================================================== */

  onEdit(parametre: Parametre): void {
    this.edit.emit(parametre);
  }

  onDetail(parametre: Parametre): void {
    this.detail.emit(parametre);
  }

  onDelete(parametre: Parametre): void {
    this.delete.emit(parametre);
  }
}
