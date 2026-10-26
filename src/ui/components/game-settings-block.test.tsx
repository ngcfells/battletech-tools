// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IGameSettings } from "../../data/game-settings";
import { DEFAULT_RULES_EDITION } from "../../data/rules-editions";
import { btSpecialRulesets } from "../../data/special-rulesets";
import GameSettingsBlock from "./game-settings-block";

afterEach(() => {
    cleanup();
    const index = btSpecialRulesets.findIndex((ruleset) => ruleset.id === "test-clash");
    if (index >= 0) btSpecialRulesets.splice(index, 1);
});

const base: IGameSettings = { rulesets: [], edition: DEFAULT_RULES_EDITION, rulesLevel: 2, techBase: "clan", era: "clan-inv" };
const SAMPLE = "Sample: The Clans never existed (alternate universe)";

// The parent keeps the settings, as a builder does with its design.
function Harness(props: { start: IGameSettings; onChange?: (settings: IGameSettings) => void }) {
    const [settings, setSettings] = useState(props.start);
    return <GameSettingsBlock unitType="mech" settings={settings} onChange={(next) => { props.onChange?.(next); setSettings(next); }} />;
}

const select = (label: RegExp) => screen.getByLabelText(label) as HTMLSelectElement;
const optionNames = (label: RegExp) => Array.from(select(label).options).map((option) => option.textContent);

describe("GameSettingsBlock (#324)", () => {
    it("shows the steps in order: Special Rulesets, Rules Edition, Rules Level, Technology Base, Era", () => {
        const { container } = render(<Harness start={base} />);
        const text = container.textContent ?? "";
        const at = ["Special Rulesets:", "Rules Edition:", "Rules Level:", "Technology Base:", "Era:"].map((label) => text.indexOf(label));
        expect(at.every((index) => index >= 0)).toBe(true);
        expect([...at].sort((a, b) => a - b)).toEqual(at);
    });

    it("Special Rulesets defaults to No and Yes opens the window", () => {
        render(<Harness start={base} />);
        expect(select(/Special Rulesets/).value).toBe("no");
        fireEvent.change(select(/Special Rulesets/), { target: { value: "yes" } });
        expect(screen.getByRole("dialog")).toBeTruthy();
        expect(screen.getByLabelText(new RegExp(SAMPLE.replace(/[()]/g, "\\$&")))).toBeTruthy();
        expect(screen.getByText(/the Clans never formed/)).toBeTruthy();
    });

    it("ticking the no-Clans universe on a Clan design moves Tech Base and reports it", () => {
        render(<Harness start={base} />);
        fireEvent.change(select(/Special Rulesets/), { target: { value: "yes" } });
        fireEvent.click(screen.getByRole("checkbox", { name: new RegExp(SAMPLE.replace(/[()]/g, "\\$&")) }));
        expect(optionNames(/Technology Base/)).toEqual(["Inner Sphere"]);
        expect(screen.getByText(/Tech Base moved to Inner Sphere/)).toBeTruthy();
    });

    it("No clears the rulesets with no moves", () => {
        const onChange = vi.fn();
        render(<Harness start={{ ...base, techBase: "is", era: "star-league", rulesets: ["sample-no-clans"] }} onChange={onChange} />);
        expect(select(/Special Rulesets/).value).toBe("yes");
        fireEvent.change(select(/Special Rulesets/), { target: { value: "no" } });
        expect(onChange.mock.lastCall?.[0].rulesets).toEqual([]);
        expect(screen.queryByText(/moved to/)).toBeNull();
        expect(optionNames(/Technology Base/)).toContain("Clan");
    });

    it("a clashing ruleset is disabled and names the one it clashes with", () => {
        btSpecialRulesets.push({ id: "test-clash", name: "Test clash", description: "", source: { title: "test" }, changes: ["techBases"] });
        render(<Harness start={{ ...base, techBase: "is", era: "star-league", rulesets: ["sample-no-clans"] }} />);
        fireEvent.click(screen.getByRole("button", { name: /Choose rulesets/ }));
        const clash = screen.getByRole("checkbox", { name: /Test clash/ }) as HTMLInputElement;
        expect(clash.disabled).toBe(true);
        expect(screen.getByText(new RegExp("Clashes with " + SAMPLE.replace(/[()]/g, "\\$&")))).toBeTruthy();
    });

    it("a stored value the lists do not offer is kept and flagged", () => {
        render(<Harness start={{ ...base, rulesets: ["sample-no-clans"] }} />);
        expect(select(/Technology Base/).value).toBe("clan");
        expect(screen.getByText(/The stored value is not offered under the ticked rulesets/)).toBeTruthy();
    });

    it("an edition without eras hides the Era step", () => {
        render(<Harness start={{ ...base, edition: "battledroids", techBase: "is", rulesLevel: 2 }} />);
        expect(screen.queryByLabelText(/^Era/)).toBeNull();
    });
});
