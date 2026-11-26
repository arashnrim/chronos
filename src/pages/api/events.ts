export const prerender = false;

import { calendarConfig } from "@utils/calendar-config";
import { normalizeCalendarEvents } from "@utils/normalize-events";
import { getCalendarPeriodBounds } from "@utils/parse";
import type { APIRoute } from "astro";
import { CALENDAR_ID, GOOGLE_CREDENTIALS_JSON } from "astro:env/server";
import { google } from "googleapis";

const badRequest = (error: string) =>
  new Response(JSON.stringify({ error }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });

export const GET = (async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const allowedParams = new Set(["date", "month"]);
  const unsupportedParam = [...searchParams.keys()].find(
    (name) => !allowedParams.has(name),
  );
  if (unsupportedParam) {
    return badRequest(`Unsupported query parameter: ${unsupportedParam}`);
  }

  const dates = searchParams.getAll("date");
  const months = searchParams.getAll("month");
  if (dates.length > 1 || months.length > 1) {
    return badRequest("date and month may only be provided once");
  }
  if (dates.length > 0 && months.length > 0) {
    return badRequest("date and month cannot be used together");
  }

  const period = dates.length > 0 ? "date" : months.length > 0 ? "month" : null;
  const periodValue =
    period === "date" ? dates[0] : period === "month" ? months[0] : null;

  const scopes = ["https://www.googleapis.com/auth/calendar.readonly"];
  const auth = new google.auth.GoogleAuth({
    scopes,
    credentials: JSON.parse(GOOGLE_CREDENTIALS_JSON),
  });
  const calendar = google.calendar({ version: "v3", auth });
  let bounds: { timeMin: string; timeMax: string } | null = null;

  if (period && periodValue !== null) {
    const metadata = await calendar.calendars.get({ calendarId: CALENDAR_ID });
    const timeZone = metadata.data.timeZone;
    if (!timeZone) {
      return new Response(
        JSON.stringify({ error: "Calendar timezone is unavailable" }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    bounds = getCalendarPeriodBounds(periodValue, period, timeZone);
    if (!bounds) {
      return badRequest(
        `Invalid ${period}; expected ${period === "date" ? "YYYY-MM-DD" : "YYYY-MM"}`,
      );
    }
  }

  const result = await calendar.events.list({
    calendarId: CALENDAR_ID,
    singleEvents: true,
    orderBy: "startTime",
    ...(bounds && { ...bounds }),
  });
  const events = normalizeCalendarEvents(
    result.data.items ?? [],
    calendarConfig,
  );

  return new Response(JSON.stringify({ events }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}) satisfies APIRoute;
