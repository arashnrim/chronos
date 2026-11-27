import { describe, expect, it, vi } from "vitest";
vi.mock("astro:env/server", () => ({ API_SECRET: "secret" }));

import { isAuthorized } from "@utils/basic-auth";

const people = [{ name: "Alex Smith", color: "#26734D" }];

const basicAuthorization = (username: string, password: string) =>
  `Basic ${btoa(`${username}:${password}`)}`;

describe("isBasicAuthAuthorized", () => {
  it("accepts a configured person's name regardless of case", () => {
    expect(
      isAuthorized(basicAuthorization("aLeX sMiTh", "secret"), people),
    ).toBe(true);
  });

  it("rejects unknown names and incorrect passwords", () => {
    expect(
      isAuthorized(basicAuthorization("Unknown Person", "secret"), people),
    ).toBe(false);
    expect(
      isAuthorized(basicAuthorization("Alex Smith", "wrong"), people),
    ).toBe(false);
  });

  it("rejects malformed or incomplete credentials", () => {
    expect(isAuthorized("Basic %%%%", people)).toBe(false);
    expect(isAuthorized("Basic dXNlcm5hbWU=", people)).toBe(false);
  });
});
