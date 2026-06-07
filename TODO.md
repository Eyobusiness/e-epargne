# TODO.md

## Cotisations (cotisations + cotisation-adherents)

- [ ] Adapter **cotisation-adherents** pour utiliser exclusivement les endpoints backend :
  - [ ] `GET/POST/PUT/DELETE /api/v1/subscriptions/members/*`
  - [ ] (optionnel) `POST /api/v1/subscriptions/members/generate`
- [ ] Mettre à jour `cotisation-adherent.model.ts` :
  - [ ] `id: string` + IDs `adherent_id`, `cotisation_id` en `string`
  - [ ] champs conformes : `montant`, `status`, `date_echeance`
- [ ] Mettre à jour `cotisation-adherent.service.ts` :
  - [ ] corriger l’URL (retirer `cotisations/adherents`)
  - [ ] implémenter CRUD propre avec pagination `data.items` / `meta`
- [ ] Mettre à jour `cotisations-adherents.component.ts` :
  - [ ] supprimer la date fake/génération fictive
  - [ ] pagination/filtrage basés sur la réponse backend
  - [ ] rafraîchir la liste après create/update/delete
- [x] Mettre à jour `cotisation-adherent-form.component.ts` :
  - [x] payload exact conforme au backend (champs attendus)
- [x] Build Angular pour valider compilation :
  - [x] `npm run build`


