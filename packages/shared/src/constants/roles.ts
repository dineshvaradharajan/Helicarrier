export const ROLES = ["admin", "developer", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 100,
  developer: 50,
  viewer: 10,
};
