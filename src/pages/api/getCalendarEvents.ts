export const prerender = false;

import type { APIRoute } from "astro";
import { resolve } from "node:path";
import { google } from "googleapis";
import { toISODateTime } from "@utils/parse";
import { CALENDAR_ID } from "astro:env/server";

export const GET = (async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const parseTimeBound = (name: string) => {
    const value = searchParams.get(name);
    return value === null ? undefined : toISODateTime(value);
  };
  const timeMin = parseTimeBound("timeMin");
  const timeMax = parseTimeBound("timeMax");

  if (timeMin === null || timeMax === null) {
    return new Response(
      JSON.stringify({
        error: "timeMin and timeMax must be valid datetimes when provided",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const scopes = ["https://www.googleapis.com/auth/calendar.readonly"];
  const auth = new google.auth.GoogleAuth({
    scopes,
    keyFile: resolve(process.cwd(), "credentials.json"),
  });
  const calendar = google.calendar({ version: "v3", auth });
  const result = await calendar.events.list({
    calendarId: CALENDAR_ID,
    singleEvents: true,
    orderBy: "startTime",
    ...(timeMin && { timeMin }),
    ...(timeMax && { timeMax }),
  });
  const events = result.data.items;
  console.log(result.data.timeZone);

  return new Response(JSON.stringify({ events }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}) satisfies APIRoute;
