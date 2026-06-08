import { Component, ElementRef, ViewChild, AfterViewInit, OnChanges, input } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Legend,
  Tooltip,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Legend,
  Tooltip,
);

@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-chart.component.html',
  styleUrls: ['./dashboard-chart.component.css'],
})
export class DashboardChartComponent implements AfterViewInit, OnChanges {
  readonly stats = input<any>();

  @ViewChild('chartCanvas')
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(): void {
    this.renderChart();
  }

  private renderChart(): void {
    if (!this.chartCanvas) {
      return;
    }

    const depot = this.stats()?.monthlyTotalsByType?.DEPOT ?? {};

    const retrait = this.stats()?.monthlyTotalsByType?.RETRAIT ?? {};

    const labels = [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ];

    const depotData = [
      depot['1'] ?? 0,
      depot['2'] ?? 0,
      depot['3'] ?? 0,
      depot['4'] ?? 0,
      depot['5'] ?? 0,
      depot['6'] ?? 0,
      depot['7'] ?? 0,
      depot['8'] ?? 0,
      depot['9'] ?? 0,
      depot['10'] ?? 0,
      depot['11'] ?? 0,
      depot['12'] ?? 0,
    ];

    const retraitData = [
      retrait['1'] ?? 0,
      retrait['2'] ?? 0,
      retrait['3'] ?? 0,
      retrait['4'] ?? 0,
      retrait['5'] ?? 0,
      retrait['6'] ?? 0,
      retrait['7'] ?? 0,
      retrait['8'] ?? 0,
      retrait['9'] ?? 0,
      retrait['10'] ?? 0,
      retrait['11'] ?? 0,
      retrait['12'] ?? 0,
    ];

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',

      data: {
        labels,

        datasets: [
          {
            label: 'Dépôts',
            data: depotData,
            borderColor: '#16a34a',
            backgroundColor: '#16a34a',
            tension: 0.4,
          },
          {
            label: 'Retraits',
            data: retraitData,
            borderColor: '#dc2626',
            backgroundColor: '#dc2626',
            tension: 0.4,
          },
        ],
      },

      options: {
        responsive: true,

        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    });
  }
}
