// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  env: {
    schema: {
      API_SECRET: envField.string({ context: "server", access: "secret" }),
      CALENDAR_ID: envField.string({ context: "server", access: "secret" }),
      GOOGLE_CREDENTIALS_JSON: envField.string({
        context: "server",
        access: "secret",
      }),
      CHRONOS_CONFIG_JSON: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      tsconfigPaths: true,
    },
  },
  integrations: [react()],
});
