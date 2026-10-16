import type { Dictionary } from "./dictionaries";
import type { Section } from "./routes";

const sectionNavKey: Record<Section, keyof Dictionary["nav"]> = {
  about: "group",
  expertises: "expertises",
  projects: "projects",
  visits: "visits",
  team: "team",
  contact: "contact",
  privacy: "privacy",
  legal: "legal",
  cookies: "cookies",
};

export function sectionLabel(section: Section, dict: Dictionary): string {
  return dict.nav[sectionNavKey[section]];
}
