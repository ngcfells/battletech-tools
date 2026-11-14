import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Vehicle from "../../../classes/vehicle";
import { ammoCustom } from "../../../data/ammo-custom";
import { ARTVEE_SAMPLES } from "../../../data/artvee-samples";
import { MICRO_MECH_AS_ABILITY_TEXT } from "../../../data/alpha-strike-special-abilities";
import { AMMUNITION_READOUT, ARTVEE_READOUT, MICRO_MECHS_READOUT, ReadoutText, TRO_DOCUMENTS, TRO_INTRODUCTION, readoutPageTitle, readoutPages, readoutSectionId } from "./tro-jbt";

/** The text of one `#### name` section of the readout. */
function section(name: string): string {
    return ARTVEE_READOUT.split(/^#### /m).find((part) => part.startsWith(name + "\n")) ?? "";
}

describe("ArtVee readout", () => {
    it.each(ARTVEE_SAMPLES.map((sample) => [sample.name, sample] as const))("prints %s as the app builds it", (name, sample) => {
        const vehicle = new Vehicle(JSON.stringify(sample.save));
        const text = section(name);
        expect(text).toContain(`Mass: ${sample.save.tonnage} tons`);
        expect(text).toContain(`Battle Value: ${vehicle.getBattleValue().toLocaleString("en-US")}`);
    });

    it("credits the idea and says it is not canon", () => {
        expect(ARTVEE_READOUT).toContain("not canon");
        expect(ARTVEE_READOUT).toContain("kris (helvedes heste)");
    });

    it("renders headings, emphasis, quotes, lists, tables and stat blocks", () => {
        const html = renderToStaticMarkup(<ReadoutText text={[
            "# Title", "", "## A Section", "", "#### A Unit", "", "##### Overview", "", "Two **bold**", "lines *here*.", "", "> *Note:* a quote", "> goes on.", "",
            "- one", "  more", "- two", "", "1. first", "1. second", "", "| A | B |", "| --- | --- |", "| 1 | 2 |", "",
            "```text", "Mass: 55 tons", "```", "", "---",
        ].join("\n")} />);
        expect(html).toContain("<h1>Title</h1>");
        expect(html).toContain(`<h2 id="${readoutSectionId("A Section")}">A Section</h2>`);
        expect(html).toContain(`<h4 id="${readoutSectionId("A Unit")}">A Unit</h4>`);
        expect(html).toContain("<h5>Overview</h5>");
        expect(html).toContain("<p>Two <strong>bold</strong> lines <em>here</em>.</p>");
        expect(html).toContain("<blockquote><em>Note:</em> a quote goes on.</blockquote>");
        expect(html).toContain("<ul><li>one more</li><li>two</li></ul>");
        expect(html).toContain("<ol><li>first</li><li>second</li></ol>");
        expect(html).toContain("<th>A</th>");
        expect(html).toContain("<td>2</td>");
        expect(html).toContain("<pre>Mass: 55 tons</pre>");
        expect(html).toContain("<hr/>");
    });

    it("moves past a line no block claims", () => {
        expect(renderToStaticMarkup(<ReadoutText text={"####### Too deep\n#tag"} />)).toBe("<p>####### Too deep #tag</p>");
    });

    it("draws an image block from the lore folder, with its description", () => {
        const html = renderToStaticMarkup(<ReadoutText text={"![Three stages](artvee-falconet.svg)"} />);
        expect(html).toMatch(/<img alt="Three stages" src="[^"]*artvee-falconet[^"]*\.svg/);
    });

    it("shows the Falconet in both modes and converting", () => {
        expect(ARTVEE_READOUT).toMatch(/^!\[.*Vehicle Mode.*Blind Infinity.*Siege Mode.*\]\(artvee-falconet\.svg\)$/m);
    });
});

describe("TRO - JBT", () => {
    it("opens with the introduction and a card for the ArtVees, then the ammunition", () => {
        expect(TRO_INTRODUCTION).toContain("## Explanation");
        expect(TRO_DOCUMENTS.map((document) => document.slug)).toEqual(["artvee", "ammunition", "micro-mechs"]);
    });

    it.each(TRO_DOCUMENTS.map((document) => [document.slug, document] as const))("renders every page of %s and loses no text", (_slug, document) => {
        const pages = readoutPages(document.text, document.pageStart);
        for (const page of pages) expect(renderToStaticMarkup(<ReadoutText text={page} />)).not.toBe("");
        const words = (text: string): string => text.replace(/^---$/gm, "").replace(/\s+/g, " ").trim();
        expect(words(pages.join("\n"))).toBe(words(document.text));
    });

    it("gives each ArtVee pattern its own page", () => {
        const artvee = TRO_DOCUMENTS[0];
        const titles = readoutPages(artvee.text, artvee.pageStart).map((page) => readoutPageTitle(page, artvee.title));
        for (const sample of ARTVEE_SAMPLES) expect(titles).toContain(sample.name);
        expect(new Set(titles).size).toBe(titles.length);
    });

    it("keeps a heading with nothing under it on the page of the heading after it", () => {
        expect(readoutPages("# T\n\n## A\n\n### B\n\nText\n\n## C\n\nMore", /^#{2,3} /)).toEqual(["# T\n\n## A\n\n### B\n\nText", "## C\n\nMore"]);
    });

    it("keeps opening text on the page of the first section", () => {
        expect(readoutPages("# T\n\nOpening\n\n## A\n\nText\n\n## B\n\nMore", /^## /)).toEqual(["# T\n\nOpening\n\n## A\n\nText", "## B\n\nMore"]);
    });

    it("prints the anti-orbital round as the catalog has it, with its credit", () => {
        const round = ammoCustom.find((item) => item.tag === "ammo-is-long-tom-anti-orbital");
        expect(AMMUNITION_READOUT).toContain(`| **Weight** | 1 ton (${round?.roundsPerTon} shots) |`);
        expect(AMMUNITION_READOUT).toContain(`| **Damage** | ${round?.damage} standard |`);
        expect(AMMUNITION_READOUT).toContain(`| **Battle Value** | ${round?.battleValue} a ton |`);
        expect(AMMUNITION_READOUT).toContain("SmilingNid");
        expect(AMMUNITION_READOUT).not.toContain("user ruling");
    });
});

describe("Micro-Mechs readout", () => {
    const flat = MICRO_MECHS_READOUT.replace(/\*\*/g, "").replace(/\s+/g, " ");

    it("credits the authors and says it is not official", () => {
        for (const text of ["Solarmech", "Discord", "6.1.0.2", "not canon", "NOT OFFICIAL"]) expect(MICRO_MECHS_READOUT).toContain(text);
    });

    it("explains each rule of the MCR ability the card popup shows", () => {
        // The readout has a bullet for every rule of the ability text (after its opening line), under the same name.
        for (const line of MICRO_MECH_AS_ABILITY_TEXT.slice(1)) expect(flat, line).toContain(`- ${line.slice(0, line.indexOf(":") + 1)}`);
    });

    it("links to the author's own text, and renders the link", () => {
        const url = "https://www.deviantart.com/solarmech/art/Micro-Mechs-for-BattleTech-Part-1-795743489";
        expect(MICRO_MECHS_READOUT).toContain(`(${url})`);
        const html = renderToStaticMarkup(<ReadoutText text={`See [the post](${url}), **here**.`} />);
        expect(html).toContain(`<a href="${url}" target="_blank" rel="noopener noreferrer">the post</a>`);
        expect(html).toContain("<strong>here</strong>");
    });

    it("explains every code a Micro-Mech card can print", () => {
        for (const code of ["MM", "MCR", "ENE", "CASE", "SEAL", "IF#", "LRM", "HT", "ECM", "PRB", "RCN", "TAG", "C3S", "SNARC", "JMPW#"]) expect(flat, code).toContain(code);
    });
});
