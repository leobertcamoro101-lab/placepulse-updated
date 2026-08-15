import { describe, it, expect } from "vitest";
import {
  validate,
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
  VALIDATOR_MAXLENGTH,
  VALIDATOR_MIN,
  VALIDATOR_MAX,
  VALIDATOR_EMAIL,
  VALIDATOR_FILE,
} from "./validators";

describe("validator factory functions", () => {
  it("VALIDATOR_REQUIRE returns the REQUIRE type", () => {
    expect(VALIDATOR_REQUIRE()).toEqual({ type: "REQUIRE" });
  });

  it("VALIDATOR_FILE returns the FILE type", () => {
    expect(VALIDATOR_FILE()).toEqual({ type: "FILE" });
  });

  it("VALIDATOR_MINLENGTH carries its val", () => {
    expect(VALIDATOR_MINLENGTH(6)).toEqual({ type: "MINLENGTH", val: 6 });
  });

  it("VALIDATOR_MAXLENGTH carries its val", () => {
    expect(VALIDATOR_MAXLENGTH(20)).toEqual({ type: "MAXLENGTH", val: 20 });
  });

  it("VALIDATOR_MIN carries its val", () => {
    expect(VALIDATOR_MIN(1)).toEqual({ type: "MIN", val: 1 });
  });

  it("VALIDATOR_MAX carries its val", () => {
    expect(VALIDATOR_MAX(100)).toEqual({ type: "MAX", val: 100 });
  });

  it("VALIDATOR_EMAIL returns the EMAIL type", () => {
    expect(VALIDATOR_EMAIL()).toEqual({ type: "EMAIL" });
  });
});

describe("validate()", () => {
  it("returns true when no validators are given", () => {
    expect(validate("", [])).toBe(true);
    expect(validate("anything", [])).toBe(true);
  });

  describe("REQUIRE", () => {
    const validators = [VALIDATOR_REQUIRE()];

    it("passes for a non-empty value", () => {
      expect(validate("hello", validators)).toBe(true);
    });

    it("fails for an empty string", () => {
      expect(validate("", validators)).toBe(false);
    });

    it("fails for a whitespace-only string", () => {
      expect(validate("   ", validators)).toBe(false);
    });
  });

  describe("MINLENGTH", () => {
    const validators = [VALIDATOR_MINLENGTH(6)];

    it("passes for a value at exactly the minimum length", () => {
      expect(validate("123456", validators)).toBe(true);
    });

    it("passes for a value longer than the minimum", () => {
      expect(validate("1234567", validators)).toBe(true);
    });

    it("fails for a value shorter than the minimum", () => {
      expect(validate("12345", validators)).toBe(false);
    });

    it("trims whitespace before measuring length", () => {
      expect(validate("  123  ", validators)).toBe(false); // trims to "123", length 3
      expect(validate("  123456  ", validators)).toBe(true); // trims to "123456", length 6
    });
  });

  describe("MAXLENGTH", () => {
    const validators = [VALIDATOR_MAXLENGTH(5)];

    it("passes for a value at exactly the maximum length", () => {
      expect(validate("12345", validators)).toBe(true);
    });

    it("passes for a value shorter than the maximum", () => {
      expect(validate("123", validators)).toBe(true);
    });

    it("fails for a value longer than the maximum", () => {
      expect(validate("123456", validators)).toBe(false);
    });
  });

  describe("MIN", () => {
    const validators = [VALIDATOR_MIN(10)];

    it("passes for a numeric value at exactly the minimum", () => {
      expect(validate("10", validators)).toBe(true);
    });

    it("passes for a numeric value above the minimum", () => {
      expect(validate("15", validators)).toBe(true);
    });

    it("fails for a numeric value below the minimum", () => {
      expect(validate("5", validators)).toBe(false);
    });

    it("fails for a non-numeric value (coerces to NaN)", () => {
      expect(validate("not-a-number", validators)).toBe(false);
    });
  });

  describe("MAX", () => {
    const validators = [VALIDATOR_MAX(100)];

    it("passes for a numeric value at exactly the maximum", () => {
      expect(validate("100", validators)).toBe(true);
    });

    it("passes for a numeric value below the maximum", () => {
      expect(validate("50", validators)).toBe(true);
    });

    it("fails for a numeric value above the maximum", () => {
      expect(validate("101", validators)).toBe(false);
    });
  });

  describe("EMAIL", () => {
    const validators = [VALIDATOR_EMAIL()];

    it("passes a plausible email address", () => {
      expect(validate("test@example.com", validators)).toBe(true);
    });

    it("fails a value with no @ symbol", () => {
      expect(validate("testexample.com", validators)).toBe(false);
    });

    it("fails a value with no domain dot", () => {
      expect(validate("test@example", validators)).toBe(false);
    });

    it("fails a value with a space", () => {
      expect(validate("test @example.com", validators)).toBe(false);
    });

    it("fails an empty string", () => {
      expect(validate("", validators)).toBe(false);
    });
  });

  describe("combining multiple validators", () => {
    const validators = [VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(3), VALIDATOR_MAXLENGTH(10)];

    it("passes when all validators are satisfied", () => {
      expect(validate("hello", validators)).toBe(true);
    });

    it("fails when any single validator is not satisfied", () => {
      expect(validate("hi", validators)).toBe(false); // too short
      expect(validate("this is way too long", validators)).toBe(false); // too long
      expect(validate("", validators)).toBe(false); // empty
    });
  });
});
