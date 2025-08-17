import React, { useRef, useEffect, useState } from 'react';
import { FilmPreset } from '../types';
import { applyFilter } from '../utils/imageProcessor';
import { getPhotoAsBase64 } from '../utils/fileStorage';

type HistogramData = { r: number[], g: number[], b: number[], l: number[] };

interface HistogramProps {
  imageUrl: string;
  preset?: FilmPreset;
  precomputedData?: HistogramData | null;
}

const Histogram: React.FC<HistogramProps> = ({ imageUrl, preset, precomputedData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [histogramData, setHistogramData] = useState<HistogramData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }

    if (precomputedData) {
      setHistogramData(precomputedData);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let objectUrl: string | null = null;
    setIsLoading(true);
    setError(null);

    const processImage = async () => {
      try {
        let imageSource = imageUrl;
        if (imageUrl.startsWith('capacitor://')) {
          imageSource = await getPhotoAsBase64(imageUrl);
        }

        if (preset) {
          const blob = await applyFilter(imageSource, preset);
          objectUrl = URL.createObjectURL(blob);
          imageSource = objectUrl;
        }

        const image = new Image();
        image.crossOrigin = 'Anonymous';
        image.src = imageSource;

        image.onload = () => {
          if (!isMounted) return;

          const canvas = document.createElement('canvas');
          const scale = Math.min(1, 256 / image.naturalWidth);
          canvas.width = image.naturalWidth * scale;
          canvas.height = image.naturalHeight * scale;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            setError("Could not get canvas context.");
            setIsLoading(false);
            return;
          }

          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

          const r = new Array(256).fill(0);
          const g = new Array(256).fill(0);
          const b = new Array(256).fill(0);
          const l = new Array(256).fill(0);

          for (let i = 0; i < imageData.length; i += 4) {
            const red = imageData[i];
            const green = imageData[i + 1];
            const blue = imageData[i + 2];
            
            r[red]++;
            g[green]++;
            b[blue]++;

            const luminance = Math.round(0.299 * red + 0.587 * green + 0.114 * blue);
            l[luminance]++;
          }

          setHistogramData({ r, g, b, l });
          setIsLoading(false);
        };

        image.onerror = () => {
          if (isMounted) {
            setError("Failed to load image for histogram.");
            setIsLoading(false);
          }
        };
      } catch (err) {
        if (isMounted) {
          console.error("Error processing histogram:", err);
          setError("Error applying film preset.");
          setIsLoading(false);
        }
      }
    };

    processImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageUrl, preset, precomputedData]);

  useEffect(() => {
    if (histogramData && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 1; i < 4; i++) {
        const x = (width / 4) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const { r, g, b, l } = histogramData;
      
      const maxVal = Math.max(...l) || 1;

      const drawChannel = (data: number[], color: string, lineWidth: number) => {
        if (maxVal === 0) return;

        ctx.beginPath();
        ctx.moveTo(0, height);
        
        data.forEach((val, index) => {
          const x = (index / 255) * width;
          const y = height - (val / maxVal) * height;
          ctx.lineTo(x, y);
        });
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      };
      
      ctx.globalCompositeOperation = 'source-over';
      drawChannel(l, 'rgba(255, 255, 255, 0.6)', 2);

      ctx.globalCompositeOperation = 'lighten';
      drawChannel(r, 'rgba(255, 80, 80, 0.9)', 1.5);
      drawChannel(g, 'rgba(80, 255, 80, 0.9)', 1.5);
      drawChannel(b, 'rgba(80, 120, 255, 0.9)', 1.5);
      
      ctx.globalCompositeOperation = 'source-over';
    }
  }, [histogramData]);

  return (
    <div className="w-full">
      <div className="w-full h-[120px] bg-neutral-900/50 rounded-md border border-neutral-700/50 p-2">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">Analyzing...</p>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : (
          <canvas ref={canvasRef} width="256" height="104" className="w-full h-full"></canvas>
        )}
      </div>
      <div className="flex justify-between items-center mt-1 px-1 text-xs text-gray-500 font-semibold">
        <span>Shadows</span>
        <span>Midtones</span>
        <span>Highlights</span>
      </div>
    </div>
  );
};

export default Histogram;