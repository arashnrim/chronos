// @ts-check
import { defineConfig, envField } from "astro/config";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  env: {
    schema: {
      API_SECRET: envField.string({ context: "server", access: "secret" }),
      CALENDAR_ID: envField.string({ context: "server", access: "secret" }),
    },
  },
});
