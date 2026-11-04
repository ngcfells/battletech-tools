import React, { type JSX } from 'react';
import readout from '../../../../docs/lore/artvee-tro.md?raw';
import { IAppGlobals } from '../../app-router';
import TextSection from '../../components/text-section';
import UIPage from '../../components/ui-page';

// The ArtVee lore (Custom Homebrew), read straight from docs/lore/artvee-tro.md: the one copy of the text.
export const ARTVEE_READOUT = readout.replace(/\r\n/g, "\n");

export const readoutSectionId = (title: string): string => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Bold and italics; the readout has no other inline marks. */
function inline(text: string): React.ReactNode[] {
    return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((part, index) => {
        if (part.startsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.length > 1) return <em key={index}>{part.slice(1, -1)}</em>;
        return part;
    });
}

const cells = (row: string): string[] => row.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());

/** The block forms the readout uses: headings, paragraphs, quotes, lists, tables, stat blocks and rules. */
export function ReadoutText({ text }: { text: string }): JSX.Element {
    const blocks: JSX.Element[] = [];
    const lines = text.split("\n");
    let at = 0;
    // Takes lines while they match, for the blocks that run on.
    const take = (matches: (line: string) => boolean): string[] => {
        const taken: string[] = [];
        while (at < lines.length && matches(lines[at])) taken.push(lines[at++]);
        return taken;
    };
    // List items, each with its indented continuation lines.
    const items = (marker: RegExp): string[] => take((line) => marker.test(line) || line.startsWith("  "))
        .reduce<string[]>((list, line) => marker.test(line) ? [...list, line.replace(marker, "")] : [...list.slice(0, -1), `${list[list.length - 1]} ${line.trim()}`], []);
    const bullet = /^- /;
    const numbered = /^\d+\. /;
    while (at < lines.length) {
        const line = lines[at];
        const key = blocks.length;
        const heading = /^(#{1,3}) (.*)/.exec(line);
        if (!line.trim()) {
            at++;
        } else if (heading) {
            at++;
            const Tag = `h${heading[1].length}` as "h1" | "h2" | "h3";
            blocks.push(<Tag key={key} id={Tag === "h2" ? readoutSectionId(heading[2]) : undefined}>{heading[2]}</Tag>);
        } else if (line.startsWith("```")) {
            at++;
            const block = take((row) => !row.startsWith("```"));
            at++;
            blocks.push(<pre key={key}>{block.join("\n")}</pre>);
        } else if (line === "---") {
            at++;
            blocks.push(<hr key={key} />);
        } else if (line.startsWith("|")) {
            const [head, , ...rows] = take((row) => row.startsWith("|")).map(cells);
            blocks.push(<table key={key}><thead><tr>{head.map((cell, index) => <th key={index}>{cell}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, column) => <td key={column}>{inline(cell)}</td>)}</tr>)}</tbody></table>);
        } else if (line.startsWith("> ")) {
            blocks.push(<blockquote key={key}>{inline(take((row) => row.startsWith("> ")).map((row) => row.slice(2)).join(" "))}</blockquote>);
        } else if (bullet.test(line)) {
            blocks.push(<ul key={key}>{items(bullet).map((item, index) => <li key={index}>{inline(item)}</li>)}</ul>);
        } else if (numbered.test(line)) {
            blocks.push(<ol key={key}>{items(numbered).map((item, index) => <li key={index}>{inline(item)}</li>)}</ol>);
        } else {
            blocks.push(<p key={key}>{inline(take((row) => !!row.trim() && !/^(#|```|> |\||- |\d+\. )/.test(row)).join(" "))}</p>);
        }
    }
    return <>{blocks}</>;
}

export default class ArtVeeReadout extends React.Component<{ appGlobals: IAppGlobals }> {
    constructor(props: { appGlobals: IAppGlobals }) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("ArtVee Technical Readout");
    }

    // A link straight to a section arrives before this lazy page has rendered it, so the browser cannot jump there itself.
    componentDidMount = (): void => {
        requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView());
    }

    render = (): JSX.Element => {
        const sections = [...ARTVEE_READOUT.matchAll(/^## (.*)$/gm)].map((match) => match[1]);
        return (
            <UIPage current="classic-battletech-artvee-readout" appGlobals={this.props.appGlobals}>
                <TextSection label="ArtVee Technical Readout">
                    <nav aria-label="Readout contents">
                        <ul className="styleless">
                            {sections.map((title) => (
                                <li key={title}><a href={`#${readoutSectionId(title)}`}>{title}</a></li>
                            ))}
                        </ul>
                    </nav>
                    <div className="artvee-readout" data-testid="artvee-readout">
                        <ReadoutText text={ARTVEE_READOUT} />
                    </div>
                </TextSection>
            </UIPage>
        );
    }
}
