import { Component, EventEmitter, Output, effect, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectorLimit, Plafond } from '../../models/plafond.model';
import { User, Profil } from '../../../utilisateurs/models/utilisateur.model';
import { AppSelectComponent } from '../../../../shared/ui/app-select/app-select.component';
import { AppButtonComponent } from '../../../../shared/ui/app-button/app-button.component';

type TargetType = 'agent' | 'profil';

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
  readonly profiles = input<Profil[]>([]);
  readonly isLoading = input<boolean>(false);

  @Output() readonly submitForm = new EventEmitter<Partial<CollectorLimit>>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly targetType = signal<TargetType>('agent');
  readonly selectedPlafondId = signal<string>('');
  readonly selectedAgentId = signal<string>('');
  readonly selectedProfilId = signal<string>('');

  readonly errors = signal<Record<string, string>>({});
  readonly hasSubmitted = signal(false);

  readonly targetTypeOptions = [
    { label: 'Agent Collecteur', value: 'agent' },
    { label: 'Profil Utilisateur', value: 'profil' },
  ];

  readonly plafondOptions = computed(() =>
    this.plafonds().map((p) => ({ label: `${p.name} (${p.amount} FCFA)`, value: p.id ?? '' }))
  );

  readonly agentOptions = computed(() =>
    this.agents().map((a) => ({ label: `${a.name} (${a.email})`, value: a.id ?? '' }))
  );

  readonly profilOptions = computed(() =>
    this.profiles().map((p) => ({ label: p.name, value: p.id ?? '' }))
  );

  constructor() {
    effect(() => {
      const value = this.affectation();
      if (value) {
        this.selectedPlafondId.set(value.plafond_id || '');
        if (value.agent_id) {
          this.targetType.set('agent');
          this.selectedAgentId.set(value.agent_id);
          this.selectedProfilId.set('');
        } else if (value.profil_id) {
          this.targetType.set('profil');
          this.selectedProfilId.set(value.profil_id);
          this.selectedAgentId.set('');
        }
      } else {
        this.selectedPlafondId.set('');
        this.selectedAgentId.set('');
        this.selectedProfilId.set('');
        this.targetType.set('agent');
      }
      this.resetValidationState();
    });
  }

  setTargetType(type: TargetType): void {
    this.targetType.set(type);
    if (type === 'agent') {
      this.selectedProfilId.set('');
    } else {
      this.selectedAgentId.set('');
    }
    this.errors.set({});
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

    if (this.targetType() === 'agent' && !this.selectedAgentId()) {
      errors['agent_id'] = 'Veuillez sélectionner un agent';
    }

    if (this.targetType() === 'profil' && !this.selectedProfilId()) {
      errors['profil_id'] = 'Veuillez sélectionner un profil';
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
      agent_id: this.targetType() === 'agent' ? this.selectedAgentId() : null,
      profil_id: this.targetType() === 'profil' ? this.selectedProfilId() : null,
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
