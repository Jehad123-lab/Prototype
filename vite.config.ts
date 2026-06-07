import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// A lightweight custom plugin to serve and bundle root-level "/assets" folder
function serveRootAssets() {
  return {
    name: 'serve-root-assets',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/assets/')) {
          const parsedUrl = new URL(req.url, 'http://localhost');
          const cleanPath = decodeURIComponent(parsedUrl.pathname);
          const localPath = path.join(process.cwd(), cleanPath);
          if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
            const ext = path.extname(localPath).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.png') contentType = 'image/png';
            if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            if (ext === '.svg') contentType = 'image/svg+xml';
            if (ext === '.json') contentType = 'application/json';
            
            res.setHeader('Content-Type', contentType);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(fs.readFileSync(localPath));
            return;
          }
        }
        next();
      });
    },
    closeBundle() {
      // Copy assets folder into dist/assets at build time
      const srcDir = path.join(process.cwd(), 'assets');
      const destDir = path.join(process.cwd(), 'dist', 'assets');
      if (fs.existsSync(srcDir)) {
        copyFolderSync(srcDir, destDir);
      }
    }
  };
}

function copyFolderSync(from: string, to: string) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    const srcElement = path.join(from, element);
    const destElement = path.join(to, element);
    if (fs.lstatSync(srcElement).isDirectory()) {
      copyFolderSync(srcElement, destElement);
    } else {
      fs.copyFileSync(srcElement, destElement);
    }
  });
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serveRootAssets()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
