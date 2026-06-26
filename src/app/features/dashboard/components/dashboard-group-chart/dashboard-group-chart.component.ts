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
  DoughnutController,
  ArcElement,
  Legend,
  Tooltip,
} from 'chart.js';
import { ClassementGroupe } from '../../../rapports/models/classement-groupe.model';

Chart.register(
  DoughnutController,
  ArcElement,
  Legend,
  Tooltip,
);

@Component({
  selector: 'app-dashboard-group-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-group-chart.component.html',
  styleUrls: ['./dashboard-group-chart.component.css'],
})
export class DashboardGroupChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly items = input<ClassementGroupe[]>([]);

  @ViewChild('chartCanvas')
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  readonly isLoading = signal(true);
  private chart: Chart | null = null;

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

    const dataItems = this.items();
    if (!dataItems || dataItems.length === 0) {
      this.isLoading.set(true);
      return;
    }

    this.isLoading.set(false);

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = dataItems.map(item => item.groupe);
    const data = dataItems.map(item => item.totalCotise);

    // Palette de couleurs premium
    const colors = [
      '#1A345C', // Bleu marine principal
      '#E94E1B', // Orange/Rouge tontine
      '#16A34A', // Vert réussite
      '#2563EB', // Bleu vif
      '#D97706', // Ambre/Jaune sombre
      '#7C3AED', // Violet
      '#06B6D4', // Cyan
      '#EC4899', // Rose
      '#64748B', // Ardoise
    ];

    const backgroundColors = data.map((_, i) => colors[i % colors.length]);

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              borderRadius: 3,
              useBorderRadius: true,
              font: {
                size: 11,
                weight: 'bold'
              },
              color: '#475569',
              padding: 12,
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
                const index = ctx.dataIndex;
                const raw = dataItems[index].totalCotise;
                const rate = dataItems[index].tauxRealisation;
                const formattedAmt = new Intl.NumberFormat('fr-FR').format(raw).replace(/\s/g, '.');
                return ` Cotisé: ${formattedAmt} FCFA (${rate.toFixed(0)}% réalisé)`;
              },
            },
          },
        },
      },
    });
  }
}
