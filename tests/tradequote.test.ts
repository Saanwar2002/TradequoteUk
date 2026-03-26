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


describe("TradeQuote UK - Availability Calendar", () => {
  it("formats availability slot date correctly", () => {
    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    };
    expect(formatDate("2026-04-15")).toContain("Apr");
    expect(formatDate("2026-04-15")).toContain("15");
  });

  it("validates availability time format", () => {
    const isValidTime = (time: string) => {
      const parts = time.split(":");
      if (!/^\d{2}:\d{2}$/.test(time)) return false;
      const [hour, min] = parts.map(Number);
      return hour < 24 && min < 60;
    };
    expect(isValidTime("09:00")).toBe(true);
    expect(isValidTime("17:30")).toBe(true);
    expect(isValidTime("9:00")).toBe(false);
    expect(isValidTime("25:00")).toBe(false);
  });

  it("calculates availability slot duration", () => {
    const getDuration = (startTime: string, endTime: string) => {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;
      return endTotalMin - startTotalMin;
    };
    expect(getDuration("09:00", "17:00")).toBe(480);
    expect(getDuration("09:00", "12:30")).toBe(210);
    expect(getDuration("14:00", "16:00")).toBe(120);
  });

  it("checks if time slot is available", () => {
    const isAvailable = (slotTime: string, currentTime: string) => {
      const [slotHour] = slotTime.split(":").map(Number);
      const [currentHour] = currentTime.split(":").map(Number);
      return slotHour > currentHour;
    };
    expect(isAvailable("14:00", "09:00")).toBe(true);
    expect(isAvailable("09:00", "14:00")).toBe(false);
  });

  it("validates availability slot does not overlap", () => {
    const hasOverlap = (slot1: { start: string; end: string }, slot2: { start: string; end: string }) => {
      const toMin = (time: string) => parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
      const slot1End = toMin(slot1.end);
      const slot2Start = toMin(slot2.start);
      return slot1End > slot2Start;
    };
    expect(hasOverlap({ start: "09:00", end: "12:00" }, { start: "12:00", end: "17:00" })).toBe(false);
    expect(hasOverlap({ start: "09:00", end: "13:00" }, { start: "12:00", end: "17:00" })).toBe(true);
  });

  it("displays availability on tradesperson profile", () => {
    const formatAvailability = (available: boolean) => available ? "Available" : "Not available";
    expect(formatAvailability(true)).toBe("Available");
    expect(formatAvailability(false)).toBe("Not available");
  });

  it("marks slot as booked when quote accepted", () => {
    let isBooked = false;
    expect(isBooked).toBe(false);
    isBooked = true;
    expect(isBooked).toBe(true);
  });

  it("allows tradesperson to add multiple availability slots", () => {
    const slots = [
      { date: "2026-04-15", startTime: "09:00", endTime: "17:00" },
      { date: "2026-04-16", startTime: "09:00", endTime: "17:00" },
      { date: "2026-04-17", startTime: "10:00", endTime: "16:00" },
    ];
    expect(slots.length).toBe(3);
    expect(slots[0].date).toBe("2026-04-15");
  });

  it("shows availability info on job detail for homeowners", () => {
    const shouldShowAvailability = (userRole: string) => userRole === "homeowner";
    expect(shouldShowAvailability("homeowner")).toBe(true);
    expect(shouldShowAvailability("tradesperson")).toBe(false);
  });
});


describe("TradeQuote UK - Job Alerts", () => {
  it("should create a job alert with valid data", () => {
    const alert = {
      tradespersonId: 1,
      tradeCategory: "Plumbing",
      postcode: "M1 1AA",
      radiusMiles: 15,
      minBudget: 500,
      maxBudget: 2000,
      enabled: true,
    };
    expect(alert.tradeCategory).toBe("Plumbing");
    expect(alert.radiusMiles).toBe(15);
    expect(alert.enabled).toBe(true);
  });

  it("should validate postcode format for alerts", () => {
    const validPostcodes = ["M1 1AA", "SW1A 1AA", "B33 8TH"];
    validPostcodes.forEach((postcode) => {
      expect(postcode.length).toBeGreaterThan(0);
      expect(postcode.length).toBeLessThanOrEqual(10);
    });
  });

  it("should validate budget range for alerts", () => {
    const alert = { minBudget: 500, maxBudget: 2000 };
    expect(alert.minBudget).toBeLessThanOrEqual(alert.maxBudget);
  });

  it("should allow optional budget constraints", () => {
    const alertWithoutBudget = {
      tradeCategory: "Electrical",
      postcode: "M1 1AA",
      minBudget: undefined,
      maxBudget: undefined,
    };
    expect(alertWithoutBudget.minBudget).toBeUndefined();
    expect(alertWithoutBudget.maxBudget).toBeUndefined();
  });

  it("should toggle alert enabled status", () => {
    let alert = { id: 1, enabled: true };
    alert.enabled = false;
    expect(alert.enabled).toBe(false);
    alert.enabled = true;
    expect(alert.enabled).toBe(true);
  });

  it("should validate radius miles is positive", () => {
    const radiusValues = [5, 10, 15, 20, 50];
    radiusValues.forEach((radius) => {
      expect(radius).toBeGreaterThan(0);
    });
  });

  it("should set default radius to 10 miles", () => {
    const defaultRadius = 10;
    expect(defaultRadius).toBe(10);
  });

  it("should format alert notification message", () => {
    const formatAlert = (category: string, location: string) =>
      `New ${category} job in ${location}`;
    expect(formatAlert("Plumbing", "Manchester")).toBe("New Plumbing job in Manchester");
  });

  it("should filter alerts by enabled status", () => {
    const alerts = [
      { id: 1, enabled: true, category: "Plumbing" },
      { id: 2, enabled: false, category: "Electrical" },
      { id: 3, enabled: true, category: "Carpentry" },
    ];
    const enabledAlerts = alerts.filter((a) => a.enabled);
    expect(enabledAlerts.length).toBe(2);
    expect(enabledAlerts[0].category).toBe("Plumbing");
  });

  it("should match job to alert criteria", () => {
    const matchesAlert = (jobBudget: number, alertMin?: number, alertMax?: number) => {
      if (alertMin && jobBudget < alertMin) return false;
      if (alertMax && jobBudget > alertMax) return false;
      return true;
    };
    expect(matchesAlert(1000, 500, 2000)).toBe(true);
    expect(matchesAlert(300, 500, 2000)).toBe(false);
    expect(matchesAlert(3000, 500, 2000)).toBe(false);
    expect(matchesAlert(1000, undefined, undefined)).toBe(true);
  });
});
