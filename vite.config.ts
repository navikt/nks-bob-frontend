import react from "@vitejs/plugin-react"
import { config } from "dotenv"
import { defineConfig, Plugin } from "vite"
import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"

config()

// Custom plugin to enhance HTML with preconnect and preload
const optimizeHtml = (): Plugin => {
  return {
    name: 'optimize-html',
    
    // Add the preconnect to API server (only in development mode)
    transformIndexHtml(html) {
      // Only add preconnect in development mode since in production
      // the API is on the same origin and doesn't need preconnect
      const isDevMode = process.env.NODE_ENV !== 'production';
      
      return html.replace(
        '<!-- Preconnect to API domain will be added by Vite plugin -->',
        isDevMode 
          ? `<!-- Preconnect to development API server -->
    <link rel="preconnect" href="http://localhost:3030" crossorigin />`
          : '<!-- No preconnect needed in production as API is same-origin -->'
      );
    },
    
    // Add vendor chunk preload in production build
    enforce: 'post',
    apply: 'build',
    closeBundle: {
      sequential: true,
      order: 'post',
      handler() {
        try {
          const manifestPath = resolve('dist/.vite/manifest.json')
          const indexPath = resolve('dist/index.html')

          // Get the index.html content
          const indexContent = readFileSync(indexPath, 'utf-8')
          
          // Read the manifest
          const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
          
          // Find the vendor chunk
          let vendorFile = ''
          Object.keys(manifest).forEach(key => {
            if (key.includes('vendor') && key.endsWith('.js')) {
              vendorFile = manifest[key].file
            }
          })
          
          // Update the preconnect to use empty href for production (same-origin)
          // and add vendor chunk preload
          let updatedContent = indexContent
            .replace(
              '<!-- Vendor chunk preload will be added by Vite during build -->',
              vendorFile
                ? `<!-- Vendor chunk preload added by build process -->
    <link rel="preload" href="/${vendorFile}" as="script" crossorigin />`
                : '<!-- No vendor chunk found to preload -->'
            );
          
          // Write the updated index.html
          writeFileSync(indexPath, updatedContent)
          console.log('✓ Added optimization tags to index.html')
        } catch (error) {
          console.error('Error adding optimization tags:', error)
        }
      }
    }
  }
}

// Filter environment variables to only include the ones needed by the app
const prodEnvVars = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => 
    key.startsWith('AZURE_') || 
    key.startsWith('NAIS_') || 
    key.startsWith('LOGIN_') || 
    key === 'NODE_ENV' || 
    key === 'BASE_URL' || 
    key === 'MILJO'
  )
)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    optimizeHtml(),
  ],
  define: {
    // Only expose the environment variables actually needed by the application
    "process.env": prodEnvVars,
  },
  server: {
    port: 5173,
    proxy: {
      "/bob-api": "http://localhost:3030",
      "/bob-api-ws": "ws://localhost:3030",
    },
  },
  build: {
    sourcemap: process.env.NODE_ENV !== 'production', // Only generate sourcemaps in development
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production', // Remove console logs in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Split vendor code (node_modules) into a separate chunk
        manualChunks: {
          'vendor': [
            'react', 
            'react-dom', 
            'react-router',
            'zustand',
          ],
          'markdown': [
            'react-markdown', 
            'remark-gfm', 
            'rehype-raw', 
            'remark-rehype', 
            'rehype-stringify',
            'remark',
            'strip-markdown',
          ],
          'navikt': [
            '@navikt/ds-react',
            '@navikt/aksel-icons',
          ],
        },
        // Use hashed filenames with content-based hashing for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to reduce noise
    manifest: true, // Generate manifest.json for plugin to use
  },
})
