# Shared game settings block and Special Rulesets (#324)

Written 2026-10-26. Status: approved by the user 2026-10-26. Builder check done; answers folded in.

## Why

Each Classic unit builder ('Mech, Vehicle, Fighter, Small Craft, Capital Ship, Battle Armor, ProtoMech, Infantry,
Building) wires its own Rules Edition and Rules Level selectors (`rules-edition-select.tsx`,
`rules-level-select.tsx`). Tech base and era are wired separately per builder, and the 'Mech builder has them further
down its first tab. The duplication costs lines of code. Worse, the order is unhelpful: a choice made lower on the form
can change a choice already made above it.

The user wants one shared block of selectors, used by every builder and by Alpha Strike, as the very first step. That
way everything else on the page relates only to those choices, and changes only flow downward.

## The block, in order

0. **Special Rulesets**: yes/no, default **No**. A one-line description sits beside it. Draft: "Optional and
   homebrew rules that change how the game plays or how units are built. Leave this off for standard BattleTech."
   Yes opens the Special Rulesets window (below), where the user ticks rulesets. It comes first because a ruleset can
   set the minimum edition and reshape every list below it (user ruling).
1. **Edition**: the most important choice after rulesets.
2. **Rules Level**: what is allowed at all under the edition.
3. **Tech Base**.
4. **Era**: only eras valid for the tech base and the rulesets are offered. Clan and Mixed tech start at Clan Founding
   Years, and there is no Clan in the Star League (user ruling 2026-10-26, which replaces "era before tech base").

Rules:
- Each step offers only what the steps above allow.
- Changing a step resets any later step whose value no longer fits, to the nearest valid value (the existing
  `getClosestEraForTech` / `fitTechToEra` behaviour). Nothing ever changes a step above the one being edited.
- Nothing further down a builder may change these values. Equipment lists, era-specific options, Battledroids
  printed-unit pickers and so on read from the block.

## Special Rulesets window

A large pop-up window over the builder or roster (user ruling 2026-10-26), so an unsaved design is never lost. It
reuses the app's `StandardModal`. A "Choose rulesets" button beside the yes/no reopens it.


- One checkbox per ruleset. Only rulesets that change gameplay or construction go here. A single custom item or unit
  type (ArtVee, VTOLAM) does not (#324).
- A ruleset is a data record:
  - `id`, `name`, `description`, and `source` (title and link, for attribution).
  - Optional `minEdition`.
  - Optional limits on the steps below: allowed rules levels, tech bases removed, eras removed or replaced.
  - `changes`: the list of things it changes (for example `techBases`, `eras`, `heat`, `bv`).
- **Conflicts**: two rulesets whose `changes` lists overlap cannot both be ticked. Once one is ticked, the other's
  checkbox is disabled and names the ruleset it clashes with.
- **Sample ruleset only, for now** (user ruling): "Sample: The Clans never existed (alternate universe)". It removes
  the Clan and Mixed tech bases (`changes: ["techBases"]`) and has no edition or rules-level limit. Real rulesets
  arrive later through their own issues.

## Where it applies

- All nine Classic builders: the block replaces each builder's own edition, rules level, tech base and era controls,
  and the old per-builder wiring is deleted.
- Alpha Strike (user ruling): the AS unit creator, and the AS roster's MUL search filters (tech, era and rules there
  follow the block).
- **Builder's call:** the Classic roster's MUL search follows the block the same way, for consistency.

## Attribution (#324)

Every card, record sheet, TRO and printout of a unit built with rulesets names them, with the source link. Example:
"Special Rulesets: Sample: The Clans never existed (alternate universe), <source>". Nothing is shown when no rulesets
are in use.

## Calls made by the designer (check these)

1. **The settings live on each design.** Each saved unit stores its own rulesets, edition, rules level, tech base and
   era. Today rules level is one global app setting (`appSettings.mechRulesFilter`, about 87 uses). That setting
   becomes only the default for new designs and for roster searches.
2. Old saves load with no rulesets and their current values. A stored value the block would not offer is kept and
   shown as is, like `getShownRulesLevel` does today, until the user changes it.
3. Selecting rulesets in the window applies them to the design being built, or to the roster search the window was
   opened from.
4. **Downward reset is automatic, with a notice.** When an upstream change makes a later value invalid, the later value
   moves to the nearest valid one, and a short line under the block says what moved (for example "Era moved to Clan
   Invasion"). No confirmation step. This applies to loaded designs too, but only when the user edits a step; loading
   alone never changes a value (call 2).
5. **Builder-internal reads follow the design.** Every read of `appSettings.mechRulesFilter` inside a builder (equipment
   lists etc.) switches to the design's own rules level. The global setting remains only the default for new designs
   and for the roster searches.
6. **Steps a unit type does not use are hidden.** If a builder has no tech base or era today (check each: Infantry,
   Building, Battle Armor, etc.), the block hides that step for it instead of adding new behaviour. Editions marked
   `noEras` hide the Era step, as today.
7. The Era list comes from the existing data (`era-options` gives each era its tech bases; `getErasForTech`), minus
   anything the rulesets remove. Mixed tech before Clan Founding Years stays impossible. Edition-specific eras
   (Battledroids) are reached as today, through the edition step.
8. **Alpha Strike storage:** the AS unit creator stores the block on each custom unit. The AS and Classic roster
   searches store it with their existing search settings in app settings (`alphaStrikeSearchEra`/`Tech`,
   `cbtMULSearch`).
9. **Attribution reads the unit's save**, never the current block state, so a printout always shows what the unit was
   built under.

## Non-goals

- No real rulesets yet beyond the sample.
- No change to how rules levels, editions and eras are defined (`rules-editions`, `era-options`).
- No map or scenario rules.

## Suggested rounds (one per session, per standing practice)

1. Data: ruleset registry and sample AU, settings type, resolver (allowed options per step given the steps above),
   downward reset, conflict check. Unit tests.
2. Shared `GameSettingsBlock` component and the Special Rulesets window; wire into the 'Mech builder and remove its old
   controls.
3. The other eight Classic builders; delete the old per-builder code.
4. Alpha Strike creator and both roster MUL searches.
5. Attribution on cards, sheets, TROs and printouts. About and home news.

## Left to the builder

The component API, file names, how per-design settings are stored inside each class's save format, and the wording of
the disabled-checkbox reason.
