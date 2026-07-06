import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';

import { User } from '../../models/utilisateur.model';
import { AvatarBgPipe } from '../../../../shared/pipes/avatar-bg.pipe';
import { ResolveUserPipe } from '../../../../shared/pipes/resolve-user.pipe';

@Component({
  selector: 'app-utilisateur-table',
  standalone: true,
  imports: [CommonModule, AvatarBgPipe, ResolveUserPipe],
  templateUrl: './utilisateur-table.component.html',
  styleUrls: ['./utilisateur-table.component.css'],
})
export class UtilisateurTableComponent {
  readonly utilisateurs = input<User[]>([]);

  readonly edit = output<User>();
  readonly delete = output<User>();
  readonly detail = output<User>();

  // Outputs for user status toggle actions
  readonly activate = output<User>();
  readonly deactivate = output<User>();

  // Pagination properties
  readonly currentPage = signal(1);
  readonly pageSize = 5;

  readonly totalPages = computed(() => {
    const pages = Math.ceil(this.utilisateurs().length / this.pageSize);
    return pages > 0 ? pages : 1;
  });

  readonly paginatedUtilisateurs = computed(() => {
    const list = this.utilisateurs();
    const page = Math.min(this.currentPage(), this.totalPages());
    const startIndex = (page - 1) * this.pageSize;
    return list.slice(startIndex, startIndex + this.pageSize);
  });

  readonly pagesArray = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  readonly startRange = computed(() => {
    if (this.utilisateurs().length === 0) return 0;
    const page = Math.min(this.currentPage(), this.totalPages());
    return (page - 1) * this.pageSize + 1;
  });

  readonly endRange = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const end = page * this.pageSize;
    const total = this.utilisateurs().length;
    return end > total ? total : end;
  });

  constructor() {
    // Keep currentPage within totalPages bounds when list updates
    effect(() => {
      const total = this.totalPages();
      if (this.currentPage() > total) {
        this.currentPage.set(total);
      }
    }, { allowSignalWrites: true });
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  onEdit(item: User): void {
    this.edit.emit(item);
  }

  onDelete(item: User): void {
    this.delete.emit(item);
  }

  onDetail(item: User): void {
    this.detail.emit(item);
  }

  onActivate(item: User): void {
    this.activate.emit(item);
  }

  onDeactivate(item: User): void {
    this.deactivate.emit(item);
  }

  trackById(index: number, item: User): string {
    return item.id ?? index.toString();
  }
}
