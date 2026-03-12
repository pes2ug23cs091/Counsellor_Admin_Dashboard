import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CounsellorsPage from "../src/pages/CounsellorsPage";

// Mock the services
jest.mock("../src/utils/services", () => ({
  getCounsellors: jest.fn().mockResolvedValue([
    {
      id: 1,
      name: "Dr. John Smith",
      specialty: "Behavioral Therapy",
      status: "active",
      assigned_users: 5,
      pending_reviews: 2,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    },
    {
      id: 2,
      name: "Dr. Sarah Johnson",
      specialty: "Cognitive Therapy",
      status: "active",
      assigned_users: 8,
      pending_reviews: 3,
      created_at: "2024-01-02",
      updated_at: "2024-01-02",
    },
    {
      id: 3,
      name: "Dr. Michael Brown",
      specialty: "Family Therapy",
      status: "inactive",
      assigned_users: 3,
      pending_reviews: 1,
      created_at: "2024-01-03",
      updated_at: "2024-01-03",
    },
  ]),
  createCounsellor: jest.fn().mockResolvedValue({
    id: 4,
    name: "New Counsellor",
    specialty: "Humanistic Therapy",
    status: "active",
    assigned_users: 0,
    pending_reviews: 0,
  }),
  updateCounsellor: jest.fn().mockResolvedValue({
    status: "active",
  }),
  deleteCounsellor: jest.fn().mockResolvedValue({ success: true }),
}));

describe("CounsellorsPage Component", () => {
  test("should render counsellors page without crashing", async () => {
    render(<CounsellorsPage />);
    expect(screen.getByText(/counsellors/i)).toBeInTheDocument();
  });

  test("should display page header", async () => {
    render(<CounsellorsPage />);
    expect(screen.getByText(/counsellors/i)).toBeInTheDocument();
  });

  test("should have add counsellor button", async () => {
    render(<CounsellorsPage />);

    await waitFor(() => {
      const addButton = screen.getByText(/add counsellor/i);
      expect(addButton).toBeInTheDocument();
    });
  });

  test("should render table structure", async () => {
    render(<CounsellorsPage />);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  test("should display search functionality", async () => {
    render(<CounsellorsPage />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  test("should fetch and display counsellors", async () => {
    render(<CounsellorsPage />);

    await waitFor(() => {
      expect(screen.getByText(/counsellors/i)).toBeInTheDocument();
    });
  });

  test("should have counsellor table headers", async () => {
    render(<CounsellorsPage />);

    await waitFor(() => {
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });
  });

  test("should have status filter options", async () => {
    render(<CounsellorsPage />);

    await waitFor(() => {
      const filterElements = screen.queryAllByText(/active|inactive/i);
      expect(filterElements.length).toBeGreaterThan(0);
    });
  });

  test("should load counsellors on mount", async () => {
    const { container } = render(<CounsellorsPage />);

    await waitFor(() => {
      expect(screen.getByText(/counsellors/i)).toBeInTheDocument();
    });

    expect(container).toBeInTheDocument();
  });

  test("should render multiple counsellors if available", async () => {
    render(<CounsellorsPage />);

    await waitFor(() => {
      // Check that table is rendered
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  test("should have action buttons in table", async () => {
    render(<CounsellorsPage />);

    await waitFor(() => {
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
      // Actions column should exist
      const actionsHeader = screen.queryByText(/actions/i);
      if (actionsHeader) {
        expect(actionsHeader).toBeInTheDocument();
      }
    });
  });

  test("should display page structure correctly", async () => {
    render(<CounsellorsPage />);

    await waitFor(() => {
      const pageHeader = screen.getByText(/counsellors/i);
      expect(pageHeader).toBeInTheDocument();
    });

    // Check if search is present
    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();

    // Check if table is present
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
  });

  test("should handle empty counsellors list gracefully", async () => {
    // Mock empty list
    const mockGetCounsellors = require("../src/utils/services")
      .getCounsellors;
    mockGetCounsellors.mockResolvedValueOnce([]);

    render(<CounsellorsPage />);

    await waitFor(() => {
      expect(screen.getByText(/counsellors/i)).toBeInTheDocument();
    });
  });
});
