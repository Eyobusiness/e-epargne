import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output,
  inject,
  input,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Operation } from '../../../operations/models/operation.model';
import { CommissionService } from '../../../commissions/services/commission.service';
import { CommissionConfig } from '../../../commissions/models/commission.model';

@Component({
  selector: 'app-retrait-direct-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './retrait-direct-form.component.html',
  styleUrls: ['./retrait-direct-form.component.css'],
})
export class RetraitDirectFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly commissionService = inject(CommissionService);

  /** Solde disponible de l'adhérent */
  readonly solde = input<number>(0);

  /** Identifiant de l'adhérent (réservé pour le reçu futur) */
  readonly adherentId = input<string>('');

  @Output() save = new EventEmitter<Operation>();
  @Output() cancel = new EventEmitter<void>();

  readonly commissionConfigs = signal<CommissionConfig[]>([]);
  readonly montantVal = signal(0);
  readonly soldeInsuffisant = signal(false);

  /** Commission calculée d'après les configs */
  readonly commission = computed(() => {
    const amount = this.montantVal();
    if (amount <= 0) return 0;

    const configs = this.commissionConfigs();
    const matching = configs.find((c) => {
      const minOk = c.montant_min == null || amount >= c.montant_min;
      const maxOk = c.montant_max == null || amount <= c.montant_max;
      return minOk && maxOk;
    });

    if (!matching) return 0;

    if (matching.mode_commission === 'FIXED') {
      return matching.valeur;
    } else if (matching.mode_commission === 'PERCENT') {
      return Math.round(amount * (matching.valeur / 100));
    }
    return 0;
  });

  /** Net à remettre à l'adhérent */
  readonly netAmount = computed(() =>
    Math.max(0, this.montantVal() - this.commission()),
  );

  /** Solde restant après retrait */
  readonly soldeRestant = computed(() =>
    Math.max(0, this.solde() - this.montantVal()),
  );

  readonly form = this.fb.nonNullable.group({
    montant: [0, [Validators.required, Validators.min(100)]],
    moyen_operation: ['CASH', Validators.required],
    motif: ['', Validators.required],
  });

  ngOnInit(): void {
    // Charger les configs de commission pour RETRAIT
    this.commissionService.getByType('RETRAIT').subscribe({
      next: (configs) => {
        this.commissionConfigs.set(configs.filter((c) => c.status === '200'));
      },
    });

    // Mettre à jour le montant en temps réel + vérifier le solde
    this.form.get('montant')?.valueChanges.subscribe((val) => {
      const montant = val || 0;
      this.montantVal.set(montant);
      this.soldeInsuffisant.set(montant > 0 && montant > this.solde());
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const montant = this.form.getRawValue().montant;

    if (montant > this.solde()) {
      this.soldeInsuffisant.set(true);
      return;
    }

    this.save.emit({
      montant,
      montant_commission: this.commission(),
      montant_net: this.netAmount(),
      moyen_operation: this.form.getRawValue().moyen_operation,
      motif: this.form.getRawValue().motif,
      description: 'Retrait direct portefeuille',
      date_operation: new Date().toISOString().split('T')[0],
      type_operation: 'RETRAIT',
      compte: '',
    });
  }
}
