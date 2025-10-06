import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname);
const srcDir = path.resolve(projectRoot, "src");
const publicDir = path.resolve(projectRoot, "public");
const allowedFsRoots = [projectRoot, srcDir, publicDir];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: "src/locales/*.json",
            dest: "locales",
          },
          {
            src: "src/assets/fonts/*",
            dest: "assets/fonts",
          },
        ],
      }),
      {
        name: "enforce-html-fs-allowlist",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (!req.url || req.method !== "GET") {
              return next();
            }

            let pathname: string;
            try {
              const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
              pathname = decodeURIComponent(url.pathname);
            } catch {
              res.statusCode = 400;
              res.end("Bad Request");
              return;
            }

            if (!pathname.endsWith(".html")) {
              return next();
            }

            const candidatePath = path.resolve(server.config.root, `.${pathname}`);
            const isAllowed = allowedFsRoots.some((allowed) =>
              candidatePath === allowed || candidatePath.startsWith(`${allowed}${path.sep}`),
            );

            if (!isAllowed) {
              res.statusCode = 403;
              res.end("Forbidden");
              return;
            }

            next();
          });
        },
      },
    ],
    build: {
      outDir: "dist",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              const paths = id.split("node_modules/")[1].split("/");
              return `vendor-${paths[0]}`;
            }
          },
        },
      },
    },
    base: "/portal/",
    define: {
      "process.env": env,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      fs: {
        strict: true,
        allow: allowedFsRoots,
        deny: [path.resolve(projectRoot, "..")],
      },
    },
    preview: {
      fs: {
        strict: true,
        allow: allowedFsRoots,
      },
    },
  };
});
