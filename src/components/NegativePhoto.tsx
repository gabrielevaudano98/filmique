import React, { useRef, useEffect } from 'react';

interface NegativePhotoProps {
  src: string;
  className?: string;
  stripWidth?: number;
  stripHeight?: number;
}

const NegativePhoto: React.FC<NegativePhotoProps> = ({ src, className, stripWidth = 2200, stripHeight = 620 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const clamp = (v: number) => Math.max(0, Math.min(255, v));

  const invertSCurveGamma = (data: Uint8ClampedArray, k = 0.16, gamma = 0.95) => {
    const K = k / 255;
    const g = gamma;
    for (let i = 0; i < data.length; i += 4) {
      let r = 255 - data[i];
      let gch = 255 - data[i + 1];
      let b = 255 - data[i + 2];
      r = r + (r - (r * r) / 255) * K;
      gch = gch + (gch - (gch * gch) / 255) * K;
      b = b + (b - (b * b) / 255) * K;
      r = Math.pow(r / 255, g) * 255;
      gch = Math.pow(gch / 255, g) * 255;
      b = Math.pow(b / 255, g) * 255;
      data[i] = clamp(r);
      data[i + 1] = clamp(gch);
      data[i + 2] = clamp(b);
    }
  };

  const multiplyOrange = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(255,122,46,0.58)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  };

  const drawGrain = (ctx: CanvasRenderingContext2D, w: number, h: number, alpha = 0.22, strength = 28) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const cx = c.getContext('2d', { willReadFrequently: true })!;
    const id = cx.createImageData(w, h);
    const data = id.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = 127 + (Math.random() * 2 - 1) * strength;
      data[i] = data[i + 1] = data[i + 2] = n;
      data[i + 3] = Math.round(alpha * 255);
    }
    cx.putImageData(id, 0, 0);
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.drawImage(c, 0, 0);
    ctx.restore();
  };

  const drawVignette = (ctx: CanvasRenderingContext2D, w: number, h: number, strength = 0.18) => {
    const rInner = Math.min(w, h) * 0.35;
    const rOuter = Math.max(w, h) * 0.85;
    const grd = ctx.createRadialGradient(w / 2, h / 2, rInner, w / 2, h / 2, rOuter);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, `rgba(0,0,0,${strength})`);
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  };

  const roundRect = (ctx: CanvasRenderingContext2D, x:number, y:number, w:number, h:number, r:number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const drawSprockets = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    const holeH = Math.round(H * 0.14);
    const holeW = Math.round(H * 0.06);
    const topY = Math.round(H * 0.045);
    const botY = H - topY - holeH;
    const pitch = Math.round(W * 0.041) || 90;
    const startX = Math.round(W * 0.028);
    const radius = Math.min(holeW, holeH) * 0.18;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    for (let x = startX; x < W - holeW; x += pitch) {
      roundRect(ctx, x, topY, holeW, holeH, radius);
      ctx.fill();
      roundRect(ctx, x, botY, holeW, holeH, radius);
      ctx.fill();
    }
    ctx.beginPath();
    const cx = Math.round(W * 0.48), r = Math.round(H * 0.042);
    ctx.arc(cx, 0, r, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawMarks = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.save();
    ctx.fillStyle = 'rgba(20,8,0,0.65)';
    ctx.font = `${Math.round(H * 0.016)}px monospace`;
    const labels = ['34','35','36'];
    let lx = Math.round(W * 0.064);
    for (let i = 0; i < labels.length; i++) {
      ctx.fillText(labels[i], lx, Math.round(H * 0.035));
      ctx.fillText(labels[i], lx, H - Math.round(H * 0.016));
      lx += Math.round(W * 0.272);
    }
    for (let x = Math.round(W * 0.055); x < W; x += Math.round(W * 0.0205)) {
      ctx.fillRect(x, H - Math.round(H * 0.01), 1, Math.round(H * 0.0065));
    }
    ctx.restore();
  };

  useEffect(() => {
    let mounted = true;
    const W = stripWidth, H = stripHeight;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      if (!mounted) return;

      // Base orange fill
      ctx.fillStyle = '#E37330';
      ctx.fillRect(0, 0, W, H);
      const gradTop = ctx.createLinearGradient(0, 0, 0, H);
      gradTop.addColorStop(0, 'rgba(255,150,70, 0.08)');
      gradTop.addColorStop(1, 'rgba(120,50,15, 0.10)');
      ctx.fillStyle = gradTop;
      ctx.fillRect(0, 0, W, H);

      drawSprockets(ctx, W, H);

      // prepare image in offscreen
      const frameX = W * (90/2200);
      const frameY = H * (97/620);
      const frameW = W * (960/2200);
      const frameH = H * (426/620);
      const ratio = 3/2;

      const cropCanvas = document.createElement('canvas');
      const cctx = cropCanvas.getContext('2d')!;
      // compute crop from original to 3:2
      let sw = img.naturalWidth;
      let sh = img.naturalHeight;
      const sourceRatio = sw / sh;
      if (sourceRatio > ratio) {
        // crop width
        const newW = sh * ratio;
        const sx = (sw - newW) / 2;
        sw = newW;
        cctx.canvas.width = sw; cctx.canvas.height = sh;
        cctx.drawImage(img, sx, 0, sw, sh, 0, 0, sw, sh);
      } else {
        // crop height
        const newH = sw / ratio;
        const sy = (sh - newH) / 2;
        sh = newH;
        cctx.canvas.width = sw; cctx.canvas.height = sh;
        cctx.drawImage(img, 0, sy, sw, sh, 0, 0, sw, sh);
      }

      // process negative
      const id = cctx.getImageData(0, 0, cctx.canvas.width, cctx.canvas.height);
      invertSCurveGamma(id.data, 0.16, 0.95);
      cctx.putImageData(id, 0, 0);
      multiplyOrange(cctx, cctx.canvas.width, cctx.canvas.height);

      // scale to frame rect, rotate 180
      ctx.save();
      ctx.translate(frameX + frameW/2, frameY + frameH/2);
      ctx.rotate(Math.PI);
      ctx.drawImage(cctx.canvas, -frameW/2, -frameH/2, frameW, frameH);
      ctx.restore();

      drawGrain(ctx, W, H);
      drawVignette(ctx, W, H);
      drawMarks(ctx, W, H);
    };

    img.src = src;
    return () => { mounted = false; };
  }, [src, stripWidth, stripHeight]);

  return <canvas ref={canvasRef} className={className} />;
};

export default NegativePhoto;