import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Container } from "./Container";
import styles from "./Container.module.css";

describe("Container", () => {
  it("renders children", () => {
    const { getByText } = render(<Container>hello</Container>);
    expect(getByText("hello")).toBeInTheDocument();
  });

  it("applies the matching width class for each width variant", () => {
    const wide = render(<Container width="wide">wide</Container>);
    expect(wide.container.firstElementChild).toHaveClass(styles.wide as string);

    const content = render(<Container width="content">content</Container>);
    expect(content.container.firstElementChild).toHaveClass(styles.content as string);

    const full = render(<Container width="full">full</Container>);
    expect(full.container.firstElementChild).toHaveClass(styles.full as string);
  });
});
