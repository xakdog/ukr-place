import {atom} from "recoil";
import {Vector} from "vecti";

export const canvasPosState = atom({
  key: 'globalCanvasPos',
  default: {
    vector: new Vector(0, 0),
    outOfBounds: false,
  },
});
