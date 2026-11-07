# mordel.net import: what's left (handoff, 2026-11-07)

Branch `mordel-user-key`. The user keys, Settings, roster and designer import, the shipped list and
"My Mordel designs" are built and reviewed. What follows is the work after that.

## Picking this up in a cloud session

The branch is not on the public GitHub repo. It lives in the private repo `NGCFells2/ResourceLibrary`,
folder `Custom/battletech-tools-handoff/`:

- `mordel-user-key.bundle`: a git bundle of this branch. Restore it with
  `git clone https://github.com/ngcfells/battletech-tools.git && cd battletech-tools &&
  git fetch <path>/mordel-user-key.bundle mordel-user-key:mordel-user-key && git checkout mordel-user-key`.
- `mordel-mirror.tar.gz`: the mordel.net unit details (56,043 units, full pull 2026-11-07). Unpack it to
  `tools/mordel-sync/.mirror/`, which is git-ignored. **It holds member designs: never commit it to
  battletech-tools, which is public.**
- `zz-gaps.test.ts`, `zz-bv.test.ts`: scratch harnesses. Copy them to `src/utils/mordel/`, change the
  `MIRROR` and `OUT` paths at the top, and run them with `npx vitest run src/utils/mordel/zz-gaps.test.ts`.
  Delete them before any commit.

Rules: no push, merge or deploy of battletech-tools without the owner's OK. The mordel.net key never goes
in a file, URL, log or commit. No member designs in committed test fixtures.

## 1. Alt names and tags (owner's call: do it)

When mordel.net names an item we already have, add their name to the catalog item's `altNames` and their
tag to `altTags`. Known so far: Blue Shield, Tracks, RISC Super-Cooled Myomer, Command Console (a cockpit
type). The gaps run lists the rest: issues worded "unknown equipment" whose item exists under our name.

## 2. Every unit kind imports (owner's call: do it)

The converters must take every unit on mordel.net. Not yet supported:

- LAMs: Avionics, Landing Gear, LAM Bomb Bay.
- QuadVees: Conversion Gear, QuadVee Wheels.
- Compact heat sinks, Superheavy myomer.
- Vehicles with engine "None" (trailers and the like).
- Placement: Environmental Sealing, Tracks, Endo Steel slots. "Unallocated Criticals". The Cargo add-on.
- Ammo read as standard rounds: Arrow IV Non-Homing, Fluid Gun Water, 'Mech Mortar Armor-Piercing.

## 3. Missing catalog items

Add with book citations (book over MegaMek, newest printing wins, errata first): Anti-'Mech Pod, Dumper,
Minesweeper, Mobile Field Base, Compartment (Battle Armor), Smart Robotic Control System,
PPC (Prototype), RISC Heat Sink Override Kit. The gaps run may add more.

## 4. Battle Value

Owner's rule: where our BV differs from mordel.net's, assume ours is wrong and find out why. Only when the
rules and errata show we are right does the case go in a report for Scott.

`zz-bv.test.ts` with `BV_CANON=1` sorts every canon mismatch:

- `theirsIsMul`: mordel.net matches the MUL, we don't. Ours to fix.
- `oursIsMul`: we match the MUL, mordel.net doesn't. Check the rules; if we hold, it goes to Scott.
- `allDiffer`, `noMul`: work through by hand.

From the earlier partial mirror: 'Mechs 3,930 of 4,269 canon match, vehicles 942 of 1,002, ProtoMechs
80 of 85. `tools/mordel-sync/canon-mismatch-report.json` has the 381 canon mismatches from the full pull
(290 BV, median gap 22).

## 5. Docs to bring up to date

- `docs/superpowers/plans/2026-11-07-mordel-storage-memo.md`, section "The list": still describes the
  dev-only gate. The list now ships (Scott agreed).
- `docs/superpowers/specs/2026-11-06-mordel-user-key-design.md`: mark the shipping question answered.

Run `npm run check` before each commit.
