import { Component, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { DashboardService } from '../services/dashboard.service';
import { DashboardStats } from '../models/dashboard.model';

import { DashboardStatsComponent } from '../components/dashboard-stats/dashboard-stats.component';
import { DashboardChartComponent } from '../components/dashboard-chart/dashboard-chart.component';
import { OperationService } from '../../operations/services/operation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardStatsComponent, DashboardChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly operationService = inject(OperationService);

  readonly dashboard = signal<DashboardStats | null>(null);
  readonly recentOperations = signal<any[]>([]);

  readonly currentPeriod = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  readonly isLoading = signal(false);

  ngOnInit(): void {
    this.loadStats();

    this.loadRecentOperations();
  }

  loadStats(): void {
    this.isLoading.set(true);

    this.dashboardService.getStats().subscribe({
      next: (response) => {
        this.dashboard.set(response);

        this.isLoading.set(false);
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
}
