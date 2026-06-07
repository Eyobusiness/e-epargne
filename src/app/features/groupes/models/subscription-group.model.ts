import {
  CreateGroupePayload,
  Groupe,
  GroupeListResponse,
  UpdateGroupePayload,
  normalizeGroupe,
  toGroupePayload,
} from './groupe.model';

export type SubscriptionGroup = Groupe;

export type SubscriptionGroupListResponse = GroupeListResponse;

export type CreateSubscriptionGroupPayload = CreateGroupePayload;

export type UpdateSubscriptionGroupPayload = UpdateGroupePayload;

export const normalizeSubscriptionGroup = normalizeGroupe;

export const toSubscriptionGroupPayload = toGroupePayload;
