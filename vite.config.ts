import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import rollupPluginNodeResolve from '@rollup/plugin-node-resolve';

export default defineConfig({
  plugins: [
    //     rollupPluginNodeResolve({
    //   extensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
    // }),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),

    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
      // '@': path.resolve(new URL(import.meta.url).pathname, './app'),
    },
    // extensions: ['.js', '.ts', '.tsx', '.jsx'],
  },
  ssr: {
    noExternal: ["remix-utils", "babylon-htmlmesh"],
  },
  server: {
    watch: {
      usePolling: true,
    }
  },
  assetsInclude: ["**/*.glb"], // Add this line to include .glb files as assets
});