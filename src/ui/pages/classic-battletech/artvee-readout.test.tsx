import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Vehicle from "../../../classes/vehicle";
import { ARTVEE_SAMPLES } from "../../../data/artvee-samples";
import { ARTVEE_READOUT, ReadoutText, readoutSectionId } from "./artvee-readout";

/** The text of one `## name` section of the readout. */
function section(name: string): string {
    return ARTVEE_READOUT.split(/^## /m).find((part) => part.startsWith(name + "\n")) ?? "";
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
            "# Title", "", "## A Section", "", "Two **bold**", "lines *here*.", "", "> *Note:* a quote", "> goes on.", "",
            "- one", "  more", "- two", "", "1. first", "1. second", "", "| A | B |", "| --- | --- |", "| 1 | 2 |", "",
            "```text", "Mass: 55 tons", "```", "", "---",
        ].join("\n")} />);
        expect(html).toContain("<h1>Title</h1>");
        expect(html).toContain(`<h2 id="${readoutSectionId("A Section")}">A Section</h2>`);
        expect(html).toContain("<p>Two <strong>bold</strong> lines <em>here</em>.</p>");
        expect(html).toContain("<blockquote><em>Note:</em> a quote goes on.</blockquote>");
        expect(html).toContain("<ul><li>one more</li><li>two</li></ul>");
        expect(html).toContain("<ol><li>first</li><li>second</li></ol>");
        expect(html).toContain("<th>A</th>");
        expect(html).toContain("<td>2</td>");
        expect(html).toContain("<pre>Mass: 55 tons</pre>");
        expect(html).toContain("<hr/>");
    });
});
