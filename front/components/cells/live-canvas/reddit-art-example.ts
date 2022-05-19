import { Vector } from "vecti";
import { TileChange } from "../../../state/pixel-changes.atom";

export const loadExampleRedditArt = async () => {
  const changes = await serializeImageUri("/reddit-art.png");
  const randomId = (Math.random() + 1).toString(36).substring(7);

  if (!changes) return;

  return { changes, randomId };
};

function serializeImageUri(url: string): Promise<TileChange | null> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No canvas context");

  const baseImage = new Image();

  return new Promise((resolve) => {
    baseImage.src = url;
    baseImage.onload = function () {
      canvas.width = baseImage.width;
      canvas.height = baseImage.height;

      ctx.drawImage(baseImage, 0, 0);
      canvas.toBlob((data) => {
        const change: TileChange | null = data
          ? {
              data,
              pos: new Vector(0, 0),
              size: new Vector(canvas.height, canvas.width),
            }
          : null;
        resolve(change);
      });
      canvas.remove();
    };
  });
}
