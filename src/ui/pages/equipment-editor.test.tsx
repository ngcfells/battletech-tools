import { describe, expect, it } from "vitest";
import { formatRecordEditions } from "./equipment-editor";

describe("formatRecordEditions", () => {
    it("names each edition with the record's rules level in it", () => {
        expect(formatRecordEditions({ editions: ["total-warfare"], rulesLevel: 3 })).toBe("Total Warfare (Advanced)");
    });

    it("says a record with no editions was never canon", () => {
        expect(formatRecordEditions({ editions: [] })).toBe("Never canon");
    });
});
