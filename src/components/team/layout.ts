/** Shared team card geometry: never stretch a 1-person group to full width. */
export const TEAM_PAGE_MAX_WIDTH = "max-w-[1200px]";
export const TEAM_CARD_MAX = "max-w-[21.25rem]";

export const teamCardGridClass = [
  "grid w-full grid-cols-1 justify-items-center gap-6",
  "md:grid-cols-[repeat(2,minmax(0,21.25rem))] md:justify-items-stretch md:justify-start",
  "lg:grid-cols-[repeat(3,minmax(0,21.25rem))] lg:gap-7",
].join(" ");
