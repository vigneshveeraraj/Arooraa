import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("allows the public site and points to the production sitemap", () => {
    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0]! : result.rules;
    expect(rule.userAgent).toBe("*");
    expect(rule.allow).toBe("/");
    expect(result.sitemap).toBe("https://arooraa.com/sitemap.xml");
  });

  it("disallows admin and the internal design-system page", () => {
    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0]! : result.rules;
    const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
    expect(disallow).toContain("/admin");
    expect(disallow).toContain("/design-system");
  });

  it("never references localhost", () => {
    const result = robots();
    expect(JSON.stringify(result)).not.toMatch(/localhost/);
  });
});
