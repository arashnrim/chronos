import { describe, expect, it, vi } from "vitest";
vi.mock("astro:env/server", () => ({ CHRONOS_CONFIG_JSON: "{}" }));

import { parseChronosConfig } from "@utils/calendar-config";
import { normalizeCalendarEvent } from "@utils/normalize-events";

const config = {
  people: [
    { name: "Person A", color: "#26734D" },
    { name: "Person B", color: "#B5473C" },
  ],
  eventTypes: [
    { code: "AL", label: "Annual Leave", priority: 1 },
    { code: "OFF", label: "Off" },
    { code: "PH", label: "Public Holiday" },
    { code: "XYZ", label: "Custom" },
  ],
};
const configJson = JSON.stringify(config);

describe("parseCalendarConfig", () => {
  it("parses configured people and event types", () => {
    expect(parseChronosConfig(configJson)).toEqual(config);
  });

  it("rejects malformed JSON", () => {
    expect(() => parseChronosConfig('{"people":')).toThrow(
      "Invalid JSON in CHRONOS_CONFIG_JSON",
    );
  });

  it("rejects duplicate person names and event type codes", () => {
    const duplicatePersonName = JSON.stringify({
      ...config,
      people: [...config.people, { name: "Person A", color: "#3565A8" }],
    });
    const duplicateConfig = JSON.stringify({
      ...config,
      eventTypes: config.eventTypes.map((eventType) =>
        eventType.code === "OFF" ? { ...eventType, code: "AL" } : eventType,
      ),
    });
    expect(() => parseChronosConfig(duplicatePersonName)).toThrow(
      "Person name is assigned more than once",
    );
    expect(() => parseChronosConfig(duplicateConfig)).toThrow(
      "Duplicate event type code: AL",
    );
  });

  it("rejects invalid colors and type codes", () => {
    const invalidConfig = JSON.stringify({
      ...config,
      people: config.people.map((person, index) =>
        index === 0 ? { ...person, color: "green" } : person,
      ),
      eventTypes: config.eventTypes.map((eventType) =>
        eventType.code === "AL" ? { ...eventType, code: "al" } : eventType,
      ),
    });
    expect(() => parseChronosConfig(invalidConfig)).toThrow(
      "Invalid CHRONOS_CONFIG_JSON",
    );
  });
});

describe("normalizeCalendarEvent", () => {
  const parsedConfig = parseChronosConfig(configJson);

  it.each([
    ["(AL) Person A", "AL", "Annual Leave", "Person A"],
    ["(OFF-PM) Person A", "OFF", "Off", "Person A"],
    ["(PH) Holiday", "PH", "Public Holiday", "Holiday"],
    ["(XYZ) Custom Event", "XYZ", "Custom", "Custom Event"],
  ])("parses %s", (summary, code, label, subject) => {
    const normalized = normalizeCalendarEvent({ summary }, parsedConfig);
    expect(normalized).toMatchObject({
      subject,
      type: { code, label, priority: code === "AL" ? 1 : 0 },
    });
  });

  it("returns only the selected fields and flattens all-day dates", () => {
    const normalized = normalizeCalendarEvent(
      {
        summary: "(AL) Person A",
        start: { date: "2026-11-26" },
        end: { date: "2026-11-27" },
      },
      parsedConfig,
    );
    expect(normalized).toEqual({
      startDate: "2026-11-26",
      endDate: "2026-11-27",
      subject: "Person A",
      people: [{ name: "Person A", color: "#26734D" }],
      type: { code: "AL", label: "Annual Leave", priority: 1 },
    });
  });

  it("flattens timed start and end values", () => {
    expect(
      normalizeCalendarEvent(
        {
          summary: "(AL) Person A",
          start: {
            dateTime: "2026-11-26T09:00:00+08:00",
            timeZone: "Asia/Singapore",
          },
          end: {
            dateTime: "2026-11-26T10:00:00+08:00",
            timeZone: "Asia/Singapore",
          },
        },
        parsedConfig,
      ),
    ).toEqual({
      startDate: "2026-11-26T09:00:00+08:00",
      endDate: "2026-11-26T10:00:00+08:00",
      subject: "Person A",
      people: [{ name: "Person A", color: "#26734D" }],
      type: { code: "AL", label: "Annual Leave", priority: 1 },
    });
  });

  it("keeps unmatched text as a subject and unknown type code", () => {
    expect(
      normalizeCalendarEvent({ summary: "(OTHER) Holiday" }, parsedConfig),
    ).toEqual({
      startDate: null,
      endDate: null,
      subject: "Holiday",
      people: [],
      type: { code: "OTHER", label: "OTHER", priority: 0 },
    });
  });

  it("leaves malformed titles unclassified", () => {
    expect(
      normalizeCalendarEvent({ summary: "OFF-PM Person A" }, parsedConfig),
    ).toEqual({
      startDate: null,
      endDate: null,
      subject: null,
      people: [],
      type: null,
    });
  });

  it("associates all configured people mentioned in the description", () => {
    expect(
      normalizeCalendarEvent(
        {
          summary: "(GD) Team event",
          description: "Participants: Person A and person b. Contact Person A.",
        },
        parsedConfig,
      ),
    ).toMatchObject({
      people: [
        { name: "Person A", color: "#26734D" },
        { name: "Person B", color: "#B5473C" },
      ],
    });
  });

  it("associates everyone when the description includes that keyword", () => {
    expect(
      normalizeCalendarEvent(
        { summary: "(GD) Team event", description: "Everyone is invited" },
        parsedConfig,
      ).people,
    ).toEqual([
      { name: "Person A", color: "#26734D" },
      { name: "Person B", color: "#B5473C" },
    ]);
  });

  it("matches complete names, not names embedded in other words", () => {
    expect(
      normalizeCalendarEvent(
        {
          summary: "invalid title",
          description: "Person Aardvark is attending",
        },
        parsedConfig,
      ).people,
    ).toEqual([]);
  });
});
