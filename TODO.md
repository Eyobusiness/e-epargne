# TODO - Module Profil (CRUD + Menus/Permissions)

## Étape 1 — Vérification backend / contrat API
- [x] Confirmer l’existence de l’endpoint menus (fait côté user)
  - GET `/api/v1/profiles/menus/all`
- [x] Confirmer endpoints Profil (liste dans la question précédente)
- [x] Reçu: pas de route dédiée menus/profils (pour l’instant)
- [ ] Confirmer si `POST /api/v1/profiles` et/ou `PUT /api/v1/profiles/:id` gèrent bien l’association des menus (car sinon il faut une autre stratégie)



## Étape 2 — Implémenter “Ajouter / Retirer un menu” dans le détail
- [ ] Modifier `src/app/features/profil/pages/profil-detail/profil-detail.component.ts`
  - charger la liste des menus disponibles
  - charger les menus associés du profil
  - fournir des méthodes `addMenu(...)` et `removeMenu(...)` (ou une sauvegarde de sélection)
- [ ] Modifier `src/app/features/profil/pages/profil-detail/profil-detail.component.html`
  - ajouter UI “Ajouter un menu”
  - ajouter UI “Retirer un menu”

## Étape 3 — Ajuster le service si nécessaire
- [ ] Modifier `src/app/features/profil/services/profil.service.ts`
  - ajouter une méthode dédiée “updateMenus(profileId, menuIds...)” si l’endpoint existe

## Étape 4 — QA
- [ ] Créer profil + sélectionner menus => persist
- [ ] Modifier profil => menus mis à jour
- [ ] Dans le détail : ajouter/retirer menus => persist
- [ ] Vérifier permissions affichées (permission 1/2/3/4) si nécessaire

