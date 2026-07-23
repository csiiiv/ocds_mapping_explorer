/** External resources and attribution copy for the About view. */

export interface ResourceLink {
  label: string;
  href: string;
  description?: string;
}

export interface ResourceSection {
  id: string;
  title: string;
  body?: string;
  links: ResourceLink[];
}

export const ABOUT_SECTIONS: ResourceSection[] = [
  {
    id: "standards",
    title: "OCDS standards & mapping guidance",
    body: "This tool follows the Open Contracting Partnership field-level mapping template for OCDS 1.1.",
    links: [
      {
        label: "OCP OCDS 1.1 mapping template guidance",
        href: "https://www.open-contracting.org/resources/ocds-1-1-mapping-template-guidance/",
        description: "Official workbook structure, yellow-cell conventions, and handoff practices.",
      },
      {
        label: "OCDS 1.1.5 documentation",
        href: "https://standard.open-contracting.org/1.1/en/",
        description: "Release schema, codelists, and field definitions used by the bundled reference tree.",
      },
      {
        label: "Open Contracting Partnership",
        href: "https://www.open-contracting.org/",
        description: "Maintains the OCDS standard and publisher tooling.",
      },
      {
        label: "OCDS extensions registry",
        href: "https://extensions.open-contracting.org/",
        description: "Extension URLs and documentation referenced in mapping and publication config.",
      },
    ],
  },
  {
    id: "cardinal",
    title: "Risk indicators (Cardinal & OCP red flags)",
    body: "Cardinal red-flag indicators ship as portable JSON packs. The OCP Red Flags guide and optional Philippines packs add further methodology-aligned checks. The app shows mapping readiness; analysis runs in a separate pipeline.",
    links: [
      {
        label: "Red flags in public procurement (OCP 2024)",
        href: "https://www.open-contracting.org/wp-content/uploads/2024/12/OCP2024-RedFlagProcurement-1.pdf",
        description:
          "OCP guide to detecting procurement risks with data — indicator definitions, formulas, and OCDS field mappings (PDF).",
      },
      {
        label: "Cardinal documentation",
        href: "https://cardinal.readthedocs.io/en/latest/cli/indicators/",
        description: "Coverage, prepare, and indicator CLI workflow.",
      },
      {
        label: "Cardinal indicators reference",
        href: "https://cardinal.readthedocs.io/en/latest/reference/indicators/",
        description: "Indicator IDs (e.g. R003, R018) and required OCDS paths.",
      },
    ],
  },
];

export const SOFTWARE_ATTRIBUTIONS: ResourceLink[] = [
  {
    label: "React",
    href: "https://react.dev/",
  },
  {
    label: "Vite",
    href: "https://vite.dev/",
  },
  {
    label: "TypeScript",
    href: "https://www.typescriptlang.org/",
  },
];
