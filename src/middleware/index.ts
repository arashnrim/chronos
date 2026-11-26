import { defineMiddleware } from "astro:middleware";
import { API_SECRET } from "astro:env/server";

export const onRequest = defineMiddleware((context, next) => {
  // Reject requests to /api/* endpoints if the Authorization header does not match the API_SECRET
  if (!import.meta.env.DEV && context.url.pathname.startsWith("/api/")) {
    const authorization = context.request.headers.get("Authorization");

    if (!API_SECRET || authorization !== `Bearer ${API_SECRET}`) {
      return new Response(null, {
        status: 401,
        headers: { "WWW-Authenticate": "Bearer" },
      });
    }
  }

  return next();
});
