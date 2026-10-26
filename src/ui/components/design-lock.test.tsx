// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { getPrintedDroids } from "../../data/battledroids-mechs";
import { buildPrintedDroid } from "../../classes/printed-droid";
import { getRulesEdition } from "../../data/rules-editions";
import type { IAppGlobals } from "../app-router";
import { confirmEditPrintedDroid, getDesignLockNote, mechRulesLevel } from "./design-lock";

afterEach(() => vi.unstubAllGlobals());

// The lock follows the design's own rules level, not the app-wide one (#324 call 5).
describe("design lock (#324)", () => {
    it("locks a printed droid at the design's play level and the edit raises the design's level", () => {
        const mech = buildPrintedDroid(getPrintedDroids(0)[0]);
        const construction = getRulesEdition(mech.getRulesEdition()).constructionLevel!;
        mech.applyGameSettings({ ...mech.getGameSettings(construction), rulesLevel: 0 });
        const appGlobals = {
            currentBattleMech: mech,
            appSettings: { mechRulesFilter: construction },
            saveAppSettings: vi.fn(),
            saveCurrentBattleMech: vi.fn(),
        } as unknown as IAppGlobals;
        expect(mechRulesLevel(appGlobals)).toBe(0);
        expect(getDesignLockNote(appGlobals)).toMatch(/plays the printed droids only/);

        vi.stubGlobal("confirm", () => true);
        confirmEditPrintedDroid(appGlobals);
        expect(mech.getRulesLevel(99)).toBe(construction);
        expect(getDesignLockNote(appGlobals)).toBeNull();
    });
});
