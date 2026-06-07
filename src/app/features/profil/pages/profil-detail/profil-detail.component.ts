// pages/profil-detail/profil-detail.component.ts

import { CommonModule } from '@angular/common';

import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { finalize } from 'rxjs';

import { Profil } from '../../models/profil.model';

import { ProfilService } from '../../services/profil.service';

import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';

@Component({
  selector: 'app-profil-detail',

  standalone: true,

  imports: [CommonModule, AppPageHeaderComponent],

  templateUrl: './profil-detail.component.html',

  styleUrls: ['./profil-detail.component.css'],
})
export class ProfilDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  private readonly service = inject(ProfilService);

  readonly profil = signal<Profil | null>(null);

  readonly isLoading = signal(false);

  readonly initials = computed(() => {
    const libelle = this.profil()?.libelle ?? '';

    return libelle.charAt(0);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.loadProfil(id);
  }

  loadProfil(id: string): void {
    this.isLoading.set(true);

    this.service
      .getById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.profil.set(response.data);
        },

        error: () => {
          this.profil.set(null);
        },
      });
  }
}
