import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const { default: dyadComponentTagger } = await import('@dyad-sh/react-vite-component-tagger');
  
  return {
    plugins: [dyadComponentTagger(), react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
  };
});