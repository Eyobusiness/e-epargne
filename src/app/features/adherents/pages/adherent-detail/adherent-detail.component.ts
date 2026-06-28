import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Adherent } from '../../models/adherent.model';
import { DocumentIdentite } from '../../models/document.model';
import { AdherentService } from '../../services/adherent.service';
import { DocumentTableComponent } from '../../components/document-table/document-table.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';
import { ToastService } from '../../../../core/services/toast.service';
import { AvatarBgPipe } from '../../../../shared/pipes/avatar-bg.pipe';
import {
  extractApiErrorMessage,
  getMemberStatusLabel,
  isMemberActive,
} from '../../utils/member-api.utils';
@Component({
  selector: 'app-adherent-detail',
  standalone: true, 
  imports: [CommonModule, RouterLink, AppEmptyStateComponent, DocumentTableComponent, AvatarBgPipe], 
  templateUrl: './adherent-detail.component.html',
  styleUrls: ['./adherent-detail.component.css'],
})
export class AdherentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adherentService = inject(AdherentService);
  private readonly toastService = inject(ToastService);
  readonly adherent = signal<Adherent | null>(null);
  readonly documents = signal<DocumentIdentite[]>([]);
  readonly isLoading = signal(false);
  readonly hasDocuments = computed(() => this.documents().length > 0);
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    this.loadMember(id);
  }
  loadMember(id: string): void {
    this.isLoading.set(true);
    this.adherentService
      .getById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          const data = response as {
            adherent?: Adherent;
            documents?: DocumentIdentite[];
            data?: { adherent?: Adherent; documents?: DocumentIdentite[] };
          };
          const adherent = data.adherent ?? data.data?.adherent ?? null;
          const documents = data.documents ?? data.data?.documents ?? [];
          this.adherent.set(adherent);
          this.documents.set(documents);
        },
        error: (err) => {
          this.adherent.set(null);
          this.documents.set([]);
          this.toastService.show(
            extractApiErrorMessage(err) || 'Erreur chargement adherent',
            'error',
          );
        },
      });
  }
  isActive(status?: string): boolean {
    return isMemberActive(status);
  }
  statusLabel(status?: string): string {
    return getMemberStatusLabel(status);
  }

  selectedDocument = signal<DocumentIdentite | null>(null);

  openDocument(document: DocumentIdentite): void {
    this.selectedDocument.set(document);
  }

  closePreview(): void {
    this.selectedDocument.set(null);
  }
}
