import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

const isDev = process.env.NODE_ENV === 'production' ? false : true;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: isDev ? '/' : '/x-ai/',
})
