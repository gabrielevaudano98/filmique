import { encode as encodeAVIF } from '@jsquash/avif';
import { decode as decodeJPEG } from '@jsquash/jpeg';
import { decode as decodePNG } from '@jsquash/png';
import { resize as resizeRGBA } from '@jsquash/resize';

type MsgIn = {
  buf: Uint8Array;
  mime: string;
  targetLong?: number;
  cqLevel?: number;
  speed?: number;
  chroma?: '420' | '444';
};

self.onmessage = async (e: MessageEvent<MsgIn>) => {
  try {
    const { buf, mime, targetLong = 5315, cqLevel = 22, speed = 6, chroma = '444' } = e.data;

    let decoded;
    if (mime.includes('jpeg') || mime.includes('jpg')) {
      decoded = await decodeJPEG(buf);
    } else if (mime.includes('png')) {
      decoded = await decodePNG(buf);
    } else {
      throw new Error(`Unsupported input MIME type: ${mime}`);
    }

    let { data, width, height } = decoded;

    if (!data || !width || !height) {
      throw new Error(`Decoded image data is invalid`);
    }

    const long = Math.max(width, height);
    if (targetLong && long > targetLong) {
      const scale = targetLong / long;
      const w = Math.round(width * scale);
      const h = Math.round(height * scale);
      const resized = await resizeRGBA({ data, width, height }, { width: w, height: h });
      data = resized.data;
      width = resized.width;
      height = resized.height;
    }

    const subsample = chroma === '420' ? 1 : 0;

    const avif = await encodeAVIF({
      data, width, height,
      cqLevel,
      speed,
      subsample,
    });

    if (!avif || !avif.buffer) {
      throw new Error(`AVIF encoding returned an invalid result.`);
    }

    (self as any).postMessage({ avif, width, height }, [avif.buffer]);
  } catch (err: any) {
    const errorMessage = err?.message ?? String(err);
    (self as any).postMessage({ error: `Worker execution failed: ${errorMessage}` });
  }
};