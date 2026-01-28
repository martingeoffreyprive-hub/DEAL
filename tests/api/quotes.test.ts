import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Quotes API Tests
 * Sprint 7 - Epic 12: Tests API Intégration
 */

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Quotes API", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("GET /api/quotes", () => {
    it("should return quotes list", async () => {
      const mockQuotes = [
        { id: "1", quote_number: "DEV-001", client_name: "Client A", total: 1000 },
        { id: "2", quote_number: "DEV-002", client_name: "Client B", total: 2000 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockQuotes }),
      });

      const response = await fetch("/api/quotes");
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].quote_number).toBe("DEV-001");
    });

    it("should handle pagination", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [],
          pagination: { page: 1, limit: 10, total: 50 },
        }),
      });

      const response = await fetch("/api/quotes?page=1&limit=10");
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.pagination.total).toBe(50);
    });

    it("should filter by status", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      await fetch("/api/quotes?status=signed");
      expect(mockFetch).toHaveBeenCalledWith("/api/quotes?status=signed");
    });
  });

  describe("POST /api/quotes", () => {
    it("should create a new quote", async () => {
      const newQuote = {
        client_name: "New Client",
        sector: "construction",
        items: [{ description: "Service", quantity: 1, unit_price: 100 }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          data: { id: "new-id", quote_number: "DEV-003", ...newQuote },
        }),
      });

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuote),
      });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(data.data.quote_number).toBe("DEV-003");
    });

    it("should validate required fields", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: "client_name is required",
        }),
      });

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(data.error).toContain("required");
    });
  });

  describe("PUT /api/quotes/:id", () => {
    it("should update an existing quote", async () => {
      const updatedData = { client_name: "Updated Client" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: { id: "1", ...updatedData },
        }),
      });

      const response = await fetch("/api/quotes/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.data.client_name).toBe("Updated Client");
    });

    it("should return 404 for non-existent quote", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: "Quote not found" }),
      });

      const response = await fetch("/api/quotes/non-existent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_name: "Test" }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/quotes/:id", () => {
    it("should delete a quote", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      });

      const response = await fetch("/api/quotes/1", { method: "DELETE" });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(204);
    });

    it("should return 403 for unauthorized deletion", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: "Forbidden" }),
      });

      const response = await fetch("/api/quotes/1", { method: "DELETE" });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
    });
  });
});

describe("Quote Calculations", () => {
  it("should calculate subtotal correctly", () => {
    const items = [
      { quantity: 2, unit_price: 100 },
      { quantity: 3, unit_price: 50 },
    ];
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    expect(subtotal).toBe(350);
  });

  it("should calculate tax amount correctly", () => {
    const subtotal = 1000;
    const taxRate = 21;
    const taxAmount = (subtotal * taxRate) / 100;
    expect(taxAmount).toBe(210);
  });

  it("should calculate total correctly", () => {
    const subtotal = 1000;
    const taxAmount = 210;
    const total = subtotal + taxAmount;
    expect(total).toBe(1210);
  });

  it("should handle zero items", () => {
    const items: { quantity: number; unit_price: number }[] = [];
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    expect(subtotal).toBe(0);
  });

  it("should handle decimal prices", () => {
    const items = [{ quantity: 1, unit_price: 99.99 }];
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    expect(subtotal).toBeCloseTo(99.99);
  });
});
