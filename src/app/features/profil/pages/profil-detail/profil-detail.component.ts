// import { CommonModule } from '@angular/common';
// import { Component, OnInit, signal, inject, computed } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { finalize } from 'rxjs';
// import { ProfilService } from '../../services/profil.service';

// @Component({
//   selector: 'app-profil-detail',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './profil-detail.component.html',
//   styleUrls: ['./profil-detail.component.css'],
// })
// export class ProfilDetailComponent implements OnInit {
//   private readonly route = inject(ActivatedRoute);
//   private readonly service = inject(ProfilService);

//   readonly profil = signal<any | null>(null);
//   readonly isLoading = signal(false);

//   readonly initials = computed(() => {
//     return this.profil()?.libelle?.charAt(0).toUpperCase() ?? '';
//   });

//   ngOnInit(): void {
//     const id = this.route.snapshot.paramMap.get('id');
//     if (id) {
//       this.loadProfil(id);
//     }
//   }

//   loadProfil(id: string): void {
//     this.isLoading.set(true);
//     this.service
//       .getById(id)
//       .pipe(finalize(() => this.isLoading.set(false)))
//       .subscribe({
//         next: (response) => this.profil.set(response.data),
//         error: () => this.profil.set(null),
//       });
//   }
// }