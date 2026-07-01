    import { Component, OnInit, inject, signal } from '@angular/core';

    import { CommonModule } from '@angular/common';

    import { DashboardService } from '../services/dashboard.service';
    import { DashboardStats } from '../models/dashboard.model';

    import { DashboardStatsComponent } from '../components/dashboard-stats/dashboard-stats.component';
    import { DashboardChartComponent } from '../components/dashboard-chart/dashboard-chart.component';
    import { OperationService } from '../../operations/services/operation.service';
    import { Operation } from'../../operations/models/operation.model';
    import { FormatMontantPipe } from '../../../shared/pipes/pipe.component';
    import { ChangerDatePipe } from '../../../shared/pipes/changer-date.pipe';
    import { RapportService } from '../../rapports/services/rapport.service';
    import { ClassementGroupe } from '../../rapports/models/classement-groupe.model';
    import { ClassementGroupesComponent } from '../../rapports/components/classement-groupes/classement-groupes.component';
    import { DashboardGroupChartComponent } from '../components/dashboard-group-chart/dashboard-group-chart.component';



    @Component({
      selector: 'app-dashboard',
      standalone: true,
      imports: [
        CommonModule,
        DashboardStatsComponent,
        DashboardChartComponent,
        FormatMontantPipe,
        ChangerDatePipe,
        ClassementGroupesComponent,
        DashboardGroupChartComponent
      ],
      templateUrl: './dashboard.component.html',
      styleUrls: ['./dashboard.component.css'],
    })
    export class DashboardComponent implements OnInit {
      private readonly dashboardService = inject(DashboardService);
      private readonly operationService = inject(OperationService);
      private readonly rapportService = inject(RapportService);

      readonly dashboard = signal<DashboardStats | null>(null);
      readonly recentOperations = signal<any[]>([]);
      readonly classement = signal<ClassementGroupe[]>([]);
      
      readonly dateHeure = signal('');



      readonly currentPeriod = new Intl.DateTimeFormat('fr-FR', {
        month: 'long',
        year: 'numeric',
      }).format(new Date());

      readonly isLoading = signal(false);

      ngOnInit(): void {
        this.loadStats();

        this.loadRecentOperations();

        this.loadClassement();

        this.mettreAJourDateHeure();

  setInterval(() => {
    this.mettreAJourDateHeure();
  }, 1000);
}

mettreAJourDateHeure(): void {
  this.dateHeure.set(new Date().toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }));
      }

      // loadStats(): void {
      //   this.isLoading.set(true);

      //   this.dashboardService.getStats().subscribe({
      //     next: (response) => {
      //       this.dashboard.set(response);

      //       this.isLoading.set(false);
      //     },

      //     error: (error) => {
      //       console.error(error);

      //       this.isLoading.set(false);
      //     },
      //   });
      // }

      loadStats(): void {
        this.isLoading.set(true);

        this.dashboardService.getStats().subscribe({
          next: (stats) => {
            this.operationService
              .getAll({
                page: 1,
                limit: 10000000,
              })
              .subscribe({
                next: (response) => {
                  const operations: Operation[] = response?.data?.items ?? [];

                  const totalDepotPaye = operations
                    .filter((o) => o.type_operation === 'DEPOT' && o.status === '200')
                    .reduce((sum, o) => sum + o.montant, 0);

                  const totalDepotEnAttente = operations
                    .filter((o) => o.type_operation === 'DEPOT' && o.status === '100')
                    .reduce((sum, o) => sum + o.montant, 0);

                  const totalDepotAnnule = operations
                    .filter((o) => o.type_operation === 'DEPOT' && o.status === '300')
                    .reduce((sum, o) => sum + o.montant, 0);

                  const totalRetrait = operations
                    .filter((o) => o.type_operation === 'RETRAIT' && o.status === '200')
                    .reduce((sum, o) => sum + o.montant, 0);

                  const totalDepot = stats.totalDepot ?? 0;
                  const Solde = totalDepotPaye - totalRetrait;

                  this.dashboard.set({
                    ...stats,

                    totalDepot,
                    totalDepotPaye,
                    totalDepotEnAttente,
                    totalDepotAnnule,

                    totalRetrait,
                    Solde,
                  });

                  this.isLoading.set(false);
                },

                error: (error) => {
                  console.error(error);

                  this.dashboard.set(stats);

                  this.isLoading.set(false);
                },
              });
          },

          error: (error) => {
            console.error(error);

            this.isLoading.set(false);
          },
        });
      }

      loadRecentOperations(): void {
        this.operationService
          .getAll({
            page: 1,
            limit: 5,
          })
          .subscribe({
            next: (response) => {
              this.recentOperations.set(response?.data?.items ?? []);
            },
          });
      }

      loadClassement(): void {
        this.rapportService.getClassementGroupes({ startDate: '', endDate: '' }).subscribe({
          next: (data) => {
            this.classement.set(data);
          },
          error: (error) => {
            console.error('Erreur lors du chargement du classement des groupes', error);
          },
        });
      }
    }
