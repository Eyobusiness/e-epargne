import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  input,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Filler,
  Legend,
  Tooltip,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Filler,
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
export class DashboardChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly stats = input<any>();

  @ViewChild('chartCanvas')
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  readonly isLoading = signal(true);

  private chart: Chart | null = null;

  private readonly LABELS = [
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

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(): void {
    this.renderChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    if (!this.chartCanvas) return;

    const depot = this.stats()?.monthlyTotalsByType?.DEPOT ?? {};
    const retrait = this.stats()?.monthlyTotalsByType?.RETRAIT ?? {};

    const depotData = Array.from({ length: 12 }, (_, i) => depot[String(i + 1)] ?? 0);
    const retraitData = Array.from({ length: 12 }, (_, i) => retrait[String(i + 1)] ?? 0);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',

      data: {
        labels: this.LABELS,

        datasets: [
          {
            label: 'Dépôts',
            data: depotData,
            borderColor: '#1B6B3A',
            backgroundColor: 'rgba(27, 107, 58, 0.08)',
            borderWidth: 2,
            pointBackgroundColor: '#1B6B3A',
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Retraits',
            data: retraitData,
            borderColor: '#E94E1B',
            backgroundColor: 'rgba(233, 78, 27, 0.07)',
            borderWidth: 2,
            pointBackgroundColor: '#E94E1B',
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              borderRadius: 3,
              useBorderRadius: true,
              font: { size: 12 },
              color: '#6b7280',
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: '#1A345C',
            titleColor: '#fff',
            bodyColor: '#c5d3e8',
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (ctx) => {
                const raw = ctx.parsed.y ?? 0;
                const val = new Intl.NumberFormat('fr-FR').format(raw).replace(/\s/g, '.');
                return ` ${ctx.dataset.label} : ${val} FCFA`;
              },
            },
          },
        },

        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { size: 12 },
              color: '#6b7280',
            },
          },
          y: {
            grid: {
              color: '#f1f5f9',
            },
            border: { display: false, dash: [4, 4] },
            ticks: {
              font: { size: 11 },
              color: '#6b7280',
              callback: (value) => {
                const num = Number(value);
                if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
                if (num >= 1_000) return (num / 1_000).toFixed(0) + 'k';
                return String(num);
              },
            },
          },
        },
      },
    });

    this.isLoading.set(false);
  }
}
