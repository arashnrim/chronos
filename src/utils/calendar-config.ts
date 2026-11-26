import { CHRONOS_CONFIG_JSON } from "astro:env/server";
import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const personSchema = z
  .object({
    name: nonEmptyString,
    color: hexColor,
  })
  .strict();

const eventTypeSchema = z
  .object({
    code: z.string().regex(/^[A-Z][A-Z0-9]*$/),
    label: nonEmptyString,
  })
  .strict();

const configSchema = z
  .object({
    people: z.array(personSchema).default([]),
    eventTypes: z.array(eventTypeSchema).default([]),
  })
  .strict()
  .superRefine((config, context) => {
    const personNames = new Set<string>();
    for (const [index, person] of config.people.entries()) {
      if (personNames.has(person.name)) {
        context.addIssue({
          code: "custom",
          message: `Person name is assigned more than once: ${person.name}`,
          path: ["people", index, "name"],
        });
      }
      personNames.add(person.name);
    }

    const eventTypeCodes = new Set<string>();
    for (const [index, eventType] of config.eventTypes.entries()) {
      if (eventTypeCodes.has(eventType.code)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate event type code: ${eventType.code}`,
          path: ["eventTypes", index, "code"],
        });
      }
      eventTypeCodes.add(eventType.code);
    }
  });

export type ChronosConfig = z.infer<typeof configSchema>;

export const parseChronosConfig = (source: string): ChronosConfig => {
  let document: unknown;
  try {
    document = JSON.parse(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in CHRONOS_CONFIG_JSON: ${message}`);
  }

  const result = configSchema.safeParse(document);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "config"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid CHRONOS_CONFIG_JSON: ${details}`);
  }

  return result.data;
};

export const calendarConfig = parseChronosConfig(CHRONOS_CONFIG_JSON);
