import {Vector} from "vecti";
import {PixelChange, TileChange, UniqueKey} from "../../state/pixel-changes.atom";

type SyncerCallbacks = {
  onUpdate: (changes: TileChange, key: UniqueKey) => void;

  onPaintRequest: () => void;
  onPaintError: () => void;
  onPaintSuccess: (lockPeriod: number) => void;
}

export interface AbstractCanvasSyncer {
  run(): void;
  stop(): void;

  setCallbacks(config: SyncerCallbacks): void;

  paintPixels(changes: Record<UniqueKey, PixelChange>): void;
}

export class FakeSyncer implements AbstractCanvasSyncer {
  private onUpdate = (_changes: TileChange, _key: UniqueKey) => {};
  private onPaintRequest = () => {};
  private onPaintSuccess = (_lockPeriod: number) => {};

  public setCallbacks(config: SyncerCallbacks) {
    this.onUpdate = config.onUpdate;
    this.onPaintRequest = config.onPaintRequest;
    this.onPaintSuccess = config.onPaintSuccess;
  }

  public run() {
    serializeImageUri("/reddit-art.png")
      .then(changes => {
        if (!changes) return;

        const randomId = (Math.random() + 1).toString(36).substring(7);

        this.onUpdate(changes, randomId);
      });
  }

  public stop() {}

  public paintPixels() {
    this.onPaintRequest();
    setTimeout(() => this.onPaintSuccess(60 * 1000), 4000);
  }
}

function serializeImageUri(url: string): Promise<TileChange | null> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const baseImage = new Image();

  return new Promise(resolve => {
    baseImage.src = url;
    baseImage.onload = function() {
      canvas.width = baseImage.width;
      canvas.height = baseImage.height;

      ctx.drawImage(baseImage, 0, 0);
      canvas.toBlob(data => {
        const change: TileChange | null = data ? {
          data,
          pos: new Vector(0, 0),
          size: new Vector(canvas.height, canvas.width),
        } : null;
        resolve(change);
      });
      canvas.remove();
    }
  });
}
