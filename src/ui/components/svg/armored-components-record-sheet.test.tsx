import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BattleMech } from "../../../classes/battlemech";
import BattleMechSVG from "./battlemech-svg";

// "Circle the number before each of the critical slots the component takes up" (TO:AUE p.95) (#46).
describe("armored components on the record sheet", () => {
    it("circles the slot numbers of an armored component and no others", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        vi.spyOn(console, "warn").mockImplementation(() => undefined);
        const mech = new BattleMech();
        mech.importSSWXML(readFileSync("src/utils/__fixtures__/violator-vt-u1.ssw", "utf8"));
        const armoredSlots = (markup: string) => (markup.match(/data-testid="armored-slot"/g) ?? []).length;

        expect(armoredSlots(renderToStaticMarkup(<BattleMechSVG mechData={mech} />))).toBe(1);

        mech.setComponentArmored("engine", true);
        // A standard engine: 6 center torso slots.
        expect(armoredSlots(renderToStaticMarkup(<BattleMechSVG mechData={mech} />))).toBe(7);
    });
});
