import type { IASMULUnit } from "../classes/alpha-strike-unit";
import { APOCRYPHAL_RULES_LEVEL, CUSTOM_HOMEBREW_RULES_LEVEL, MUNCHKIN_RULES_LEVEL } from "../data/rules-level-options";

/** Where a unit stands: published canon, licensed but not canon, fan-made, or fan-made with no claim to balance. */
export type UnitStanding = "canon" | "apocryphal" | "custom" | "munchkin";

export const UNIT_STANDINGS: Record<UnitStanding, { label: string; description: string }> = {
    canon: { label: "Canon", description: "published by the license holder and current" },
    apocryphal: { label: "Apocryphal", description: "licensed but not canon, such as video game units" },
    custom: { label: "Custom", description: "fan-made or homebrew, meant to be balanced" },
    munchkin: { label: "Munchkin", description: "fan-made with no claim to balance" },
};

/** The standing a rules level gives (Apocryphal 5, Custom Homebrew 6, Munchkin 7), else canon. */
export function getRulesLevelStanding(rulesLevel: number): UnitStanding {
    if (rulesLevel >= MUNCHKIN_RULES_LEVEL) return "munchkin";
    if (rulesLevel >= CUSTOM_HOMEBREW_RULES_LEVEL) return "custom";
    if (rulesLevel >= APOCRYPHAL_RULES_LEVEL) return "apocryphal";
    return "canon";
}

/** A Master Unit List record's standing: the MUL's own lists are canon, our custom list is custom unless it says otherwise. */
export function getMULRecordStanding(unit: Pick<IASMULUnit, "MulSource" | "CustomInfo">): UnitStanding {
    return unit.CustomInfo?.standing ?? (unit.MulSource === "custom" || unit.CustomInfo ? "custom" : "canon");
}

/** Of two standings, the further from canon. */
export function worseStanding(a: UnitStanding, b: UnitStanding): UnitStanding {
    const order: UnitStanding[] = ["canon", "apocryphal", "custom", "munchkin"];
    return order.indexOf(a) >= order.indexOf(b) ? a : b;
}
