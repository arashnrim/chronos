export const prerender = false;

import type { APIRoute } from "astro";
import { calendarConfig } from "@utils/calendar-config";

export const GET = (() => {
  const people = calendarConfig.people;

  return new Response(JSON.stringify({ people, count: people.length }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}) satisfies APIRoute;
