import {useEffect, useRef} from "react";

import {useHeightCssVar} from "./useHeightCssVar";
import {useCanvasNav} from "./useCanvasNav";
import styles from './paint-canvas.module.css'


const IMAGE_WIDTH = 1280;
const IMAGE_HEIGHT = 920;

export default function PixelCanvas() {
  const imgRef = useRef<HTMLElement>();
  const canvasRef = useRef<HTMLCanvasElement>();

  useHeightCssVar();
  useCanvasNav(imgRef);

  useEffect(() => {
    const el = canvasRef.current;

    if (!el)
      return;

    const ctx = el.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  }, [canvasRef.current]);

  return (
    <div className={styles.container}>
      <div className={styles.content} ref={imgRef}>
        <img className={styles.mapOverlay} src="/ukraine-outline.svg" draggable={false} />
        {/*<canvas className={styles.image} ref={canvasRef} id="canvas" height="920" width="1280" />*/}
        <img className={styles.image} src="/reddit-art.png" height="920" width="1280" alt="pixel canvas" />
      </div>
    </div>
  )
}
