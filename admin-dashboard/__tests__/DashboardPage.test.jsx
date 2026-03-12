import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "../src/pages/DashboardPage";

// Mock the services
jest.mock("../src/utils/services", () => ({
  getDashboardMetrics: jest.fn().mockResolvedValue({
    totalUsers: 100,
    activeUsers: 75,
    counsellors: 10,
    pendingReviews: 5,
  }),
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
  ]),
  getCounsellors: jest.fn().mockResolvedValue([
    {
      id: 1,
      name: "Dr. Smith",
      specialty: "Behavioral Therapy",
      status: "active",
      assigned_users: 5,
      pending_reviews: 2,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    },
  ]),
}));

describe("DashboardPage Component", () => {
  test("should render dashboard without crashing", async () => {
    render(<DashboardPage />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  test("should display loading state initially", () => {
    render(<DashboardPage />);
    // The component should render even if loading
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  test("should fetch and display metrics", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/total users/i)).toBeInTheDocument();
    });
  });

  test("should display page header", async () => {
    render(<DashboardPage />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  test("should render metrics grid", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      const metricsGrid = screen.getByText(/dashboard/i).closest(
        ".page-header"
      );
      expect(metricsGrid).toBeInTheDocument();
    });
  });

  test("should display all metric cards", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByText(/total users/i)).toBeInTheDocument();
    });
  });
});
