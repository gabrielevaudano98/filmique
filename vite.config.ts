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
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..'],
      },
    },
  };
});