import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ghPages } from "vite-plugin-gh-pages";

// https://vite.dev/config/
export default defineConfig({
  base: '/proof-of-concept/',
  plugins: [react(), ghPages(
    ghPages({
      fallback: '404.html',
      onBeforePublish: ({ outDir }) => {
        console.log(`📦 Starting deployment from ${outDir}...`);
      },
      onPublish: ({ branch }) => {
        console.log(`🎉 Successfully deployed to ${branch}!`);
      },
      onError: (error) => {
        console.error("❌ Deployment failed:", error);
      },
    })
  )],
})




