import { isAuthorized } from "@utils/basic-auth";
import { calendarConfig } from "@utils/calendar-config";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  if (context.url.pathname.startsWith("/api/")) {
    const authorized = isAuthorized(
      context.request.headers.get("Authorization"),
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
