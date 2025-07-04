import type { Profession, Skill } from "./models";

export const PROFESSIONS: Profession[] = [
  { id: "forestry", name: "Forestry", resources: [] },
  { id: "carpentry", name: "Carpentry", resources: [] },
  { id: "mining", name: "Mining", resources: [] },
  { id: "smithing", name: "Smithing", resources: [] },
  { id: "masonry", name: "Masonry", resources: [] },
  { id: "foraging", name: "Foraging", resources: [] },
  { id: "farming", name: "Farming", resources: [] },
  { id: "tailoring", name: "Tailoring", resources: [] },
  { id: "fishing", name: "Fishing", resources: [] },
  { id: "hunting", name: "Hunting", resources: [] },
  { id: "leatherworking", name: "Leatherworking", resources: [] },
  { id: "scholar", name: "Scholar", resources: [] },
];

export const SKILLS: Skill[] = [
  { id: "cooking", name: "Cooking", description: "Crafting food items for travelers." },
  { id: "slayer", name: "Slayer", description: "Defeat NPCs for resource drops." },
  { id: "explorer", name: "Explorer", description: "Discover new areas and resources." },
  { id: "trader", name: "Trader", description: "Trade resources with NPCs or players." },
  { id: "builder", name: "Builder", description: "Construct buildings and structures." },
  { id: "gatherer", name: "Gatherer", description: "Collect various resources for travelers." },
];
