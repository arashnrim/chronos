import type { ChronosConfig } from "@utils/calendar-config";

type CalendarEventLike = {
  summary?: string | null;
  description?: string | null;
  start?: CalendarEventDateTime | null;
  end?: CalendarEventDateTime | null;
};

type CalendarEventDateTime = {
  date?: string | null;
  dateTime?: string | null;
  timeZone?: string | null;
};

type EventTypeLabel = Pick<
  ChronosConfig["eventTypes"][number],
  "code" | "label"
>;
type PersonLabel = Pick<ChronosConfig["people"][number], "name" | "color">;

export type NormalizedCalendarEvent = {
  startDate: string | null;
  endDate: string | null;
  subject: string | null;
  people: PersonLabel[];
  type: EventTypeLabel | null;
};

const titlePattern = /^\(([A-Z][A-Z0-9]*)(?:-(AM|PM))?\)\s+(.+?)\s*$/i;
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const descriptionIncludesPerson = (
  description: string,
  name: string,
): boolean => {
  const escapedName = escapeRegExp(name);
  return new RegExp(
    `(^|[^\\p{L}\\p{N}_])${escapedName}(?=$|[^\\p{L}\\p{N}_])`,
    "iu",
  ).test(description);
};

export const normalizeCalendarEvent = (
  event: CalendarEventLike,
  config: ChronosConfig,
): NormalizedCalendarEvent => {
  const match = event.summary?.match(titlePattern);
  const subject = match?.[3].trim() ?? null;
  const configuredPerson = subject
    ? config.people.find((person) => person.name === subject)
    : undefined;
  const includesEveryone =
    !!event.description &&
    descriptionIncludesPerson(event.description, "everyone");
  const people = config.people
    .filter(
      (person) =>
        includesEveryone ||
        person === configuredPerson ||
        (!!event.description &&
          descriptionIncludesPerson(event.description, person.name)),
    )
    .map(({ name, color }) => ({ name, color }));

  if (!match) {
    return {
      startDate: event.start?.date ?? event.start?.dateTime ?? null,
      endDate: event.end?.date ?? event.end?.dateTime ?? null,
      subject: null,
      people,
      type: null,
    };
  }

  const typeCode = match[1].toUpperCase();
  const configuredType = config.eventTypes.find(
    (eventType) => eventType.code === typeCode,
  );

  return {
    startDate: event.start?.date ?? event.start?.dateTime ?? null,
    endDate: event.end?.date ?? event.end?.dateTime ?? null,
    subject,
    people,
    type: {
      code: typeCode,
      label: configuredType?.label ?? typeCode,
    },
  };
};

export const normalizeCalendarEvents = (
  events: readonly CalendarEventLike[],
  config: ChronosConfig,
): NormalizedCalendarEvent[] => {
  return events.map((event) => normalizeCalendarEvent(event, config));
};
