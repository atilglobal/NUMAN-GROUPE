"use client";

import { useState } from "react";
import { savePlacementAction } from "@/admin/actions/placements";
import { mediaProfiles, resolutionWarning, type MediaProfileId } from "@/media/profiles";
import { ActionForm, FormStatus, SubmitButton } from "./forms";

export function FocalPicker({
  assetId,
  src,
  width,
  height,
  context,
  focalX = 0.5,
  focalY = 0.5,
}: {
  assetId: string;
  src: string;
  width: number | null;
  height: number | null;
  context: string;
  focalX?: number;
  focalY?: number;
}) {
  const [x, setX] = useState(focalX);
  const [y, setY] = useState(focalY);
  const [profile, setProfile] = useState<MediaProfileId>("projectCard");
  const warning = resolutionWarning(width, height, profile);
  const aspect = mediaProfiles[profile].aspect;

  return (
    <ActionForm action={savePlacementAction} className="grid gap-3">
      <FormStatus />
      <input type="hidden" name="assetId" value={assetId} />
      <input type="hidden" name="context" value={context} />
      <input type="hidden" name="focalX" value={x} />
      <input type="hidden" name="focalY" value={y} />
      <label className="text-sm">
        Önizleme oranı
        <select
          value={profile}
          onChange={(event) => setProfile(event.target.value as MediaProfileId)}
          className="ml-2 rounded border border-line px-2 py-1"
        >
          {Object.values(mediaProfiles).map((item) => (
            <option key={item.id} value={item.id}>
              {item.id}
            </option>
          ))}
        </select>
      </label>
      {warning ? <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-950">{warning}</p> : null}
      <button
        type="button"
        className="relative max-w-xl overflow-hidden bg-navy-900"
        style={{ aspectRatio: String(aspect) }}
        onClick={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          setX(Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)));
          setY(Math.min(1, Math.max(0, (event.clientY - box.top) / box.height)));
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" />
        <span
          className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gold-500"
          style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
        />
      </button>
      <p className="text-xs text-muted">Masaüstü {mediaProfiles.desktopHero.aspect.toFixed(2)} · mobil {mediaProfiles.mobileHero.aspect.toFixed(2)} · kart {mediaProfiles.projectCard.aspect.toFixed(2)}</p>
      <SubmitButton>Odak noktasını kaydet</SubmitButton>
    </ActionForm>
  );
}
