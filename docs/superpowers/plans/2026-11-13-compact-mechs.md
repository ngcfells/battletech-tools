# Compact 'Mechs Implementation Plan (#172)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan. The owner's
> execution method is **one chunk per session**, each ending with a commit, a ledger entry and a handoff, and the
> session is cleared before the next chunk. Do not run two chunks in one session. Steps use checkbox (`- [ ]`) syntax.

> **BLOCKED ON THE OWNER (2026-11-13).** No article called "Compact 'Mechs" is in the *Best of Future Wars*. The
> only 'Mech construction rules in it are Clell Flint's "Alternate Rules for Building Mechs in BattleTech", which
> size a 'Mech's insides by weight class. This plan assumes that article is what #172 means. Chunk A does not start
> until the owner confirms it (question 1 below).

**Goal:** Clell Flint's alternate construction rules can be chosen as a Special Ruleset under the Custom Homebrew
rules level. A 'Mech built under it gets critical slots, a head, a cockpit, an engine and a gyro sized by its weight
class. Its record sheet and play mode use those slot counts. The rest of the fanzine comes in as the owner picks it.

**Architecture:** Flint's rules change how every 'Mech is built, not one item or unit type, so they are a **Special
Ruleset** (#324, `src/data/special-rulesets.ts`: "optional and homebrew rules that change how the game plays or how
units are built"). It is the first real one; the only ruleset there now is a sample. `BattleMech` reads it through
`getRulesets()`. The first chunk stops `BattleMech` assuming that every location has 6 or 12 slots. That assumption
is written out in at least 21 places. The change must alter nothing, and the bundle tests prove it. Flint's walkers
(four-legged 'Mechs with ten locations) do not fit the canon quad's eight locations. They wait on owner question 2.

**Tech Stack:** TypeScript, React, Vitest. No new dependencies.

**Spec:** issue #172, and the source below. This plan is Chunk 5 of
`docs/superpowers/plans/2026-11-12-custom-homebrew-batch.md`; that plan's Global Constraints apply here too.

**Source:** *The Best of Future Wars, Volume One* (1991, Herb Barents, ed.; Steve Burnett and Paul Pelfrey
compiled it): Clell Flint, "Alternate Rules for Building Mechs in BattleTech", printed pp.35-38. The PDF is
`JBTIICRework/magazines/Future Wars/Future Wars Magazine - Best of - Future Wars Magazine.pdf`, a scan with no text
layer. **Page mapping:** printed page = PDF page - 1 up to printed p.35 (PDF 36). PDF pages 37-44 are an unnumbered
art insert. After it, printed page = PDF page - 9 (printed p.36 = PDF 45). The OCR text is
`ResourceLibrary/text/Future-Wars-Magazine-Best-of-Future-Wars-Magazine.ocr.txt`. Its PDF 39-44 is noise, and its
p.36 engine table is good. **Read every table from the page image** (`pdftoppm -r 110 -gray -png -f N -l N`): the
OCR drops the turret and the walker slot tables.

The article first appeared in *Future Wars* #11 (`ResourceLibrary/text/future-wars-11-Qyhm8x.ocr.txt`, from line
about 1413; PDF `future_wars_11_Qyhm8x.pdf`). The two printings differ in places (see Printings). The rules summary
and every call made while planning are in the batch ledger, entry "Chunk 5". Read it before Chunk A.

## Owner questions (asked 2026-11-13, one message)

1. **Is Flint's article what #172 calls "Compact 'Mechs"?** The words "Compact 'Mech" are in no held *Future Wars*
   text held (the Best-of and every held issue were searched). If something else was meant, name the issue and page; this plan is then
   replaced, not executed.
2. **Walkers.** Flint's four-legged 'Mech has ten locations: four legs, front, rear, left, right and center torso,
   and a control section with an optional turret. It has its own structure table, hit table, firing arcs, and
   1.25 x movement while all four legs work. Options: (a) a new `walker` 'Mech type inside `BattleMech` (largest;
   touches the record sheet, armor, criticals and play); (b) a unit type of its own, after the Micro-Mech plan;
   (c) its own issue, later. **Recommendation: (c)**, so the ruleset ships first.
3. **Printings.** Offer both printings as selectable versions (as the Micro-Mechs do), or the Best-of only?
   The differences (Printings below) are all in the walker section, so for the biped rules this matters only
   once walkers are built. **Recommendation:** the Best-of is the text of record, and #11's extra rule is a note.
4. **Later technology under the ruleset.** Flint wrote for the 3025 rules: one engine, one gyro, one cockpit.
   **Recommendation:** allow all equipment. Items keep their own slot counts. The engine-weight table sets the
   centre-torso slots of every engine, and an XL or Light engine's side-torso slots are unchanged. The gyro table
   (one slot a ton) applies to every gyro. Small and torso-mounted cockpits are not offered under the ruleset. The
   alternative is a ruleset limited to 3025 standard parts (no XL, Light, Compact or XXL engine; no XL, Compact or
   Heavy-Duty gyro; standard cockpit only).
5. **The rest of the fanzine** (the issue asks for it). The list is under "Other material". Pick the items to bring
   in. **Recommendation:** the nine equipment items first, as one chunk after the batch's Chunk 3 pattern. The
   play rules become further Special Rulesets later. Power Armor and DropShip construction get their own issues.
6. **The HeavyMetal Pro folder** (twelve files: eleven designs and HMP's `Mech.lst` index) holds no Compact
   'Mechs. They are ordinary 3050-era designs: nine from *Future Wars* #33, and the Pulsar and Pulsar 2 from #32
   (see the ledger). The app has no HMP importer. **Recommendation:** a separate
   issue that enters them as Custom Homebrew designs from the issues' stat blocks (#33 has a text layer), not
   through an importer.

## Global Constraints

- The ruleset is Custom Homebrew (`minRulesLevel` at that level). Its `source` credits "Clell Flint, 'Alternate
  Rules for Building Mechs in BattleTech', *Future Wars* #11, reprinted in *The Best of Future Wars, Volume One*
  (1991), pp.35-38". The sheet and TRO credit it through `getRulesetCredits`.
- Without the ruleset, nothing changes: every bundle test passes unchanged at every chunk. If one fails, stop for the owner.
- Read the page image before typing a number. A rule the article does not give is ours, labelled as ours in the
  code comment, the ruleset description and the ledger.
- Flint gives no Battle Value or cost. **Our call:** both come from the edition's rules applied to the design as
  built (head structure, cockpit weight and slot counts are what change), with a breakdown note "built under
  Clell Flint's alternate construction rules (Future Wars); Battle Value and cost by <edition> on the design as
  built". No new BV step.
- Failing test first. `npx vitest run --project unit src/classes src/data src/utils`, then `npm run check`.
- Commit and push `beta` (from a cloud session, the session branch). Ask the owner before any deploy, `master`
  fast-forward or news entry.

## Session protocol (every chunk)

As in the batch plan: read the handoff, this plan and the ledger; do the first chunk not marked done; test, commit,
push; append to the ledger what was built and every call that was ours; rewrite the top block of the handoff; stop.

## Models

| Chunk | Work | Model |
|---|---|---|
| A | Slot counts read from one place in `BattleMech`; nothing changes | Opus 5.5 |
| B | The ruleset: slots, head, cockpit, engine and gyro by weight class | Opus 5.5 |
| C | Creator: the ruleset's choices, issues when it is ticked or unticked | Sonnet 5.5 |
| D | Record sheet and play mode: critical tables of any length | Sonnet 5.5 |
| E | Fanzine equipment, once the owner picks (question 5) | Sonnet 5.5 |
| F | Verify and report | Sonnet 5.5 |

Walkers (question 2) get their own plan if the owner chooses (a) or (b).

## Rules (Best-of, printed pp.35-37; confirm each against the page image)

| Rule | Light (to 35 t) | Medium (40-55) | Heavy (60-75) | Assault (80-100) |
|---|---|---|---|---|
| Head slots | 5 | 6 | 7 | 8 |
| Each arm | 6 | 8 | 10 | 12 |
| Each leg | 7 | 10 | 12 | 16 |
| Left / right torso | 7 | 10 | 12 | 16 |
| Center torso | 11 | 14 | 18 | 20 |
| Head structure | 3 | 4 | 5 | 6 |
| Cockpit | 2 t, 1 slot | 3 t, 1 slot | 3 t, 1 slot ("most"), or 4 t, 2 slots ("a few") | 4 t, 2 slots |
| Life support | 1 slot | 1 slot | 1 or 2 (with the cockpit) | 2 slots |

- Head armor at most **2 x** head structure (light 6 ... assault 12), not 3 x.
- Sensors: 2 head slots on every 'Mech. Extra sensors: +1 slot, +0.5 t. Extra life support: +1 slot, +0.5 t. The
  cockpit's weight includes its own life support.
- Engine, centre-torso slots by engine weight: 0.5-4.0 t: 4; 4.5-6.0: 5; 6.5-9.0: 6; 9.5-12.0: 7; 12.5-16.0: 8;
  16.5-30.0: 9; 30.5 and up: 10.
- Gyro: one slot per ton of gyro.
- **Ours (no text):** the order of fixed items in each location (head: life support, sensors, cockpit, then the
  rest; arm and leg actuators first, as now); how a critical hit picks a slot in a location that is not 6 or 12
  long (Chunk D); BV and cost (above); which 'Mech types the ruleset allows (biped only; quads, tripods, LAMs,
  QuadVees and superheavies are refused with a message, since Flint's four-legged rules are his walkers).

## Printings (the walker section only)

| Point | *Future Wars* #11 | Best-of (1991) |
|---|---|---|
| Section title | "Rules for Building 4 Legged Mechs" | "Optional Rules for Building Walkers" |
| Centre-torso anti-infantry weapons, base to-hit | "0" | "8" |
| Immobilized walker with every leg standing | cannot be knocked over except by a push, until a leg's structure is gone | not printed |
| Firing arcs | six, named clockwise | "on the attached firing arc sheet" (no sheet in the reprint) |

The #11 scan's walker slot table OCRs badly. Read it in the #11 page image before using it.

## Review Focus

- A design saved under the ruleset, opened with the ruleset gone from the registry: it must open with a message
  and its slots must not be silently cut to 6/12. If items no longer fit, report them as issues.
- Ticking the ruleset on an existing 'Mech: every item that no longer fits is listed and nothing is deleted.
- A 35-ton and a 40-ton 'Mech either side of a class line. A tonnage change across a class line is a re-check.
- Head armor over 2 x structure after a class change.
- An engine whose weight sits exactly on a table boundary (4.0 / 4.5 t; 30.0 / 30.5 t).
- The record sheet with a 20-slot centre torso and a 5-slot head.

---

## Chunk A: Slot counts from one place (no behaviour change)

**Files:** Modify `src/classes/battlemech.ts`; test in `src/classes/battlemech.test.ts` (or a new
`battlemech-slots.test.ts`).

**Interfaces (produces):** `BattleMech.getLocationSlotCount(location: string): number`: today's counts (head and legs
6, the rest 12, a QuadVee leg 2, as `_moveCritical` and `_calcCriticals` now spell them). It is used everywhere a
6 or 12 is written for a location.

- [ ] **Step 1:** List every site: `grep -n -E 'Array\((6|12|2)\)\.fill|numSlots = (6|12)|maxLegalSlots|slots? ?(=|===|<) ?(6|12)\b' src/classes/battlemech.ts`
  (21 lines on 2026-11-13; include `_calcCriticals` about line 4840 and `_moveCritical` about 10824), and the
  same grep over `src/ui` and `src/utils` (record sheet, criticals page, SSW import) to list where the UI assumes it.
- [ ] **Step 2:** Failing test pinning `getLocationSlotCount` for biped, quad, tripod, LAM and QuadVee locations.
- [ ] **Step 3:** Implement; replace each site in the class. UI sites are listed in the ledger for Chunks C and D,
  not changed here.
- [ ] **Step 4:** Unit tests (the bundle tests must pass unchanged), `npm run check`.
- [ ] **Step 5:** Commit `refactor: 'Mech slot counts from one method (#172)`, push, ledger, handoff.

## Chunk B: The ruleset

**Files:** Modify `src/data/special-rulesets.ts` (+ test), `src/classes/battlemech.ts`; create
`src/data/future-wars-construction.ts` (the tables) and `src/classes/battlemech-future-wars.test.ts`.

**Interfaces (produces):** ruleset id `future-wars-alternate-construction`, `changes: ["mechConstruction"]`,
`removesUnitTypes` none, `minRulesLevel` Custom Homebrew. `FUTURE_WARS_WEIGHT_CLASSES`, `getFutureWarsSlots(tons,
location)`, `getFutureWarsEngineSlots(engineTons)`, `getFutureWarsCockpit(tons, large?)`. On `BattleMech`:
`usesFutureWarsConstruction()`, `getFutureWarsLargeCockpit/setFutureWarsLargeCockpit` (heavy only),
`getExtraSensors/setExtraSensors`, `getExtraLifeSupport/setExtraLifeSupport`, all saved in `export`.

- [ ] **Step 1: Read** printed pp.35-37 in the page images. Correct this plan's Rules table and the ledger wherever
  the page says otherwise.
- [ ] **Step 2: Failing tests**, each named for its rule: slot counts per class and location (one test per table
  row); head structure 3/4/5/6 and head armor maximum 6/8/10/12; cockpit 2/3/3-or-4/4 tons and slots; sensors
  2 slots; extra sensors and extra life support +0.5 t and +1 slot each; engine slots at 4.0, 4.5, 30.0 and 30.5
  tons; gyro slots = gyro tons (a 3-ton gyro takes 3); a quad is refused under the ruleset with a message; a
  design without the ruleset is unchanged (the bundle tests); ticking the ruleset on a 'Mech that no longer fits
  lists issues and deletes nothing; `exportJSON`/`importJSON` round-trips the new fields; a save naming the
  ruleset when the registry lacks it loads with a message.
- [ ] **Step 3: See them fail.**
- [ ] **Step 4: Implement.** `getLocationSlotCount` reads the ruleset; `_calcCriticals` places head, engine and gyro
  by the tables. Head structure goes through the structure lookup, so BV and the sheet pick it up with no BV change.
- [ ] **Step 5:** Unit tests and `npm run check`.
- [ ] **Step 6:** Commit `Custom Homebrew: Future Wars alternate 'Mech construction ruleset (#172)`, push, ledger,
  handoff.

## Chunk C: Creator

**Files:** `src/ui/pages/classic-battletech/mech-creator/` (the criticals page and the step that holds the cockpit),
`src/ui/components/edition-choice.tsx` only if the ruleset needs a description there; page tests beside them.

- [ ] **Step 1:** Failing tests: the ruleset is offered at Custom Homebrew and not below; under it the criticals page
  shows each location at its class's length; the heavy cockpit choice and the two extras appear only under it.
- [ ] **Step 2:** Implement, fixing the UI sites Chunk A listed. Then run the app: build a 35-ton and a 100-ton
  'Mech under the ruleset by hand.
- [ ] **Step 3:** Unit tests, `npm run check`, commit `Custom Homebrew: Future Wars construction in the 'Mech creator
  (#172)`, push, ledger, handoff.

## Chunk D: Record sheet and play mode

**Our rule (no text for bipeds), to put in the ruleset description:** a location's slots are printed in tables of
six, the last one short if needed. For a hit, roll 1D6 for the table when there is more than one (re-roll a number
with no table), then 1D6 for the slot (re-roll a number with no slot, as for an empty slot). This is the standard
two-table method stretched; Flint gives "two critical tables" only for the walker's centre torso and control
section.

- [ ] **Step 1:** Failing tests: the sheet renders a 5-slot head and a 20-slot centre torso in tables of six with
  die numbers; play mode's critical-hit helper rolls into them; a standard 'Mech's sheet is unchanged (snapshot).
- [ ] **Step 2:** Implement in `src/ui/components/svg/battlemech-svg.tsx` and the roster play critical table
  (`roster/_criticalHitTable.tsx`).
- [ ] **Step 3:** Unit tests, `npm run check`; print both 'Mechs from Chunk C and look at them.
- [ ] **Step 4:** Commit `Custom Homebrew: Future Wars construction on the record sheet and in play (#172)`, push,
  ledger, handoff.

## Chunk E: Fanzine equipment (after owner question 5)

Follows the batch plan's Chunk 3: records in the matching `*-custom.ts` catalog (`weapon-custom`, `ammo-custom`,
`misc-custom`), tags in `src/data/__fixtures__/tech-lists.json`, a test file after `custom-homebrew-batch.test.ts`.
Each record credits its author and cites the printed page. Any figure the article leaves out is left at the
"unverified" convention or labelled as ours, as the *Future Wars* #32 smoke devices do (`misc-custom.ts`).

- [ ] **Step 1:** Read each picked item's page image. Ledger: every figure printed and every figure missing.
- [ ] **Step 2:** Failing tests, records, unit tests, `npm run check`, commit, push, ledger, handoff.

## Chunk F: Verify and report

- [ ] **Step 1:** `npm run check`; confirm no bundled design changed.
- [ ] **Step 2:** Comment on #172 with what is in and what is not (walkers, the play rules, Power Armor, DropShips,
  the HMP designs), and leave it open while any of those is wanted.
- [ ] **Step 3:** Ask the owner about shipping. No deploy, `master` fast-forward or news entry without the answer.

## Other material in the Best-of (for owner question 5)

Printed pages. Bylines as printed. "Equipment" = catalog records; "play rule" = a Special Ruleset candidate.

| Printed p. | Title | Author | Kind |
|---|---|---|---|
| 8 | Ellena Industries Point Defense System (EII PDS) | Mike Reese | equipment (anti-missile) |
| 9-11 | The Development of the VHE Shell (VHE and Liao Inferno Gauss shells) | Chris Congdon | equipment (Gauss ammunition) |
| 20 | The Penitrator | Herb Barents | equipment (missile) |
| 21 | How to Kick Goliath Where it Counts (SABOT shells) | Charles J. Tomaszewski | equipment (autocannon ammunition) |
| 27 | Gatling Laser | Karl Sanders | equipment (weapon) |
| 27 | Swing Fire Missile System | Karl Sanders | equipment (launcher mount) |
| 27 | Rapid Fire Autocannon (Pom-Pom Guns) | Karl Sanders | equipment (autocannon conversion) |
| 28 | Long Range Flamer | Karl Sanders | equipment (weapon + ammunition) |
| 28 | Power Booster | Karl Sanders | equipment (with a burn-out table) |
| 7 | DropShip Construction | Mark Stock | construction rules (DropShips) |
| 14-16 | Power Armor: The Poor Man's Battlemech | Bill Swisher | unit type (5-ton suits) |
| 35-38 | Optional Rules for Building Walkers | Clell Flint | unit type (owner question 2) |
| 17 | Rules Variant: Opportunity Fire | Charles J. Tomaszewski | play rule |
| 18-19 | Strategic Movement for BattleTech | H. Barents | play rule |
| 22-26 | Stand, I Say!! Morale in BattleTech | H. Barents | play rule |
| 29 | Weapons Malfunctions During Combat | Karl Bruanning | play rule |
| 55-56 | The Long Range Wars (extended ranges) | Herb Barents | play rule |
| 33-34 | A Question on Economics | Herb Barents | campaign rule |
| 42-52 | BattleTech Planetary Assault Rules | Michael Reese | campaign rules |
| 57-59 | MechWarrior in a Box | Mark Stock | role-playing rules |
| 60-61 | City Raid | Herb Barents | scenario |

Not rules (nothing to bring in): the story "The Fast Devils" (pp.2-5); opinion pieces "Those Annoying Nonsense
Rules" (p.6) and "Weapons: Is There a Difference?" (pp.12-13); "3-D BattleTech" (pp.30-32); reviews of BattleTroops
(pp.39-41) and game books (pp.62-63); "The Goliath... A New Look" (pp.53-54, tactics); the classifieds (p.64).
