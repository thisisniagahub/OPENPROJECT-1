// Layout Serializer - handles office layout data
import type {
  FloorColor,
  FurnitureInstance,
  OfficeLayout,
  PlacedFurniture,
  TileType,
} from './types';
import {
  DEFAULT_COLS,
  DEFAULT_ROWS,
  Direction,
  FurnitureType,
  TILE_SIZE,
  TileType as TileTypeEnum,
} from './types';
import { getCatalogEntry } from './furnitureCatalog';

/** Convert flat tile array from layout into 2D grid */
export function layoutToTileMap(layout: OfficeLayout): TileType[][] {
  const map: TileType[][] = [];
  for (let r = 0; r < layout.rows; r++) {
    const row: TileType[] = [];
    for (let c = 0; c < layout.cols; c++) {
      row.push(layout.tiles[r * layout.cols + c]);
    }
    map.push(row);
  }
  return map;
}

/** Convert placed furniture into renderable FurnitureInstance[] */
export function layoutToFurnitureInstances(furniture: PlacedFurniture[]): FurnitureInstance[] {
  const instances: FurnitureInstance[] = [];
  for (const item of furniture) {
    const entry = getCatalogEntry(item.type);
    if (!entry) continue;
    const x = item.col * TILE_SIZE;
    const y = item.row * TILE_SIZE;
    const spriteH = entry.sprite.length;
    const zY = y + spriteH;
    instances.push({ sprite: entry.sprite, x, y, zY });
  }
  return instances;
}

/** Get all tiles blocked by furniture footprints */
export function getBlockedTiles(furniture: PlacedFurniture[]): Set<string> {
  const tiles = new Set<string>();
  for (const item of furniture) {
    const entry = getCatalogEntry(item.type);
    if (!entry) continue;
    for (let dr = 0; dr < entry.footprintH; dr++) {
      for (let dc = 0; dc < entry.footprintW; dc++) {
        tiles.add(`${item.col + dc},${item.row + dr}`);
      }
    }
  }
  return tiles;
}

/** Default floor colors for the two rooms */
const DEFAULT_LEFT_ROOM_COLOR: FloorColor = { h: 35, s: 30, b: 15, c: 0 }; // warm beige
const DEFAULT_RIGHT_ROOM_COLOR: FloorColor = { h: 25, s: 45, b: 5, c: 10 }; // warm brown
const DEFAULT_CARPET_COLOR: FloorColor = { h: 280, s: 40, b: -5, c: 0 }; // purple
const DEFAULT_DOORWAY_COLOR: FloorColor = { h: 35, s: 25, b: 10, c: 0 }; // tan

/** Create the default office layout */
export function createDefaultLayout(): OfficeLayout {
  const W = TileTypeEnum.WALL;
  const F1 = TileTypeEnum.FLOOR_1;
  const F2 = TileTypeEnum.FLOOR_2;
  const F3 = TileTypeEnum.FLOOR_3;
  const F4 = TileTypeEnum.FLOOR_4;

  const tiles: TileType[] = [];
  const tileColors: Array<FloorColor | null> = [];

  for (let r = 0; r < DEFAULT_ROWS; r++) {
    for (let c = 0; c < DEFAULT_COLS; c++) {
      if (r === 0 || r === DEFAULT_ROWS - 1) {
        tiles.push(W);
        tileColors.push(null);
        continue;
      }
      if (c === 0 || c === DEFAULT_COLS - 1) {
        tiles.push(W);
        tileColors.push(null);
        continue;
      }
      if (c === 10) {
        if (r >= 4 && r <= 6) {
          tiles.push(F4);
          tileColors.push(DEFAULT_DOORWAY_COLOR);
        } else {
          tiles.push(W);
          tileColors.push(null);
        }
        continue;
      }
      if (c >= 15 && c <= 18 && r >= 7 && r <= 9) {
        tiles.push(F3);
        tileColors.push(DEFAULT_CARPET_COLOR);
        continue;
      }
      if (c < 10) {
        tiles.push(F1);
        tileColors.push(DEFAULT_LEFT_ROOM_COLOR);
      } else {
        tiles.push(F2);
        tileColors.push(DEFAULT_RIGHT_ROOM_COLOR);
      }
    }
  }

  const furniture: PlacedFurniture[] = [
    { uid: 'desk-left', type: FurnitureType.DESK, col: 4, row: 3 },
    { uid: 'desk-right', type: FurnitureType.DESK, col: 13, row: 3 },
    { uid: 'bookshelf-1', type: FurnitureType.BOOKSHELF, col: 1, row: 5 },
    { uid: 'plant-left', type: FurnitureType.PLANT, col: 1, row: 1 },
    { uid: 'cooler-1', type: FurnitureType.COOLER, col: 17, row: 7 },
    { uid: 'plant-right', type: FurnitureType.PLANT, col: 18, row: 1 },
    { uid: 'whiteboard-1', type: FurnitureType.WHITEBOARD, col: 15, row: 0 },
    // Left desk chairs
    { uid: 'chair-l-top', type: FurnitureType.CHAIR, col: 4, row: 2 },
    { uid: 'chair-l-bottom', type: FurnitureType.CHAIR, col: 5, row: 5 },
    { uid: 'chair-l-left', type: FurnitureType.CHAIR, col: 3, row: 4 },
    { uid: 'chair-l-right', type: FurnitureType.CHAIR, col: 6, row: 3 },
    // Right desk chairs
    { uid: 'chair-r-top', type: FurnitureType.CHAIR, col: 13, row: 2 },
    { uid: 'chair-r-bottom', type: FurnitureType.CHAIR, col: 14, row: 5 },
    { uid: 'chair-r-left', type: FurnitureType.CHAIR, col: 12, row: 4 },
    { uid: 'chair-r-right', type: FurnitureType.CHAIR, col: 15, row: 3 },
  ];

  return { version: 1, cols: DEFAULT_COLS, rows: DEFAULT_ROWS, tiles, tileColors, furniture };
}

/** Serialize layout to JSON string */
export function serializeLayout(layout: OfficeLayout): string {
  return JSON.stringify(layout);
}

/** Deserialize layout from JSON string */
export function deserializeLayout(json: string): OfficeLayout | null {
  try {
    const obj = JSON.parse(json);
    if (obj && obj.version === 1 && Array.isArray(obj.tiles) && Array.isArray(obj.furniture)) {
      return obj as OfficeLayout;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

/** Check if furniture can be placed at (col, row) without overlapping */
export function canPlaceFurniture(
  layout: OfficeLayout,
  type: string,
  col: number,
  row: number,
  excludeUid?: string
): boolean {
  const entry = getCatalogEntry(type);
  if (!entry) return false;

  // Check bounds
  if (
    col < 0 ||
    row < 0 ||
    col + entry.footprintW > layout.cols ||
    row + entry.footprintH > layout.rows
  ) {
    return false;
  }

  // Check for VOID tiles
  for (let dr = 0; dr < entry.footprintH; dr++) {
    for (let dc = 0; dc < entry.footprintW; dc++) {
      const idx = (row + dr) * layout.cols + (col + dc);
      const tileVal = layout.tiles[idx];
      if (tileVal === TileTypeEnum.VOID || tileVal === TileTypeEnum.WALL) {
        return false;
      }
    }
  }

  // Build occupied set excluding the item being moved
  const occupied = getPlacementBlockedTiles(layout.furniture, excludeUid);

  // Check overlap
  for (let dr = 0; dr < entry.footprintH; dr++) {
    for (let dc = 0; dc < entry.footprintW; dc++) {
      if (occupied.has(`${col + dc},${row + dr}`)) return false;
    }
  }

  return true;
}

/** Get tiles blocked for placement purposes */
export function getPlacementBlockedTiles(
  furniture: PlacedFurniture[],
  excludeUid?: string
): Set<string> {
  const tiles = new Set<string>();
  for (const item of furniture) {
    if (item.uid === excludeUid) continue;
    const entry = getCatalogEntry(item.type);
    if (!entry) continue;
    for (let dr = 0; dr < entry.footprintH; dr++) {
      for (let dc = 0; dc < entry.footprintW; dc++) {
        tiles.add(`${item.col + dc},${item.row + dr}`);
      }
    }
  }
  return tiles;
}

/** Paint a single tile with pattern and color. Returns new layout (immutable). */
export function paintTile(
  layout: OfficeLayout,
  col: number,
  row: number,
  tileType: TileType,
  color?: FloorColor
): OfficeLayout {
  const idx = row * layout.cols + col;
  if (idx < 0 || idx >= layout.tiles.length) return layout;

  const existingColors = layout.tileColors || new Array(layout.tiles.length).fill(null);
  const newColor =
    color ??
    (tileType === TileTypeEnum.WALL || tileType === TileTypeEnum.VOID
      ? null
      : { h: 0, s: 0, b: 0, c: 0 });

  // Check if anything actually changed
  if (layout.tiles[idx] === tileType) {
    const existingColor = existingColors[idx];
    if (newColor === null && existingColor === null) return layout;
    if (
      newColor &&
      existingColor &&
      newColor.h === existingColor.h &&
      newColor.s === existingColor.s &&
      newColor.b === existingColor.b &&
      newColor.c === existingColor.c &&
      !!newColor.colorize === !!existingColor.colorize
    ) {
      return layout;
    }
  }

  const tiles = [...layout.tiles];
  tiles[idx] = tileType;
  const tileColors = [...existingColors];
  tileColors[idx] = newColor;
  return { ...layout, tiles, tileColors };
}

/** Place furniture. Returns new layout (immutable). */
export function placeFurniture(layout: OfficeLayout, item: PlacedFurniture): OfficeLayout {
  if (!canPlaceFurniture(layout, item.type, item.col, item.row)) return layout;
  return { ...layout, furniture: [...layout.furniture, item] };
}

/** Remove furniture by uid. Returns new layout (immutable). */
export function removeFurniture(layout: OfficeLayout, uid: string): OfficeLayout {
  const filtered = layout.furniture.filter((f) => f.uid !== uid);
  if (filtered.length === layout.furniture.length) return layout;
  return { ...layout, furniture: filtered };
}

/** Move furniture to new position. Returns new layout (immutable). */
export function moveFurniture(
  layout: OfficeLayout,
  uid: string,
  newCol: number,
  newRow: number
): OfficeLayout {
  const item = layout.furniture.find((f) => f.uid === uid);
  if (!item) return layout;
  if (!canPlaceFurniture(layout, item.type, newCol, newRow, uid)) return layout;
  return {
    ...layout,
    furniture: layout.furniture.map((f) =>
      f.uid === uid ? { ...f, col: newCol, row: newRow } : f
    ),
  };
}
