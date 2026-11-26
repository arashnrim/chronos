import { defineMiddleware } from "astro:middleware";
import { API_SECRET } from "astro:env/server";
import { calendarConfig } from "@utils/calendar-config";
import { isBasicAuthAuthorized } from "@utils/basic-auth";

export const onRequest = defineMiddleware((context, next) => {
  if (context.url.pathname.startsWith("/api/")) {
    const authorized = isBasicAuthAuthorized(
      context.request.headers.get("Authorization"),
      API_SECRET,
      calendarConfig.people,
    );

    if (!authorized) {
      return new Response(null, {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic charset="UTF-8"',
        },
      });
    }
  }

  return next();
});
