import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Operation } from '../../../operations/models/operation.model';
import { FormatMontantPipe } from '@shared/pipes/pipe.component';

@Component({
  selector: 'app-portefeuille-operations',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatMontantPipe],
  providers: [DatePipe],
  templateUrl: './portefeuille-operations.component.html',
  styleUrls: ['./portefeuille-operations.component.css'],
})
export class PortefeuilleOperationsComponent {
  readonly operations = input<Operation[]>([]);
  readonly adherentName = input<string>('');
  readonly adherentId = input<string>('');
  readonly solde = input<number>(0);

  private readonly datePipe = inject(DatePipe);

  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly type_operation = signal('');

  readonly currentPage = signal(1);

  readonly itemsPerPage = 10;

  readonly filteredOperations = computed(() => {
    const start = this.startDate();
    const end = this.endDate();

    return this.operations().filter((item) => {
      const operationDate = new Date(item.date_operation);

      const matchStart = !start || operationDate >= new Date(start);

      const matchEnd = !end || operationDate <= new Date(end);

      const matchType = !this.type_operation() || item.type_operation === this.type_operation();

      return matchStart && matchEnd && matchType;
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredOperations().length / this.itemsPerPage)),
  );

  readonly paginatedOperations = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;

    return this.filteredOperations().slice(start, start + this.itemsPerPage);
  });

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  applyFilter(): void {
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.type_operation.set('');
    this.currentPage.set(1);
  }

  trackById(index: number, item: Operation): string {
    return item.id ?? index.toString();
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case '200':
        return 'Payé';

      case '100':
        return 'En attente';

      case '300':
        return 'Annulé';

      default:
        return '--';
    }
  }

  printRecu(item: Operation): void {
    const dateFormatted = this.datePipe.transform(item.date_operation, 'dd/MM/yyyy') ?? item.date_operation;
    const now = this.datePipe.transform(new Date(), 'dd/MM/yyyy à HH:mm') ?? '';
    const typeLabel = item.type_operation === 'DEPOT' ? 'Dépôt' : 'Retrait';
    const statusLabel = this.getStatusLabel(item.status);
    const adherent = this.adherentName() || this.adherentId() || '--';
    const soldeActuel = this.solde().toLocaleString('fr-FR') + ' FCFA';

    const montantFormatted = (item.montant ?? 0).toLocaleString('fr-FR') + ' FCFA';
    const commissionFormatted = ((item.montant_commission ?? 0)).toLocaleString('fr-FR') + ' FCFA';
    const netFormatted = ((item.montant_net ?? item.montant ?? 0)).toLocaleString('fr-FR') + ' FCFA';

    const showRetrait = item.type_operation === 'RETRAIT';

    const retraitRows = showRetrait ? `
      <tr>
        <td>Commission</td>
        <td style="color:#d97706;font-weight:700;">${commissionFormatted}</td>
      </tr>
      <tr>
        <td>Montant net remis</td>
        <td style="color:#16a34a;font-weight:700;">${netFormatted}</td>
      </tr>
    ` : '';

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Reçu — ${typeLabel}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #fff;
      color: #1A345C;
      padding: 20mm 20mm 15mm;
    }
    .recu-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #1A345C;
    }
    .recu-logo {
      font-size: 28px;
      font-weight: 900;
      color: #1A345C;
      letter-spacing: -1px;
    }
    .recu-logo span { color: #E94E1B; }
    .recu-meta {
      text-align: right;
      font-size: 12px;
      color: #64748b;
    }
    .recu-meta strong { color: #1A345C; font-size: 14px; }
    .recu-title {
      text-align: center;
      margin: 24px 0 20px;
    }
    .recu-title h1 {
      font-size: 22px;
      font-weight: 800;
      color: #1A345C;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .recu-title .badge {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      background: ${item.type_operation === 'DEPOT' ? '#dcfce7' : '#fdecea'};
      color: ${item.type_operation === 'DEPOT' ? '#16a34a' : '#E94E1B'};
    }
    .section {
      margin-bottom: 22px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #94a3b8;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    tr td {
      padding: 9px 8px;
      font-size: 13.5px;
      border-bottom: 1px solid #f1f5f9;
    }
    tr td:first-child {
      color: #64748b;
      font-weight: 500;
      width: 50%;
    }
    tr td:last-child {
      font-weight: 600;
      color: #1A345C;
      text-align: right;
    }
    .montant-principal td:last-child {
      font-size: 18px;
      font-weight: 800;
      color: ${item.type_operation === 'DEPOT' ? '#16a34a' : '#E94E1B'};
    }
    .divider {
      border: none;
      border-top: 2px dashed #e2e8f0;
      margin: 20px 0;
    }
    .recu-footer {
      margin-top: 40px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.7;
    }
    .stamp {
      display: inline-block;
      margin-top: 16px;
      padding: 6px 20px;
      border: 2px solid #16a34a;
      border-radius: 4px;
      color: #16a34a;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      transform: rotate(-3deg);
    }
    @media print {
      body { padding: 10mm 15mm; }
    }
  </style>
</head>
<body>
  <div class="recu-header">
    <div class="recu-logo">e<span>-</span>Épargne</div>
    <div class="recu-meta">
      <strong>REÇU DE ${typeLabel.toUpperCase()}</strong><br>
      Réf : ${item.id?.slice(0, 12).toUpperCase() ?? 'N/A'}<br>
      Imprimé le : ${now}
    </div>
  </div>

  <div class="recu-title">
    <h1>Reçu de ${typeLabel}</h1>
    <div class="badge">${typeLabel.toUpperCase()}</div>
  </div>

  <div class="section">
    <div class="section-title">Informations adhérent</div>
    <table>
      <tr>
        <td>Adhérent</td>
        <td>${adherent}</td>
      </tr>
      <tr>
        <td>Solde actuel</td>
        <td>${soldeActuel}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Détail de l'opération</div>
    <table>
      <tr class="montant-principal">
        <td>Montant</td>
        <td>${montantFormatted}</td>
      </tr>
      ${retraitRows}
      <tr>
        <td>Moyen de paiement</td>
        <td>${item.moyen_operation ?? '--'}</td>
      </tr>
      <tr>
        <td>Date opération</td>
        <td>${dateFormatted}</td>
      </tr>
      <tr>
        <td>Statut</td>
        <td>${statusLabel}</td>
      </tr>
      ${item.motif ? `<tr><td>Motif</td><td>${item.motif}</td></tr>` : ''}
    </table>
  </div>

  <hr class="divider">

  <div class="recu-footer">
    <div>Ce reçu est généré automatiquement et fait foi de l'opération effectuée.</div>
    <div>e-Épargne — Système de gestion de tontine</div>
    ${item.status === '200' ? '<div class="stamp">Validé</div>' : ''}
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=794,height=1123');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 500);
  }
}
