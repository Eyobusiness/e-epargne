import { Component, EventEmitter, Output, effect, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectorLimit, Plafond } from '../../models/plafond.model';
import { User } from '../../../utilisateurs/models/utilisateur.model';
import { AppSelectComponent } from '../../../../shared/ui/app-select/app-select.component';
import { AppButtonComponent } from '../../../../shared/ui/app-button/app-button.component';

@Component({
  selector: 'app-affectation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AppSelectComponent, AppButtonComponent],
  templateUrl: './affectation-form.component.html',
  styleUrls: ['./affectation-form.component.css'],
})
export class AffectationFormComponent {
  readonly affectation = input<CollectorLimit | null>(null);
  readonly plafonds = input<Plafond[]>([]);
  readonly agents = input<User[]>([]);
  readonly isLoading = input<boolean>(false);

  @Output() readonly submitForm = new EventEmitter<Partial<CollectorLimit>>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly selectedPlafondId = signal<string>('');
  readonly selectedAgentId = signal<string>('');

  readonly errors = signal<Record<string, string>>({});
  readonly hasSubmitted = signal(false);

  readonly plafondOptions = computed(() =>
    this.plafonds().map((p) => ({ label: `${p.name} (${p.amount} FCFA)`, value: p.id ?? '' }))
  );

  readonly agentOptions = computed(() =>
    this.agents()
      .filter((a) => a.profil?.code === 'COLLECTOR')
      .map((a) => ({ label: `${a.name} (${a.email})`, value: a.id ?? '' }))
  );

  constructor() {
    effect(() => {
      const value = this.affectation();
      if (value) {
        this.selectedPlafondId.set(value.plafond_id || '');
        this.selectedAgentId.set(value.agent_id || '');
      } else {
        this.selectedPlafondId.set('');
        this.selectedAgentId.set('');
      }
      this.resetValidationState();
    });
  }

  resetValidationState(): void {
    this.errors.set({});
    this.hasSubmitted.set(false);
  }

  validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!this.selectedPlafondId()) {
      errors['plafond_id'] = 'Veuillez sélectionner un plafond';
    }

    if (!this.selectedAgentId()) {
      errors['agent_id'] = 'Veuillez sélectionner un agent';
    }

    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }

  getError(field: string): string | null {
    if (!this.hasSubmitted()) {
      return null;
    }
    return this.errors()[field] ?? null;
  }

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }
    this.hasSubmitted.set(true);

    if (!this.validateForm()) {
      return;
    }

    const payload: Partial<CollectorLimit> = {
      plafond_id: this.selectedPlafondId(),
      agent_id: this.selectedAgentId(),
      profil_id: null,
    };

    this.submitForm.emit(payload);
  }

  onCancel(): void {
    if (this.isLoading()) {
      return;
    }
    this.cancel.emit();
  }
}
