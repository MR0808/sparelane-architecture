import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { LikeC4VitePlugin } from 'likec4/vite-plugin'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const portalDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(portalDir, '..')
const openapiSrc = path.join(repoRoot, 'contracts', 'openapi.yaml')

function copyOpenApiPlugin(): Plugin {
  return {
    name: 'copy-openapi',
    configureServer(server) {
      server.middlewares.use('/openapi.yaml', (_req, res, next) => {
        if (!fs.existsSync(openapiSrc)) return next()
        res.setHeader('Content-Type', 'application/yaml; charset=utf-8')
        fs.createReadStream(openapiSrc).pipe(res)
      })
    },
    closeBundle() {
      const outDir = path.join(repoRoot, 'dist')
      if (!fs.existsSync(outDir)) return
      fs.copyFileSync(openapiSrc, path.join(outDir, 'openapi.yaml'))
    },
  }
}

export default defineConfig({
  root: portalDir,
  base: '/',
  publicDir: path.join(portalDir, 'public'),
  plugins: [
    react(),
    LikeC4VitePlugin({
      workspace: repoRoot,
      ai: 'disabled',
      appConfig: {
        pageTitle: 'Sparelane Architecture',
        theme: 'light',
      },
    }),
    copyOpenApiPlugin(),
  ],
  resolve: {
    alias: {
      '@docs': path.join(repoRoot, 'docs'),
      '@contracts': path.join(repoRoot, 'contracts'),
    },
  },
  server: {
    port: 5173,
    fs: {
      allow: [repoRoot],
    },
  },
  build: {
    outDir: path.join(repoRoot, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
  },
})
