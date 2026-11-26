import { describe, expect, it } from "vitest";
import { isBasicAuthAuthorized } from "./basic-auth";

const people = [{ name: "Alex Smith", color: "#26734D" }];

const basicAuthorization = (username: string, password: string) =>
  `Basic ${btoa(`${username}:${password}`)}`;

describe("isBasicAuthAuthorized", () => {
  it("accepts a configured person's name regardless of case", () => {
    expect(
      isBasicAuthAuthorized(
        basicAuthorization("aLeX sMiTh", "secret"),
        "secret",
        people,
      ),
    ).toBe(true);
  });

  it("rejects unknown names and incorrect passwords", () => {
    expect(
      isBasicAuthAuthorized(
        basicAuthorization("Unknown Person", "secret"),
        "secret",
        people,
      ),
    ).toBe(false);
    expect(
      isBasicAuthAuthorized(
        basicAuthorization("Alex Smith", "wrong"),
        "secret",
        people,
      ),
    ).toBe(false);
  });

  it("rejects malformed or incomplete credentials", () => {
    expect(isBasicAuthAuthorized("Basic %%%%", "secret", people)).toBe(false);
    expect(
      isBasicAuthAuthorized("Basic dXNlcm5hbWU=", "secret", people),
    ).toBe(false);
  });
});
