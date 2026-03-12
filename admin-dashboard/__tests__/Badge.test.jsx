import React from "react";
import { render, screen } from "@testing-library/react";
import Badge from "../src/components/Badge";

describe("Badge Component", () => {
  test("should render badge with text", () => {
    render(<Badge text="Low" color="green" />);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  test("should render with correct color class", () => {
    const { container } = render(<Badge text="Medium" color="yellow" />);
    const badge = container.querySelector(".badge");
    expect(badge).toHaveClass("badge-medium");
  });

  test("should render with low risk level styling", () => {
    const { container } = render(<Badge text="Low" color="green" />);
    const badge = container.querySelector(".badge");
    expect(badge).toHaveClass("badge-low");
  });

  test("should render with high risk level styling", () => {
    const { container } = render(<Badge text="High" color="red" />);
    const badge = container.querySelector(".badge");
    expect(badge).toHaveClass("badge-high");
  });

  test("should have correct text content", () => {
    render(<Badge text="Active" color="green" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  test("should render multiple badges independently", () => {
    render(
      <>
        <Badge text="Low" color="green" />
        <Badge text="High" color="red" />
      </>
    );
    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});
