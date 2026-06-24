/** Publication / compile configuration (tier B) — not per-field OCP yellow cells. */

export interface PublisherInfo {
  name: string;
  scheme: string;
  uid: string;
  uri: string;
}

export interface PublicationDefaults {
  currency: string;
  classification_scheme: string;
  language: string;
  initiationType: string;
}

export interface GeneratedOcidRule {
  from: string[];
}

export interface GeneratedReleaseDateRule {
  prefer: string[];
}

export interface PublicationGenerated {
  ocid: GeneratedOcidRule;
  release_id: string;
  release_date: GeneratedReleaseDateRule;
}

export interface CompileBuyerRefs {
  name: string;
  id: string;
}

export interface PublicationConfig {
  version: string;
  ocid_prefix: string;
  publisher: PublisherInfo;
  license: string;
  publicationPolicy: string;
  extensions: string[];
  defaults: PublicationDefaults;
  generated: PublicationGenerated;
  planning_triggers: string[];
  buyer: CompileBuyerRefs;
}

export function emptyPublicationConfig(): PublicationConfig {
  return {
    version: "1",
    ocid_prefix: "",
    publisher: { name: "", scheme: "", uid: "", uri: "" },
    license: "",
    publicationPolicy: "",
    extensions: [],
    defaults: {
      currency: "",
      classification_scheme: "",
      language: "en",
      initiationType: "tender",
    },
    generated: {
      ocid: { from: [] },
      release_id: "",
      release_date: { prefer: [] },
    },
    planning_triggers: [],
    buyer: { name: "", id: "" },
  };
}

export function normalizePublicationConfig(
  raw: Partial<PublicationConfig> | undefined | null,
): PublicationConfig {
  const base = emptyPublicationConfig();
  if (!raw) return base;
  return {
    version: raw.version ?? base.version,
    ocid_prefix: raw.ocid_prefix ?? base.ocid_prefix,
    publisher: { ...base.publisher, ...raw.publisher },
    license: raw.license ?? base.license,
    publicationPolicy: raw.publicationPolicy ?? base.publicationPolicy,
    extensions: [...(raw.extensions ?? base.extensions)],
    defaults: { ...base.defaults, ...raw.defaults },
    generated: {
      ocid: { from: [...(raw.generated?.ocid?.from ?? base.generated.ocid.from)] },
      release_id: raw.generated?.release_id ?? base.generated.release_id,
      release_date: {
        prefer: [...(raw.generated?.release_date?.prefer ?? base.generated.release_date.prefer)],
      },
    },
    planning_triggers: [...(raw.planning_triggers ?? base.planning_triggers)],
    buyer: { ...base.buyer, ...raw.buyer },
  };
}

export function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function listToLines(items: string[] | undefined): string {
  return (items ?? []).join("\n");
}

/** Strip empty strings for YAML/JSON export. */
export function publicationConfigForExport(config: PublicationConfig): Record<string, unknown> {
  const out: Record<string, unknown> = { version: config.version };
  if (config.ocid_prefix) out.ocid_prefix = config.ocid_prefix;
  const pub = config.publisher;
  if (pub.name || pub.scheme || pub.uid || pub.uri) {
    out.publisher = {
      ...(pub.name ? { name: pub.name } : {}),
      ...(pub.scheme ? { scheme: pub.scheme } : {}),
      ...(pub.uid ? { uid: pub.uid } : {}),
      ...(pub.uri ? { uri: pub.uri } : {}),
    };
  }
  if (config.license) out.license = config.license;
  if (config.publicationPolicy) out.publicationPolicy = config.publicationPolicy;
  if (config.extensions.length) out.extensions = config.extensions;
  const defs = config.defaults;
  if (defs.currency || defs.classification_scheme || defs.language || defs.initiationType) {
    out.defaults = {
      ...(defs.currency ? { currency: defs.currency } : {}),
      ...(defs.classification_scheme ? { classification_scheme: defs.classification_scheme } : {}),
      ...(defs.language ? { language: defs.language } : {}),
      ...(defs.initiationType ? { initiationType: defs.initiationType } : {}),
    };
  }
  const gen = config.generated;
  const generated: Record<string, unknown> = {};
  if (gen.ocid.from.length) generated.ocid = { from: gen.ocid.from };
  if (gen.release_id) generated.release_id = gen.release_id;
  if (gen.release_date.prefer.length) {
    generated.release_date = { prefer: gen.release_date.prefer };
  }
  if (Object.keys(generated).length) out.generated = generated;
  if (config.planning_triggers.length) out.planning_triggers = config.planning_triggers;
  if (config.buyer.name || config.buyer.id) {
    out.buyer = {
      ...(config.buyer.name ? { name: config.buyer.name } : {}),
      ...(config.buyer.id ? { id: config.buyer.id } : {}),
    };
  }
  return out;
}
