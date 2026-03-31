/**
 * Coloca o output do Vite (dist/) em .vercel/output/static e gera config.json
 * para o Build Output API v3, corrigindo 404 em deploy na Vercel.
 * @see https://vercel.com/docs/build-output-api/v3/primitives#static-files
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const outputDir = path.join(root, ".vercel", "output");
const staticDir = path.join(outputDir, "static");

if (!fs.existsSync(distDir)) {
  console.error("vercel-output: dist/ não encontrado. Rode 'pnpm build' (vite build) antes.");
  process.exit(1);
}

fs.mkdirSync(staticDir, { recursive: true });
fs.cpSync(distDir, staticDir, { recursive: true });

const config = {
  version: 3,
  routes: [
    // API rewrites (before filesystem, so they take priority)
    { src: "/api/health", dest: "/api/index" },
    { src: "/api/version", dest: "/api/index" },
    { src: "/api/stripe/(.*)", dest: "/api/index" },
    { src: "/api/oauth/(.*)", dest: "/api/index" },
    { src: "/api/trpc/(.*)", dest: "/api/index" },
    // Filesystem check (serves static files from .vercel/output/static/)
    { handle: "filesystem" },
    // SPA fallback (all other routes go to index.html)
    { src: "/(.*)", dest: "/index.html" },
  ],
};

fs.writeFileSync(
  path.join(outputDir, "config.json"),
  JSON.stringify(config, null, 2),
  "utf8"
);

console.log("vercel-output: .vercel/output/static e config.json criados.");
