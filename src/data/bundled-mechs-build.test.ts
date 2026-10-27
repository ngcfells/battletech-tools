import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { buildBundledMechs } from "./bundled-mechs-build";

// MegaMek keeps an OmniMech configuration in a file of its own; it is compared with that configuration of the kept
// Skunk Werks OmniMech, not with its base (Dire Wolf A was once reported as a design with "different equipment").
it("takes MegaMek's one-configuration file for a duplicate of the kept OmniMech's configuration", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "bundled-mechs-build-"));
    const ssw = path.join(root, "ssw"), megamek = path.join(root, "megamek", "3050U");
    fs.mkdirSync(ssw, { recursive: true });
    fs.mkdirSync(megamek, { recursive: true });
    fs.copyFileSync(path.resolve(__dirname, "../utils/__fixtures__/dire-wolf-omni.ssw"), path.join(ssw, "dire-wolf-omni.ssw"));
    fs.copyFileSync(path.resolve(__dirname, "../utils/__fixtures__/daishi-dire-wolf-a.mtf"), path.join(megamek, "Daishi (Dire Wolf) A.mtf"));
    try {
        const build = buildBundledMechs(ssw, path.resolve(__dirname, "mul"), path.join(root, "megamek"));
        expect(build.headers.map((header) => header.name)).toEqual(["Dire Wolf (Daishi)"]);
        expect(build.leftOut).toEqual([expect.objectContaining({ file: "megamek/3050U/Daishi (Dire Wolf) A.mtf", reason: expect.stringMatching(/^duplicate of a design already kept/) })]);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}, 120_000);
