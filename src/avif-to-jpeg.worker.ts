import { decode as decodeAVIF } from '@jsquash/avif';
import { encode as encodeJPEG } from '@jsquash/jpeg';

type MsgIn = {
  buf: Uint8Array;
};

self.onmessage = async (e: MessageEvent<MsgIn>) => {
  try {
    const { buf } = e.data;

    // Decode AVIF
    const decoded = await decodeAVIF(buf);
    const { data, width, height } = decoded;

    // Encode JPEG
    const jpeg = await encodeJPEG({
      data,
      width,
      height,
      quality: 90, // You can adjust JPEG quality here (0-100)
    });

    (self as any).postMessage({ jpeg }, [jpeg.buffer]);
  } catch (err: any) {
    (self as any).postMessage({ error: err?.message ?? String(err) });
  }
};