import { useEffect, useState } from "react";
import type { Person } from "@utils/attendance";
import type { NormalizedCalendarEvent } from "@utils/normalize-events";

export type CalendarData = {
  people: Person[];
  events: NormalizedCalendarEvent[];
};
type LoadState =
  | { status: "loading" }
  | { status: "unauthorized" }
  | { status: "error" }
  | { status: "ready"; data: CalendarData };

function monthParameter(date: Date, offset: number) {
  const month = new Date(date.getFullYear(), date.getMonth() + offset, 1);
  return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
}

export function useAttendanceData(month: Date) {
  const [secret, setSecret] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const monthKey = monthParameter(month, 0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    const load = async () => {
      const headers = secret
        ? { Authorization: `Bearer ${secret}` }
        : undefined;
      const urls = [
        "/api/people",
        ...[-1, 0, 1].map(
          (offset) => `/api/events?month=${monthParameter(month, offset)}`,
        ),
      ];
      const responses = await Promise.all(
        urls.map((url) => fetch(url, { headers, signal: controller.signal })),
      );
      if (responses.some((response) => response.status === 401)) {
        setState({ status: "unauthorized" });
        return;
      }
      if (responses.some((response) => !response.ok))
        throw new Error("Could not load attendance");
      const [peopleResponse, ...eventResponses] = await Promise.all(
        responses.map((response) => response.json()),
      );
      if (!controller.signal.aborted) {
        setState({
          status: "ready",
          data: {
            people: peopleResponse.people,
            events: eventResponses.flatMap((response) => response.events),
          },
        });
      }
    };

    load().catch(() => {
      if (!controller.signal.aborted) setState({ status: "error" });
    });
    return () => controller.abort();
  }, [monthKey, secret, attempt]);

  const retry = () => setAttempt((value) => value + 1);
  const connect = (value: string) => {
    if (value === secret) retry();
    else setSecret(value);
  };

  return { state, retry, connect };
}
