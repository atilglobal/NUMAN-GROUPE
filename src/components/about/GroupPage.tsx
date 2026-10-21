import type { ReactNode } from "react";
import type { AboutSectionView, ExpertiseView, PageView, SiteChrome } from "@/content/types";
import type { GroupSectionKey } from "@/content/group-layout";
import { GROUP_SECTORS } from "@/content/group-sectors";
import { hasRichText, RichText } from "@/content/rich-text";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { detailPath, homePath, sectionPath } from "@/i18n/routes";
import { GroupSectionNav } from "@/components/about/GroupSectionNav";
import { PageCta } from "@/components/page/PageCta";
import { Prose } from "@/components/page/Prose";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/Badges";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Eyebrow } from "@/components/ui/SectionHeading";

const SNAPSHOT = [
  { label: "snapshotYearLabel", caption: "snapshotYear" },
  { label: "snapshotSeatLabel", caption: "snapshotSeat" },
  { label: "snapshotFocusLabel", caption: "snapshotFocus" },
  { label: "snapshotWorkLabel", caption: "snapshotWork" },
] as const;

const FINANCE_STEPS = ["need", "prep", "risk", "partners", "contract"] as const;
const METHOD_STEPS = ["qualify", "collect", "analyse", "define", "structure", "deliver", "close"] as const;
const PRINCIPLES = ["rigour", "transparency", "compliance", "responsibility", "cooperation", "continuity"] as const;

function block(sections: AboutSectionView[], key: string) {
  return sections.find((item) => item.key === key) ?? null;
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
    <>
      <GroupSectionNav items={nav} label={g.navLabel} />

      {show("hero") ? (
        <section id="groupe" className="scroll-mt-[calc(var(--header-height)+3.5rem)]">
          <Container className="grid gap-10 py-12 lg:grid-cols-12 lg:items-end lg:py-16">
            <div className="lg:col-span-7">
              <Eyebrow>{g.eyebrow}</Eyebrow>
              <h1 className="mt-4 text-balance font-serif text-[2.25rem] leading-[1.1] text-navy-950 sm:text-5xl lg:text-[3.25rem]">
                {g.officialName}
              </h1>
              <p className="mt-5 max-w-[40rem] text-lg leading-relaxed text-ink/85">{page?.summary ?? g.lead}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="#identite" variant="secondary">
                  {g.discover}
                </Button>
                <Button href={sectionPath(locale, "contact")} withArrow>
                  {g.contact}
                </Button>
              </div>
            </div>
            {image ? (
              <div className="lg:col-span-5">
                <MediaFrame
                  image={image}
                  profile="pageBanner"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  preload
                  className="aspect-[4/3]"
                >
                  {image.isDemo ? (
                    <DemoBadge label={dict.demo.imageBadge} className="absolute right-3 top-3" />
                  ) : null}
                </MediaFrame>
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      {show("snapshot") ? (
        <section id="apercu" className="scroll-mt-[calc(var(--header-height)+3.5rem)] border-y border-line bg-paper-2/50">
          <Container className="py-12 lg:py-14">
            <h2 className="font-serif text-3xl text-navy-950">{g.snapshotTitle}</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {SNAPSHOT.map((item) => (
                <li key={item.label} className="border-t border-gold-400 pt-4">
                  <p className="font-serif text-xl text-navy-950">{g[item.label]}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{g[item.caption]}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {show("identity") && identityText ? (
        <Section id="identite" title={g.identityTitle}>
          <Prose>
            <RichText source={page!.body} className="space-y-5" />
          </Prose>
        </Section>
      ) : null}

      {show("history") && history ? <Editorial id="histoire" block={history} /> : null}
      {show("mission") && mission ? <Editorial id="mission" block={mission} /> : null}
      {show("vision") && vision ? <Editorial id="vision" block={vision} /> : null}

      {show("sectors") ? (
        <section id="secteurs" className="scroll-mt-[calc(var(--header-height)+3.5rem)] border-t border-line">
          <Container className="py-14 lg:py-16">
            <h2 className="font-serif text-3xl text-navy-950">{g.sectorsTitle}</h2>
            <p className="mt-3 max-w-[42rem] text-base leading-relaxed text-muted">{g.sectorsLead}</p>
            <ol className="mt-10 grid gap-8">
              {GROUP_SECTORS.map((sector, index) => {
                const copy = g.sectors[sector.key];
                const links = expertises.filter((item) => (sector.slugs as readonly string[]).includes(item.slug));
                return (
                  <li key={sector.key} className="grid gap-3 border-t border-line pt-6 lg:grid-cols-12">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-700 lg:col-span-2">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <div className="lg:col-span-10">
                      <h3 className="font-serif text-2xl text-navy-950">{copy.title}</h3>
                      <p className="mt-2 max-w-[42rem] text-base leading-relaxed text-ink/85">{copy.body}</p>
                      {links.length > 0 ? (
                        <ul className="mt-4 flex flex-wrap gap-3">
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
                    </div>
                  </li>
                );
              })}
            </ol>
          </Container>
        </section>
      ) : null}

      {show("finance") ? (
        <section id="financement" className="scroll-mt-[calc(var(--header-height)+3.5rem)] bg-navy-950 text-paper">
          <Container className="py-14 lg:py-16">
            <h2 className="font-serif text-3xl">{finance?.title ?? g.financeTitle}</h2>
            {finance?.summary ? <p className="mt-3 max-w-[42rem] text-paper/85">{finance.summary}</p> : null}
            <ol className="mt-8 grid gap-5 md:grid-cols-2">
              {FINANCE_STEPS.map((key, index) => (
                <li key={key} className="border border-paper/20 p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-300">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-serif text-xl">{g.financeSteps[key].title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper/80">{g.financeSteps[key].body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 max-w-[46rem] border-l-2 border-gold-400 pl-5 text-base leading-relaxed text-paper">
              {hasRichText(finance?.body) ? (
                <RichText source={finance!.body} className="space-y-4 text-paper/90" />
              ) : (
                <p>{g.financeCaveat}</p>
              )}
            </div>
          </Container>
        </section>
      ) : null}

      {show("regions") && regions ? <Editorial id="regions" block={regions} /> : null}

      {show("method") ? (
        <section id="methode" className="scroll-mt-[calc(var(--header-height)+3.5rem)] border-t border-line">
          <Container className="py-14 lg:py-16">
            <h2 className="font-serif text-3xl text-navy-950">{method?.title ?? g.methodTitle}</h2>
            {method?.summary ? <p className="mt-3 max-w-[42rem] text-base text-muted">{method.summary}</p> : null}
            <ol className="mt-10 grid gap-5">
              {METHOD_STEPS.map((key, index) => (
                <li key={key} className="grid gap-2 border-t border-line pt-5 sm:grid-cols-[4rem_1fr] sm:gap-6">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-700">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <h3 className="font-serif text-xl text-navy-950">{g.methodSteps[key].title}</h3>
                    <p className="mt-2 max-w-[42rem] text-sm leading-relaxed text-ink/80">{g.methodSteps[key].body}</p>
                  </div>
                </li>
              ))}
            </ol>
            {hasRichText(method?.body) ? (
              <Prose className="mt-8">
                <RichText source={method!.body} className="space-y-4" />
              </Prose>
            ) : null}
          </Container>
        </section>
      ) : null}

      {show("principles") ? (
        <section id="principes" className="scroll-mt-[calc(var(--header-height)+3.5rem)] bg-paper-2/50">
          <Container className="py-14 lg:py-16">
            <h2 className="font-serif text-3xl text-navy-950">{principles?.title ?? g.principlesTitle}</h2>
            {principles?.summary ? <p className="mt-3 max-w-[42rem] text-muted">{principles.summary}</p> : null}
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {PRINCIPLES.map((key) => (
                <li key={key} className="border-t border-gold-400 pt-4">
                  <h3 className="font-serif text-xl text-navy-950">{g.principles[key].title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/85">{g.principles[key].body}</p>
                </li>
              ))}
            </ul>
            {hasRichText(principles?.body) ? (
              <Prose className="mt-8">
                <RichText source={principles!.body} className="space-y-4" />
              </Prose>
            ) : null}
          </Container>
        </section>
      ) : null}

      {show("organization") && organization ? (
        <Editorial id="organisation" block={organization}>
          {hasTeam ? (
            <div className="mt-6">
              <Button href={sectionPath(locale, "team")} variant="secondary">
                {g.teamLink}
              </Button>
            </div>
          ) : null}
        </Editorial>
      ) : null}

      {show("quality") && quality ? <Editorial id="qualite" block={quality} /> : null}
      {show("future") && future ? <Editorial id="avenir" block={future} /> : null}

      {show("closing") ? (
        <div id="contact-groupe" className="scroll-mt-[calc(var(--header-height)+3.5rem)]">
          <PageCta
            title={g.closingTitle}
            description={g.closingBody}
            href={sectionPath(locale, "contact")}
            label={g.contact}
          />
        </div>
      ) : null}

      <Container className="py-6">
        <p className="text-sm">
          <a href={homePath(locale)} className="underline underline-offset-4">
            {dict.placeholder.backHome}
          </a>
        </p>
      </Container>
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-[calc(var(--header-height)+3.5rem)]">
      <Container className="py-14 lg:py-16">
        <h2 className="font-serif text-3xl text-navy-950">{title}</h2>
        <div className="mt-6">{children}</div>
      </Container>
    </section>
  );
}

function Editorial({
  id,
  block,
  children,
}: {
  id: string;
  block: AboutSectionView;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[calc(var(--header-height)+3.5rem)] border-t border-line">
      <Container className="py-14 lg:py-16">
        <h2 className="font-serif text-3xl text-navy-950">{block.title}</h2>
        {block.summary ? <p className="mt-3 max-w-[42rem] text-lg leading-relaxed text-ink/85">{block.summary}</p> : null}
        {hasRichText(block.body) ? (
          <Prose className="mt-6">
            <RichText source={block.body} className="space-y-5" />
          </Prose>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
