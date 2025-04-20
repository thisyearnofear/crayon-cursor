import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
const isCodeSandbox =
  "SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env;

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    root: "src/",
    publicDir: "../static/",
    base: "/",
    server: {
      host: true,
      open: !isCodeSandbox,
      port: 8899,
    },
    build: {
      outDir: "../dist",
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/index.html"),
          signatures: resolve(__dirname, "src/signatures.html"),
        },
      },
    },

  };
});
