import { describe, expect, it } from "vitest";
import { BattleMech } from "./battlemech";

describe("Alpha Strike heat-modified damage", () => {
    it("two LRM 5s on a cool 'Mech do not gain short-range damage (issue 62)", () => {
        const mech = new BattleMech();
        mech.setTonnage(50);
        mech.addEquipmentFromTag("lrm-5", "is", "rt", false, undefined, "", false, [], undefined, undefined);
        mech.addEquipmentFromTag("lrm-5", "is", "lt", false, undefined, "", false, [], undefined, undefined);
        expect(mech.getAlphaStrikeForceStats().damage.short).toBeLessThanOrEqual(1);
    });
});

// ASC p.101, Ammunition: under 10 shots a weapon's damage is x 0.75 (20 for an Ultra autocannon, 60 for a Rotary); a
// one-shot launcher is x 0.1. Checked against the MUL cards of the Clan LRM 20 'Mechs (Bowman, Naja, Atlas C).
describe("Alpha Strike low-ammunition damage (ASC p.101)", () => {
    const clanMech = (launcher: string, ammoTag: string, ammoTons: number, launchers = 1): BattleMech => {
        const mech = new BattleMech();
        mech.setTech("clan");
        mech.setTonnage(50);
        mech.setWalkSpeed(4);
        for (let count = 0; count < launchers; count++) {
            mech.addEquipmentFromTag(launcher, "clan", count === 0 ? "rt" : "lt", false, undefined, "", false, [], undefined, undefined);
        }
        for (let ton = 0; ton < ammoTons; ton++) {
            mech.addEquipmentFromTag(ammoTag, "clan", "lt", false, undefined, "", false, [], undefined, undefined);
        }
        return mech;
    };

    it("a Clan LRM 20 with 6 shots is x 0.75: 1.2 becomes 0.9, a damage of 1 at every range", () => {
        const damage = clanMech("clan-lrm-20", "ammo-lrm-standard", 1).getAlphaStrikeForceStats().damage;
        expect([damage.short, damage.medium, damage.long]).toEqual([1, 1, 1]);
    });

    it("a Clan LRM 20 with 12 shots is not reduced: 1.2 rounds up to 2", () => {
        const damage = clanMech("clan-lrm-20", "ammo-lrm-standard", 2).getAlphaStrikeForceStats().damage;
        expect([damage.short, damage.medium, damage.long]).toEqual([2, 2, 2]);
    });

    it("two Clan UAC/20s with 15 shots each are x 0.75 (an Ultra needs 20): 6 becomes 4.5, a 5, against 6 at 20 shots", () => {
        // 2 x 3 = 6 at Short and Medium; Ultra ammunition is 5 shots a ton. 6 tons are 30 shots (15 each), 8 tons are 40 (20 each).
        const low = clanMech("clan-autocannon-uac-20", "ammo-clan-ultra-ac-20-standard", 6, 2).getAlphaStrikeForceStats();
        const full = clanMech("clan-autocannon-uac-20", "ammo-clan-ultra-ac-20-standard", 8, 2).getAlphaStrikeForceStats();
        expect(full.damage.short).toBeGreaterThan(low.damage.short);
    });

    it("a one-shot launcher is x 0.1: a Clan LRM 20 (OS) is Minimal Damage", () => {
        const damage = clanMech("clan-lrm-20-os", "ammo-lrm-standard", 0).getAlphaStrikeForceStats().damage;
        expect(damage.shortMinimal).toBe(true);
        expect(damage.short).toBe(0);
    });
});
