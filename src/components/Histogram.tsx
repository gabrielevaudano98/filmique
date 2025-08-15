import React, { useRef, useEffect, useState } from 'react';
import { FilmPreset } from '../types';
import { applyFilter } from '../utils/imageProcessor';

interface HistogramProps {
  imageUrl: string;
  preset?: FilmPreset;
}

const Histogram: React.FC<HistogramProps> = ({ imageUrl, preset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [histogramData, setHistogramData] = useState<{ r: number[], g: number[], b: number[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;
    setIsLoading(true);
    setError(null);

    const processImage = async () => {
      try {
        let finalImageUrl = imageUrl;
        if (preset) {
          const blob = await applyFilter(imageUrl, preset);
          objectUrl = URL.createObjectURL(blob);
          finalImageUrl = objectUrl;
        }

        const image = new Image();
        image.crossOrigin = 'Anonymous';
        image.src = finalImageUrl;

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

          for (let i = 0; i < imageData.length; i += 4) {
            r[imageData[i]]++;
            g[imageData[i + 1]]++;
            b[imageData[i + 2]]++;
          }

          setHistogramData({ r, g, b });
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
  }, [imageUrl, JSON.stringify(preset)]);

  useEffect(() => {
    if (histogramData && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const { r, g, b } = histogramData;
      
      const drawChannel = (data: number[], color: string) => {
        const maxVal = Math.max(...data);
        if (maxVal === 0) return;

        ctx.beginPath();
        ctx.moveTo(0, height);
        
        data.forEach((val, index) => {
          const x = (index / 255) * width;
          const y = height - (val / maxVal) * height;
          ctx.lineTo(x, y);
        });
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      };
      
      ctx.globalCompositeOperation = 'lighten';

      drawChannel(r, 'rgba(255, 80, 80, 0.8)');
      drawChannel(g, 'rgba(80, 255, 80, 0.8)');
      drawChannel(b, 'rgba(80, 80, 255, 0.8)');
      
      ctx.globalCompositeOperation = 'source-over';
    }
  }, [histogramData]);

  return (
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
  );
};

export default Histogram;