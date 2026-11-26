import { describe, expect, it } from "vitest";
import { parseCalendarConfig } from "./calendar-config";
import { normalizeCalendarEvent } from "./normalize-events";

const configYaml = `
people:
  - name: Person A
    color: "#26734D"
  - name: Person B
    color: "#B5473C"
eventTypes:
  - code: AL
    label: Annual Leave
  - code: OFF
    label: Off
  - code: PH
    label: Public Holiday
  - code: XYZ
    label: Custom
`;

describe("parseCalendarConfig", () => {
  it("parses configured people and event types", () => {
    expect(parseCalendarConfig(configYaml)).toEqual({
      people: [
        { name: "Person A", color: "#26734D" },
        { name: "Person B", color: "#B5473C" },
      ],
      eventTypes: [
        { code: "AL", label: "Annual Leave" },
        { code: "OFF", label: "Off" },
        { code: "PH", label: "Public Holiday" },
        { code: "XYZ", label: "Custom" },
      ],
    });
  });

  it("rejects duplicate person names and event type codes", () => {
    const duplicatePersonName = configYaml.replace(
      '  - name: Person B\n    color: "#B5473C"\neventTypes:',
      '  - name: Person B\n    color: "#B5473C"\n  - name: Person A\n    color: "#3565A8"\neventTypes:',
    );
    const duplicateConfig = configYaml.replace(
      "  - code: OFF\n    label: Off",
      "  - code: AL\n    label: Off",
    );
    expect(() => parseCalendarConfig(duplicatePersonName)).toThrow(
      "Person name is assigned more than once",
    );
    expect(() => parseCalendarConfig(duplicateConfig)).toThrow(
      "Duplicate event type code: AL",
    );
  });

  it("rejects invalid colors and type codes", () => {
    const invalidConfig = configYaml
      .replace("#26734D", "green")
      .replace("code: AL", "code: al");
    expect(() => parseCalendarConfig(invalidConfig)).toThrow(
      "Invalid chronos-config.yml",
    );
  });
});

describe("normalizeCalendarEvent", () => {
  const config = parseCalendarConfig(configYaml);

  it.each([
    ["(AL) Person A", "AL", "Annual Leave", "Person A"],
    ["(OFF-PM) Person A", "OFF", "Off", "Person A"],
    ["(PH) Holiday", "PH", "Public Holiday", "Holiday"],
    ["(XYZ) Custom Event", "XYZ", "Custom", "Custom Event"],
  ])("parses %s", (summary, code, label, subject) => {
    const normalized = normalizeCalendarEvent({ summary }, config);
    expect(normalized).toMatchObject({
      subject,
      type: { code, label },
    });
  });

  it("returns only the selected fields and flattens all-day dates", () => {
    const normalized = normalizeCalendarEvent(
      {
        summary: "(AL) Person A",
        start: { date: "2026-11-26" },
        end: { date: "2026-11-27" },
      },
      config,
    );
    expect(normalized).toEqual({
      startDate: "2026-11-26",
      endDate: "2026-11-27",
      subject: "Person A",
      people: [{ name: "Person A", color: "#26734D" }],
      type: { code: "AL", label: "Annual Leave" },
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
        config,
      ),
    ).toEqual({
      startDate: "2026-11-26T09:00:00+08:00",
      endDate: "2026-11-26T10:00:00+08:00",
      subject: "Person A",
      people: [{ name: "Person A", color: "#26734D" }],
      type: { code: "AL", label: "Annual Leave" },
    });
  });

  it("keeps unmatched text as a subject and unknown type code", () => {
    expect(
      normalizeCalendarEvent({ summary: "(OTHER) Holiday" }, config),
    ).toEqual({
      startDate: null,
      endDate: null,
      subject: "Holiday",
      people: [],
      type: { code: "OTHER", label: "OTHER" },
    });
  });

  it("leaves malformed titles unclassified", () => {
    expect(
      normalizeCalendarEvent({ summary: "OFF-PM Person A" }, config),
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
        config,
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
        config,
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
        config,
      ).people,
    ).toEqual([]);
  });
});
