import type { FieldEdit } from "../types";

/** Merge a field edit patch; explicit `mapping: ""` clears a base-document mapping. */
export function mergeFieldEdit(
  prev: FieldEdit | undefined,
  patch: FieldEdit,
): FieldEdit | null {
  const merged = { ...prev, ...patch };
  const cleaned: FieldEdit = {};
  for (const [kk, vv] of Object.entries(merged)) {
    if (vv === undefined) continue;
    if (kk === "mapping" && "mapping" in patch && patch.mapping === "") {
      cleaned.mapping = "";
      continue;
    }
    if (vv !== "") cleaned[kk as keyof FieldEdit] = vv as string;
  }
  return Object.keys(cleaned).length ? cleaned : null;
}
