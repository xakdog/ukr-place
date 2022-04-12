import React, {useRef} from "react";
import {useRecoilValue} from "recoil";

import {useHeightCssVar} from "./useHeightCssVar";
import {useCanvasNav} from "./useCanvasNav";
import styles from './paint-canvas.module.css';

import LiveCanvas from "../live-canvas/live-canvas";
import {paletteColorState} from "../palette-bar/palette-bar";
import {canvasPosState} from "../../state/canvas-pos.atom";

const PlacedPixel: React.FC = () => {
  const color = useRecoilValue(paletteColorState);
  const pos = useRecoilValue(canvasPosState);
  const x = Math.floor(pos.vector.x);
  const y = Math.floor(pos.vector.y);

  const opacity = pos.outOfBounds ? 0 : 1;
  const transform = `translate(${x}px, ${y}px)`;

  return <div className={styles.pixel} style={{ opacity, transform, backgroundColor: color }} />;
};

const PixelCanvas: React.FC<{ onClick(): void; }> = ({ onClick }) => {
  const imgRef = useRef<HTMLElement>();

  useHeightCssVar();
  useCanvasNav({ container: imgRef, onClick });

  return (
    <div className={styles.container}>
      <div className={styles.content} ref={imgRef}>
        <PlacedPixel />
        <img className={styles.mapOverlay} src="/ukraine-outline.svg" />
        <LiveCanvas />
      </div>
    </div>
  )
}

export default PixelCanvas;
