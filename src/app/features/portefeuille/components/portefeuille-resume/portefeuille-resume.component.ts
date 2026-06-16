import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { Portefeuille } from '../../models/portefeuille.model';
import { Adherent } from '../../../adherents/models/adherent.model';
import { FormatMontantPipe } from '../../../../shared/pipes/pipe.component';

@Component({
  selector: 'app-portefeuille-resume',
  standalone: true,
  imports: [CommonModule, FormatMontantPipe],
  templateUrl: './portefeuille-resume.component.html',
  styleUrls: ['./portefeuille-resume.component.css'],
})
export class PortefeuilleResumeComponent {
  readonly portefeuille = input<Portefeuille | null>(null);

  readonly adherent = input<Adherent | null>(null);

  readonly montant = computed(() => this.portefeuille()?.montant ?? 0);

  readonly typeCompte = computed(() => this.portefeuille()?.type_compte ?? '--');

  readonly adherentName = computed(() => this.adherent()?.name ?? '--');

  readonly adherentEmail = computed(() => this.adherent()?.email ?? '--');

  readonly adherentPhone = computed(() => this.adherent()?.phone ?? '--');

  readonly adherentAddress = computed(() => this.adherent()?.address ?? '--');

  readonly adherentInitial = computed(() => {
    const name = this.adherentName();

    if (!name || name === '--') {
      return '?';
    }

    return name.charAt(0).toUpperCase();
  });
}
