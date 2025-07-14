import path from "path";
import { createServer as createViteServer } from "vite";
import type { Express } from "express";
import type { Server } from "http";
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import viteConfig from "../vite.config";
import { createLogger } from "vite";

const viteLogger = createLogger();

export function log(message: string, source: string = "express") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  const indexPath = path.resolve(distPath, "index.html");
  
  log(`Serving static files from: ${distPath}`);
  
  // Check if build files exist
  if (!fs.existsSync(distPath)) {
    log("Build files not found! Please run 'npm run build' first", "static");
    process.exit(1);
  }
  
  if (!fs.existsSync(indexPath)) {
    log("index.html not found in build directory!", "static");
    process.exit(1);
  }

  // Serve static files with proper headers
  app.use(express.static(distPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Set security headers for static files
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Set appropriate cache headers
      if (path.endsWith('.js') || path.endsWith('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    }
  }));

  // Handle SPA routing - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "Not Found" });
    }
    
    try {
      const indexHtml = fs.readFileSync(indexPath, "utf-8");
      res.status(200).set({ "Content-Type": "text/html" }).end(indexHtml);
    } catch (error) {
      log(`Error serving index.html: ${error}`, "static");
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  log("Static file serving configured for production", "static");
}