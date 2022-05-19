import { Vector } from "vecti";
import { PixelChange, TileChange, UniqueKey } from "./pixel-changes.atom";
import { hexPaletteMap, hexPaletteMapReverse } from "../data/canvas-colors";

export const TILE_SIZE = 16;
export const DEFAULT_COLOR = "#ffffff";

export type TileChangeReq = {
  tilePos: Vector;
  image: number[][];
};

const groupTileChanges = (
  syncing: Record<UniqueKey, PixelChange>
): TileChangeReq[] => {
  const groupedUpdates = Object.values(syncing)
    .map((change) => {
      const tilePos = new Vector(
        Math.floor(change.pos.x / 16),
        Math.floor(change.pos.y / 16)
      );
      const tilePosStr = `${tilePos.x}:${tilePos.y}`;

      return { tilePos, tilePosStr, ...change };
    })
    .reduce((grouped: Record<string, typeof change[]>, change) => {
      grouped[change.tilePosStr] = grouped[change.tilePosStr] || [];
      grouped[change.tilePosStr].push(change);

      return grouped;
    }, {});

  return Object.values(groupedUpdates).map((changes) => {
    const tilePos = changes[0].tilePos;
    const zeroPoint = tilePos.multiply(16);

    const row = [...Array(16)].map(() => 0);
    const image = [...Array(16)].map(() => [...row]);

    for (let change of changes) {
      const relativePos = change.pos.subtract(zeroPoint);

      image[relativePos.y][relativePos.x] = hexPaletteMap[change.color] || 0;
    }

    return { tilePos, image };
  });
};

const colorsArrayToImage = (colorsArray: number[][], tilePos: Vector) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No canvas context");

  canvas.height = TILE_SIZE;
  canvas.width = TILE_SIZE;

  const pos = tilePos.multiply(TILE_SIZE);
  const size = new Vector(TILE_SIZE, TILE_SIZE);

  return new Promise<TileChange | null>((resolve) => {
    const previewChanges = colorsArray.flatMap((row, y) =>
      row.map((colorId, x) => ({
        x,
        y,
        color: hexPaletteMapReverse[colorId] || DEFAULT_COLOR,
      }))
    );

    previewChanges.forEach((change) => {
      ctx.fillStyle = change.color;
      ctx.fillRect(change.x, change.y, 1, 1);
    });

    canvas.toBlob((data) => {
      const change = data ? ({ data, pos, size } as TileChange) : null;
      resolve(change);
    });
    canvas.remove();
  });
};

export const pixelChangesTransform = { groupTileChanges, colorsArrayToImage };
