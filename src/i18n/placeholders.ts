const TOKEN = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
const ICU_PLURAL = /\{([a-zA-Z_][a-zA-Z0-9_]*),\s*plural,/g;

export function placeholderNames(template: string): string[] {
  const names = new Set<string>();
  for (const match of template.matchAll(TOKEN)) {
    const name = match[1];
    if (name) names.add(name);
  }
  for (const match of template.matchAll(ICU_PLURAL)) {
    const name = match[1];
    if (name) names.add(name);
  }
  return [...names].sort();
}

export function placeholdersMatch(defaultValue: string, candidate: string): boolean {
  const expected = placeholderNames(defaultValue);
  const actual = placeholderNames(candidate);
  if (expected.length !== actual.length) return false;
  return expected.every((name, index) => name === actual[index]);
}

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
  locale: string,
): string {
  const formatted = { ...vars };
  for (const [key, value] of Object.entries(formatted)) {
    if (typeof value === "number") {
      formatted[key] = new Intl.NumberFormat(locale).format(value);
    }
  }
  let text = template.replace(TOKEN, (_all, name: string) => {
    const value = formatted[name];
    return value === undefined ? _all : String(value);
  });
  text = text.replace(
    /\{(\w+),\s*plural,\s*((?:[a-z]+\s*\{[^}]*\}\s*)+)\}/g,
    (_all, name: string, body: string) => {
      const count = Number(vars[name] ?? 0);
      const category = new Intl.PluralRules(locale).select(Number.isFinite(count) ? count : 0);
      const clauses = [...body.matchAll(/([a-z]+)\s*\{([^}]*)\}/g)];
      const match =
        clauses.find((clause) => clause[1] === category) ?? clauses.find((clause) => clause[1] === "other");
      const inner = match?.[2] ?? "";
      return inner.replace(/#/g, String(formatted[name] ?? count));
    },
  );
  return text;
}

export function formatDate(locale: string, value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

export function formatNumber(locale: string, value: number): string {
  return new Intl.NumberFormat(locale).format(value);
}
