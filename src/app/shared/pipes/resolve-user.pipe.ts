import { Pipe, PipeTransform, inject } from '@angular/core';
import { UtilisateurService } from '../../features/utilisateurs/services/utilisateur.service';
import { AdherentService } from '../../features/adherents/services/adherent.service';

@Pipe({
  name: 'resolveUser',
  standalone: true,
  pure: false
})
export class ResolveUserPipe implements PipeTransform {
  private readonly userService = inject(UtilisateurService);
  private readonly adherentService = inject(AdherentService);

  transform(userId: string | null | undefined): string {
    if (!userId) return '--';

    // 1. Essayer de trouver l'utilisateur dans le cache des agents/admins
    const userCache = this.userService.usersCache();
    if (userCache.length === 0) {
      this.userService.loadAllUsersToCache();
    }
    const user = userCache.find((u) => u && String(u.id) === String(userId));
    if (user) {
      const roleName = user.profil?.name || user.profil?.code || 'Opérateur';
      return `${roleName} - ${user.name}`;
    }

    // 2. Si non trouvé, essayer de trouver l'adhérent dans le cache des membres
    const memberCache = this.adherentService.membersCache();
    if (memberCache.length === 0) {
      this.adherentService.loadAllMembersToCache();
    }
    const member = memberCache.find((m) => m && String(m.id) === String(userId));
    if (member) {
      return `Adhérent - ${member.name}`;
    }

    // 3. Afficher l'ID en attendant la fin du chargement des caches
    if (userCache.length === 0 || memberCache.length === 0) {
      return `${userId} (Chargement...)`;
    }

    return `ID: ${userId}`;
  }
}
