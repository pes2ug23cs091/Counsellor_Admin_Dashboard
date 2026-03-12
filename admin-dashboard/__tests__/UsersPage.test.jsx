import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import UsersPage from "../src/pages/UsersPage";

// Mock the services
jest.mock("../src/utils/services", () => ({
  getUsers: jest.fn().mockResolvedValue([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      risk_level: "low",
      plan_status: "active",
      counsellor_id: 1,
      session_time: "9:00 AM - 10:00 AM",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      risk_level: "high",
      plan_status: "active",
      counsellor_id: 2,
      session_time: "2:00 PM - 3:00 PM",
      created_at: "2024-01-02",
      updated_at: "2024-01-02",
    },
  ]),
  getCounsellors: jest.fn().mockResolvedValue([
    {
      id: 1,
      name: "Dr. Smith",
      specialty: "Behavioral Therapy",
      status: "active",
      assigned_users: 5,
      pending_reviews: 2,
    },
  ]),
  createUser: jest.fn().mockResolvedValue({
    id: 3,
    name: "New User",
    email: "new@example.com",
  }),
  deleteUser: jest.fn().mockResolvedValue({ success: true }),
  assignCounsellor: jest.fn().mockResolvedValue({
    counsellor_id: 1,
    session_time: "10:00 AM - 11:00 AM",
  }),
}));

describe("UsersPage Component", () => {
  test("should render users page without crashing", async () => {
    render(<UsersPage />);
    expect(screen.getByText(/users/i)).toBeInTheDocument();
  });

  test("should display page header", async () => {
    render(<UsersPage />);
    expect(screen.getByText(/users/i)).toBeInTheDocument();
  });

  test("should have add user button", async () => {
    render(<UsersPage />);

    await waitFor(() => {
      const addButton = screen.getByText(/add user/i);
      expect(addButton).toBeInTheDocument();
    });
  });

  test("should render table structure", async () => {
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  test("should display search functionality", async () => {
    render(<UsersPage />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });
  });
});
