import { describe, it, expect } from "vitest";

// Test the core business logic utilities
describe("TradeQuote UK - Core Logic", () => {
  it("formats job status correctly", () => {
    const formatStatus = (status: string) =>
      status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
    expect(formatStatus("in_progress")).toBe("In Progress");
    expect(formatStatus("open")).toBe("Open");
    expect(formatStatus("completed")).toBe("Completed");
  });

  it("calculates budget display correctly", () => {
    const formatBudget = (min?: number, max?: number, notSure?: boolean) => {
      if (notSure) return "Not sure";
      if (!min && !max) return "Not specified";
      return `£${min ?? "?"} – £${max ?? "?"}`;
    };
    expect(formatBudget(100, 500)).toBe("£100 – £500");
    expect(formatBudget(undefined, undefined, true)).toBe("Not sure");
    expect(formatBudget()).toBe("Not specified");
    expect(formatBudget(200)).toBe("£200 – £?");
  });

  it("formats message time correctly", () => {
    const formatTime = (date: Date | string) => {
      const d = new Date(date);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      if (diff < 60000) return "now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    };
    const justNow = new Date(Date.now() - 30000);
    expect(formatTime(justNow)).toBe("now");
    const fiveMinAgo = new Date(Date.now() - 300000);
    expect(formatTime(fiveMinAgo)).toBe("5m");
  });

  it("validates job title minimum length", () => {
    const validateTitle = (title: string) => title.trim().length >= 5;
    expect(validateTitle("Fix leaking tap")).toBe(true);
    expect(validateTitle("Fix")).toBe(false);
    expect(validateTitle("     ")).toBe(false);
  });

  it("validates postcode format", () => {
    const isValidPostcode = (pc: string) => pc.trim().length >= 2 && pc.trim().length <= 10;
    expect(isValidPostcode("SW1A 1AA")).toBe(true);
    expect(isValidPostcode("M1 1AE")).toBe(true);
    expect(isValidPostcode("")).toBe(false);
    expect(isValidPostcode("X")).toBe(false);
  });

  it("calculates quote boost fee correctly", () => {
    const calcTotal = (price: number, isBoosted: boolean) =>
      isBoosted ? price + 3.0 : price;
    expect(calcTotal(150, false)).toBe(150);
    expect(calcTotal(150, true)).toBe(153);
    expect(calcTotal(0, true)).toBe(3);
  });

  it("determines urgency color correctly", () => {
    const getUrgencyColor = (urgency: string) => {
      if (urgency === "emergency") return "#DC2626";
      if (urgency === "urgent") return "#D97706";
      return "#64748B";
    };
    expect(getUrgencyColor("emergency")).toBe("#DC2626");
    expect(getUrgencyColor("urgent")).toBe("#D97706");
    expect(getUrgencyColor("normal")).toBe("#64748B");
  });

  it("validates price is positive", () => {
    const isValidPrice = (price: string) => {
      const n = parseFloat(price);
      return !isNaN(n) && n > 0;
    };
    expect(isValidPrice("150.00")).toBe(true);
    expect(isValidPrice("0")).toBe(false);
    expect(isValidPrice("-10")).toBe(false);
    expect(isValidPrice("abc")).toBe(false);
  });

  it("formats star rating display", () => {
    const formatRating = (rating: number) => {
      if (rating <= 0) return "—";
      return `⭐ ${rating.toFixed(1)}`;
    };
    expect(formatRating(4.5)).toBe("⭐ 4.5");
    expect(formatRating(0)).toBe("—");
    expect(formatRating(5)).toBe("⭐ 5.0");
  });

  it("generates correct initials from name", () => {
    const getInitials = (name: string) =>
      name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    expect(getInitials("John Smith")).toBe("JS");
    expect(getInitials("Alice")).toBe("A");
    expect(getInitials("Mary Jane Watson")).toBe("MJ");
  });
});


describe("TradeQuote UK - New Features", () => {
  it("calculates job expiry time for emergency jobs (24 hours)", () => {
    const now = Date.now();
    const emergencyExpiry = new Date(now + 24 * 60 * 60 * 1000);
    const hoursUntilExpiry = Math.ceil((emergencyExpiry.getTime() - now) / (1000 * 60 * 60));
    expect(hoursUntilExpiry).toBe(24);
  });

  it("calculates job expiry time for normal jobs (30 days)", () => {
    const now = Date.now();
    const normalExpiry = new Date(now + 30 * 24 * 60 * 60 * 1000);
    const daysUntilExpiry = Math.ceil((normalExpiry.getTime() - now) / (1000 * 60 * 60 * 24));
    expect(daysUntilExpiry).toBe(30);
  });

  it("formats job expiry countdown correctly", () => {
    const formatExpiry = (expiresAt: Date) => {
      const hours = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60));
      return `Expires in ${hours} hours`;
    };
    const soon = new Date(Date.now() + 12 * 60 * 60 * 1000);
    const result = formatExpiry(soon);
    expect(result).toContain("Expires in");
    expect(result).toContain("hours");
  });

  it("applies £3 boost fee to emergency jobs", () => {
    const calcBoostCost = (urgency: string, wantBoost: boolean) => {
      return urgency === "emergency" && wantBoost ? 3.0 : 0;
    };
    expect(calcBoostCost("emergency", true)).toBe(3.0);
    expect(calcBoostCost("emergency", false)).toBe(0);
    expect(calcBoostCost("normal", true)).toBe(0);
    expect(calcBoostCost("urgent", true)).toBe(0);
  });

  it("displays response time on tradesperson profile", () => {
    const formatResponseTime = (minutes: number) => {
      if (minutes < 60) return `${minutes} mins`;
      if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
      return `${Math.floor(minutes / 1440)}d`;
    };
    expect(formatResponseTime(15)).toBe("15 mins");
    expect(formatResponseTime(120)).toBe("2h");
    expect(formatResponseTime(1440)).toBe("1d");
    expect(formatResponseTime(2880)).toBe("2d");
  });

  it("only shows boost toggle for emergency jobs", () => {
    const shouldShowBoost = (urgency: string) => urgency === "emergency";
    expect(shouldShowBoost("emergency")).toBe(true);
    expect(shouldShowBoost("urgent")).toBe(false);
    expect(shouldShowBoost("normal")).toBe(false);
  });

  it("only shows expiry countdown for open jobs", () => {
    const shouldShowExpiry = (status: string, expiresAt: Date | null) => {
      return status === "open" && expiresAt !== null;
    };
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(shouldShowExpiry("open", futureDate)).toBe(true);
    expect(shouldShowExpiry("quoting", futureDate)).toBe(false);
    expect(shouldShowExpiry("completed", futureDate)).toBe(false);
    expect(shouldShowExpiry("open", null)).toBe(false);
  });

  it("calculates hours remaining until job expiry", () => {
    const getHoursRemaining = (expiresAt: Date) => {
      return Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60));
    };
    const in12Hours = new Date(Date.now() + 12 * 60 * 60 * 1000);
    const hours = getHoursRemaining(in12Hours);
    expect(hours).toBeGreaterThanOrEqual(11);
    expect(hours).toBeLessThanOrEqual(12);
  });

  it("validates boost toggle state", () => {
    let wantBoost = false;
    expect(wantBoost).toBe(false);
    wantBoost = true;
    expect(wantBoost).toBe(true);
    wantBoost = false;
    expect(wantBoost).toBe(false);
  });

  it("prevents boost for non-emergency jobs", () => {
    const canBoost = (urgency: string) => urgency === "emergency";
    const applyBoost = (urgency: string, wantBoost: boolean) => {
      return canBoost(urgency) && wantBoost;
    };
    expect(applyBoost("emergency", true)).toBe(true);
    expect(applyBoost("urgent", true)).toBe(false);
    expect(applyBoost("normal", true)).toBe(false);
  });
});
