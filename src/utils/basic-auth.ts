import { API_SECRET } from "astro:env/server";
import type { Person } from "./attendance";

export const isAuthorized = (
  authorization: string | null,
  people: readonly Person[],
) => {
  if (!authorization) return false;

  const match = authorization?.match(/^Basic\s+([A-Za-z0-9+/]+={0,2})$/i);
  if (!match) return false;

  try {
    const bytes = Uint8Array.from(atob(match[1]), (character) =>
      character.charCodeAt(0),
    );
    const credentials = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const separator = credentials.indexOf(":");
    if (separator === -1) return false;

    const username = credentials.slice(0, separator);
    const password = credentials.slice(separator + 1);
    return (
      password === API_SECRET &&
      people.some(
        (person) => person.name.toLowerCase() === username.toLowerCase(),
      )
    );
  } catch {
    return false;
  }
};
