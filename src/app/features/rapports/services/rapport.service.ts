import { Injectable, inject } from '@angular/core';

import { AdherentService } from '../../adherents/services/adherent.service';
import { CotisationAdherentService } from '../../cotisation-adherents/services/cotisation-adherent.service';
import { OperationService } from '../../operations/services/operation.service';
import { DepenseService } from '../../depenses/services/depense.service';
import { GroupeService } from '../../groupes/services/groupe.service';
import { AffectationAdherentService } from '../../groupes/services/affectation-adherent.service';
import { forkJoin, map, Observable } from 'rxjs';

import { RapportFilter } from '../models/rapport-filter.model';
import { RapportFinancier } from '../models/rapport-financier.model';
import { isInDateRange, sumBy, calculateRate, calculateRemaining } from '../utils/rapport.utils';
import { RapportAdherent } from '../models/rapport-adherent.model';
import { RapportGroupe } from '../models/rapport-groupe.model';
import {ClassementGroupe } from '../models/classement-groupe.model';



@Injectable({
  providedIn: 'root',
})
export class RapportService {
  private readonly adherentService = inject(AdherentService);

  private readonly cotisationAdherentService = inject(CotisationAdherentService);

  private readonly operationService = inject(OperationService);

  private readonly depenseService = inject(DepenseService);

  private readonly groupeService = inject(GroupeService);

  private readonly affectationService = inject(AffectationAdherentService);

  getRapportFinancier(filter: RapportFilter): Observable<RapportFinancier> {
    return forkJoin({
      operations: this.operationService.getAll({
        page: 1,
        limit: 1000000,
      }),

      cotisations: this.cotisationAdherentService.getAll({
        page: 1,
        limit: 1000000,
      }),

      depenses: this.depenseService.getAll(1, 1000000, ''),
    }).pipe(
      map((result) => {
        const operations = result.operations?.data?.items ?? [];

        const cotisations = result.cotisations?.data?.items ?? [];

        const depenses = result.depenses?.data?.items ?? [];

        const operationsFiltrees = operations.filter((item: any) =>
          isInDateRange(item.date_operation, filter.startDate, filter.endDate),
        );

        const cotisationsFiltrees = cotisations.filter((item: any) =>
          isInDateRange(item.date_cotisation, filter.startDate, filter.endDate),
        );

        const depensesFiltrees = depenses.filter((item: any) =>
          isInDateRange(item.date_depense, filter.startDate, filter.endDate),
        );

        const totalDepotPrevu = cotisationsFiltrees.reduce(
          (sum: number, item: any) => sum + (item.montant ?? 0),
          0,
        );

        const totalDepotPaye = operationsFiltrees
          .filter((item: any) => item.type_operation === 'DEPOT' && item.status === '200')
          .reduce((sum: number, item: any) => sum + (item.montant ?? 0), 0);

        const totalDepotEnAttente = operationsFiltrees
          .filter((item: any) => item.type_operation === 'DEPOT' && item.status === '100')
          .reduce((sum: number, item: any) => sum + (item.montant ?? 0), 0);

        const totalDepotAnnule = operationsFiltrees
          .filter((item: any) => item.type_operation === 'DEPOT' && item.status === '300')
          .reduce((sum: number, item: any) => sum + (item.montant ?? 0), 0);

        const totalRetrait = operationsFiltrees
          .filter((item: any) => item.type_operation === 'RETRAIT' && item.status === '200')
          .reduce((sum: number, item: any) => sum + (item.montant ?? 0), 0);

        const totalDepense = depensesFiltrees.reduce(
          (sum: number, item: any) => sum + (item.amount ?? 0),
          0,
        );

        const lignes = operationsFiltrees.map((operation: any) => ({
          id: operation.id ?? '',

          date: operation.date_operation,

          type: operation.type_operation,

          adherent: operation.adherent?.name ?? '--',

          montant: operation.montant ?? 0,

          statut: operation.status,

          moyenPaiement: operation.moyen_operation,

          description: operation.description,
        }));

        const soldeDisponible = totalDepotPaye - totalRetrait;

        const totalCommission = 0;

        return {
          totalDepotPrevu,
          totalDepotPaye,
          totalDepotEnAttente,
          totalDepotAnnule,
          totalRetrait,
          totalDepense,
          soldeDisponible,
          totalCommission,
          lignes,
        };
      }),
    );
  }

  getRapportAdherents(filter: RapportFilter): Observable<RapportAdherent[]> {
    return forkJoin({
      adherents: this.adherentService.getAll(1, 1000000, '', '200'),

      cotisations: this.cotisationAdherentService.getAll({
        page: 1,
        limit: 1000000,
      }),

      operations: this.operationService.getAll({
        page: 1,
        limit: 1000000,
      }),
    }).pipe(
      map((result) => {
        const adherents = result.adherents?.data?.items ?? [];

        const cotisations = result.cotisations?.data?.items ?? [];

        const operations = result.operations?.data?.items ?? [];

        const lignes: RapportAdherent[] = [];

        for (const cotisation of cotisations) {
          if (!isInDateRange(cotisation.date_cotisation, filter.startDate, filter.endDate)) {
            continue;
          }

          const adherent = adherents.find((a: any) => a.id === cotisation.adherent_id);

          if (!adherent) {
            continue;
          }

          const operationsDepot = operations.filter(
            (operation: any) =>
              operation.cotisation_adherent_id === cotisation.id &&
              operation.type_operation === 'DEPOT' &&
              operation.status === '200',
          );

          const montantPaye = operationsDepot.reduce(
            (sum: number, operation: any) => sum + (operation.montant ?? 0),
            0,
          );

          const montantPrevu = cotisation.montant ?? 0;

          const montantReste = calculateRemaining(montantPrevu, montantPaye);

          lignes.push({
            adherentId: adherent.id ?? '',

            matricule: adherent.matricule ?? '--',

            nom: adherent.name ?? '--',

            telephone: adherent.phone ?? '--',

            groupeId: cotisation.groupe_cotisation?.id ?? '',

            groupe: cotisation.groupe_cotisation?.name ?? 'Sans groupe',

            montantPrevu,

            montantPaye,

            montantReste,

            tauxRealisation: calculateRate(montantPaye, montantPrevu),

            periodicite: cotisation.periodicite,

            statut: cotisation.status,
          });
        }

        return lignes.sort((a, b) => a.nom.localeCompare(b.nom));
      }),
    );
  }

  getRapportGroupes(filter: RapportFilter): Observable<RapportGroupe[]> {
    return this.getRapportAdherents(filter).pipe(
      map((lignes) => {
        const groupes = new Map<
          string,
          RapportGroupe & {
            matricules: Set<string>;
          }
        >();

        for (const ligne of lignes) {
          const key = ligne.groupeId;

          if (!groupes.has(key)) {
            groupes.set(key, {
              groupeId: ligne.groupeId,

              groupe: ligne.groupe,

              nombreAdherents: 0,

              totalPrevu: 0,

              totalCotise: 0,

              resteACotiser: 0,

              tauxRealisation: 0,

              matricules: new Set<string>(),
            });
          }

          const groupe = groupes.get(key)!;

          // Compte uniquement les adhérents uniques
          groupe.matricules.add(ligne.matricule);

          groupe.totalPrevu += ligne.montantPrevu;

          groupe.totalCotise += ligne.montantPaye;

          groupe.resteACotiser += ligne.montantReste;
        }

        const result = Array.from(groupes.values());

        result.forEach((groupe) => {
          groupe.nombreAdherents = groupe.matricules.size;

          groupe.tauxRealisation = calculateRate(groupe.totalCotise, groupe.totalPrevu);

          delete (groupe as any).matricules;
        });

        return result.sort((a, b) => b.totalCotise - a.totalCotise);
      }),
    );
  }

  getClassementGroupes(filter: RapportFilter): Observable<ClassementGroupe[]> {
    return this.getRapportGroupes(filter).pipe(
      map((groupes) => {
        return [...groupes]

          .sort((a, b) => b.tauxRealisation - a.tauxRealisation)

          .map((groupe, index) => ({
            rang: index + 1,

            groupeId: groupe.groupeId,

            groupe: groupe.groupe,

            nombreMembres: groupe.nombreAdherents,

            totalPrevu: groupe.totalPrevu,

            totalCotise: groupe.totalCotise,

            resteACotiser: groupe.resteACotiser,

            tauxRealisation: groupe.tauxRealisation,
          }));
      }),
    );
  }
}
