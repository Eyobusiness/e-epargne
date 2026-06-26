import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { RapportFilterComponent } from '../../components/rapport-filter/rapport-filter.component';

import { RapportService } from '../../services/rapport.service';

import { RapportFilter } from '../../models/rapport-filter.model';
import { RapportAdherent } from '../../models/rapport-adherent.model';
import { RapportGroupe } from '../../models/rapport-groupe.model';
import { ClassementGroupe } from '../../models/classement-groupe.model';
import { RapportGroupeTableComponent } from '../../components/rapport-groupe-table/rapport-groupe-table.component';
import { ClassementGroupesComponent } from '../../components/classement-groupes/classement-groupes.component';
import { computed } from '@angular/core';
import { RapportCotisationStatsComponent } from '../../components/rapport-cotisation-stats/rapport-cotisation-stats.component';
import { AppPageHeaderComponent } from '@shared/ui/app-page-header/app-page-header.component';
import { RapportAdherentTableComponent } from '../../components/rapport-adherent-table/rapport-adherent-table.component';

@Component({
  selector: 'app-rapport-adherents',
  standalone: true,
  imports: [
    CommonModule,
    RapportFilterComponent,
    RapportGroupeTableComponent,
    ClassementGroupesComponent,
    RapportCotisationStatsComponent,
    AppPageHeaderComponent,
  
    RapportAdherentTableComponent
  ],
  templateUrl: './rapport-adherents.component.html',
  styleUrls: ['./rapport-adherents.component.css'],
})
export class RapportAdherentsComponent implements OnInit {
  private readonly rapportService = inject(RapportService);

  readonly activeTab = signal<'adherents' | 'groupes' | 'classement'>('adherents');

  readonly isLoading = signal(false);

  readonly filter = signal<RapportFilter>({
    startDate: '',
    endDate: '',
  });

  readonly adherents = signal<RapportAdherent[]>([]);

  readonly groupes = signal<RapportGroupe[]>([]);

  readonly classement = signal<ClassementGroupe[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  setTab(tab: 'adherents' | 'groupes' | 'classement'): void {
    this.activeTab.set(tab);
  }

  loadData(): void {
    this.isLoading.set(true);

    this.rapportService.getRapportAdherents(this.filter()).subscribe({
      next: (data) => {
        this.adherents.set(data);

        this.isLoading.set(false);
      },

      error: () => {
        this.isLoading.set(false);
      },
    });

    this.rapportService.getRapportGroupes(this.filter()).subscribe({
      next: (data) => {
        this.groupes.set(data);
      },
    });

    this.rapportService.getClassementGroupes(this.filter()).subscribe({
      next: (data) => {
        this.classement.set(data);
      },
    });
  }

  onFilter(filter: RapportFilter): void {
    this.filter.set(filter);

    this.loadData();
  }

  resetFilters(): void {
    this.filter.set({
      startDate: '',
      endDate: '',
    });

    this.loadData();
  }

  readonly stats = computed(() => {
    const adherents = this.adherents();

    const groupes = this.groupes();

    const totalPrevu = adherents.reduce((sum, item) => sum + item.montantPrevu, 0);

    const totalPaye = adherents.reduce((sum, item) => sum + item.montantPaye, 0);

    const totalReste = adherents.reduce((sum, item) => sum + item.montantReste, 0);

    const matricules = new Set(adherents.map((item) => item.matricule));

    return {
      totalAdherents: matricules.size,

      totalGroupes: groupes.length,

      totalPrevu,

      totalPaye,

      totalReste,

      tauxRealisation: totalPrevu > 0 ? Math.round((totalPaye * 100) / totalPrevu) : 0,
    };
  });

  exportExcel(): void {

  switch (this.activeTab()) {

    case 'adherents':

      console.log(
        'Export Excel Adhérents',
        this.adherents(),
      );

      break;

    case 'groupes':

      console.log(
        'Export Excel Groupes',
        this.groupes(),
      );

      break;

    case 'classement':

      console.log(
        'Export Excel Classement',
        this.classement(),
      );

      break;
  }
}

exportPdf(): void {

  switch (this.activeTab()) {

    case 'adherents':

      console.log(
        'Export PDF Adhérents',
        this.adherents(),
      );

      break;

    case 'groupes':

      console.log(
        'Export PDF Groupes',
        this.groupes(),
      );

      break;

    case 'classement':

      console.log(
        'Export PDF Classement',
        this.classement(),
      );

      break;
  }
}
}
