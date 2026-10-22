// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { QuirkList } from "../../classes/quirk-list";
import { getQuirkEffects } from "../../utils/quirk-effects";
import QuirksInPlay from "./quirks-in-play";

afterEach(cleanup);

const effectsOf = (...tags: string[]) => {
    const list = new QuirkList();
    for (const tag of tags) list.add({ tag });
    return getQuirkEffects(list, [], 3025);
};

describe("QuirksInPlay", () => {
    it("lists each quirk with what it does, and an unapplied quirk as not yet applied", () => {
        render(<QuirksInPlay effects={effectsOf("quirk-exposed-actuators", "quirk-multi-trac")} quirksInPlay={true} />);
        expect(screen.getByText(/Exposed Actuators/).textContent).toContain("-1 to-hit against it: Leg and Swarm attacks");
        expect(screen.getByText(/Multi-Trac/).textContent).toContain("not yet applied in play");
    });

    it("renders nothing with the switch off", () => {
        const { container } = render(<QuirksInPlay effects={effectsOf("quirk-exposed-actuators")} quirksInPlay={false} />);
        expect(container.innerHTML).toBe("");
    });

    it("renders nothing for a unit without quirks", () => {
        const { container } = render(<QuirksInPlay effects={[]} quirksInPlay={true} />);
        expect(container.innerHTML).toBe("");
    });
});
