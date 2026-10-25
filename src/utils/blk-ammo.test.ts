import { describe, expect, it } from "vitest";
import { getEquipmentListByTech } from "../data/equipment-registry";
import { findBlkAmmo, findBlkAmmoWeapon, parseBlkAmmoLine } from "./blk-ammo";

describe("MegaMek .blk ammunition lines", () => {
    it("reads the weapon, half-ton bins and the kind of round", () => {
        expect(parseBlkAmmoLine("IS Ammo AC/10 - Half")).toMatchObject({ weaponKey: "ac10", half: true, kind: undefined });
        expect(parseBlkAmmoLine("IS LB 10-X Cluster Ammo")?.kind?.source).toBe("cluster");
        expect(parseBlkAmmoLine("Medium Laser")).toBeNull();
        expect(parseBlkAmmoLine("IS Ammo MG - Full")).toMatchObject({ weaponKey: "machinegun", half: false });
    });

    it("finds the mounted weapon a line feeds and its standard round", () => {
        const lrm20 = getEquipmentListByTech("is", false).find((item) => item.tag === "lrm-20");
        expect(lrm20).toBeDefined();
        const line = parseBlkAmmoLine("IS Ammo LRM-20");
        expect(line).not.toBeNull();
        expect(findBlkAmmoWeapon(line!, [lrm20!])).toBe(lrm20);
        const ammo = findBlkAmmo(line!, lrm20!);
        expect(ammo?.isAmmo).toBe(true);
        expect(ammo?.isSpecialAmmo).toBeFalsy();
        // No weapon is guessed when nothing mounted fires the round.
        expect(findBlkAmmoWeapon(parseBlkAmmoLine("IS Gauss Ammo")!, [lrm20!])).toBeUndefined();
    });

    const all = [...getEquipmentListByTech("is", false), ...getEquipmentListByTech("clan", false)];
    const record = (tag: string) => all.find((item) => item.tag === tag)!;
    // The round a line names, fed to the one weapon given.
    const roundFor = (lineName: string, weaponTag: string) => {
        const line = parseBlkAmmoLine(lineName)!;
        const weapon = findBlkAmmoWeapon(line, [record(weaponTag)]);
        return weapon ? findBlkAmmo(line, weapon)?.tag : undefined;
    };

    it("reads the rounds of Clan, MML, ATM and HAG lines", () => {
        // A Clan launcher is found by its name, not just its import names.
        expect(roundFor("Clan Ammo LRM-20 (Clan) Artemis-capable", "clan-lrm-20-artemis-iv")).toBe("ammo-clan-lrm-artemis-iv");
        expect(roundFor("Clan Ammo SRM-6 (Clan) Artemis V-capable", "clan-srm-6-artemis-v")).toBe("ammo-clan-srm-artemis-v");
        // An MML line names which of its two rounds it holds; Artemis IV fits MMLs (TM p.207).
        expect(roundFor("IS Ammo MML-9 LRM Artemis-capable", "mml-9-artemis-iv")).toBe("ammo-is-lrm-artemis-iv");
        expect(roundFor("IS Ammo MML-9 SRM Artemis-capable", "mml-9-artemis-iv")).toBe("ammo-is-srm-artemis-iv");
        expect(roundFor("Clan Ammo ATM-9 ER", "atm-9")).toBe("ammo-clan-atm-er");
        expect(roundFor("Clan Ammo ATM-9 HE", "atm-9")).toBe("ammo-clan-atm-he");
        expect(roundFor("Hyper-Assault Gauss Rifle/20 Ammo", "hyper-assault-gauss-20")).toBe("ammo-clan-hag-20-standard");
        // "AC/10 Primitive" rounds feed the Primitive Prototype AC/10 (IO:AE p.112).
        expect(roundFor("IS Ammo AC/10 Primitive", "primitive-prototype-ac-10")).toBe("ammo-ac-10-standard");
    });
});
