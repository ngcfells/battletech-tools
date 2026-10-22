import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BattleMech } from "../../../classes/battlemech";
import Vehicle from "../../../classes/vehicle";
import BattleMechSVG from "./battlemech-svg";
import { sheetFooter, TRADEMARK_NOTICE } from "./record-sheet-svg-kit";
import VehicleRecordSheetSVG from "./vehicle-record-sheet-svg";

// Rendered markup puts an apostrophe in as &#x27; and an ampersand as &amp;.
const text = (markup: string) => markup.replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
const year = new Date().getFullYear();

// The notice MegaMekLab and Solaris Skunk Werks print, as on the official Total Warfare sheets, with the year filled in.
const TOPPS = `© ${year} The Topps Company, Inc. Classic BattleTech, BattleTech, 'Mech and BattleMech are trademarks of The Topps Company, Inc. All rights reserved.`;
const CGL = "Catalyst Game Labs and the Catalyst Game Labs logo are trademarks of InMediaRes Productions, LLC.";

describe("record sheet trademark footer (user ruling 2026-10-22: the logo goes on the sheets)", () => {
    it("gives the notice in the official sheets' wording, this year", () => {
        expect(TRADEMARK_NOTICE(year)).toEqual([TOPPS, CGL]);
    });

    it("puts the BattleTech logo and the notice on the shared footer", () => {
        const markup = text(renderToStaticMarkup(<svg>{sheetFooter("Tables: TW p.1.")}</svg>));
        expect(markup).toContain('data-testid="battletech-logo"');
        expect(markup).toContain(TOPPS);
        expect(markup).toContain(CGL);
        expect(markup).toContain("Tables: TW p.1.");
        expect(markup).toContain("Created with Jeff's BattleTech Tools IIC");
    });

    it("does not grant photocopy permission or claim permission it does not have", () => {
        for (const markup of [
            text(renderToStaticMarkup(<svg>{sheetFooter("Tables: TW p.1.")}</svg>)),
            text(renderToStaticMarkup(<BattleMechSVG mechData={new BattleMech()} />)),
        ]) {
            expect(markup).not.toContain("Permission to photocopy");
            expect(markup).not.toContain("Used with permission");
            expect(markup).toContain("not published or endorsed by");
        }
    });

    it("prints the logo and notice on the Combat Vehicle sheet", () => {
        const markup = text(renderToStaticMarkup(<VehicleRecordSheetSVG vehicle={new Vehicle()} />));
        expect(markup).toContain('data-testid="battletech-logo"');
        expect(markup).toContain(TOPPS);
    });

    it("prints the same notice on the 'Mech sheet, under its logo", () => {
        const markup = text(renderToStaticMarkup(<BattleMechSVG mechData={new BattleMech()} />));
        expect(markup).toContain(TOPPS);
        expect(markup).toContain(CGL);
        expect(markup).not.toContain("Neither Topps nor Catalyst Game Labs makes no");
    });
});
