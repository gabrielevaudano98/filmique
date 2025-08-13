import { encode as encodeAVIF } from '@jsquash/avif';
import { decode as decodeJPEG } from '@jsquash/jpeg';
import { decode as decodePNG } from '@jsquash/png';
import { resize as resizeRGBA } from '@jsquash/resize';

type MsgIn = {
  buf: Uint8Array;
  mime: string;
  targetLong?: number;   // e.g., 5315
  cqLevel?: number;      // default 22
  speed?: number;        // default 6
  chroma?: '420' | '444' // default '444'
};

self.onmessage = async (e: MessageEvent<MsgIn>) => {
  try {
    const { buf, mime, targetLong = 5315, cqLevel = 22, speed = 6, chroma = '444' } = e.data;

    // Decode
    let decoded;
    if (mime.includes('jpeg') || mime.includes('jpg')) decoded = await decodeJPEG(buf);
    else if (mime.includes('png')) decoded = await decodePNG(buf);
    else throw new Error(`Unsupported input: ${mime}`);

    let { data, width, height } = decoded;

    // Optional downscale to target long edge
    const long = Math.max(width, height);
    if (targetLong && long > targetLong) {
      const scale = targetLong / long;
      const w = Math.round(width * scale);
      const h = Math.round(height * scale);
      const r = await resizeRGBA({ data, width, height }, { width: w, height: h });
      data = r.data; width = r.width; height = r.height;
    }

    const subsample = chroma === '420' ? 1 : 0; // 0=4:4:4

    // Encode AVIF
    const avif = await encodeAVIF({
      data, width, height,
      cqLevel,
      speed,
      subsample,
    });

    (self as any).postMessage({ avif, width, height }, [avif.buffer]);
  } catch (err: any) {
    (self as any).postMessage({ error: err?.message ?? String(err) });
  }
};