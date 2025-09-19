export type Entitlement = { key: string; limit?: number | null; isEnabled: boolean };
export type Snapshot = { entitlements: Record<string, Entitlement>; usage: Record<string, number> };
export function buildHelpers(s: Snapshot) {
  const can = (k: string) => !!s.entitlements[k]?.isEnabled && (s.entitlements[k]?.limit == null || (s.usage[k] ?? 0) < (s.entitlements[k]!.limit!));
  const limit = (k: string) => s.entitlements[k]?.limit ?? null;
  return { can, limit };
}
