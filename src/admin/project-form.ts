import {
  fieldErrors,
  projectDraftTranslationSchema,
  projectRootSchema,
  summarizeFieldErrors,
} from "./validation";

export type ParsedProjectForm =
  | {
      ok: true;
      translation: ReturnType<typeof projectDraftTranslationSchema.parse>;
      root: ReturnType<typeof projectRootSchema.parse>;
    }
  | { ok: false; fieldErrors: Record<string, string>; message: string };

export function parseProjectTranslationForm(formData: FormData) {
  return projectDraftTranslationSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    summary: formData.get("summary") ?? "",
    body: formData.get("body") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
}

/** Same keys the browser posts: missing checkbox → get() is null. */
export function parseProjectRootForm(formData: FormData) {
  return projectRootSchema.safeParse({
    status: formData.get("status"),
    isFeatured: formData.get("isFeatured"),
    sortOrder: formData.get("sortOrder") || 0,
    coverAssetId: formData.get("coverAssetId") ?? "",
    gallery: formData
      .getAll("gallery")
      .map((value) => String(value))
      .filter(Boolean),
  });
}

/** Same keys the new-project / root forms post from the browser. */
export function parseProjectForm(formData: FormData): ParsedProjectForm {
  const translation = parseProjectTranslationForm(formData);
  const root = parseProjectRootForm(formData);

  if (!translation.success || !root.success) {
    const errors = {
      ...(translation.success ? {} : fieldErrors(translation.error)),
      ...(root.success ? {} : fieldErrors(root.error)),
    };
    return { ok: false, fieldErrors: errors, message: summarizeFieldErrors(errors) };
  }

  return { ok: true, translation: translation.data, root: root.data };
}

export function newProjectFormData(input: {
  title: string;
  status?: string;
  slug?: string;
  summary?: string;
  body?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder?: string;
  featured?: boolean;
  coverAssetId?: string;
  gallery?: string[];
}): FormData {
  const form = new FormData();
  form.set("title", input.title);
  form.set("slug", input.slug ?? "");
  form.set("summary", input.summary ?? "");
  form.set("body", input.body ?? "");
  form.set("seoTitle", input.seoTitle ?? "");
  form.set("seoDescription", input.seoDescription ?? "");
  form.set("status", input.status ?? "planned");
  form.set("sortOrder", input.sortOrder ?? "0");
  form.set("coverAssetId", input.coverAssetId ?? "");
  if (input.featured) form.set("isFeatured", "on");
  for (const id of input.gallery ?? []) form.append("gallery", id);
  return form;
}
