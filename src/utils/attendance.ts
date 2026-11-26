import type { NormalizedCalendarEvent } from "@utils/normalize-events";

export type Person = { name: string; color: string };
export type PersonOut = Person & { reasons: string[] };
export type Attendance = { peopleIn: Person[]; peopleOut: PersonOut[] };

export const nextWeekday = (date: Date): Date => {
  const weekday = new Date(date);
  if (weekday.getDay() === 6) weekday.setDate(weekday.getDate() + 2);
  if (weekday.getDay() === 0) weekday.setDate(weekday.getDate() + 1);
  return weekday;
};

const dateValue = (value: string): Date => {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
      )
    : new Date(value);
};

export const getAttendance = (
  date: Date,
  people: readonly Person[],
  events: readonly NormalizedCalendarEvent[],
): Attendance => {
  const startOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const endOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
  );
  const reasonsByName = new Map<string, Set<string>>();

  for (const event of events) {
    if (!event.startDate || !event.endDate) continue;
    const start = dateValue(event.startDate);
    const end = dateValue(event.endDate);
    if (!(start < endOfDay && end > startOfDay)) continue;

    for (const person of event.people) {
      const reasons = reasonsByName.get(person.name) ?? new Set<string>();
      reasons.add(event.type?.label ?? "Reason unavailable");
      reasonsByName.set(person.name, reasons);
    }
  }

  const peopleIn: Person[] = [];
  const peopleOut: PersonOut[] = [];
  for (const person of people) {
    const reasons = reasonsByName.get(person.name);
    if (reasons) peopleOut.push({ ...person, reasons: [...reasons] });
    else peopleIn.push(person);
  }
  return { peopleIn, peopleOut };
};

export const getCapacityLevel = (
  peopleIn: number,
  total: number,
): "low" | "medium" | "high" | null => {
  if (total === 0) return null;
  const capacity = peopleIn / total;
  if (capacity < 0.5) return "low";
  if (capacity <= 0.75) return "medium";
  return "high";
};

export const capacityLevelColors = {
  low: "text-red-700 dark:text-red-400",
  medium: "text-orange-800 dark:text-orange-400",
  high: "text-green-700 dark:text-green-400",
};
