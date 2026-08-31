import { describe, expect, it } from "vitest";
import { groupProjectEnquiryFields } from "./project-enquiry-sections";

describe("groupProjectEnquiryFields", () => {
  it("groups a guided enquiry's fields into the expected sections, with no legacy-only fields present", () => {
    const { sections, attribution, additional } = groupProjectEnquiryFields({
      "Submission type": "Guided",
      "Solution model": "New Product",
      "Engagement model": "Discover Define",
      "Problem statement": "We want to launch a new ordering app.",
      "Project stage": "Exploring",
      "Product types": "Saas Platform",
      Timeline: "Within 3 To 6 Months",
      "Budget range": "Under 5l",
      "Preferred contact time": "Afternoon",
      "WhatsApp consent": "No",
      "Preferred contact method": "Email",
      "Country code": "IN",
      Source: "WEBSITE",
      "Source page": "/start-project",
    });

    const byTitle = Object.fromEntries(sections.map((s) => [s.title, s.rows]));
    expect(byTitle["Project Direction"]).toEqual([{ label: "Solution model", value: "New Product" }]);
    expect(byTitle["Problem / Opportunity"]).toEqual([
      { label: "Problem statement", value: "We want to launch a new ordering app." },
    ]);
    expect(byTitle["Stage"]).toEqual([{ label: "Project stage", value: "Exploring" }]);
    expect(byTitle["Service type"]).toBeUndefined();
    expect(byTitle["Description"]).toBeUndefined();

    expect(attribution.rows).toEqual([
      { label: "Source", value: "WEBSITE" },
      { label: "Source page", value: "/start-project" },
    ]);
    // "Submission type" is rendered in the header, never duplicated in the body.
    expect(additional.rows.find((r) => r.label === "Submission type")).toBeUndefined();
  });

  it("groups a legacy enquiry's fields, with no guided-only fields present", () => {
    const { sections } = groupProjectEnquiryFields({
      "Submission type": "Legacy",
      "Service type": "Custom Software",
      "Project type": "New Product",
      Description: "We need a logistics tracking platform.",
      "Existing system": "No",
      "Budget range": "From 2l To 5l",
      Timeline: "From 1 To 3 Months",
      "Preferred contact method": "Phone",
      "WhatsApp consent": "No",
    });

    const byTitle = Object.fromEntries(sections.map((s) => [s.title, s.rows]));
    expect(byTitle["Project Direction"]).toEqual([
      { label: "Service type", value: "Custom Software" },
      { label: "Project type", value: "New Product" },
    ]);
    expect(byTitle["Problem / Opportunity"]).toEqual([{ label: "Description", value: "We need a logistics tracking platform." }]);
    expect(byTitle["Stage"]).toEqual([{ label: "Existing system", value: "No" }]);
    expect(byTitle["Solution model"]).toBeUndefined();
    expect(byTitle["Engagement"]).toBeUndefined();
    expect(byTitle["Products / Platforms"]).toBeUndefined();
  });

  it("never drops an unrecognized field — it falls into Additional details instead of disappearing", () => {
    const { additional } = groupProjectEnquiryFields({
      "Submission type": "Guided",
      "Some Future Field": "future value",
    });

    expect(additional.rows).toEqual([{ label: "Some Future Field", value: "future value" }]);
  });

  it("produces no sections at all for an empty field map", () => {
    const { sections, attribution, additional } = groupProjectEnquiryFields({});
    expect(sections).toEqual([]);
    expect(attribution.rows).toEqual([]);
    expect(additional.rows).toEqual([]);
  });
});
