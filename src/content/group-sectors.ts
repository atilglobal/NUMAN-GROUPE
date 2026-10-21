export const GROUP_SECTORS = [
  { key: "institutional", slugs: [] as string[] },
  { key: "health", slugs: ["hopitaux", "hospitals", "hastaneler"] },
  { key: "sports", slugs: ["stades", "stadiums", "stadyumlar", "villages-sportifs", "sports-villages", "spor-koyleri"] },
  { key: "roads", slugs: [] as string[] },
  { key: "ports", slugs: [] as string[] },
  { key: "defense", slugs: [] as string[] },
  { key: "urban", slugs: ["logements", "housing", "lojmanlar"] },
] as const;

export type GroupSectorKey = (typeof GROUP_SECTORS)[number]["key"];
