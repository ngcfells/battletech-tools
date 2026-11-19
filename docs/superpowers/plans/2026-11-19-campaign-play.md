# Campaign Play (survey, core, planet layer + Future Wars Economics) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Survey every campaign edition, then build the shared campaign core, its planet layer and the merged Future
Wars Economics ruleset with NGCFells's derived damage table, as the first shippable piece of campaign play.

**Architecture:** One saved `Campaign` record (sides, ledgers, log, force snapshots, optional planet) in
`src/classes/campaign/`; Economics and damage are pure functions in `src/data/`; the two rulesets are Special Rulesets
(category `campaign`) hooked into the campaign's step advance; screens under `game-management/campaigns/`.

**Tech Stack:** TypeScript, React (class and function components as the neighbours use), react-router, vitest +
testing-library.

**Spec:** `docs/superpowers/specs/2026-11-19-campaign-play-design.md` (approved by NGCFells 2026-11-19).

**Later plans (written after Task 1's check-in, one each):** Aces onto the core (adapter; the campaign list shows Aces
campaigns), planet editions (BattleForce 2, BattleForce 1987, Reese's Planetary Assault, Interstellar Operations),
unit editions (Mercenary's Handbook 1987, 3055, Field Manual: Mercenaries, Chaos Campaign, Campaign Operations,
Mercenaries 2025). Other Classic BattleTech unit types in the force (vehicles, fighters...) come with the first unit
edition; this plan snapshots 'Mechs and Alpha Strike units only.

## Global Constraints

- Work in `C:/repo/btt-work` on branch `work/2026-11-19`; check `git branch --show-current` before every commit.
- Tests run in **PowerShell only**: `npx vitest run <path>`; the full gate is `npm run check` (PowerShell).
- Every canon or fanzine figure is read from the page image (OCR is a lead only) and pinned by a test.
- User-facing text names **NGCFells** as the one who decided or derived anything; never "owner", "ours", "the app".
- Economics ruleset text must contain: "Both printings merged into one ruleset by NGCFells's decision."
- Damage table credit: "Inspired by Herb Barents, *Future Wars* #5"; derived by NGCFells. Fan rulesets show NOT OFFICIAL.
- Sources: *Future Wars* #5 (1987) pp.5-6 and *The Best of Future Wars, Volume One* (1991) pp.33-34, both Herb Barents.
- No Bash heredocs (write files with the Write tool). Do not edit ResourceLibrary while another agent is active there.
- New saved collections cap at 500 and are optional keys in the full backup (older backups still restore).
- Commit message footer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A backup with no `campaigns` key, or with malformed campaign entries, restores everything else and skips the bad
   ones with a warning (Task 3 test).
2. A campaign whose saved 'Mech was deleted or edited still opens and plays from its snapshot (Task 4 test).
3. Destroyed dots pay nothing and cannot sit in a combination (Task 5 test).
4. An area with no controller pays no one at payday, and a side with no areas gets no ledger entry (Task 7 test).
5. Advancing several months at once pays every third month exactly once, never at month 0 (Task 7 test).

---

### Task 1: Survey the campaign editions, then check in with NGCFells

**Files:**
- Create: `.superpowers/sdd/2026-11-19-campaign-play/survey.md` (ledger)
- Modify: `docs/superpowers/plans/2026-11-17-future-wars-originals.md` (line 45: remove the "pain factor" claim; line
  73/169: Chunk H Economics now points here)

**Interfaces:**
- Produces: the final `ICampaignEdition` hook list (names and signatures) written into this plan's Task 2 before it
  starts, after NGCFells approves.

- [ ] **Step 1:** For each source in the spec's "Sources to read" table, read its campaign chapters (text extract in
  `C:/repo/ResourceLibrary/text`; numbers, tables and names checked on the page image rendered from
  `C:/repo/JBTIICRework`). Ledger row per book/printing: what it tracks (money unit, time step, contracts, repair,
  salvage, experience, supply, territory), each table with page, and the hooks it needs. Note real rule differences
  between printings (separate editions) and misprints (follow the original).
- [ ] **Step 2:** Where an OCR extract is wrong on a passage used, list the correction in the ledger ("pending: another
  agent active in ResourceLibrary") instead of editing ResourceLibrary now.
- [ ] **Step 3:** Fix the re-plan's "pain factor" line and point Chunk H's Economics at this plan. Commit
  (`docs: campaign survey ledger; correct FW Economics reprint note`).
- [ ] **Step 4: STOP.** Show NGCFells the ledger summary and the proposed hook list. Write their answer into Task 2's
  Interfaces block. If the survey shows the core cannot carry an edition, take the design back to NGCFells.

### Task 2: Campaign core record

**Files:**
- Create: `src/classes/campaign/campaign-types.ts`, `src/classes/campaign/campaign.ts`
- Test: `src/classes/campaign/campaign.test.ts`

**Interfaces:**
- Produces (in `campaign-types.ts`):
  - `type CampaignTimeStep = "month" | "sortie" | "track"`
  - `type CampaignSideRole = "attacker" | "defender" | "other"`
  - `interface ICampaignSide { id: string; name: string; role: CampaignSideRole }`
  - `interface ICampaignLedgerEntry { id: string; sideId: string; step: number; amount: number; currency: string; reason: string; rule: string }`
  - `interface ICampaignLogEntry { id: string; step: number; text: string }`
  - `interface ICampaignDot { id: string; type: string; destroyed: boolean }`
  - `interface ICampaignArea { id: string; name: string; terrain: string; controllerSideId: string | null; dots: ICampaignDot[]; comboOverride: string[] | null }` (GM's chosen combination ids, in order; null = the app picks)
  - `interface ICampaignPlanet { name: string; areas: ICampaignArea[]; customDotTypes: ICustomDotType[] }`
  - `interface ICustomDotType { id: string; name: string; value: number; target: number }` (GM-added type; value
    default 1,000,000; destruction target default 8, builder's call: the middle of the table)
  - `interface ICampaignForceUnit` (Task 4 fills it; Task 2 stores it as given)
  - `interface ICampaignEdition { id: string; name: string; source: { title: string; publication: string; pages: string }; kind: "unit" | "planet" | "both"; currency: string; timeStep: CampaignTimeStep }` plus the hooks Task 1 settles
  - `interface ICampaignExport { version: 1; id: string; name: string; editionId: string | null; rulesetIds: string[]; step: number; sides: ICampaignSide[]; force: ICampaignForceUnit[]; ledger: ICampaignLedgerEntry[]; log: ICampaignLogEntry[]; planet: ICampaignPlanet | null; editionState: unknown }`
  - `CAMPAIGN_EXPORT_VERSION = 1`
- Produces (in `campaign.ts`): `class Campaign` with `constructor(data: ICampaignExport | null = null)`,
  `export(): ICampaignExport`, `import(data: unknown): void` (throws on non-object or missing id; drops malformed
  array items; caps each array at 5,000 entries), `get currency(): string` (edition's, else `"C"`),
  `get timeStep(): CampaignTimeStep` (edition's, else `"month"`), `balance(sideId: string, currency?: string): number`,
  `addLedger(entry: Omit<ICampaignLedgerEntry, "id">): void`, `addLog(text: string): void` (at the current step),
  `addSide(name: string, role: CampaignSideRole): ICampaignSide`, `advance(steps?: number): void` (Task 7 adds the
  ruleset hooks; here it only moves `step` and logs "Month N" / "Sortie N").

- [ ] **Step 1: Write the failing tests:** `"round-trips through export and import"` (a campaign with two sides, one
  ledger entry, one log line, a planet with one area and two dots exports and re-imports deep-equal);
  `"balances each side's ledger in its currency"` (+5,000,000 and -1,200,000 on side A, +3 on side B: `balance(A)` =
  3,800,000, `balance(B)` = 3); `"refuses a non-object and skips malformed items"` (`import("x")` throws; a ledger
  item without `sideId` is dropped); `"advances months and logs each"` (`advance(3)`: step 3, three log lines);
  `"uses C-bills and months with no edition"`.
- [ ] **Step 2:** Run `npx vitest run src/classes/campaign/campaign.test.ts` (PowerShell). Expected: FAIL, module not
  found.
- [ ] **Step 3:** Implement the types and class (ids from `src/utils/generateUUID.ts`; editions looked up from
  `src/data/campaign-editions/index.ts`, which exports `CAMPAIGN_EDITIONS: ICampaignEdition[] = []` and
  `findCampaignEdition(id: string | null): ICampaignEdition | undefined`).
- [ ] **Step 4:** Run the test. Expected: PASS.
- [ ] **Step 5:** Commit `Campaign play: core campaign record`.

### Task 3: Persistence and backup

**Files:**
- Modify: `src/dataSaves.ts` (beside the Aces campaign functions, lines ~28-45, ~99-102, ~137, ~880-910, ~1130-1141)
- Test: `src/dataSaves.test.ts`, `src/restore-backup-security.test.ts`

**Interfaces:**
- Consumes: `Campaign`, `ICampaignExport` (Task 2).
- Produces: `MAX_CAMPAIGNS = 500`, `saveCampaigns(appSettings, value: ICampaignExport[]): void`,
  `getCampaigns(appSettings): Promise<ICampaignExport[]>` (storage key `"campaigns"`), `IFullBackup.campaigns?`.

- [ ] **Step 1: Write the failing tests:** `"backs up and restores campaigns"` (two saved campaigns survive
  `getFullBackup` then restore); `"restores a backup with no campaigns key"`; `"skips an unreadable campaign with a
  warning"` and `"caps restored campaigns at 500"` (in the security test, following the Aces campaign cases there).
- [ ] **Step 2:** Run both test files. Expected: FAIL.
- [ ] **Step 3:** Implement following the Aces campaign pattern exactly (parse, cap, rebuild each through
  `new Campaign(raw).export()`, merge by id, "Add or replace campaign 'name'" messages).
- [ ] **Step 4:** Run both. Expected: PASS.
- [ ] **Step 5:** Commit `Campaign play: save, back up and restore campaigns`.

### Task 4: Force snapshots

**Files:**
- Create: `src/classes/campaign/campaign-force.ts`
- Test: `src/classes/campaign/campaign-force.test.ts`

**Interfaces:**
- Produces: `interface ICampaignForceUnit { id: string; sideId: string; kind: "battlemech" | "alpha-strike"; savedId: string | null; name: string; cost: number | null; bv: number | null; pv: number | null; snapshot: unknown; status: string }`;
  `snapshotBattleMech(mech: BattleMech, sideId: string): ICampaignForceUnit` (cost `getCBillCostNumeric()`, bv
  `getBattleValue()`, pv from its Alpha Strike conversion, snapshot `mech.export()`, savedId its uuid);
  `snapshotAlphaStrikeUnit(unit: AlphaStrikeUnit, sideId: string): ICampaignForceUnit` (cost `costCR`, pv
  `currentPV` or `basePoints` as the force page shows it, bv from the unit if present else null);
  `refreshForceUnit(unit: ICampaignForceUnit, saved: BattleMech | AlphaStrikeUnit): ICampaignForceUnit` (keeps id,
  sideId, status).

- [ ] **Step 1: Write the failing tests:** `"snapshots a 'Mech's cost, BV and PV"` (build a stock 'Mech the way
  neighbouring tests do; assert the three equal the class's own getters); `"keeps playing from the snapshot when the
  saved 'Mech is gone"` (snapshot, then re-create the 'Mech from `snapshot`: same name and cost);
  `"refresh replaces figures but keeps status"`; `"snapshots an Alpha Strike unit"`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `Campaign play: force snapshots`.

### Task 5: Economics (pure)

**Files:**
- Create: `src/data/future-wars-economics.ts`
- Test: `src/data/future-wars-economics.test.ts`

**Interfaces:**
- Consumes: `ICampaignArea`, `ICampaignDot`, `ICustomDotType`, `ICampaignSide`, `ICampaignLedgerEntry` (Task 2).
- Produces:
  - `FW_DOT_TYPES: { id: FwDotType; name: string }[]` with ids `light-manufacturing`, `heavy-manufacturing`,
    `mining`, `radioactive-materials`, `oil`, `food`, `refining`, `processing`
  - `FW_DOT_VALUE = 1_000_000`, `FW_PAYDAY_MONTHS = 3`
  - `interface IFwCombination { id: string; name: string; needs: Record<string, number>; pays: { total: number } | { multiplier: 2 | 3 }; source: string }`
  - `FW_PRINTED_COMBINATIONS`: mining 1 + refining 1 + heavy-manufacturing 1 → total 7,000,000; food 2 + processing 1
    → 6,000,000; oil 1 + refining 1 + processing 1 → 12,000,000 (source "Future Wars #5 p.5")
  - `getBestAreaIncome(area: ICampaignArea, combos: IFwCombination[], custom: ICustomDotType[]): { total: number; used: { comboId: string; dotIds: string[]; pays: number }[]; loose: string[] }`
  - `getPayday(areas: ICampaignArea[], sides: ICampaignSide[], combos: IFwCombination[], custom: ICustomDotType[], step: number): Omit<ICampaignLedgerEntry, "id">[]` (one entry per side that controls at least one paying area; reason lists areas; rule `"fw-economics"`; currency `"C"`)
- Algorithm (not fixed by the tests alone): count the area's live dots by type; best = max over "no more
  combinations" (each loose dot pays its value) and, for each combination whose needs fit the remaining counts, its pay
  plus the best of the remainder; memoise on the counts. A multiplier combination pays multiplier x the sum of its
  dots' values. Ties: fewer combinations first.

- [ ] **Step 1: Write the failing tests:** `"pays a million a loose dot"` (3 dots → 3,000,000);
  `"pays the printed combinations"` (mining+refining+heavy → 7,000,000; food, food, processing → 6,000,000;
  oil+refining+processing → 12,000,000); `"picks the grouping that pays most"` (mining, refining, heavy, oil,
  processing → 14,000,000 via oil+refining+processing, mining and heavy loose); `"a dot sits in one combination only"`
  (food x4 + processing x1 → 6,000,000 + 2,000,000); `"destroyed dots pay nothing and join no combination"`;
  `"a GM combination pays double or triple"` (light x2 at multiplier 2 → 4,000,000; at 3 → 6,000,000);
  `"custom dot types pay their own value"`; `"the GM's grouping overrides the best one"` (the five-dot area with
  `comboOverride: ["mining-refining-heavy"]` → 9,000,000; an override combination that no longer fits is skipped); `"payday goes to each area's controller; no controller pays no one"`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `Future Wars: Economics (merged printings) income and payday`.

### Task 6: Derived damage table (pure)

**Files:**
- Create: `src/data/future-wars-economic-damage.ts`
- Test: `src/data/future-wars-economic-damage.test.ts`

**Interfaces:**
- Produces:
  - `FW_DOT_DESTROY_TARGETS: Record<FwDotType, number>`: food 6, oil 7, mining 8, radioactive-materials 8, refining 9,
    processing 9, light-manufacturing 10, heavy-manufacturing 11 (custom types use their `target`)
  - `type FightSize = "lance" | "company" | "battalion" | "regiment"`; `FW_FIGHT_SIZE_MODIFIERS`: lance -2, company 0,
    battalion 1, regiment 2
  - `interface IDotDamageInput { size: FightSize; defenderRestraint: boolean; scorchedEarth: boolean }`
  - `getDotDamageModifier(input: IDotDamageInput): number` (restraint -1, scorched earth +3)
  - `isDotDestroyed(target: number, naturalRoll: number, modifier: number): boolean` (natural 2 never destroys)
  - `isDefenderRestraint(area: ICampaignArea, sides: ICampaignSide[], step: number): boolean` (controller's role is
    defender and step < 3)
  - `rollAreaDamage(area, custom, input, roll2d6: () => number): { dotId: string; roll: number; destroyed: boolean }[]`
  - `rollPartisans(dot: ICampaignDot, custom, roll2d6: () => number): { roll: number; destroyed: boolean }` (-2 only)

- [ ] **Step 1: Write the failing tests:** `"prints NGCFells's table"` (each target above); `"food falls on 6+ in a
  company fight"` (roll 6 → destroyed, 5 → not); `"a lance fight takes 2 off"` (food, roll 7 → not); `"heavy
  industry needs 11+"` (regiment, roll 9 → destroyed; company, roll 10 → not); `"a natural 2 never destroys"`
  (food, regiment + scorched earth); `"defender's restraint only in the first quarter"` (defender-held: step 2 true,
  step 3 false; attacker-held: false); `"partisans roll at -2"` (food: 8 → destroyed, 7 → not).
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `Future Wars: derived economic damage table (NGCFells, inspired by Barents)`.

### Task 7: The two rulesets and the campaign hooks

**Files:**
- Modify: `src/data/special-rulesets.ts` (two entries after the Future Wars play rulesets; `CHANGE_LABELS` gains
  `planetEconomics: "planet economics"`, `planetDamage: "economic damage"`)
- Create: `src/classes/campaign/campaign-rules.ts`
- Modify: `src/classes/campaign/campaign.ts` (`advance` calls the hooks)
- Modify: `src/ui/components/special-rulesets/ruleset-list.tsx` (optional prop `categories?: RulesetCategory[]`
  limits the list)
- Test: `src/classes/campaign/campaign-rules.test.ts`, `src/data/special-rulesets.test.ts`,
  `src/ui/components/special-rulesets/special-rulesets-step.test.tsx` (or the list's existing test file)

**Interfaces:**
- Consumes: Tasks 2, 5, 6.
- Produces:
  - Ruleset `fw-economics`: name "Future Wars: Economics", category `campaign`, `changes: ["planetEconomics"]`,
    `minRulesLevel: CUSTOM_HOMEBREW_RULES_LEVEL`, source publication "Future Wars", tag "FW #5", author "Herb Barents",
    summary within 120 chars, description: dots, 1 million each, quarterly payday, the three printed combinations,
    same-area rule, double/triple for others, one combination a dot, and "Both printings merged into one ruleset by
    NGCFells's decision."
  - Ruleset `fw-economic-damage`: name "Future Wars: Economic Damage (derived)", `requires: ["fw-economics"]`,
    `changes: ["planetDamage"]`, tag "FW #5", author "Herb Barents", description says the table is derived by
    NGCFells, "Inspired by Herb Barents, Future Wars #5", and prints the table and modifiers.
  - `CAMPAIGN_RULE_HOOKS: Record<string, { onStep?: (campaign: Campaign) => void }>`; `fw-economics.onStep` writes
    `getPayday(...)` entries when `timeStep === "month"` and `step % 3 === 0 && step > 0`, and logs "Payday".
    `fw-economic-damage` has no step hook (rolls are made from the planet page, Task 8).

- [ ] **Step 1: Write the failing tests:** `"pays on months 3, 6 and 9 only"` (`advance(9)` → three paydays, none at
  0); `"no payday without the ruleset ticked"`; `"no payday on a sortie edition"` (a test edition with timeStep
  "sortie"); `"a side with no paying areas gets no entry"`; ruleset tests: `"economics says the merge was NGCFells's
  decision"`, `"economic damage needs economics"` (`getRulesetBlock(["fw-economic-damage"]...)` / requires check as
  existing tests do); list test: `"limits the list to campaign rulesets"`.
- [ ] **Step 2:** Run the four files. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS. Also run `npx vitest run src/data/special-rulesets.test.ts src/ui/components/special-rulesets` (no regressions in summary-length and CHANGE_LABELS checks).
- [ ] **Step 5:** Commit `Future Wars: Economics and Economic Damage rulesets in campaigns`.

### Task 8: Campaign screens

**Files:**
- Create: `src/ui/pages/game-management/campaigns/_router.tsx`, `list.tsx`, `campaign-home.tsx`, `planet.tsx`,
  `campaigns.scss`
- Modify: `src/ui/pages/game-management/_router.tsx` (route `campaigns/*`), `src/ui/pages/game-management/home.tsx`
  (link "Campaigns")
- Test: `src/ui/pages/game-management/campaigns/campaigns.test.tsx`

**Interfaces:**
- Consumes: Tasks 2-7; `getCurrentCBTForce`, `getCurrentASForce` from `dataSaves.ts` for adding units.
- Produces: routes `game-management/campaigns` (list + New), `.../campaigns/:id` (home), `.../campaigns/:id/planet`.

Screens (follow the Aces campaign page's look and its save-on-change pattern):
- List: name, edition ("No edition rules" for now), month, Open / Delete (confirm). New: name, campaign rulesets
  through `RulesetList` with `categories={["campaign"]}`, sides (name + role, at least one).
- Home: step and Advance button; per-side balance and ledger table; log; force table (name, cost, BV, PV, status,
  Refresh, Remove) with "Add from current Classic BattleTech force" / "Add from current Alpha Strike force".
- Planet (shown when `fw-economics` is ticked): areas (name, terrain, controller, dots by type with add/remove and a
  destroyed mark), custom dot types, GM combinations (needs + double/triple), payday preview per area with the grouping
  used. When `fw-economic-damage` is ticked: an after-battle damage roller per area (fight size, scorched earth;
  restraint shown automatically) and a quarterly partisans roll; results logged and marked on the dots. Both rulesets
  show NOT OFFICIAL and their credits.

- [ ] **Step 1: Write the failing tests:** `"creates a campaign with a side and saves it"`; `"advancing three months
  shows a payday in the controller's ledger"`; `"payday preview shows the grouping that pays most"` (the 14,000,000
  area); `"the damage roller marks destroyed dots and logs them"` (inject the roll); `"the planet page is hidden
  without Economics"`; `"shows NOT OFFICIAL and NGCFells's merge note"`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Check in Chromium (dev server): create a campaign, add an area with the five-dot set, advance 3
  months, roll damage; no console errors, no overflow at 375 px.
- [ ] **Step 6:** Commit `Campaign play: campaign, ledger, force and planet screens`.

### Task 9: Ship

**Files:**
- Modify: `src/ui/pages/home.tsx` (news: today's entry gains a bullet "Campaigns (issue #172)": campaign record,
  Future Wars Economics with both printings merged by NGCFells's decision, NGCFells's derived damage table; Available
  Tools: Game Management gains Campaigns)
- Modify: `docs/superpowers/plans/2026-11-17-future-wars-originals.md` (Chunk H Economics ticked, pointing here)
- Modify: `C:/repo/JBTToolsSupportFiles/handoff.md` (new top block starting "FIRST: check memory, rules and guidelines")

- [ ] **Step 1:** `npm run check` in PowerShell. Expected: exit 0 (known 3 lint warnings only).
- [ ] **Step 2:** Commit `News: campaigns and Future Wars Economics`.
- [ ] **Step 3:** Merge `work/2026-11-19` into beta (fast-forward if possible), push origin, verify with
  `git ls-remote`, `git deploy-beta` (standing permission).
- [ ] **Step 4:** Handoff block (STATE, DONE, NEXT: the Aces plan and the edition plans from the survey) and commit it
  in JBTToolsSupportFiles.
