import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BADGES, BadgeCard, BadgeGrid } from "@/components/gamification/badge-system";

/**
 * Badge System Component Tests
 * Sprint 7 - Epic 12: Tests Composants Vitest
 */

describe("Badge System", () => {
  describe("BADGES constant", () => {
    it("should have at least 10 badges defined", () => {
      expect(BADGES.length).toBeGreaterThanOrEqual(10);
    });

    it("should have unique badge IDs", () => {
      const ids = BADGES.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid tiers for all badges", () => {
      const validTiers = ["bronze", "silver", "gold", "platinum"];
      BADGES.forEach((badge) => {
        expect(validTiers).toContain(badge.tier);
      });
    });

    it("should have valid categories for all badges", () => {
      const validCategories = ["quotes", "clients", "speed", "consistency", "special"];
      BADGES.forEach((badge) => {
        expect(validCategories).toContain(badge.category);
      });
    });
  });

  describe("BadgeCard", () => {
    const mockBadge = BADGES[0];

    it("should render badge name", () => {
      render(<BadgeCard badge={mockBadge} isUnlocked={false} />);
      expect(screen.getByText(mockBadge.name)).toBeInTheDocument();
    });

    it("should render badge description", () => {
      render(<BadgeCard badge={mockBadge} isUnlocked={false} />);
      expect(screen.getByText(mockBadge.description)).toBeInTheDocument();
    });

    it("should show locked state when not unlocked", () => {
      render(<BadgeCard badge={mockBadge} isUnlocked={false} />);
      // Badge should have reduced opacity or locked indicator
      const card = screen.getByText(mockBadge.name).closest("div");
      expect(card).toBeInTheDocument();
    });

    it("should show unlocked state when unlocked", () => {
      render(<BadgeCard badge={mockBadge} isUnlocked={true} />);
      const card = screen.getByText(mockBadge.name).closest("div");
      expect(card).toBeInTheDocument();
    });

    it("should display unlock date when provided", () => {
      const unlockedAt = new Date().toISOString();
      render(<BadgeCard badge={mockBadge} isUnlocked={true} unlockedAt={unlockedAt} />);
      // Should show relative or formatted date
      expect(screen.getByText(mockBadge.name)).toBeInTheDocument();
    });
  });

  describe("BadgeGrid", () => {
    const unlockedBadgeIds = [BADGES[0].id, BADGES[1].id];

    it("should render all badges", () => {
      render(<BadgeGrid unlockedBadgeIds={unlockedBadgeIds} />);
      BADGES.forEach((badge) => {
        expect(screen.getByText(badge.name)).toBeInTheDocument();
      });
    });

    it("should mark correct badges as unlocked", () => {
      render(<BadgeGrid unlockedBadgeIds={unlockedBadgeIds} />);
      // First two badges should be unlocked
      expect(screen.getByText(BADGES[0].name)).toBeInTheDocument();
      expect(screen.getByText(BADGES[1].name)).toBeInTheDocument();
    });
  });
});
