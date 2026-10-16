import { updateTag } from "next/cache";
import { tagsForEntity, type ContentEntity } from "./cache-tags";

/**
 * Expire every public cache entry a change can affect. Runs inside the panel's
 * Server Actions, so the editor's next request reads fresh data.
 */
export function refreshPublicContent(entity: ContentEntity): void {
  for (const tag of tagsForEntity(entity)) updateTag(tag);
}
