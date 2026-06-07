export function isGroupActive(status?: string): boolean {
  return status === '200';
}

export function getGroupStatusLabel(status?: string): string {
  if (status === '200') {
    return 'Actif';
  }

  if (status === '0') {
    return 'Inactif';
  }

  return status ?? '--';
}
