import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "../src/components/SearchBar";

describe("SearchBar Component", () => {
  test("should render search input", () => {
    render(<SearchBar onSearch={() => {}} />);
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
  });

  test("should call onSearch when typing", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/search/i);

    fireEvent.change(input, { target: { value: "test query" } });
    expect(mockOnSearch).toHaveBeenCalledWith("test query");
  });

  test("should have correct placeholder text", () => {
    render(<SearchBar onSearch={() => {}} />);
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toHaveAttribute("placeholder");
  });

  test("should update input value when typing", () => {
    render(<SearchBar onSearch={() => {}} />);
    const input = screen.getByPlaceholderText(/search/i);

    fireEvent.change(input, { target: { value: "John Doe" } });
    expect(input.value).toBe("John Doe");
  });

  test("should clear input when cleared", () => {
    render(<SearchBar onSearch={() => {}} />);
    const input = screen.getByPlaceholderText(/search/i);

    fireEvent.change(input, { target: { value: "test" } });
    expect(input.value).toBe("test");

    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");
  });

  test("should call onSearch multiple times", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/search/i);

    fireEvent.change(input, { target: { value: "first" } });
    fireEvent.change(input, { target: { value: "second" } });
    fireEvent.change(input, { target: { value: "third" } });

    expect(mockOnSearch).toHaveBeenCalledTimes(3);
  });
});
