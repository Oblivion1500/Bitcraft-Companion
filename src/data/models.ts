// Data models for Bitcraft Companion App

export interface Resource {
  id: string;
  name: string;
  description?: string;
  obtainedBy?: string[]; // Professions or skills that can obtain this resource
}

export interface Profession {
  id: string;
  name: string;
  resources: string[]; // Resource IDs
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  requirements?: string[]; // Resource or action IDs
}

export interface Recipe {
  id: string;
  name: string;
  profession: string; // Profession ID
  ingredients: { resourceId: string; quantity: number }[];
  output: { resourceId: string; quantity: number };
}
