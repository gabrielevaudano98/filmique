import React, { useRef, useEffect, useState } from 'react';

interface HistogramProps {
  imageUrl: string;
}

const Histogram: React.FC<HistogramProps> = ({ imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [histogramData, setHistogramData] = useState<{ r: number[], g: number[], b: number[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const calculateHistogram = () => {
      const image = new Image();
      image.crossOrigin = 'Anonymous';
      
      // Add a cache-busting query parameter
      const url = new URL(imageUrl);
      url.searchParams.set('t', new Date().getTime().toString());
      image.src = url.toString();

      image.onload = () => {
        if (!isMounted) return;

        const canvas = document.createElement('canvas');
        // Use a smaller canvas for performance
        const scale = Math.min(1, 256 / image.width);
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

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
        if (isMounted) setIsLoading(false);
        console.error("Failed to load image for histogram.");
      }
    };

    calculateHistogram();

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

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
          <p className="text-gray-400 text-sm">Analyzing photo...</p>
        </div>
      ) : histogramData ? (
        <canvas ref={canvasRef} width="256" height="104" className="w-full h-full"></canvas>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-red-400 text-sm">Could not generate histogram.</p>
        </div>
      )}
    </div>
  );
};

export default Histogram;