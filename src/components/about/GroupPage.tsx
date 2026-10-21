import { ArchitecturalFrame, RegionAtlas, SectorMark } from "@/components/about/GroupMarks";
import { GroupSectionNav } from "@/components/about/GroupSectionNav";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/Badges";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { GroupSectionKey } from "@/content/group-layout";
import { GROUP_SECTORS } from "@/content/group-sectors";
import { regionColumns } from "@/content/group-regions";
import { hasRichText, parseRichText, renderInline } from "@/content/rich-text";
import type { AboutSectionView, ExpertiseView, PageView, SiteChrome } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { detailPath, sectionPath } from "@/i18n/routes";

const SNAPSHOT = [
  { label: "snapshotYearLabel", caption: "snapshotYear" },
  { label: "snapshotSeatLabel", caption: "snapshotSeat" },
  { label: "snapshotFocusLabel", caption: "snapshotFocus" },
  { label: "snapshotWorkLabel", caption: "snapshotWork" },
] as const;

const FINANCE_STEPS = ["need", "prep", "risk", "partners", "contract"] as const;
const METHOD_STEPS = ["qualify", "collect", "analyse", "define", "structure", "deliver", "close"] as const;
const PRINCIPLES = ["rigour", "transparency", "compliance", "responsibility", "cooperation", "continuity"] as const;
const ANCHOR = "scroll-mt-[calc(var(--header-height)+3.25rem)]";

function block(sections: AboutSectionView[], key: string) {
  return sections.find((item) => item.key === key) ?? null;
}

function indexLabel(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function GroupPage({
  locale,
  dict,
  page,
  sections,
  expertises,
  chrome,
  hasTeam,
}: {
  locale: Locale;
  dict: Dictionary;
  page: PageView | null;
  sections: AboutSectionView[];
  expertises: ExpertiseView[];
  chrome: SiteChrome;
  hasTeam: boolean;
}) {
  const g = dict.group;
  const visible = new Set(chrome.groupLayout.filter((item) => item.visible).map((item) => item.key));
  const show = (key: GroupSectionKey) => visible.has(key);
  const history = block(sections, "history");
  const mission = block(sections, "mission");
  const vision = block(sections, "vision");
  const finance = block(sections, "finance");
  const regions = block(sections, "regions");
  const method = block(sections, "approach");
  const principles = block(sections, "principles");
  const organization = block(sections, "organization");
  const quality = block(sections, "quality");
  const future = block(sections, "future");
  const identityText = hasRichText(page?.body);
  const image = chrome.homeVisuals.hero;
  const regionsSplit = regionColumns(regions?.body);

  const nav = chrome.groupLayout
    .filter((item) => item.visible)
    .flatMap((item) => {
      const map: Partial<Record<GroupSectionKey, { id: string; label: string; ready: boolean }>> = {
        hero: { id: "groupe", label: g.eyebrow, ready: true },
        snapshot: { id: "apercu", label: g.snapshotTitle, ready: true },
        identity: { id: "identite", label: g.identityTitle, ready: identityText },
        history: { id: "histoire", label: g.historyNav, ready: Boolean(history) },
        mission: { id: "mission", label: g.missionNav, ready: Boolean(mission) },
        vision: { id: "vision", label: g.visionNav, ready: Boolean(vision) },
        sectors: { id: "secteurs", label: g.sectorsTitle, ready: true },
        finance: { id: "financement", label: g.financeTitle, ready: true },
        regions: { id: "regions", label: regions?.title ?? g.snapshotFocus, ready: Boolean(regions) },
        method: { id: "methode", label: g.methodTitle, ready: true },
        principles: { id: "principes", label: g.principlesTitle, ready: true },
        organization: { id: "organisation", label: organization?.title ?? "", ready: Boolean(organization) },
        quality: { id: "qualite", label: quality?.title ?? "", ready: Boolean(quality) },
        future: { id: "avenir", label: future?.title ?? "", ready: Boolean(future) },
        closing: { id: "contact-groupe", label: dict.nav.contact, ready: true },
      };
      const entry = map[item.key];
      return entry?.ready && entry.label ? [{ id: entry.id, label: entry.label }] : [];
    });

  return (
    <div data-group-design="stage">
      <GroupSectionNav items={nav} label={g.navLabel} />

      {show("hero") ? (
        <section id="groupe" className={`group-hero-stage on-dark bg-navy-950 text-paper ${ANCHOR}`}>
          <Container className="grid items-center gap-10 py-14 lg:grid-cols-12 lg:gap-14 lg:py-20">
            <div className="lg:col-span-6">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-gold-300">{g.brandMark}</p>
              <h1 className="mt-5 text-balance font-serif text-[2.75rem] leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-[4.35rem]">
                {g.officialName}
              </h1>
              <p className="mt-6 max-w-[36rem] text-lg leading-relaxed text-paper/85">{page?.summary ?? g.lead}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button href={sectionPath(locale, "contact")} withArrow>
                  {g.contact}
                </Button>
                <Button href="#identite" variant="outline-light">
                  {g.discover}
                </Button>
              </div>
            </div>
            <div className="lg:col-span-6">
              {image ? (
                <div className="relative">
                  <MediaFrame
                    image={image}
                    profile="pageBanner"
                    sizes="(min-width: 1024px) 44vw, 100vw"
                    preload
                    className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]"
                  >
                    {image.isDemo ? (
                      <DemoBadge label={dict.demo.imageBadge} className="absolute right-3 top-3" />
                    ) : null}
                  </MediaFrame>
                  <p className="absolute bottom-4 left-4 border border-gold-400/70 bg-navy-950/80 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-gold-300">
                    {g.sinceYear}
                  </p>
                </div>
              ) : (
                <ArchitecturalFrame label={g.snapshotYearLabel} caption={g.sinceYear} />
              )}
            </div>
          </Container>
        </section>
      ) : null}

      {show("snapshot") ? (
        <section id="apercu" className={`on-dark border-t border-paper/10 bg-navy-900 text-paper ${ANCHOR}`}>
          <h2 className="sr-only">{g.snapshotTitle}</h2>
          <Container className="px-0 sm:px-8 lg:px-10">
            <ul className="grid sm:grid-cols-2 lg:grid-cols-4">
              {SNAPSHOT.map((item) => (
                <li
                  key={item.label}
                  className="border-t border-paper/10 px-5 py-8 first:border-t-0 sm:border-t-0 sm:border-l sm:border-paper/10 sm:first:border-l-0 sm:px-8"
                >
                  <p className="font-serif text-[1.85rem] leading-tight text-paper lg:text-[2.1rem]">{g[item.label]}</p>
                  <p className="mt-3 text-sm leading-relaxed text-paper/65">{g[item.caption]}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {show("identity") && identityText ? (
        <section id="identite" className={`bg-paper py-16 lg:py-24 ${ANCHOR}`}>
          <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold-700">01 — {g.eyebrow}</p>
              <h2 className="mt-4 font-serif text-4xl leading-[1.08] text-navy-950 lg:text-6xl">{g.identityTitle}</h2>
            </div>
            <div className="lg:col-span-7">
              <ToneBlocks source={page!.body} className="max-w-[42rem] text-[1.05rem] leading-8" />
            </div>
          </Container>
        </section>
      ) : null}

      {show("history") && history ? (
        <section id="histoire" className={`border-t border-line bg-paper-2/60 py-16 lg:py-24 ${ANCHOR}`}>
          <Container className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="font-serif text-[5.5rem] leading-none text-navy-950/12 lg:text-[7.5rem]">{g.snapshotYearLabel}</p>
              <h2 className="mt-4 font-serif text-4xl text-navy-950">{history.title}</h2>
            </div>
            <div className="lg:col-span-8">
              {history.summary ? (
                <p className="max-w-[40rem] text-xl leading-relaxed text-navy-950">{history.summary}</p>
              ) : null}
              <ToneBlocks source={history.body} className="mt-6 max-w-[42rem]" />
            </div>
          </Container>
        </section>
      ) : null}

      {show("mission") || show("vision") ? (
        <div className={show("mission") && mission && show("vision") && vision ? "grid lg:grid-cols-2" : "grid"}>
          {show("mission") && mission ? (
            <article id="mission" className={`on-dark bg-navy-950 px-5 py-16 text-paper sm:px-10 lg:px-14 lg:py-24 ${ANCHOR}`}>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold-300">02 — {g.missionNav}</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight lg:text-5xl">{mission.title}</h2>
              {mission.summary ? <p className="mt-5 max-w-[36rem] text-lg text-paper/85">{mission.summary}</p> : null}
              <ToneBlocks source={mission.body} tone="dark" className="mt-8 max-w-[40rem]" />
            </article>
          ) : null}
          {show("vision") && vision ? (
            <article id="vision" className={`bg-paper-2 px-5 py-16 sm:px-10 lg:px-14 lg:py-24 ${ANCHOR}`}>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold-700">03 — {g.visionNav}</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-navy-950 lg:text-5xl">{vision.title}</h2>
              {vision.summary ? <p className="mt-5 max-w-[36rem] text-lg text-ink/85">{vision.summary}</p> : null}
              <ToneBlocks source={vision.body} className="mt-8 max-w-[40rem]" />
            </article>
          ) : null}
        </div>
      ) : null}

      {show("sectors") ? (
        <section id="secteurs" className={`bg-paper py-16 lg:py-24 ${ANCHOR}`}>
          <Container>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold-700">04</p>
            <h2 className="mt-3 max-w-[20ch] font-serif text-4xl text-navy-950 lg:text-5xl">{g.sectorsTitle}</h2>
            <p className="mt-4 max-w-[42rem] text-base leading-relaxed text-muted">{g.sectorsLead}</p>
            <ol className="mt-12 grid gap-px bg-line md:grid-cols-2 xl:grid-cols-3">
              {GROUP_SECTORS.map((sector, index) => {
                const copy = g.sectors[sector.key];
                const links = expertises.filter((item) => (sector.slugs as readonly string[]).includes(item.slug));
                return (
                  <li key={sector.key} className="bg-paper p-6 transition-colors duration-200 hover:bg-paper-2/70 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-gold-700">
                        <SectorMark name={sector.key} />
                      </span>
                      <p className="font-mono text-xs uppercase tracking-[0.22em] text-gold-700">{indexLabel(index)}</p>
                    </div>
                    <h3 className="mt-6 font-serif text-2xl leading-tight text-navy-950">{copy.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink/80">{copy.body}</p>
                    {links.length > 0 ? (
                      <ul className="mt-5 flex flex-col gap-2">
                        {links.map((item) => (
                          <li key={item.id}>
                            <a
                              href={detailPath(locale, "expertises", item.slug)}
                              className="text-sm font-medium text-navy-950 underline underline-offset-4"
                            >
                              {g.sectorOpen} : {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </Container>
        </section>
      ) : null}

      {show("regions") && regions ? (
        <section id="regions" className={`on-dark relative overflow-hidden bg-navy-950 py-16 text-paper lg:py-24 ${ANCHOR}`}>
          <RegionAtlas />
          <Container className="relative">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold-300">05</p>
            <h2 className="mt-3 max-w-[18ch] font-serif text-4xl lg:text-5xl">{regions.title}</h2>
            {regions.summary ? <p className="mt-4 max-w-[40rem] text-lg text-paper/80">{regions.summary}</p> : null}
            {regionsSplit.length > 0 ? (
              <ul className="mt-12 grid gap-10 md:grid-cols-3">
                {regionsSplit.map((column) => (
                  <li key={column.title} className="border-t border-gold-400/50 pt-5">
                    <h3 className="font-serif text-3xl">{column.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-paper/80">{column.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <ToneBlocks source={regions.body} tone="dark" className="mt-8 max-w-[42rem]" />
            )}
          </Container>
        </section>
      ) : null}

      {show("method") ? (
        <section id="methode" className={`bg-paper py-16 lg:py-24 ${ANCHOR}`}>
          <Container>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold-700">06</p>
            <h2 className="mt-3 font-serif text-4xl text-navy-950 lg:text-5xl">{method?.title ?? g.methodTitle}</h2>
            {method?.summary ? <p className="mt-4 max-w-[42rem] text-muted">{method.summary}</p> : null}
            <ol className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2">
              {METHOD_STEPS.map((key, index) => (
                <li key={key} className="grid grid-cols-[4.5rem_1fr] gap-4 border-t border-line pt-6">
                  <p className="font-serif text-4xl leading-none text-navy-950/20">{indexLabel(index)}</p>
                  <div>
                    <h3 className="font-serif text-2xl text-navy-950">{g.methodSteps[key].title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/80">{g.methodSteps[key].body}</p>
                  </div>
                </li>
              ))}
            </ol>
            {hasRichText(method?.body) ? <ToneBlocks source={method!.body} className="mt-10 max-w-[42rem]" /> : null}
          </Container>
        </section>
      ) : null}

      {show("finance") ? (
        <section id="financement" className={`border-t border-line bg-paper-2/50 py-16 lg:py-24 ${ANCHOR}`}>
          <Container className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold-700">07</p>
              <h2 className="mt-3 font-serif text-4xl text-navy-950 lg:text-5xl">{finance?.title ?? g.financeTitle}</h2>
              {finance?.summary ? <p className="mt-5 text-lg leading-relaxed text-ink/85">{finance.summary}</p> : null}
              <aside className="mt-8 border-l-2 border-gold-500 bg-navy-950 px-5 py-6 text-paper">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-gold-300">{g.financeNoteLabel}</p>
                <div className="mt-3 text-sm leading-7 text-paper/90">
                  {hasRichText(finance?.body) ? <ToneBlocks source={finance!.body} tone="dark" /> : <p>{g.financeCaveat}</p>}
                </div>
              </aside>
            </div>
            <ol className="grid gap-6 lg:col-span-7">
              {FINANCE_STEPS.map((key, index) => (
                <li key={key} className="grid grid-cols-[3rem_1fr] gap-4">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-700">{indexLabel(index)}</p>
                  <div className="border-t border-line pt-1">
                    <h3 className="font-serif text-xl text-navy-950">{g.financeSteps[key].title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/80">{g.financeSteps[key].body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      ) : null}

      {show("principles") ? (
        <section id="principes" className={`bg-paper py-16 lg:py-24 ${ANCHOR}`}>
          <Container>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold-700">08</p>
            <h2 className="mt-3 font-serif text-4xl text-navy-950 lg:text-5xl">{principles?.title ?? g.principlesTitle}</h2>
            {principles?.summary ? <p className="mt-4 max-w-[42rem] text-muted">{principles.summary}</p> : null}
            <ul className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {PRINCIPLES.map((key) => (
                <li key={key} className="border-t-2 border-gold-400 pt-5">
                  <h3 className="font-serif text-2xl text-navy-950">{g.principles[key].title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/80">{g.principles[key].body}</p>
                </li>
              ))}
            </ul>
            {hasRichText(principles?.body) ? <ToneBlocks source={principles!.body} className="mt-10 max-w-[42rem]" /> : null}
          </Container>
        </section>
      ) : null}

      {show("organization") && organization ? (
        <section id="organisation" className={`border-t border-line bg-paper-2/50 py-16 lg:py-20 ${ANCHOR}`}>
          <Container className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold-700">09</p>
              <h2 className="mt-3 font-serif text-4xl text-navy-950">{organization.title}</h2>
              {hasTeam ? (
                <div className="mt-8">
                  <Button href={sectionPath(locale, "team")} variant="secondary">
                    {g.teamLink}
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              {organization.summary ? <p className="text-xl leading-relaxed text-navy-950">{organization.summary}</p> : null}
              <ToneBlocks source={organization.body} className="mt-6 max-w-[42rem]" />
            </div>
          </Container>
        </section>
      ) : null}

      {show("quality") && quality ? (
        <QuietBlock id="qualite" title={quality.title} summary={quality.summary} body={quality.body} />
      ) : null}
      {show("future") && future ? (
        <QuietBlock id="avenir" title={future.title} summary={future.summary} body={future.body} />
      ) : null}

      {show("closing") ? (
        <section id="contact-groupe" className={`on-dark bg-navy-950 py-20 text-paper lg:py-28 ${ANCHOR}`}>
          <Container className="max-w-4xl">
            <h2 className="font-serif text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">{g.closingTitle}</h2>
            <p className="mt-6 max-w-[40rem] text-lg leading-relaxed text-paper/80">{g.closingBody}</p>
            <div className="mt-10">
              <Button href={sectionPath(locale, "contact")} withArrow>
                {g.contact}
              </Button>
            </div>
          </Container>
        </section>
      ) : null}
    </div>
  );
}

function QuietBlock({
  id,
  title,
  summary,
  body,
}: {
  id: string;
  title: string;
  summary?: string | null;
  body?: string | null;
}) {
  return (
    <section id={id} className={`border-t border-line bg-paper py-16 ${ANCHOR}`}>
      <Container className="grid gap-6 lg:grid-cols-12">
        <h2 className="font-serif text-3xl text-navy-950 lg:col-span-4">{title}</h2>
        <div className="lg:col-span-7 lg:col-start-6">
          {summary ? <p className="text-lg text-navy-950">{summary}</p> : null}
          <ToneBlocks source={body} className="mt-5 max-w-[42rem]" />
        </div>
      </Container>
    </section>
  );
}

function ToneBlocks({
  source,
  tone = "light",
  className,
}: {
  source: string | null | undefined;
  tone?: "light" | "dark";
  className?: string;
}) {
  const blocks = parseRichText(source);
  if (blocks.length === 0) return null;
  const body = tone === "dark" ? "text-paper/85" : "text-ink/85";
  const heading = tone === "dark" ? "text-paper" : "text-navy-950";
  return (
    <div className={`space-y-5 leading-relaxed ${body} ${className ?? ""}`}>
      {blocks.map((item, index) => {
        if (item.type === "heading") {
          return (
            <h3 key={index} className={`pt-2 font-serif text-2xl ${heading}`}>
              {renderInline(item.text, `h${index}`)}
            </h3>
          );
        }
        if (item.type === "list") {
          const Tag = item.ordered ? "ol" : "ul";
          return (
            <Tag key={index} className={`${item.ordered ? "list-decimal" : "list-disc"} space-y-2 pl-5`}>
              {item.items.map((entry, itemIndex) => (
                <li key={itemIndex}>{renderInline(entry, `l${index}-${itemIndex}`)}</li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={index} className="whitespace-pre-line">
            {renderInline(item.text, `p${index}`)}
          </p>
        );
      })}
    </div>
  );
}
