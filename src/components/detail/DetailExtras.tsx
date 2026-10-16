import type { DetailEntry } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { DemoBadge } from "@/components/ui/Badges";
import { MediaFrame } from "@/components/ui/MediaFrame";

type Props = { entry: DetailEntry; locale: Locale; dict: Dictionary };

function formatDate(locale: Locale, value: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
}

/** Facts, cover and gallery of a detail page. Fields that were not provided are not rendered. */
export function DetailExtras({ entry, locale, dict }: Props) {
  const { facts } = entry;
  const rows: { label: string; value: string }[] = [];

  if (facts.kind === "project") {
    if (facts.expertiseName) rows.push({ label: dict.detail.expertise, value: facts.expertiseName });
    rows.push({ label: dict.detail.status, value: dict.projects.status[facts.status] });
    if (facts.place) rows.push({ label: dict.detail.location, value: facts.place });
    if (facts.startedOn) rows.push({ label: dict.detail.started, value: formatDate(locale, facts.startedOn) });
    if (facts.completedOn) {
      rows.push({ label: dict.detail.completed, value: formatDate(locale, facts.completedOn) });
    }
    if (facts.progressPercent !== null && facts.progressPercent !== undefined) {
      rows.push({ label: dict.detail.progress, value: `${facts.progressPercent}\u00a0%` });
    }
  }
  if (facts.kind === "visit") {
    if (facts.visitedOn) rows.push({ label: dict.detail.date, value: formatDate(locale, facts.visitedOn) });
    if (facts.host) rows.push({ label: dict.detail.host, value: facts.host });
    if (facts.place) rows.push({ label: dict.detail.location, value: facts.place });
  }

  const technical = facts.kind === "project" ? facts.technicalDetails : [];
  const participants = facts.kind === "visit" ? facts.participants : [];
  const videoUrl = facts.kind === "project" ? facts.videoUrl : null;

  return (
    <>
      {entry.image ? (
        <figure className="mt-10">
          <MediaFrame
            image={entry.image}
            sizes="(min-width: 1024px) 768px, 100vw"
            className="aspect-[16/9]"
            preload
          >
            {entry.image.isDemo ? (
              <DemoBadge label={dict.demo.imageBadge} className="absolute right-3 top-3" />
            ) : null}
          </MediaFrame>
          {entry.image.caption ? (
            <figcaption className="mt-2 text-sm text-muted">{entry.image.caption}</figcaption>
          ) : null}
        </figure>
      ) : null}

      {rows.length > 0 ? (
        <section aria-labelledby="detail-facts" className="mt-10">
          <h2 id="detail-facts" className="font-serif text-2xl text-navy-950">
            {dict.detail.facts}
          </h2>
          <dl className="mt-4 grid gap-x-8 gap-y-3 border-t border-line pt-4 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{row.label}</dt>
                <dd className="mt-1 text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {participants.length > 0 ? (
        <section aria-labelledby="detail-participants" className="mt-10">
          <h2 id="detail-participants" className="font-serif text-2xl text-navy-950">
            {dict.detail.participants}
          </h2>
          <ul className="mt-4 space-y-2 border-t border-line pt-4">
            {participants.map((participant, index) => (
              <li key={`${participant.fullName}-${index}`} className="text-ink">
                <span className="font-medium">{participant.fullName}</span>
                {participant.roleTitle ? (
                  <span className="text-muted"> — {participant.roleTitle}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {technical.length > 0 ? (
        <section aria-labelledby="detail-technical" className="mt-10">
          <h2 id="detail-technical" className="font-serif text-2xl text-navy-950">
            {dict.detail.technical}
          </h2>
          <dl className="mt-4 grid gap-x-8 gap-y-3 border-t border-line pt-4 sm:grid-cols-2">
            {technical.map((detail, index) => (
              <div key={`${detail.label}-${index}`}>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {detail.label}
                </dt>
                <dd className="mt-1 text-ink">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {videoUrl ? (
        <p className="mt-10">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {dict.detail.video}
          </span>
          <br />
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-navy-900 underline decoration-gold-500 underline-offset-4 hover:text-gold-700"
          >
            {dict.detail.watchVideo}
          </a>
        </p>
      ) : null}

      {entry.gallery.length > 0 ? (
        <section aria-labelledby="detail-gallery" className="mt-10">
          <h2 id="detail-gallery" className="font-serif text-2xl text-navy-950">
            {dict.detail.gallery}
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {entry.gallery.map((image) => (
              <li key={image.src}>
                <figure>
                  <MediaFrame image={image} sizes="(min-width: 640px) 384px, 100vw" className="aspect-[4/3]">
                    {image.isDemo ? (
                      <DemoBadge label={dict.demo.imageBadge} className="absolute right-3 top-3" />
                    ) : null}
                  </MediaFrame>
                  {image.caption ? (
                    <figcaption className="mt-2 text-sm text-muted">{image.caption}</figcaption>
                  ) : null}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
