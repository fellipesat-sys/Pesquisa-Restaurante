import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração oficial de compilação do Vite: https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});
