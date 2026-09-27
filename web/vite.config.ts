import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { supabaseDashboard } from './server/viteSupabaseDashboard.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load every key, not just VITE_*. These are passed straight to the server
  // plugin and deliberately NOT merged into `config.env`, which Vite compiles
  // into `import.meta.env` — putting the secret there would ship it to the browser.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    plugins: [react(), tailwindcss(), supabaseDashboard(env)],
  }
})
