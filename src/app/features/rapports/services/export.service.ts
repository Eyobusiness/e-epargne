import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { RapportAdherent } from '../models/rapport-adherent.model';
import { RapportGroupe } from '../models/rapport-groupe.model';
import { ClassementGroupe } from '../models/classement-groupe.model';
import { RapportFinancier } from '../models/rapport-financier.model';
import { RapportFinancierLigne } from '../models/rapport-financier-ligne.model';
import { FormatMontantPipe } from '../../../shared/pipes/pipe.component';

const APP_NAME = 'E-COTISATION';
const PRIMARY_COLOR: [number, number, number] = [37, 99, 235];   // blue-600
const HEADER_BG: [number, number, number] = [30, 58, 138];       // blue-900
const HEADER_FG: [number, number, number] = [255, 255, 255];



function formatPct(value: number): string {
  return value.toFixed(1) + ' %';
}

function buildPdfHeader(doc: jsPDF, title: string, subtitle?: string): void {
  // Background stripe
  doc.setFillColor(...PRIMARY_COLOR);
  const pageWidth = doc.internal.pageSize.getWidth();
doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(APP_NAME, 14, 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 17);

  if (subtitle) {
    doc.setFontSize(8);
    doc.text(subtitle, 14, 22);
  }

  // Date on the right
  const now = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  doc.setFontSize(8);
  doc.text('Généré le : ' + now, pageWidth - 14, 10, { align: 'right' });
  doc.setTextColor(0, 0, 0);
}

// ─── ADHERENTS ───────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ExportService {

  // ── EXCEL ────────────────────────────────────────────────────────────────

  exportAdherentsExcel(items: RapportAdherent[], filter?: { startDate?: string; endDate?: string }): void {
    const rows = items.map((item, i) => ({
      'N°': i + 1,
      'Matricule': item.matricule,
      'Nom': item.nom,
      'Téléphone': item.telephone,
      'Groupe': item.groupe,
      'Montant Prévu (FCFA)': item.montantPrevu,
      'Montant Payé (FCFA)': item.montantPaye,
      'Reste (FCFA)': item.montantReste,
      'Taux (%)': +item.tauxRealisation.toFixed(1),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    this._autoWidth(ws, rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Adhérents');
    XLSX.writeFile(wb, `rapport_adherents_${this._today()}.xlsx`);
  }

  exportGroupesExcel(items: RapportGroupe[]): void {
    const rows = items.map((item, i) => ({
      'N°': i + 1,
      'Groupe': item.groupe,
      'Membres': item.nombreAdherents,
      'Total Prévu (FCFA)': item.totalPrevu,
      'Total Cotisé (FCFA)': item.totalCotise,
      'Reste (FCFA)': item.resteACotiser,
      'Taux (%)': +item.tauxRealisation.toFixed(1),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    this._autoWidth(ws, rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Groupes');
    XLSX.writeFile(wb, `rapport_groupes_${this._today()}.xlsx`);
  }

  exportClassementExcel(items: ClassementGroupe[]): void {
    const rows = items.map(item => ({
      'Rang': item.rang,
      'Groupe': item.groupe,
      'Membres': item.nombreMembres,
      'Total Prévu (FCFA)': item.totalPrevu ?? 0,
      'Total Cotisé (FCFA)': item.totalCotise,
      'Reste (FCFA)': item.resteACotiser ?? 0,
      'Taux (%)': +item.tauxRealisation.toFixed(1),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    this._autoWidth(ws, rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Classement');
    XLSX.writeFile(wb, `classement_groupes_${this._today()}.xlsx`);
  }

  exportFinancierExcel(rapport: RapportFinancier): void {
    const wb = XLSX.utils.book_new();

    // Feuille résumé
    const summary = [
      { 'Indicateur': 'Total Dépôts Prévus',    'Montant (FCFA)': rapport.totalDepotPrevu },
      { 'Indicateur': 'Total Dépôts Payés',      'Montant (FCFA)': rapport.totalDepotPaye },
      { 'Indicateur': 'Dépôts En Attente',       'Montant (FCFA)': rapport.totalDepotEnAttente },
      { 'Indicateur': 'Dépôts Annulés',          'Montant (FCFA)': rapport.totalDepotAnnule },
      { 'Indicateur': 'Total Retraits',           'Montant (FCFA)': rapport.totalRetrait },
      { 'Indicateur': 'Total Dépenses',           'Montant (FCFA)': rapport.totalDepense },
      { 'Indicateur': 'Total Commissions',        'Montant (FCFA)': rapport.totalCommission },
      { 'Indicateur': 'Solde Disponible',         'Montant (FCFA)': rapport.soldeDisponible },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summary);
    this._autoWidth(wsSummary, summary);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');

    // Feuille détail opérations
    if (rapport.lignes?.length) {
      const details = rapport.lignes.map((l, i) => ({
        'N°': i + 1,
        'Date': l.date ? new Date(l.date).toLocaleDateString('fr-FR') : '--',
        'Type': l.type,
        'Adhérent': l.adherent,
        'Montant (FCFA)': l.montant,
        'Statut': this._statutLabel(l.statut),
        'Moyen': l.moyenPaiement ?? '--',
        'Description': l.description ?? '--',
      }));
      const wsDetails = XLSX.utils.json_to_sheet(details);
      this._autoWidth(wsDetails, details);
      XLSX.utils.book_append_sheet(wb, wsDetails, 'Opérations');
    }

    XLSX.writeFile(wb, `rapport_financier_${this._today()}.xlsx`);
  }

  // ── PDF ──────────────────────────────────────────────────────────────────

  exportAdherentsPdf(items: RapportAdherent[]): void {
    const doc = new jsPDF({ orientation: 'landscape' });
    buildPdfHeader(doc, 'Rapport des Adhérents');

    const head = [['N°', 'Matricule', 'Nom', 'Téléphone', 'Groupe', 'Prévu', 'Payé', 'Reste', 'Taux']];
    const body = items.map((item, i) => [
      i + 1,
      item.matricule,
      item.nom,
      item.telephone,
      item.groupe,
      FormatMontantPipe.prototype.transform(item.montantPrevu) + 'F',
      FormatMontantPipe.prototype.transform(item.montantPaye) + 'F',
      FormatMontantPipe.prototype.transform(item.montantReste) + 'F',
      formatPct(item.tauxRealisation) + '%',
    ]);

    autoTable(doc, {
      startY: 26,
      head,
      body,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: HEADER_BG, textColor: HEADER_FG, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: { 0: { halign: 'center', cellWidth: 10 }, 8: { halign: 'center' } },
    });

    this._addPageNumbers(doc);
    doc.save(`rapport_adherents_${this._today()}.pdf`);
  }

  exportGroupesPdf(items: RapportGroupe[]): void {
    const doc = new jsPDF({ orientation: 'landscape' });
    buildPdfHeader(doc, 'Rapport des Groupes');

    const head = [['N°', 'Groupe', 'Membres', 'Total Prévu', 'Total Cotisé', 'Reste', 'Taux']];
    const body = items.map((item, i) => [
      i + 1,
      item.groupe,
      item.nombreAdherents,
      FormatMontantPipe.prototype.transform(item.totalPrevu) + 'F',
      FormatMontantPipe.prototype.transform(item.totalCotise) + 'F',
      FormatMontantPipe.prototype.transform(item.resteACotiser) + 'F',
      formatPct(item.tauxRealisation) + '%',
    ]);

    autoTable(doc, {
      startY: 26,
      head,
      body,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: HEADER_BG, textColor: HEADER_FG, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 255] },
    });

    this._addPageNumbers(doc);
    doc.save(`rapport_groupes_${this._today()}.pdf`);
  }

  exportClassementPdf(items: ClassementGroupe[]): void {
    const doc = new jsPDF({ orientation: 'landscape' });
    buildPdfHeader(doc, 'Classement des Groupes');

    const head = [['Rang', 'Groupe', 'Membres', 'Total Prévu', 'Total Cotisé', 'Reste', 'Taux']];
    const body = items.map(item => [
      `#${item.rang}`,
      item.groupe,
      item.nombreMembres,
      FormatMontantPipe.prototype.transform(item.totalPrevu ?? 0) + 'F',
      FormatMontantPipe.prototype.transform(item.totalCotise) + 'F',
      FormatMontantPipe.prototype.transform(item.resteACotiser ?? 0) + 'F',
      formatPct(item.tauxRealisation) + '%',
    ]);

    autoTable(doc, {
      startY: 26,
      head,
      body,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: HEADER_BG, textColor: HEADER_FG, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: { 0: { halign: 'center', fontStyle: 'bold' } },
    });

    this._addPageNumbers(doc);
    doc.save(`classement_groupes_${this._today()}.pdf`);
  }

  exportFinancierPdf(rapport: RapportFinancier): void {
    const doc = new jsPDF({ orientation: 'portrait' });
    buildPdfHeader(doc, 'Rapport Financier');

    let y = 28;

    // ── Résumé ──────────────────────────────
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('Résumé financier', 14, y);
    doc.setTextColor(0, 0, 0);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Indicateur', 'Montant']],
      body: [
        ['Total Dépôts Prévus',   FormatMontantPipe.prototype.transform(rapport.totalDepotPrevu) + ' FCFA'],
        ['Total Dépôts Payés',    FormatMontantPipe.prototype.transform(rapport.totalDepotPaye) + ' FCFA'],
        ['Dépôts En Attente',     FormatMontantPipe.prototype.transform(rapport.totalDepotEnAttente) + ' FCFA'],
        ['Dépôts Annulés',        FormatMontantPipe.prototype.transform(rapport.totalDepotAnnule) + ' FCFA'],
        ['Total Retraits',         FormatMontantPipe.prototype.transform(rapport.totalRetrait) + ' FCFA'],
        ['Total Dépenses',         FormatMontantPipe.prototype.transform(rapport.totalDepense) + ' FCFA'],
        ['Total Commissions',      FormatMontantPipe.prototype.transform(rapport.totalCommission ?? 0) + ' FCFA'],
        ['Solde Disponible',       FormatMontantPipe.prototype.transform(rapport.soldeDisponible) + ' FCFA'],
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: HEADER_BG, textColor: HEADER_FG, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: {
         0: { cellWidth: 'auto' },
         1: { cellWidth: 35, halign: 'right' }
        }
    });

    // ── Détail opérations ──────────────────
    if (rapport.lignes?.length) {
      const finalY = (doc as any).lastAutoTable?.finalY ?? 80;
      y = finalY + 8;

      if (y > 240) {
        doc.addPage();
        buildPdfHeader(doc, 'Rapport Financier — Détail des opérations');
        y = 28;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PRIMARY_COLOR);
      doc.text('Détail des opérations', 14, y);
      doc.setTextColor(0, 0, 0);
      y += 2;

      autoTable(doc, {
        startY: y,
        head: [['Date', 'Type', 'Adhérent', 'Montant', 'Statut', 'Moyen']],
        body: rapport.lignes.map((l: RapportFinancierLigne) => [
          l.date ? new Date(l.date).toLocaleDateString('fr-FR') : '--',
          l.type,
          l.adherent,
          FormatMontantPipe.prototype.transform(l.montant) + 'F',
          this._statutLabel(l.statut),
          l.moyenPaiement ?? '--',
        ]),
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: HEADER_BG, textColor: HEADER_FG, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 248, 255] },
        columnStyles: { 3: { halign: 'right' } },
      });
    }

    this._addPageNumbers(doc);
    doc.save(`rapport_financier_${this._today()}.pdf`);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private _today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private _statutLabel(code: string): string {
    const map: Record<string, string> = { '100': 'En attente', '200': 'Payé', '300': 'Annulé' };
    return map[code] ?? code;
  }

  private _autoWidth(ws: XLSX.WorkSheet, rows: Record<string, unknown>[]): void {
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    ws['!cols'] = keys.map(k => {
      const maxLen = Math.max(
        k.length,
        ...rows.map(r => String(r[k] ?? '').length),
      );
      return { wch: Math.min(maxLen + 2, 40) };
    });
  }

  private _addPageNumbers(doc: jsPDF): void {
    const total = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} / ${total}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' },
      );
    }
  }
}
