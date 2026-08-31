import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound, { metadata } from "./not-found";

describe("not-found page", () => {
  it("renders exactly one H1 explaining the page is missing", () => {
    render(<NotFound />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/page not found/i);
  });

  it("offers a restrained way back: Home, Products, Start a Project", () => {
    render(<NotFound />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("is never indexed", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
