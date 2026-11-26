import { describe, expect, it } from "vitest";
import { getAttendance, getCapacityLevel, nextWeekday } from "./attendance";
import type { NormalizedCalendarEvent } from "./normalize-events";

const people = [
  { name: "Alex", color: "#123456" },
  { name: "Blair", color: "#654321" },
];

const event = (
  overrides: Partial<NormalizedCalendarEvent> = {},
): NormalizedCalendarEvent => ({
  startDate: "2026-11-26",
  endDate: "2026-11-28",
  subject: "Alex",
  people: [people[0]],
  type: { code: "AL", label: "Annual Leave" },
  ...overrides,
});

describe("next weekday", () => {
  it.each([
    [new Date(2026, 7, 1), new Date(2026, 7, 3)],
    [new Date(2026, 10, 1), new Date(2026, 10, 2)],
    [new Date(2027, 0, 31), new Date(2027, 1, 1)],
    [new Date(2026, 10, 26), new Date(2026, 10, 26)],
  ])("finds the next weekday from %s", (date, expected) => {
    const original = date.getTime();
    expect(nextWeekday(date)).toEqual(expected);
    expect(date.getTime()).toBe(original);
  });
});

describe("daily attendance", () => {
  it("counts multi-day absences until the exclusive end date", () => {
    expect(getAttendance(new Date(2026, 10, 27), people, [event()])).toEqual({
      peopleIn: [people[1]],
      peopleOut: [{ ...people[0], reasons: ["Annual Leave"] }],
    });
    expect(
      getAttendance(new Date(2026, 10, 28), people, [event()]).peopleOut,
    ).toEqual([]);
  });

  it("combines reasons without counting a person twice", () => {
    const events = [
      event(),
      event(),
      event({ type: { code: "OFF", label: "Off" } }),
    ];
    expect(
      getAttendance(new Date(2026, 10, 26), people, events).peopleOut,
    ).toEqual([{ ...people[0], reasons: ["Annual Leave", "Off"] }]);
  });

  it("handles timed events ending at midnight and missing event types", () => {
    const timed = event({
      startDate: "2026-11-25T23:00:00",
      endDate: "2026-11-26T00:00:00",
      type: null,
    });
    expect(
      getAttendance(new Date(2026, 10, 25), people, [timed]).peopleOut[0]
        .reasons,
    ).toEqual(["Reason unavailable"]);
    expect(
      getAttendance(new Date(2026, 10, 26), people, [timed]).peopleOut,
    ).toEqual([]);
  });
});

describe("capacity levels", () => {
  it.each([
    [0, 0, null],
    [1, 4, "red"],
    [2, 4, "orange"],
    [3, 4, "orange"],
    [4, 4, "green"],
  ])("classifies %i of %i as %s", (present, total, expected) => {
    expect(getCapacityLevel(present, total)).toBe(expected);
  });
});
