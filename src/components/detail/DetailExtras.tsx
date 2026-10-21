import type { DetailEntry } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { GalleryLightbox } from "@/components/detail/GalleryLightbox";
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
    rows.push({ label: dict.detail.status, value: dict.projects.status[facts.status] });
  }
  if (facts.kind === "visit") {
    if (facts.visitedOn) rows.push({ label: dict.detail.date, value: formatDate(locale, facts.visitedOn) });
    if (facts.host) rows.push({ label: dict.detail.host, value: facts.host });
    if (facts.place) rows.push({ label: dict.detail.location, value: facts.place });
  }

  const participants = facts.kind === "visit" ? facts.participants : [];

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

      {entry.gallery.length > 0 ? (
        <section aria-labelledby="detail-gallery" className="mt-10">
          <h2 id="detail-gallery" className="font-serif text-2xl text-navy-950">
            {dict.detail.gallery}
          </h2>
          <GalleryLightbox
            images={entry.gallery}
            labels={{
              gallery: dict.detail.gallery,
              open: dict.detail.galleryOpen,
              close: dict.detail.galleryClose,
              previous: dict.detail.galleryPrev,
              next: dict.detail.galleryNext,
              of: dict.detail.galleryOf,
              demo: dict.demo.imageBadge,
            }}
          />
        </section>
      ) : null}
    </>
  );
}
