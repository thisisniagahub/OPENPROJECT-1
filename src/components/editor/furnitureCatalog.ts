// Furniture Catalog - defines all furniture items for the editor
import type { FurnitureCatalogEntry, SpriteData } from './types';
import { FurnitureType } from './types';
import {
  DESK_SQUARE_SPRITE,
  BOOKSHELF_SPRITE,
  PLANT_SPRITE,
  COOLER_SPRITE,
  WHITEBOARD_SPRITE,
  CHAIR_SPRITE,
  PC_SPRITE,
  LAMP_SPRITE,
} from './spriteData';

export type FurnitureCategory =
  | 'desks'
  | 'chairs'
  | 'storage'
  | 'decor'
  | 'electronics'
  | 'wall'
  | 'misc';

export interface CatalogEntryWithCategory extends FurnitureCatalogEntry {
  category: FurnitureCategory;
}

export const FURNITURE_CATALOG: CatalogEntryWithCategory[] = [
  {
    type: FurnitureType.DESK,
    label: 'Desk',
    footprintW: 2,
    footprintH: 2,
    sprite: DESK_SQUARE_SPRITE,
    isDesk: true,
    category: 'desks',
  },
  {
    type: FurnitureType.BOOKSHELF,
    label: 'Bookshelf',
    footprintW: 1,
    footprintH: 2,
    sprite: BOOKSHELF_SPRITE,
    isDesk: false,
    category: 'storage',
  },
  {
    type: FurnitureType.PLANT,
    label: 'Plant',
    footprintW: 1,
    footprintH: 1,
    sprite: PLANT_SPRITE,
    isDesk: false,
    category: 'decor',
  },
  {
    type: FurnitureType.COOLER,
    label: 'Cooler',
    footprintW: 1,
    footprintH: 1,
    sprite: COOLER_SPRITE,
    isDesk: false,
    category: 'misc',
  },
  {
    type: FurnitureType.WHITEBOARD,
    label: 'Whiteboard',
    footprintW: 2,
    footprintH: 1,
    sprite: WHITEBOARD_SPRITE,
    isDesk: false,
    category: 'decor',
  },
  {
    type: FurnitureType.CHAIR,
    label: 'Chair',
    footprintW: 1,
    footprintH: 1,
    sprite: CHAIR_SPRITE,
    isDesk: false,
    category: 'chairs',
  },
  {
    type: FurnitureType.PC,
    label: 'PC',
    footprintW: 1,
    footprintH: 1,
    sprite: PC_SPRITE,
    isDesk: false,
    category: 'electronics',
    canPlaceOnSurfaces: true,
  },
  {
    type: FurnitureType.LAMP,
    label: 'Lamp',
    footprintW: 1,
    footprintH: 1,
    sprite: LAMP_SPRITE,
    isDesk: false,
    category: 'decor',
    canPlaceOnSurfaces: true,
  },
];

export const FURNITURE_CATEGORIES: Array<{ id: FurnitureCategory; label: string }> = [
  { id: 'desks', label: 'Desks' },
  { id: 'chairs', label: 'Chairs' },
  { id: 'storage', label: 'Storage' },
  { id: 'electronics', label: 'Tech' },
  { id: 'decor', label: 'Decor' },
  { id: 'wall', label: 'Wall' },
  { id: 'misc', label: 'Misc' },
];

export function getCatalogEntry(type: string): CatalogEntryWithCategory | undefined {
  return FURNITURE_CATALOG.find((e) => e.type === type);
}

export function getCatalogByCategory(category: FurnitureCategory): CatalogEntryWithCategory[] {
  return FURNITURE_CATALOG.filter((e) => e.category === category);
}

export function isRotatable(_type: string): boolean {
  // For now, none of the basic furniture is rotatable
  // This can be extended later with rotation groups
  return false;
}
