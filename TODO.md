# Product Roadmap

Open work for growing Jeff's BattleTech Tools from a BattleMech and vehicle creator into a full BattleTech
construction, import/export and record-management tool. Sections are in priority order: fix what ships
first, then make imports reliable, then check the data against the books, then add unit domains.
Finished items are moved to `TODO-Completed.md`, which also lists the commit history.

Local references (git-ignored, never imported by shipped code):

- `C:/repo/JBTIICRework/`: the reference library, about 870 files sorted into folders on 2026-10-06:
  `rulebooks/` (current Catalyst line, BMM, Core Rulebook, box sets), `rulebooks-legacy/` (Battledroids, BattleTech
  2nd/3rd Edition, Compendium, Master Rules, Maximum Tech, CityTech, AeroTech, BattleSpace and the FanPro printings),
  `alpha-strike/`, `errata/` and `errata-2025/`, `rpg/`, `technical-readouts/` (TROs, XTROs, Recognition Guides),
  `record-sheets/`, `sourcebooks/`, `maps-and-art/`, `apocryphal/` (BattleTechnology and licensed game material),
  `magazines/mechforce/`, `fan-made/`, `languages/de/` and `languages/es/`, `fiction/`, `Custom/`. Text extracts are
  flat in `text/`. `INDEX.md` there has the editions, page offsets (printed page = PDF page - offset), errata
  applicability and a generated catalog of every file; `_reorg-2026-10-06.json` records each rename and the 97
  duplicates removed.
- `WorkingData_DEV/SSWdata/`: Solaris Skunk Werks designs (3,358 `.ssw`, shallow clone of
  Solaris-Skunk-Werks/SSW-Master).
- `WorkingData_DEV/mmlData/mekfiles/`: MegaMek unit files (4,312 `.mtf`, 6,723 `.blk`) for every unit type,
  including `advancedbuildings` and `ge`. Licensed CC BY-NC-SA 4.0.
- `WorkingData_DEV/HMPdata/`: HeavyMetal Pro/Vee files (2,963 `.hmp`, 515 `.hmv`).
- `WorkingData_DEV/TDBdata/`: The Drawing Board files (630 binary `.dbm`).
- `WorkingData_DEV/format-references/megamek/`: MegaMek loaders used as format references: `HmpFile`,
  `HmvFile`, `TdbFile` (from tag v0.49.19, since removed from MegaMek), and current `MtfFile`, `BLKFile`,
  `BLKMekFile`. GPL: read them for the file layout; don't copy code.

## 1. Fix what ships

- [x] Record sheet parity (beta feedback item 10, spec `docs/superpowers/specs/2026-10-21-beta-feedback-design.md`):
  every sheet carries the tables and helpers the Total Warfare record sheet for that unit type prints, laid out
  close to it, with our own silhouettes, and is checked in the browser against a render of the official sheet.
  Done: Combat and Support Vehicles (ground, VTOL, naval, submarine, super-heavy, Large Support Vehicle,
  Large Naval Vessel); 'Mechs (heat scale 30 down to 0 with Overflow; every other TW block was already there);
  aerospace and conventional fighters and fixed-wing support vehicles; Small Craft and DropShips (aerodyne and
  spheroid; DropShip weapons listed by bay, TM p.199); JumpShips, WarShips and space stations (SO:AA pp.9-11,
  laid out like the Strategic Operations sheets); battle armor (five squads to a page with the leg, swarm,
  swarm modifier, swarm hit location and transport position tables, TW pp.221-222, 227); conventional infantry
  (four platoons or sub-platoons to a page with the leg, swarm, swarm modifier, non-infantry weapon and
  burst-fire tables, TW pp.216-217, 221); ProtoMechs (a Point of five to a page with the weapons inventory,
  pilot data, hit location and critical hit boxes, armor diagram and each chassis's torso weapon roll, TW
  pp.185-187, IO:AE pp.93-94); buildings (the TO:AUE p.215 Structure Record Sheet with a four-level structure map,
  each hex's CF, armor and entry cost, the building critical hits table and the structure rules, with continuation
  pages for long walls); Airships and Satellites (the TW Airship Record Sheet and the TO:AUE p.213 Satellite
  Record Sheet: craft data and inventory, armor diagram with our own silhouettes, crew data, critical damage with
  the thrusters and the -1 to -5 engine track, and for an Airship the velocity record and the Airship Velocity
  Table, TW p.204; Fixed-Wing Support Vehicles stay on the conventional fighter sheet). The drawing helpers are
  shared in `src/ui/components/svg/record-sheet-svg-kit.tsx` and `aerospace-record-sheet-svg-blocks.tsx`. The
  *Battledroids* tanks, jeeps and infantry (BD pp.22-23) print two to a page in the style of the book's droid
  sheet, with its to-hit, movement, terrain and target modifiers, the Tank Hit Locations, the Missile Hit Table and
  the tank firing arc (2026-10-22).
- [ ] End-to-end tests written for the old HTML record sheets fail on the SVG sheets (Chromium, 24 tests), and the
  Firefox and WebKit runs are owed: [#22](https://github.com/ngcfells/battletech-tools/issues/22),
  [#23](https://github.com/ngcfells/battletech-tools/issues/23), [#24](https://github.com/ngcfells/battletech-tools/issues/24),
  [#25](https://github.com/ngcfells/battletech-tools/issues/25).
- [ ] *Battledroids* droids still print on the TW-style 'Mech sheet. A sheet in the style of the book's droid
  record sheet (the photocopiable droid sheets bound into BD) is not built. ([#52](https://github.com/ngcfells/battletech-tools/discussions/52))
- [ ] Verify before using: a fan-made vehicle sheet says a CASE-protected ammunition critical removes all rear
  armor and stuns the crew. Find the rule in the library before printing it on our sheet. ([#57](https://github.com/ngcfells/battletech-tools/discussions/57))
- [x] Hailstorm Artillery (Apocryphal, MechWarrior 5): towed, 35 damage at 12 mapsheets, 25 tons, 4 shots a ton, with the
  munitions the other tubes share (2026-10-22; TRO.md). Cost, BV and heat are scaled from the Long Tom.

- [ ] BV differs from SSW's BV2 figure: after the import fixes, 350 of 2,610 non-bundled designs match
  exactly and 805 within 2%. Work through the differences by cause (unplaced criticals and unknown
  equipment first, since they skew BV). ([#46](https://github.com/ngcfells/battletech-tools/issues/46))
- [ ] MUL 2.0 records have no BFThreshold, Rules or ImageUrl: aerospace cards lack their armor threshold and
  MUL 2.0 units have no rules level. Extend `tools/mul-sync/sync-mul.mjs` to collect them. ([#48](https://github.com/ngcfells/battletech-tools/issues/48))
- [ ] Custom MUL entries (`mul2+mul1+custom` source, Custom MUL Editor) exist only in this fork. Decide
  whether to offer them upstream as their own PR. ([#75](https://github.com/ngcfells/battletech-tools/discussions/75))

## 2. Import and export adapters

Imports convert into the canonical JSON model; exports convert back out. Every adapter needs round-trip
tests (source file -> canonical -> exported file -> canonical, with no loss), and the canonical model must
keep whatever a format needs to be written back faithfully: critical-slot order and indexes, manufacturer
and fluff text, quirks, source/book fields, and per-format IDs (MUL id, SSW solaris7id, MegaMek UUID).

### Shared

- [ ] Make the canonical JSON format versioned, documented, and stable enough to be the app's long-term
  interchange format. Decide as group whether we should use a dedicated extension or stick with json. ([#53](https://github.com/ngcfells/battletech-tools/discussions/53))
- [ ] Keep provenance on imported records: source file, source format, source book, and conversion warnings. ([#53](https://github.com/ngcfells/battletech-tools/discussions/53))
- [ ] Import review screen: parsed fields, unmapped fields, warnings, provenance, and the final canonical
  record before saving. ([#53](https://github.com/ngcfells/battletech-tools/discussions/53))
- [ ] Add MegaMek's names to the records' `altNames`: its equipment classes list each item's internal name
  and lookup names (the names MTF, BLK, HMP and older SSW files use). Review them as data; `name_changes.txt`
  in the MegaMek data maps renamed units. ([#53](https://github.com/ngcfells/battletech-tools/discussions/53))
- [ ] Bulk import audits as dev tools (not tests, since the fixtures stay in `_DEV`): run every sample file
  of a format through its importer and report crashes, unknown equipment, unplaced criticals, and BV/cost
  against the value stored in the file. ([#53](https://github.com/ngcfells/battletech-tools/discussions/53))

### Solaris Skunk Werks (`.ssw`)

The SSW audit (every design in `WorkingData_DEV/SSWdata` through `importSSWXML`) found the importer handled
only the bundled 3039/3050 Inner Sphere set. Fixed: Clan items (the `(CL)` prefix), Clan designs' unprefixed
items, Mixed Tech designs, the `(T)` turret prefix, and every SSW spelling added to the records' `altNames`.

Audit on 2026-09-30, all 3,864 files (bundled and `WorkingData_DEV`): 3,727 designs resolve every item (1,290
before the `altNames` rework). 43 names remain, all listed below. Of the bundled designs, only Electronic
Warfare Equipment, Collapsible Command Module and Communications Equipment are left; a test pins that list.

Audit on 2026-09-29, the 2,846 designs outside the bundled set: 1,780 of the 2,610 BattleMechs import with no
errors (433 before these fixes), 828 still drop some equipment (155 distinct names), 358 leave criticals
unplaced, 2 change on a JSON save/load, and 350 match SSW's BV exactly (805 within 2%). Of the 512 bundled
designs, 44 still report errors (421 before).

- [ ] Unplaced criticals: jump jets (822 across the designs), heat sinks (251), ferro-fibrous (128),
  ER lasers, ECM, C3i. Compare the SSW placements with our allocation (the earlier list of 12 bundled
  designs: ANH-3A, AWS-10KM, CTF-5D, CGR-KMZ, CLNT-6S, FS9-B, JR7-C2, CRK-5003-CJ, PNT-14S, WTH-3, WTH-K,
  "Grinner" Wolfhound IIC). ([#43](https://github.com/ngcfells/battletech-tools/issues/43))
- [ ] Chassis component names with no record yet (they report an import error): Primitive Structure,
  Primitive Industrial Structure, Primitive I.C.E./Fuel-Cell engines, Industrial Armor, Ablation Armor,
  Prototype Improved Jump Jet, Primitive Prototype Jump Jet, No Gyro, and every cockpit but Standard and Small. ([#54](https://github.com/ngcfells/battletech-tools/discussions/54))
- [ ] Canon equipment with no catalog record yet (needs TO:AUE/TM stats before adding): B-Pod, M-Pod,
  Coolant Pod, Chaff Pod, BattleMech Taser and ammo, TSEMP / TSEMP One-Shot, HarJel II/III, ProtoMech AC/2,
  AC/4, AC/8 weapons (their ammo exists), Collapsible Command Module, Communications Equipment, Electronic
  Warfare Equipment, Drone Operating System, Vehicular Grenade Launcher, Cargo (Standard/Liquid), C3 Remote
  Sensor Launcher and ammo. ([#54](https://github.com/ngcfells/battletech-tools/discussions/54))
- [ ] Adapter cases: `X (Insulated)` is a laser plus the Laser Insulator (TO:AUE); "Extra Double Heat Sink
  (Freezers)" placed as equipment; Clan `ER PPC + PPC Capacitor` exists only as a custom record. ([#44](https://github.com/ngcfells/battletech-tools/issues/44))
- [ ] SSW data quirks, one design each: an Inner Sphere design with an unprefixed `Streak SRM-6 CP` (Highlander
  HGN-732 Colleen); `(IS) Enhanced ER PPC` outside Mixed designs (IO p. 95: Clan tech). ([#44](https://github.com/ngcfells/battletech-tools/issues/44))
- [ ] Import clarification step (approved design 2026-09-30): before an SSW import is accepted, ask the importer
  about each new unknown item (tech base IS/Clan, tons, slots; optional damage/heat/ranges and a source note),
  each with "I don't know". Best guesses: design's tech base, the slot estimate, the tonnage gap split across
  unknown-weight items, all marked estimated. Accept stays disabled until every required answer is given.
  Split the session into analyze and accept-with-answers. ([#54](https://github.com/ngcfells/battletech-tools/discussions/54))
- [ ] IndustrialMechs and Primitive BattleMechs/IndustrialMechs are skipped entirely (234 designs):
  `importSSWXML` only accepts `mech_type` "BattleMech". ([#54](https://github.com/ngcfells/battletech-tools/discussions/54))
- [ ] Two OmniMech files fail to parse (`Summoner (Thor)`, `Puma (Adder)` with `model=""`:
  "readTagExp returned undefined"). ([#42](https://github.com/ngcfells/battletech-tools/issues/42))
- [ ] OmniMech configurations: SSW stores every loadout in one file; import them as our OmniMech
  configurations instead of only the base loadout. ([#54](https://github.com/ngcfells/battletech-tools/discussions/54))
- [ ] Drafts have no editor page yet (phase A2), so their stats can't be entered in the UI. Until then a
  draft's placeholder has unknown (0 at runtime) weight, damage, heat and BV. ([#54](https://github.com/ngcfells/battletech-tools/discussions/54))
- [ ] Custom chassis components (seven `mech-custom-*-types.ts` catalogs) resolve on import but don't appear in
  the construction steps' selection lists yet. ([#54](https://github.com/ngcfells/battletech-tools/discussions/54))
- [ ] Custom cockpit catalog: unknown cockpits are reported (`kind: "cockpit"`) but never drafted. ([#54](https://github.com/ngcfells/battletech-tools/discussions/54))
- [ ] SSW import follow-ups from the 2026-09-30 branch review (lower confidence, not fixed yet):
  slot estimates ignore `splitLocations`; "incomplete custom stats" is flagged only on the review screen, not
  in the Mech Creator or the saved record; two files with the same name overwrite each other's evidence XML but
  keep the first hash; every draft stores whole source files, so big batches can hit the storage quota; ammo
  drafts don't feed their weapon draft (`getAllAmmo` excludes local drafts); `crypto.subtle`/`randomUUID` need
  a secure origin (LAN dev over http). ([#45](https://github.com/ngcfells/battletech-tools/issues/45))
- [ ] Custom content PR submission (phase A2 of the same plan, deferred 2026-09-30): catalog merge serializer,
  multi-file GitHub PR with a never-merged evidence branch, submission orchestrator, drafts editor page
  (plan Tasks 9, 10, 11, 13). Until then, copy a local draft's record into the custom catalog by hand. ([#54](https://github.com/ngcfells/battletech-tools/discussions/54))
- [ ] SSW export: write `.ssw` XML (SSW save file version 3) from a BattleMech. ([#54](https://github.com/ngcfells/battletech-tools/discussions/54))

### MegaMek / MegaMekLab (`.mtf`, `.blk`)

- [ ] MTF parser (BattleMechs, IndustrialMechs, LAMs, QuadVees, Tripods) into the canonical model, using the
  equipment-name bridge. Reference: MegaMek `MtfFile`. 4,312 samples. ([#55](https://github.com/ngcfells/battletech-tools/discussions/55))
- [ ] BLK parser shared by every other domain (the block reader `blk-file.ts` and the battle armor mapping landed
  2026-10-08), one mapping per unit type as each domain lands: vehicles and
  support vehicles, battle armor, infantry, ProtoMechs, fighters, small craft, DropShips, JumpShips,
  WarShips, space stations, gun emplacements and buildings. Reference: MegaMek `BLKFile` and the
  `BLK*File` loaders. 6,723 samples. ([#55](https://github.com/ngcfells/battletech-tools/discussions/55))
- [ ] MTF and BLK export. ([#55](https://github.com/ngcfells/battletech-tools/discussions/55))
- [ ] Licensing: the MegaMek data is CC BY-NC-SA 4.0. Importing a user's own files is fine; bundling any
  MegaMek unit data in the app needs a decision first (as the SSW data carries its own notice today). ([#55](https://github.com/ngcfells/battletech-tools/discussions/55))

### HeavyMetal Pro / HeavyMetal Vee (`.hmp`, `.hmv`)

- [ ] HMP reader (binary, `V5.00` header): port the field layout documented by MegaMek's `HmpFile` (a Java
  port of Hmpread) into a TypeScript reader. 2,963 samples; `Mech.lst` files list the designs per folder.
  The `hmp_dumper.py` in `HMPdata/hmpFiles/ClanCustoms` is only a raw byte scanner. ([#56](https://github.com/ngcfells/battletech-tools/discussions/56))
- [ ] HMV reader for vehicles (`HmvFile`). 515 samples. ([#56](https://github.com/ngcfells/battletech-tools/discussions/56))
- [ ] HMP/HMV export: write the binary format once the reader round-trips every sample byte for byte. ([#56](https://github.com/ngcfells/battletech-tools/discussions/56))

### The Drawing Board (`.dbm`)

- [ ] The 630 samples are TDB's binary `.dbm` format ("Drawing Board Mech" header, fixed-width records).
  MegaMek's `TdbFile` reads only TDB's XML export, so the binary layout has to be worked out from the
  samples; `TdbFile` still documents the field meanings. Support the XML export as well. ([#56](https://github.com/ngcfells/battletech-tools/discussions/56))
- [ ] TDB export, once the reader is verified. ([#56](https://github.com/ngcfells/battletech-tools/discussions/56))

### Other tools

- [ ] The Mech Factory and The Vehicle Factory: find sample files and any format documentation before
  committing time. ([#56](https://github.com/ngcfells/battletech-tools/discussions/56))

## 3. Check the data against the sourcebooks

- [ ] Sourcebook validation tool (`tools/`, dev only): check every catalog table entry against the rulebook
  text in `C:/repo/JBTIICRework` and report mismatches with book and page. Cover weapons, ammunition,
  equipment, engines, gyros, cockpits, structure, armor, heat sinks, jump jets and myomer: weight, slots,
  damage, heat, ranges, BV, cost, tech rating and dates. Records whose book isn't local are listed as
  unchecked, not passed. ([#57](https://github.com/ngcfells/battletech-tools/discussions/57))
- [ ] Items waiting on a source (fold into the tool's report as it lands): ([#57](https://github.com/ngcfells/battletech-tools/discussions/57))
  - LAM and Tripod values cited "via MegaMek" (chassis rules levels, IO p.50; cost multipliers; Superheavy
    costs; the Tripod prohibited-equipment list).
  - Naval vehicles over 300 t use MegaMek's suspension formula, unverified (no hit in the library text).
  - Artillery Thunder/FASCAM ammo BV against the rack-size formulas (the TO:AUE p.198 Alternative Munitions
    Table has the "Thunder/FASCAM †" row; the formula is not checked); IndustrialMech armor (Industrial,
    Heavy Industrial, Commercial).
- [ ] Apocryphal hunt: `enhanced_er_ppc`, `enhanced_er_large_laser` and `enhanced_clan_lrm_10` don't match
  IO's Clan Enhanced PPC / Improved Large Laser / Improved LRM statistics; Clan LRM Mag-Pulse ammo has no
  Clan IO window. Decide the canon mapping or move them to custom. ([#49](https://github.com/ngcfells/battletech-tools/issues/49))
- [ ] Records with no IO munition data, kept as-is: LRM Incendiary, SRM Tear Gas, SRT Harpoon, Vehicle/Heavy
  Flamer Inferno and Water. Historical tags ammo-long-tom-ap, ammo-sniper-ap and ammo-thumper-ap have no
  canon round. ([#57](https://github.com/ngcfells/battletech-tools/discussions/57))
- [ ] Inventory all equipment lists against the current rulebooks and identify missing, duplicate, renamed
  and obsolete entries. Equipment shared by 'Mechs, vehicles, aerospace, DropShips, WarShips and infantry
  is represented once, with domain legality metadata. ([#57](https://github.com/ngcfells/battletech-tools/discussions/57))

## 4. Unit domain architecture (before the new domains)

- [ ] Define a versioned canonical record schema shared by all unit domains: schema version, source
  metadata, unit domain and ruleset. Importers and exporters stay adapters around it; the UI and saved
  files never depend directly on SSW, MTF, BLK, HMP or other vendor formats. ([#53](https://github.com/ngcfells/battletech-tools/discussions/53))
- [ ] Split shared concepts (identity, era, faction, tech base, movement, armor, structure, equipment,
  crew, rules level, source attribution, notes) from domain-specific ones (BattleMech, vehicle, aerospace,
  capital, infantry, battle armor, ProtoMech, building). ([#53](https://github.com/ngcfells/battletech-tools/discussions/53))
- [ ] Unit-domain registry and capability matrix, so routes, equipment legality, record sheets and
  importers select behavior by domain instead of checking BattleMech-specific fields. ([#53](https://github.com/ngcfells/battletech-tools/discussions/53))
- [ ] Extract BattleMech construction logic behind the first domain interface without changing BattleMech
  behavior; keep existing BattleMech JSON exports loading. ([#53](https://github.com/ngcfells/battletech-tools/discussions/53))

## 5. New unit domains

Each domain gets: construction model and rules, an editor, a record sheet, BV and cost, Alpha Strike
conversion, roster/play support, MTF/BLK import from the MegaMek samples, and browser tests. Order: most
played first, then by dependency.

### Battle Armor

- [ ] Battle armor still owed: `.blk` export (left off for now at the user's word, 2026-10-08). ([#55](https://github.com/ngcfells/battletech-tools/discussions/55))
- [x] Record sheet like the Total Warfare one (2026-10-22): five squads to a page, so the roster prints its
  battle armor together and the creator prints the base design with its loadouts.

### Conventional Infantry

- [ ] The Infantry Creator builds platoons (motive types, weapons by era, armor kits, specializations, record sheet,
  BV, cost, Alpha Strike card). Still owed: beast-mounted infantry, field guns and field artillery, and transport
  capacity checks against vehicle and aerospace bays. ([#58](https://github.com/ngcfells/battletech-tools/discussions/58))
- [x] Record sheet like the Total Warfare one: four platoons to a page, a block per sub-platoon, and the
  anti-'Mech, non-infantry weapon and burst-fire damage tables.

### Aerospace and Conventional Fighters

- [ ] The Fighter Creator builds aerospace, conventional and OmniFighters with bombs and external stores, record
  sheets, BV, cost and Alpha Strike cards. Still owed: atmospheric and orbital movement in play (altitude,
  velocity) and the air-to-ground attack rules. ([#59](https://github.com/ngcfells/battletech-tools/discussions/59))

### ProtoMechs

- [x] Record sheet like the Total Warfare one: five ProtoMechs to a page, quads and Gliders included
  (2026-10-22).

- [ ] Found in that check: buildings have no Alpha Strike card, and saved buildings and saved vehicles are not
  offered to an Alpha Strike force. (ASCE says advanced buildings have their own unit card; the rules for
  it have not been read yet.) ([#60](https://github.com/ngcfells/battletech-tools/discussions/60))
- [ ] ProtoMechs, left for the MegaMek import and export run (user, 2026-10-09): `.blk` export; the
  Svartalfa 3 file, 100 kg over, with no printed sheet to check. ([#55](https://github.com/ngcfells/battletech-tools/discussions/55))

### Small Craft

- [ ] Small Craft readings for the user to rule on (2026-10-09). Each is built as stated and noted in the code:
  1. Free armor from the structure: the rule gives the Structural Integrity "per facing" (TM p.191); the
     Astrolux example pools the points and shares them out freely (TM p.192). Built as the example: a pool.
  2. Free heat sinks: the table gives engine tons / 60 (aerodyne) or the square root of engine tons x 1.6
     (spheroid) (TM p.193), and the Astrolux gets 1 (TM p.194); a sentence on p.195 speaks of Small Craft's
     "initial 10 free sinks". Built by the table and the example.
  3. Bay doors: "transport bays for any unit type other than infantry" need a door (TM p.196). Read as unit
     bays; a cargo bay carries no unit and needs none (many published craft have doorless cargo bays).
  4. Ten turns of fire (TM p.194) is not asked of anti-missile systems, which fire only at incoming
     missiles (the published Oo-Suzumebachi carries 48 rounds for 6 systems).
  5. Battle Value, rear-firing weapons (TM p.312): on an aerodyne craft the wing weapons turned to the rear
     count as rear-firing with the aft ones; a spheroid's aft-side arcs are "not considered", as the book
     says. The Master Unit List agrees on the first; on some cards (the three Aquarius Escorts, exactly) it
     leaves out the 15 points for each type of explosive ammunition, on others it applies them. Built by
     the book.
  6. Battle Value heat of rapid-fire weapons: the x 2 (Ultra) and x 6 (rotary) apply to the heat of one
     shot, not to the aerospace heat value, which is already a full burst. The fighter class multiplies the
     aerospace value; it should be checked the same way (no rotary-armed fighter is in its tests).
  7. Prices: quarters are not charged (the Nekohono'o example, TM p.284: "part of the life support costs"),
     though the equipment table prices them. Battle armor bays are charged 15,000 a ton as the table has it;
     the same example calls them free. Same-book conflict, to be ruled on.
  8. A Clan craft takes the Clan engine factor (TM p.184). MegaMek's files mark Clan Small Craft
     `clan_engine false`; the flag is read only for a Mixed Tech craft.
  9. MegaMek's crew count takes in the troops carried in bays; on import the crew is whoever has quarters.
  10. Alpha Strike: converted as a large aerospace unit with four firing arcs (ASC pp.101-102), heat worked
      over all weapons (ASC pp.115-116). Armor, structure, Threshold and Move match the published cards.
      The Point Value follows ASC p.144 with errata v1.6 and is marked provisional: published unarmed Small
      Craft run 4 points higher than the formula gives (Astrolux 16 against 12, S-7A Bus 16 against 12),
      and the source of that 4 has not been found. VSTOL is given to aerodyne craft only; LG and SPC to all. ([#61](https://github.com/ngcfells/battletech-tools/discussions/61))
- [ ] Small Craft still owed: the Alpha Strike roster cannot take them (its cards have no firing arcs;
  DropShips will need the same card); primitive Small Craft (IO:AE; 5 sample files); the hyperspectral
  imager, space mine dispenser and booby trap are not in the catalog; a `.blk` export (with the MegaMek
  run); the two 5-ton sample "Small Craft" (Escape Pod, Life Boat) are not buildable units. ([#61](https://github.com/ngcfells/battletech-tools/discussions/61))
- [ ] Found while building Small Craft: the weekly Master Unit List sync files every "Aerospace Craft"
  (Small Craft, DropShips, JumpShips, WarShips, stations) as type AF and does not read their firing arcs,
  so those bundled cards show no damage; the catalog gives the Clan Rotary AC/2 and AC/5 an aerospace heat
  of 1 where the Inner Sphere ones have 6; CASE is marked as not mountable on Small Craft (`smallCraft: -1`),
  to be checked against TM p.210. ([#29](https://github.com/ngcfells/battletech-tools/issues/29), [#30](https://github.com/ngcfells/battletech-tools/issues/30), [#32](https://github.com/ngcfells/battletech-tools/issues/32))

### DropShips

- [ ] Capital and sub-capital weapons in the DropShip Alpha Strike conversion and in play (damage, criticals). ([#60](https://github.com/ngcfells/battletech-tools/discussions/60))
- [x] DropShip record sheet layout (2026-10-22: its own page, weapon bays, crew data, K-F boom and docking collar).
- [ ] The Alpha Strike large-craft card for DropShips. ([#60](https://github.com/ngcfells/battletech-tools/discussions/60))
- [x] K-F Boom and Docking Collar criticals in play (2026-10-22, from AeroTech 2 Revised pp.29-30, 48-49): a
  DropShip's boom or collar is destroyed and its box filled; a Small Craft's hit has no effect. The collar can also be
  marked damaged by a docking mishap (twice the docking time); play shows the docking modifiers the ship's own damage
  brings. The docking procedure itself is not tracked (no map system).
- [x] Small Craft fire in full weapon bays (2026-10-22, user ruling: the latest publication with its errata stands,
  TM errata v8.0 of 2024-08-22, which revised the p.195 bay rules, over TW, corrected 11th printing, (c) 2023). The
  Small Craft sheet lists bays at standard scale, and play fires a bay from one box, for DropShips too.
- [ ] Check imported DropShip BV against the MUL where it has one (most DropShips show BV 0 there; the
  Overlord A3 imports at 25,708 against 24,600). ([#47](https://github.com/ngcfells/battletech-tools/issues/47))

### JumpShips, WarShips and Space Stations

- [ ] JumpShip construction: K-F drive, jump sail, docking collars, grav decks, lithium-fusion batteries. ([#62](https://github.com/ngcfells/battletech-tools/discussions/62))
- [ ] WarShip construction with capital weapons, bays, arcs and naval armor. Confirm the current
  capital-ship construction rules (edition) before starting. ([#62](https://github.com/ngcfells/battletech-tools/discussions/62))
- [ ] Space stations (MegaMek `spacestation` samples). ([#62](https://github.com/ngcfells/battletech-tools/discussions/62))
  - 2026-10-15: the construction model for all three is in `advanced-aerospace-construction.ts` and
    `classes/capital-ship.ts` (SO:AA pp.130-149 with errata v5.0); the three book examples reproduce. Creator
    pages, Battle Value, record sheet and Alpha Strike card are done (below). Still owed: cost check against a
    published design, pressurized repair bays (TO:AUE p.146), and checking imports against the mm-data
    JumpShip, WarShip and station samples.
  - JumpShip firing arcs: SO:AA p.142's text gives JumpShips the broadsides, its p.133 table does not. Same
    book, so MegaMek decides (broadsides on WarShips only); flagged in the module.
  - The K-F boom on a station has no weight in SO:AA (p.139); only its cost multiplier is modelled.
  - 2026-10-22: the record sheet is a full page like the Strategic Operations JumpShip, WarShip and station sheets
    (armor in capital-scale squares by facing, integrity tracks in the hull, crew data, critical damage, heat per
    arc, velocity record).
- [ ] A station's jump sail with energy storage batteries (SO:AA p.136) is not built; its record sheet leaves the
  official sheet's Sail Integrity line blank to write in. ([#62](https://github.com/ngcfells/battletech-tools/discussions/62))
- [ ] SDS (Caspar) drone control system (IO p.143; Historical: Liberation of Terra I p.159): a percentage of
  the vessel's weight on top of the controls, quarters for half the minimum crew, the SDS self-destruct, and
  WarShip drones of 800,000 tons at most. SDS WarShip drones still carry a K-F drive; the fail-safe only stops
  them jumping while the AI is active. ([#62](https://github.com/ngcfells/battletech-tools/discussions/62))

### Buildings, Gun Emplacements and Mobile Structures

- [x] Record sheet like the Tactical Operations Structure Record Sheet (TO:AUE p.215), 2026-10-22.

- [ ] Capital weapons by rules edition (user, 2026-10-07: where editions disagree, each edition's values are
  listed so the selected edition shows its own). `ICapitalWeapon` takes `introducedInEdition` and
  `editionStats`; BattleSpace (1993), AeroTech 2 (2000) and its Revised Edition (2004) are not entered yet. ([#63](https://github.com/ngcfells/battletech-tools/discussions/63))
- [ ] Custom rule to propose: a price for capital fire control (the books give none; the user wants everything
  priced under custom rules). Needs a figure the user approves. ([#63](https://github.com/ngcfells/battletech-tools/discussions/63))
- [ ] Buildings, still owed: ([#63](https://github.com/ngcfells/battletech-tools/discussions/63))
  - Light and Medium weapons in play: the critical hit table's weapon results pick only Heavy weapons, and
    burst, flame and anti-aircraft effects are shown as letters, not applied.
  - Capital weapons in play: ammunition used, critical hits on them, and fire at aerospace units; the record
    sheet lists them and nothing more.
  - Castles Brian open-space collapse effects by location, and the fire modifiers for Castles Brian hexes
    (TO:AR pp.42, 137).
  - The Expanded Construction Factor rules (a CF for each level, top-down collapse, total collapse), collapse
    splash damage and the domino effect (TO:AR pp.119-124); splash and adjacency need the building's shape on
    the map.
  - Attacks on equipment from inside (p.119); weapon fire by the building with to-hit numbers; hangar movement
    reductions, which depend on the moving unit's height (p.117); fuel type, leaks and explosions for liquid
    storage in play (pp.132-134); elevator position and door state in play; semi-subsurface buildings and
    basements as one design (p.138); the PCMT-fed generator; flight decks, helipads, mobile field bases and
    modular linkage on the crew table, which are not in the equipment lists.
- [ ] Buildings in Alpha Strike: ASCE pp.137-139 has no conversion from a constructed building. An armed
  building's damage is chosen by the players, up to its Alpha Strike CF for each emplacement, with armor up
  to the CF. Nothing is built. ([#60](https://github.com/ngcfells/battletech-tools/discussions/60))
- [ ] Mobile Structures (Designing Mobile Structures, TO p. 259): type, Construction Factor, internal weight
  capacity, power and motive systems. Static buildings share its armor, heat sink and weapon rules. ([#63](https://github.com/ngcfells/battletech-tools/discussions/63))
- [ ] Gun emplacements: construction is in the Building Creator (2026-10-07). Still owed: the BLK import of
  the 106 `advancedbuildings` and the `ge` folder in the MegaMek samples. ([#63](https://github.com/ngcfells/battletech-tools/discussions/63))

### Support Vehicles

- [ ] Readings, flagged: TM p.308's CellCo Ranger example leaves the x 2.5 off armor BV (38 x 0.7 = 26.6);
  the rule text and MegaMek keep it, so it is read as a misprint. The Dixon example divides officers by 5;
  the Minimum Crew Table (reprinted in errata v8.0) divides by 6, which is used. The same example counts a
  half ton of machine gun ammunition as BV 1; the catalog's 1 BV a ton gives 0.5. ([#64](https://github.com/ngcfells/battletech-tools/discussions/64))
- [ ] Support Vehicle equipment the catalog lacks, from that run: Handheld Searchlight (38 files), Vehicular
  Mine Dispenser (22), Minesweeper, Vehicle Jump Jets, Ladder, Mobile Field Base, Drone Operating System,
  infrared / high-resolution / hyperspectral imagers, Refueling Drogue, Medium VSP Laser, light and heavy
  torpedoes, primitive autocannon ammunition, vehicle flamer and heavy/medium rifle ammunition; the
  troopspace, infantry, battle armor and light vehicle bays on vehicles and aircraft; MegaMek's internal names
  for light weapons ("InfantryAssaultRifle", "InfantrySRMLight"), which the importer matches by display name only. ([#64](https://github.com/ngcfells/battletech-tools/discussions/64))
- [x] Airship and Satellite record sheets like the Total Warfare and Tactical Operations ones (TO:AUE p.213),
  2026-10-22, with the Airship Velocity Table (TW p.204).
- [ ] Support Vehicles still owed: Patchwork armor (the Patchwork code is on
  `feature/patchwork-vehicles-fighters`); BV and Alpha Strike checks against published cards (the bundled
  live MUL lists Support Vehicles with BV 0); Large Naval sinking, running aground and boarding, and rail
  derailing and collisions, which need map play. ([#64](https://github.com/ngcfells/battletech-tools/discussions/64))

## 6. BattleMech construction and play gaps

### LAMs

- [ ] Loaded bomb BV is added to the base BV before the skill multiplier, as TM p.315 does for external
  stores ("The BV of any external stores is added to the base BV of a unit before the base BV is modified
  for skill rating"). Still provisional: IO:AE's LAM BV rules (p.186) don't say LAM bombs follow it; they
  only count each bomb bay and fuel slot as explosive ammunition (-15). ([#65](https://github.com/ngcfells/battletech-tools/discussions/65))
- [ ] Not included: the Alamo nuclear missile (optional nuclear rules) and the prototype rocket pod
  (Experimental). ([#65](https://github.com/ngcfells/battletech-tools/discussions/65))
- [ ] Averaged pilot skills ('Mech + aerospace, rounded normally; IO p.192, TM p.314): we store one skill
  pair, so a LAM needs separate aerospace skills first. ([#65](https://github.com/ngcfells/battletech-tools/discussions/65))
- [ ] Alpha Strike conversion for LAMs (LAM movement and specials); LAM PV is marked provisional until then. ([#60](https://github.com/ngcfells/battletech-tools/discussions/60))

### OmniMechs

- [ ] Pod-mounted heat sinks and jump jets (legal per TM) can't be modeled: they are counts in our model,
  not equipment. ([#66](https://github.com/ngcfells/battletech-tools/discussions/66))
- [ ] HarJel II/III, Drone OS, SRCS and Mobile HPG are now in the catalogs (`clan-harjel-ii`/`-iii`,
  `drone-operating-system`, `srcs`, `mobile-hpg`). Left: the HarJel "2*"/"3*" tonnage footnote (IO
  pp.220-221) is still not found. The BV footnote is: HarJel II x1.1, HarJel III x1.2 armor multiplier on
  protected locations only, stacking with other armor modifiers, and -1 Defensive BV per HarJel slot (IO:AE
  p.185, Dark Age Armor Modifiers Table). ([#66](https://github.com/ngcfells/battletech-tools/discussions/66))

### Equipment still missing or unwired

- [ ] Artemis V and Apollo launcher combos (Artemis IV exists as combined launcher records). Then the Clan
  LRM/SRM + Artemis V records from workbook rows 157/159/161/163 (LRM 5/10/15/20: heat 2/4/5/6,
  0.42/0.84/1.26/1.68 at S/M/L) and 169/171/173 (SRM 2/4/6: heat 2/3/4, 0.42/0.84/1.05 at S/M). Alpha Strike
  values stay "Provisional workbook conversion"; Classic stats need the TO source. ([#67](https://github.com/ngcfells/battletech-tools/discussions/67))
- [ ] Misc equipment still unsourced or unwired: EI Interface, DNI, drone OS/console, SRCS, IndustrialMech
  ejection seat, recon camera, sprayer, buzzsaw, fluid suction, ladder, vehicular mine dispenser, booby
  trap, cargo/liquid storage, chaff pod, comms equipment, collapsible command module, HarJel II/III,
  paramedic gear, ground-mobile HPG, RISC viral jammers / laser pulse module / super-cooled myomer, DIC,
  QuadVee wheels, turrets (needs a turret-mount toggle), dumpers, Ram Plate. Leads from the Sarna pass
  (review-only, `tools/misc-equipment-sources-staging.jsonl`; Sarna "TO" pages may be the pre-split book):
  Drone OS/Carrier Control TO p.305, Recon Camera TO p.337, Sprayer TM p.248, Fluid Suction TM p.248, Liquid
  Storage TM p.239, Comms Equipment TM p.212, Paramedic TM p.233, Booby Trap TO p.297, Chaff Pod TO p.299,
  Collapsible Command Module TO p.301, BattleMech Turret TO p.347, Artemis V TO p.283, Apollo TO p.331, DNI
  Unbound p.66, Buzzsaw Unbound p.70, RISC Laser Pulse Module IO p.93, Super-Cooled Myomer IO p.94, Ram Plate
  OTP: Hanseatic Crusade p.30. ([#67](https://github.com/ngcfells/battletech-tools/discussions/67))
- [ ] Placement rules not enforced yet: spread items (one per location, side torsos, legs), hand-actuator
  requirements, Claw replacing the hand. ([#36](https://github.com/ngcfells/battletech-tools/issues/36))
- [ ] Patchwork armor still owed: Support Vehicles (with the Armored Chassis modification; wait for the Support
  Vehicle builder); Fractional Accounting's kilogram rounding per location on vehicles and fighters once #118 is
  merged in; SSW/MTF import (there is no 'Mech MTF importer, and the SSW library holds no Patchwork design to take
  the format from); armor types on the 'Mech record sheet; era checks per location on vehicles (they have no
  issues list). ([#67](https://github.com/ngcfells/battletech-tools/discussions/67))
- [ ] FrankenMechs still owed: MTF import of "Config:Biped FrankenMek" files (no 'Mech MTF importer; samples in
  mm-data: Sneede, Sneede II, Temax Cat Ninjabolt, Schwerer Gustav, the two Royal Fantasy Hunchbacks); the
  Centurion susceptibility of FrankenMechs (IO:AE p.80) waits for the Centurion in play; Quality Rating and
  refit time (CO pp.211-214) belong to a campaign tool. ([#67](https://github.com/ngcfells/battletech-tools/discussions/67))
- [ ] Clans' pre-2825 use of Star League Ferro-Fibrous isn't modeled. ([#67](https://github.com/ngcfells/battletech-tools/discussions/67))

### IndustrialMechs and Primitive 'Mechs

Chassis types the Mech Creator builds (checked 2026-10-02): Biped, Quad, Tripod, LAM, QuadVee (Mech Type);
Ultralight and Superheavy (tonnage); OmniMech and Primitive (checkboxes); IndustrialMech (Industrial structure).

- [ ] Flagged, kept as printed: the BV Movement Heat of 0 is for "ICE-powered IndustrialMechs" only (TM p.303, still so
  in the BV errata v4.1), though fuel cell IndustrialMechs also make no movement heat in play (TW p.158). MegaMek
  gives every IndustrialMech 0.
- [ ] IndustrialMechs still owed: Extended Fuel Tanks on Combat Vehicles (vehicle builder cannot size
  variable equipment; with the Support Vehicles work); an ICE engine stalling on a failed Piloting Skill Roll
  (TW p.59) and the water-depth rules (TW p.52) need 'Mech play to track Piloting Skill Rolls and terrain; fuel
  consumption (TM p.68); a Tripod's legs on the Front/Rear column for the End Phase check. ([#67](https://github.com/ngcfells/battletech-tools/discussions/67))
- [ ] Then lift the SSW import skip for these designs (section 2, 234 designs): `importSSWXML` only accepts
  `mech_type` "BattleMech".

### Canon equipment pass: still owed (branch `feature/canon-equipment-pass`, ledger `tools/canon-pass-ledger.md`)

Status 2026-10-09: upstream draft PR #115 (branch `bundle/unit-builders-and-catalogs`) offers the whole fork as one
bundle: every open PR except #92 and #97, plus the unit builders, rules levels and rules editions. It leaves out
`.claude/` and the local Ollama worker tools. Update it (merge this branch, drop those files again) as work lands.

- [ ] From the review of #115 (fleetfootmike, 2026-10-09), still open: ([#33](https://github.com/ngcfells/battletech-tools/issues/33), [#34](https://github.com/ngcfells/battletech-tools/issues/34), [#35](https://github.com/ngcfells/battletech-tools/issues/35))
  - Scope, decided by the user 2026-10-09: both split out. The Custom MUL editor is upstream #116 (branch
    `feature/custom-mul-editor`, from upstream master, entries proposed to the upstream repository). Building
    play is upstream draft #117 (branch `feature/building-play` = the bundle branch plus one commit); rebase it
    on upstream master when #115 merges. The bundle branch carries two removal commits for them: when merging
    this branch into it, keep `building.ts`, the roster files and the MUL source files free of play and custom
    MUL code, then merge the bundle into `feature/building-play`.
  - Pass 5 (2026-10-09) is fixed and #115 is marked ready for review. Open items in this file go up as
    follow-up PRs on top of it.
  - Custom MUL submission is off (`CONST_CUSTOM_MUL_SUBMISSION_ENABLED = false`, user 2026-10-09): the path takes
    a GitHub token in the page. Before switching it on: a security review of that path, and the SSW
    custom-content submission ready to ship beside it.
  - `tools/mul-sync/sync-mul.mjs`: the live-to-legacy era id table has no entry for ids 1 and 9. 494 bundled
    records carry era id 1 unmapped. Which legacy era each is has to come from the site's era list.
  - Reported as already on upstream master, not fixed here: Alpha Strike value adds Medium damage twice and
    uses ground movement for jump-heavy units; restored favourite groups are not saved; three ammunition Battle
    Values out of step with their Clan twins (IS LB 5-X cluster, IS Thumper Copperhead, IS Arrow IV Homing);
    the roster footer counts only 'Mechs.
  - The 'Mech armor, engine, gyro and other option lists still mark availability on the shared tables (as
    upstream does); vehicles now mark copies. A 'Mech viewed after another 'Mech can still show the other's marks.
  - Kept as the book prints them, against the review: Firedrake needler range 1 and Dragonsbane pulse laser
    range 3 (TM infantry tables v4.1); ProtoMech Extended Jump Jets at Standard ("Tournament Legal", IO:AE p.59).

Status 2026-10-02: rebased on upstream master (after #85), split into seven branches and opened upstream
in HeySporky/battletech-tools. All of it is merged into local `master` together with the SSW runtime import.

| PR | branch | state |
|---|---|---|
| #98 | `canon-pass/1-components` | ready |
| #99 | `canon-pass/2-equipment-weapons-ammo` | draft, on #98 |
| #100 | `canon-pass/3-audits-splits-bv` | draft, on #99 |
| #101 | `canon-pass/4-superheavy-bv-slots` | draft, on #100 |
| #102 | `canon-pass/5-new-equipment` | draft, on #101 |
| #103 | `canon-pass/6-industrialmechs-builder-rules` | draft, on #102 |
| #104 | `canon-pass/unit-domain-catalogs` (ledger `tools/canon-pass-ledger-unit-catalogs.md`) | ready, independent |
| #105 | `canon-pass/7-industrial-primitive-mechs` | draft, on #103 |
| #106 | `patchwork-armor` | draft, on #105 |
| #107 | `industrialmech-sealing-fuel` | draft, on #105 |
| #108 | `primitive-retrotech` | draft, on #105 |
| #109 | `industrialmech-to-hit` | draft, on #105 |

- [ ] As each part merges upstream, rebase the next branch on upstream master and mark it ready.
- [ ] #91 and #94 (Clan eras) touch the same catalogs; whichever set merges second needs a rebase. The
  merge into local master shows where they differ: the canon pass values were kept (Clan 'Mech Mortar
  dates and weights, Clan artillery cannon production 3079 with one universal shell record, Inner Sphere
  Laser Insulator never reintroduced, Inner Sphere mortar munitions following the launcher).
- [ ] SSW importer PR: not opened. Rebase `feature/ssw-runtime-import` on upstream master, rerun the corpus
  audit against the full catalog and shrink `ssw-canon-pending-names.ts` first.
- [ ] After both PR sets merge, restore the Ferro-Aluminum note dropped from `mech-armor-types.ts` in the split.
- [ ] `ammo-is-*` records moved out of the universal catalog list the old tag twice and their own tag in
  `altTags` (harmless; tidy up). ([#41](https://github.com/ngcfells/battletech-tools/issues/41))

- [ ] Same-book conflicts: the errata were checked (IO v1.21, IO:AE v3.01; Batch 14) and rule on none
  of them, so the catalog still follows MegaMek and each is flagged in the ledger: IO:AE armor BV
  modifiers p.185 vs p.190; primitive cockpit cost p.117 vs p.215; Heat-Dissipating Clan year p.81 vs
  pp.29, 215; Improved Large Laser / Pulse Laser years p.89 vs p.37; Clan claws (3090 as a prototype,
  no production year); primitive prototype missile shots per ton and SRM range (p.112 text vs p.210
  table); TO:AUE p.219 large engine dates vs IO:AE p.38. ([#57](https://github.com/ngcfells/battletech-tools/discussions/57))
- [ ] Domain catalogs. Done (Batches 49-54): `capital-weapons.ts` and `sub-capital-weapons.ts` (never
  'Mech-legal), `aerospace-armor-types.ts` (fighter, DropShip and capital armor), `support-vehicle-armor.ts`
  (BAR 2-10), `protomech-components.ts`, `battle-armor-armor-types.ts`, IndustrialMech armor (Industrial,
  Commercial), and 26 industrial items of TM pp.344-345. Still owed: battle armor chassis, motive systems,
  manipulators and weapons; ProtoMech UMU, engine and structure-point tables; capital missile large-craft
  slot columns (Strategic Operations), Naval C3 and other large-craft systems; the variable-size industrial
  items (Communications Equipment, Dumper, Extended Fuel Tanks, Ladder, Pintle Mount, Power Amplifiers,
  transport bays); Primitive small and large craft armor. ([#67](https://github.com/ngcfells/battletech-tools/discussions/67))
- [ ] Still owed before the PRs: missile `damageAero` convention, Nail Gun range dash, source search for
  the custom catalogs, Alpha Strike conversions marked unresolved, play-rule items, the import
  "ask the importer" step, review of `tools/spec-c-sources-staging.jsonl`. The equipment PRs are open
  (#98-#104); these items go in follow-up PRs.
- [ ] Alpha Strike conversions for the pods added in Batch 9c (B-Pod, M-Pod, Chaff Pod) are marked
  unresolved. ([#60](https://github.com/ngcfells/battletech-tools/discussions/60))
- [ ] Vehicles have no era check on engine types, so large engine dates (Batch 16) apply to 'Mechs only. ([#37](https://github.com/ngcfells/battletech-tools/issues/37))
- [ ] Missile launcher `damageAero` holds 3 for every LRM size (the tables give 3 / 6 / 9 / 12). Check
  how the aerospace code reads it before changing the catalog. ([#28](https://github.com/ngcfells/battletech-tools/issues/28))
- [ ] The Nail/Rivet Gun has no medium or long range bracket (TM p.344); the record stores 0 and the
  record sheet prints 1/0/0. Print a dash for a missing bracket. ([#31](https://github.com/ngcfells/battletech-tools/issues/31))
- [ ] Cockpit slots (Batch 24): Tripod, superheavy and QuadVee cockpits now sit in the head only, per the
  IO:AE record sheets. The center torso slot was in upstream too: call it out in the equipment PR.
- [ ] Battle Value (Batches 26, 27): explosive penalty by location, CASE II, floor of 1, weapon order by
  Modified BV. Owed: prototype CASE is not counted as CASE; `hasXLEngine()` answers
  true for Light and Clan XL engines and drives the "wrecked" check in play tracking. ([#26](https://github.com/ngcfells/battletech-tools/issues/26), [#27](https://github.com/ngcfells/battletech-tools/issues/27))
- [ ] TM equipment limits not modeled: torso-only weapons (Heavy Gauss), one industrial item per location. ([#36](https://github.com/ngcfells/battletech-tools/issues/36))

### Cockpits

- [ ] Cockpit selector (found in the canon pass, Batch 8): `mech-cockpit-types.ts` on
  `feature/canon-equipment-pass` catalogues 15 'Mech cockpits, but the builder only mounts Standard,
  Small and the chassis cockpits. Still to wire: Torso-Mounted (2 CT slots, life support in the side
  torsos, BV x0.95 with doubled CT armor, TO:AUE pp.112-113, 193), Command Console (add-on, 3 tons),
  Interface / Machina Domini (gyro optional, IO:AE p.110), DNI modification, IndustrialMech and primitive
  cockpits. Saved designs store only `sm_cockpit`; a cockpit tag needs a schema bump. ([#67](https://github.com/ngcfells/battletech-tools/discussions/67))

### Custom Homebrew

- [ ] Compact 'Mechs under the Custom Homebrew rules level (requested 2026-10-01). Source: the *Best of
  Future Wars* fanzine. The fanzine is in `_KNOWLEDGE_DEV/custom/`
  and read before any design work; nothing is to be reconstructed from memory. Lead: 12 HeavyMetal Pro
  files in `WorkingData_DEV/HMPdata/hmpFiles/FutureWars`. Goes in `mech-custom-*` only, gated by
  `tag: "custom"`, never in canon lists or canon BV/PV math.  **Note there is other stuff inside this source that should be brought in as well. ([#68](https://github.com/ngcfells/battletech-tools/discussions/68))
- [ ] Micro Mechs under the Custom Homebrew rules level. Source: Micro Mechs in `_KNOWLEDGE_DEV/custom/` ([#68](https://github.com/ngcfells/battletech-tools/discussions/68))
- [ ] Hexa and Octapeds. under the Custom homebrew rules level. Source: https://www.reddit.com/r/battletech/comments/fb5ufe/eight_and_sixlegged_mech_thoughts/ ([#68](https://github.com/ngcfells/battletech-tools/discussions/68))
- [ ] Permenant Air Mechs (PAMs): Source: https://www.battletech.com/forums/index.php/topic,44833.0.html  **Note: there is a lot of other good stuff to pull out of that thread as well... we want it all. ([#68](https://github.com/ngcfells/battletech-tools/discussions/68))
- [ ] https://lostech.miraheze.org/  Lots of good custom stuff here... The detargeting computer as an example. ([#68](https://github.com/ngcfells/battletech-tools/discussions/68))
- [ ] https://battletechfanon.fandom.com/wiki/Category:Weapons  More stuff to add. ([#68](https://github.com/ngcfells/battletech-tools/discussions/68))
- [x] **ArtVee (Artillery Vehicle; "MAP" to some powers), the Siege Tank below, designed 2026-10-20.** The
  design supersedes the notes below: `docs/superpowers/specs/2026-10-20-artvee-design.md`. Built 2026-10-21 on
  `feature/artvee`: creator option, combo guns, blended BV, play modes, record sheet and AS card, Armored Motive
  (canon), Smoker and Buckler (*Future Wars* #32), and nine production-tech sample ArtVees in the creator.
  - [ ] Later: Superheavy ArtVees (allowed, pinned until the user has looked at superheavy vehicles). ([#69](https://github.com/ngcfells/battletech-tools/discussions/69))
  - [ ] Later: Armored Motive System in the Support Vehicle creator (separate multiplier-based chassis mods). ([#69](https://github.com/ngcfells/battletech-tools/discussions/69))
  - [ ] Later: canon artillery records carry the IS BV only; Clan units need the Clan BV (TO:AUE p.197: Long Tom
    560, Sniper 96, Thumper 48) — needs a per-tech-base BV field. ([#38](https://github.com/ngcfells/battletech-tools/issues/38))
  - [ ] Later: write the ArtVee TRO for the community from `docs/lore/artvee-tro-skeleton.md`. ([#69](https://github.com/ngcfells/battletech-tools/discussions/69))

    | Variant | Artillery | Damage | Range (mapsheets) | Artillery weight | Source's min. tonnage |
    | --- | --- | --- | --- | --- | --- |
    | Light | Thumper | 15 | 21 | 15 t | 45 t |
    | Medium | Sniper | 20 | 18 | 20 t | 55 t |
    | Heavy | Long Tom | 25 (the source says 30) | 30 | 30 t | 65 t |

  - **Siege Mode extras the source offers, to decide:** a to-hit bonus for the stable platform (the source
    says both +1 and -1; it means a bonus), treating the tank as a gun emplacement while sieged, and a
    direct-fire option in Siege Mode.
  - **Construction checks the source proposes:** at least 45 tons (55 for Sniper, 65 for Long Tom); at
    least 4/6 MP in Vehicle Mode; armor at least 75% of the tonnage's maximum; the turret must hold the gun
    and its ammunition. These thresholds are rules of thumb. Better: let the construction math decide
    (Thumper 15 t + its ammunition + turret 10% fits a 45-ton hull; Long Tom 30 t does not fit much under
    60), and give only the 45-ton floor as a rule.
  - **Not in the source, needed to build it:** a weight for the conversion equipment. Canon precedents are
    LAM conversion equipment 10% of the unit's weight, bimodal LAM 15% (IO:AE p.108) and QuadVee 10%
    (IO:AE p.128); 10% is a reasonable default. Also its slots (vehicle body or turret), Battle Value
    (each mode's offensive BV, as LAM modes are rated?), cost multiplier, how damage to the conversion
    equipment strands the tank in one mode, and an Alpha Strike card (two cards or one with both modes).
  - **What the source gets wrong:** BattleTech has no canon "bimodal vehicle" chassis, and Tactical
    Operations does not make this "100% legal". Tripods have no alternate modes, and QuadVees are 'Mechs.
    Gun emplacements give no +1 accuracy. The real canon pieces it can lean on are LAM and QuadVee
    conversion (IO:AE pp.108, 128), Direct-Fire Artillery (TO:AR p.153: canon artillery may already fire
    directly at units in line of sight), Artillery Cannons (TO:AUE p.97: Thumper/Sniper/Long Tom Cannons
    of 10/15/20 t, direct-fire weapons in the catalog) and Mobile Field Artillery (TO:AUE p.122).
  - **Where it goes:** the Combat Vehicle creator, at the Custom Homebrew level only (6): a vehicle option
    "Siege Tank (transforming)", the three dual-mode guns in `mech-custom-equipment-weapons-*` (or a vehicle
    custom file), never in canon lists or canon BV. Play mode needs the mode flag, the transformation turn
    and the profile switch.

### Calculations and play

- [ ] Quirks system (requested 2026-10-18) for all unit types, equipment and weapons: design quirks on vehicles, mechs, aerospace, etc, 
  weapon quirks on individual mounted weapons, and quirks on equipment. Nothing models quirks today, not
  even for 'Mechs (only a mention in the cockpit and Clan misc data). Read the canon quirk rules in the
  library first (the positive, negative and weapon quirk lists and which unit types each applies to) and
  cite them; then store quirks on the unit and on each mounted item, show them on the record sheet, apply
  their play effects, keep them in saves, and read and write them in the MegaMek and SSW adapters (which
  already carry quirks, see "Shared" above). Design: docs/superpowers/specs/2026-10-21-quirks-design.md
  (approved 2026-10-21), which adds targeting/tracking and comms systems as line items.
  - [x] BLK import reads `<quirks>` and `<weaponQuirks>` by MegaMek's codes (kept as altNames) for Battle Armor,
    Small Craft/DropShips and Support Vehicles; an unknown code or unplaceable weapon goes in the import issues.
    SSW files carry no quirk element, so the SSW import has none to read.
  - [x] Play effects (plan 3, docs/superpowers/plans/2026-10-22-quirks-play-effects.md): a per-game "Use design
    quirks" switch on both rosters, off by default and saved with the force. With it on, Classic play adds quirk
    to-hit modifiers to the GATOR (weapon, range band, ran or flanked), Combat Computer heat to the Heat Phase,
    the side's largest quirk Initiative to the header, and lists each unit's quirks in play; Alpha Strike units
    made from a design carry the Companion's quirks and apply their weapon to-hit by range band.
  - [ ] Plan 4: the targeting/tracking and comms catalog, and the Lost Issues rules. ([#51](https://github.com/ngcfells/battletech-tools/discussions/51))
- [ ] Much later: custom targeting/tracking (T&T) quirks drawn from the lore, beyond the Lost Issues table
  (user, 2026-10-21). They go in as custom quirk and T&T records once the quirk catalog exists. ([#51](https://github.com/ngcfells/battletech-tools/discussions/51))

- [ ] Cost, record sheet and Alpha Strike conversion should consume `roundsPerTon`/`shotsPerTon`,
  `prototype` and composite records. ([#70](https://github.com/ngcfells/battletech-tools/discussions/70))
- [ ] Play mode for the newer weapons and armor: MG Array cluster fire, AMS interception with ammo use, TAG
  designation, chemical laser ammo use, HVAC; Reactive, Reflective, Hardened and Heat-Dissipating armor
  effects; tracked movement mode. ([#70](https://github.com/ngcfells/battletech-tools/discussions/70))
- [ ] 'Mech ammunition explosions: total the damage of the ammunition carried (the vehicle version exists). ([#70](https://github.com/ngcfells/battletech-tools/discussions/70))

## 7. Alpha Strike workbook review (waiting on classification decisions)

- [ ] Classify the remaining rows in `tools/alpha-strike-workbook-review-blocks.md` and promote only after
  the source and tech-base decisions are recorded there. Blocks 13-20 have proposed classifications and
  findings F1-F12 in the ledger (2026-09-27), awaiting approval: ([#71](https://github.com/ngcfells/battletech-tools/discussions/71))
  - Block 13, rows 121-130: Ultra AC/5/10/20 (C), Improved AC/2/5/10/20, Improved Gauss Rifle, and
    Prototype LB 2-X/5-X Autocannons.
  - Block 14, rows 131-140: Prototype LB 20-X, Prototype UAC/2/10/20, Chemical Lasers, and ER Pulse Lasers.
  - Block 15, rows 141-150: Vehicle Flamer (C), Improved Heavy Lasers, Prototype ER Lasers, Improved
    Lasers/Pulse Laser, Improved PPC, and Enhanced PPC.
  - Blocks 16-17, rows 151-170: ER PPC (C), ATM variants, Clan LRM Artemis IV/V variants, Clan 'Mech
    Mortars, and Clan SRM Artemis IV/V variants.
  - Block 18, rows 171-180: remaining Clan SRM variants, Clan Streak LRMs, ProtoMech Streak LRM, Fusillade
    Launcher, and Improved LRM 5.
  - Block 19, rows 181-190: Improved LRM 5/10/15/20 with standard and Artemis IV profiles, plus Improved
    SRM 2/4.
  - Block 20, rows 191-199: Improved SRM 4/6, Prototype Streak SRMs, and Improved ATM 3/6/9/12.
- [ ] For each block, use the source rows in `tools/alpha-strike-workbook-data.json` and record `IS`,
  `Clan`, `Universal` or `Both (Stats Differ)` in the ledger before editing the catalog files. ([#71](https://github.com/ngcfells/battletech-tools/discussions/71))
- [ ] Resolve the remaining provisional/source gaps separately from classification: physical weights and
  slots absent from workbook rows, Clan alternate-ammo variants, specialized torpedo `-T` ammunition, and
  numeric TOR profiles. ([#71](https://github.com/ngcfells/battletech-tools/discussions/71))
- [ ] Keep the literal-object rule: promote approved records directly into their owning catalog files; no
  generated supplemental imports. ([#71](https://github.com/ngcfells/battletech-tools/discussions/71))

## 8. Alpha Strike: BattleTech Aces (solo/co-op automated opponent and campaigns)

BattleTech: Aces (Catalyst/Lynnvander, 2025) has three parts. First, an automated opponent for Alpha Strike, driven
by per-unit Aces decks and a Commander deck. Second, a branching narrative campaign with Named Pilots, Edge and a
Support Point (SP) economy. Third, extra Alpha Strike rules for vehicles, infantry and emplacements (*Aces* p.2).
Goal: all of it playable from the Alpha Strike section. Sources: `text/Battletech-Aces-RuleBook.ocr.txt` (cite
*Aces* p.N, printed page = PDF page - 1) and `text/battletech-aces-scouring-sands-campaign-books.ocr.txt` (cite
*Aces SS* p.N, offset 0). Both are OCR text, so check every table and number against the PDF page image before
encoding it. The Golden Rules section (*Aces* p.10) did not OCR at all.

What the app has today: one player force (`currentASForce`; its `turn`/`phase` fields are unused), damage, heat,
critical-hit and vehicle-motive tracking, SPAs, MUL roles, and the match-play scenario generator. What it lacks: an
opposing force, initiative, a target-number calculator, any game or campaign state, and any knowledge of where
units stand on the table.

**Status 2026-09-30: merged to master from `AS-Aces` (3946f1d1) and offered upstream as a PR.** Players enter
their own cards and sorties in the Card Library (`/alpha-strike/aces/library`); one cited sample of each record
type ships. The card reader walks each unit's top card; decks deal from the library with a seeded RNG.
- Model: `src/data/aces-rules.ts` (cited tables), `src/classes/aces-helpers.ts` (to-hit, crippled, front-loaded
  order, activation order, deck split and suggestion, Initiative), `aces-game.ts` (automated-force tracker) and
  `aces-campaign.ts` (difficulty, force checks, Named Pilots, ledger, sortie log). 45 tests.
- Persistence: `dataSaves.ts` keys `acesGame` and `acesCampaigns`, both included in the full backup.
- UI: `/alpha-strike/aces` (home, game, campaign, rules) and a tile on the AS home.
- `AlphaStrikeUnitSVG` gained `onChange`, so in-play damage on the automated units saves to the Aces game instead
  of the roster.
- Card engine: `src/data/aces-cards.ts` (schema, typed-line parsers, validation, library merge),
  `aces-card-samples.ts` (cited samples), `src/classes/aces-engine.ts` (behavior, targets, filters, OV, physical,
  support, tokens, strategy, crits, seeded dice). UI: `library.tsx`, `_card-reader.tsx`, `print.tsx`.
- Still open: emplacement unit entry, Waypoint scan/escape edges, Edge spends, SS abilities, campaign printables.

### Decisions before any code

- [ ] **Source gaps.** Now local (2026-10-18, library `alpha-strike/`): the Aces print-and-play cards (`Battletech-Aces-Cards-20230310.pdf`, v3, 8 pages), the Aces rules sheet, the Aces rulebook and Scouring Sands books, and the Alpha Strike Quick-Start Rules. Still missing: the other Aces boxes. ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))

### A. Game state and unit queries (`src/classes/`)

- [ ] Per-unit turn state: movement mode used and the TMM it produced (the "movement dice", *Aces* p.15),
  moved/attacked flags, Move First/Last tokens, Forced Withdrawal and Fleeing flags, escaped, mounted-on-transport,
  Force Commander, Named Pilot link, Edge tokens left, and destroyed-by-ammo (needed for salvage). ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))
- [ ] A stable stat-query API for the engine: current and starting MV, TMM (with the battle armor +1, STL and heat
  effects, *Aces* p.9), armor, armor lost, starting armor, structure, damage per range, OV, PV and Size. The
  engine reads these, never the UI. ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))

### B. Additional Alpha Strike rules (*Aces* pp.3-6, *Aces SS* pp.18-19)

- [ ] Combat vehicles (p.4). *Partial:* the motive and critical-hit tables roll and mark the unit card under the
  `aces` ruleset; heat-as-damage and Charge-only are still the player's job. Motive table (+1 for hover and wheeled; check it against the existing motive
  tracking), the Aces vehicle critical hit table under the `aces` ruleset, heat applied as damage, Charge as the
  only physical attack, TUR#. Ground vehicle movement costs as a reference table. ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))
- [ ] Infantry (p.5). *Partial:* the to-hit modifiers and transport (IT/CAR, OMNI+MEC mount, dismount at half MV,
  carried units destroyed with an IT transport) are done; the OMNI 1D6 5-6 hit split is not. 360-degree arc, no rear, no AMM, battle armor +1 TN, critical hit is always a Weapon Hit, and
  Anti-'Mech attacks (+1 TN; +3 more for conventional infantry; +3 against a target carrying battle armor; a
  critical check on any damage). Transport: IT#/CAR#, MEC/OMNI mount (2") and dismount (half MV); the transport
  can't Sprint the turn it loads. Attacks on transports (*Aces* p.6): carried units die with an IT transport; on
  an OMNI, battle armor takes the hit on 1D6 5-6, per attack roll. ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))
- [ ] Emplacements (p.6). *Partial:* the to-hit modifiers, the crippled-at-0 check, and the game-tracker flag
  (no deck, no FW) are done; there is no unit entry yet. Immobile (-4), -1 when attacking or spotting, critical hits always a Weapon Hit,
  crippled at 0 damage, no Forced Withdrawal. Needs an emplacement unit entry (probably a custom-MUL-style record;
  check the MUL first). ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))
- [ ] Scouring Sands abilities (*Aces SS* p.19): ECM (12"), FLK, JMPS#, SRCH, TAG, TUR#, alternate munitions.
  Compare each with `alpha-strike-special-abilities.ts` (ASCE wording) and add Aces notes where they differ. Probe
  scan ranges (4" base, LPRB 8", PRB 12", BH 16") apply only to Waypoints (*Aces* p.24). ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))

### C. Automated opponent engine (*Aces* pp.7-21, 38-40)

- [ ] Extras. *Partial:* the non-campaign difficulty PV helper is on the game setup page. Automated allies inside the player's force (p.38); non-campaign difficulty (80%/120% PV, skill ±1
  without recalculating PV, p.38); a quick-reference panel of icons and keywords (back cover, p.40). ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))
- [ ] OPFOR builder in the roster. *Partial:* the automated force is loaded from the current roster or a
  favorite group, with an overridable deck, the Command deck name and card letter, and the commander unit.
  Objectives are not done. build the automated force from the MUL like the player force, assign decks (role
  default, overridable), choose the Commander deck and starting card, designate the commander unit, and define
  objectives. ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))

### D. Campaign rules (*Aces* pp.23-37)

- [ ] Sortie setup checklist (pp.30-31): record the log entry, briefing by entry ID, Reconnaissance SP, play-area
  and Waypoint setup. ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))
  - Player force: PV cap after difficulty. OMNI reconfiguration costs Size x5 SP, or the PV difference x40 SP if
    the new variant costs more. Named Pilots assigned by type, wounded pilots excluded, force commander chosen.
  - Then the OPFOR and special rules.
- [ ] Playing a sortie (p.32). *Partial:* the -2 Initiative modifiers and the End Phase order are in the tracker;
  Waypoints and escape edges are not. ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))
  - Initiative: the last winner takes -2; a force whose commander is destroyed takes -2.
  - Escape edges.
  - Strict End Phase order: sortie rules, damage, heat, objectives, strategy, turn track and Waypoints.
  - Waypoint reveal and scan (p.24).
  - Edge spends: +1 pip once per Combat Phase (a raised 12 doesn't cause a critical hit), reroll motive, reroll a
    critical hit, and Edge abilities (p.24).
- [ ] Printables generated by the app: Campaign Log, Player Force Roster, Sortie Log and Named Pilot card, in our
  own layout, not copies of the official sheets. ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))

### E. Scouring Sands content (*Aces SS*)

- [ ] Unit availability list for Apolakkia (*Aces SS* p.20). *Partial:* encoded and shown on the rules page; check SP = PV x40. Terrain legend CF values and the
  river and canyon rules (*Aces SS* p.18). ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))
- [ ] Box OPFOR units (Bane 3, Marauder IIC, Thunderbolt IIC, Summoner H, Rifleman C2, Howler, Locust IIC 4, Fulcrum
  Heavy Hover Tank): check that our MUL data has them and that PV and specials match the box cards. ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))

### F. UI in the Alpha Strike section

- [ ] Reuse the in-play unit cards and damage tracking for both sides. *Partial:* the automated side uses them;
  the player side uses the roster's in-play view. Show the automated units' priority,
  behavior, target and tokens next to their cards. ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))
- [ ] Phone-first and offline, like the rest of the PWA: no network calls, and the RNG and state persist across
  reloads. ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))

### G. Verification

- [ ] One regression test per rule, named for the rule with its *Aces* page, using the book's worked examples:
  IF p.3; Determine Behavior and Identify Target pp.11-13; Forced Withdrawal priority 625 - 500 = 125, p.16;
  Destroy Objective TMM -4, p.17; BSP ordering p.21; plus the campaign examples above. ([#72](https://github.com/ngcfells/battletech-tools/discussions/72))

## 9. Runtime and tooling

- [ ] File-state and cleanup audit: check that every tracked file is used or documented, and remove the rest. ([#74](https://github.com/ngcfells/battletech-tools/discussions/74))
  - Source: unused modules, exports and dead code in `src/` (a tool such as knip reports unused files,
    exports and dependencies).
  - Scripts: everything in `tools/`, `scripts/`, `command-line-scripts/` and `src/bin/` is referenced by
    `package.json`, a workflow or the docs, or it goes. (`tools/mul-sync/ensure-chromium-windows.mjs`, an
    unwired Windows-runner workaround, was removed on 2026-09-30.)
  - Committed outputs: generated reports and staging files (`tools/*-report.json`, `tools/*-staging.jsonl`,
    `tools/equipment-inventory-*`) are either still read by something or regenerated on demand instead of
    committed.
  - License files are never cleanup candidates: `LICENSE` (GPLv3) and `LICENSE-MIT` (the original Jeff's
    BattleTech Tools license, verbatim) stay tracked, and `src/license-files.test.ts` pins their content so any
    change fails CI until it is deliberately approved. Add any new license or notice file to that test.
  - `package.json` dependencies nothing imports.

- [ ] Drop the `typescript-7` alias and make TS 7 the only `typescript` once typescript-eslint supports
  TS >= 6.1 and TS 7 ships the JS API (or an Android binary); then remove the fallback in
  `scripts/typecheck.mjs`. ([#74](https://github.com/ngcfells/battletech-tools/discussions/74))
- [ ] Turn `prefer-const` (~790 hits) and `no-var` (~20) back on after their own `eslint --fix` commit
  (`npx eslint . --fix --rule 'prefer-const: error' --rule 'no-var: error'`). ([#74](https://github.com/ngcfells/battletech-tools/discussions/74))
- [ ] Add lint back to `npm run check` and make the CI lint job blocking once the backlog below is empty. ([#74](https://github.com/ngcfells/battletech-tools/discussions/74))

## 10. JBTIICRework review (2026-10-06)

`C:\repo\JBTIICRework` is the rulebook library. The export is reference only: port by hand,
never copy its `package.json`, lockfiles, Vite config, `.gitignore`, `tsconfig.json` or `index.html`. Its
`errors.md` was checked item by item.

Local e2e note: with Playwright's bundled Chromium and more than about 4 workers, every test times out on the
maintainer's Windows machine. The `vite preview` process blocks for 19-38 s inside the native close of a TCP
socket (CPU profile), which points at a network filter driver, not the app: Firefox and
`PLAYWRIGHT_CHANNEL=msedge` pass at 13 workers and GitHub CI passes. Run `--workers=4` or the Edge channel locally.

Open:
- [ ] Upstream draft PRs waiting on review: #110 (`fix/storage-quota-handling`) and #112
  (`perf/lazy-ssw-corpus`, which now carries the AppRouter cleanup too; #111 was closed into it).
- [ ] Read the sources added to `C:/repo/JBTIICRework/` on 2026-10-06 for rules and options the tool lacks:
  the BattleMech Manual (7th printing), Ghosts of Obeedah, The Wars of Reaving and Supplemental, the 31 XTROs
  (experimental equipment), and the quick-start rulebooks. Log each gap under the section it belongs to.
- [ ] Reference library, after the 2026-10-06 sort:
  - [ ] About 205 files (42,000 pages) are scans with no text layer. OCR of the 21 scanned `rulebooks-legacy/` books
    was started 2026-10-06; next the 20 scanned Technical Readouts, then `rpg/` and `sourcebooks/` as needed.
    Check OCR against the page image before citing a stat block.
  - [ ] Identify the files whose names say "title unconfirmed" or "title truncated" (20 left on 2026-10-17,
    mostly fan and foreign-language magazines, plus a few FASA/FanPro scans) and rename them.
- [ ] Rules editions (`src/data/rules-editions.ts`, branch `feature/rules-editions-list`). Eleven editions are
  listed, Battledroids 1984 to the Core Rulebook 2026, the Third and Fourth Edition box sets included. Each record
  an earlier edition includes carries `editionStats`: one key per edition, the stats as printed, or `null` when
  unchanged from the previous edition that lists it. Work one edition at a time, whole, from page images (never
  OCR text), then stop for review. ([#40](https://github.com/ngcfells/battletech-tools/issues/40), [#73](https://github.com/ngcfells/battletech-tools/discussions/73))
  - [ ] Fields by edition in the other creators: vehicles, fighters, small craft, infantry, battle armor,
    ProtoMechs and buildings do not hide the fields an earlier edition lacks yet (`EditionChoice` is the
    Mech Creator's).
  - [ ] Rules levels by edition, the rest: each other edition's own level names, its construction level and its
    printed units, from its own book, one edition at a time. Two TCI kit sheets are still to find (the Dougram
    Jakt-type Shadow Hawk and the plain Soltic H8 Griffin, entered from the book's SHD-2H and GRF-1N and marked
    inferred); the 1985-86 TCI BattleTech sets (Scorpion, Locust, Ostroc Mk II, TCI Hunter) belong to the Second
    Edition pass. Photographs of the sheets found so far are in the library's `unsorted/` folder.
  - [ ] Battledroids armor limit: BD p.25 caps a location's armor at twice its internal structure (head 9), and
    the book's own Stinger, Wasp, Phoenix Hawk, Archer and Marauder fit only if a torso's front section is
    capped alone. The creator's armor maximum counts front and rear together, so it is stricter than the book
    under Battledroids. Read as front-only for the printed droids' check; the creator still to follow. ([#39](https://github.com/ngcfells/battletech-tools/issues/39))
  - [ ] A printed droid's heat sinks are left unallocated: Battledroids puts every heat sink on the critical
    chart (BD p.25), but the listings do not say where.
  - [ ] Rules edition selector, still to do: (1) the Master Rules' own Battle Value system and each edition's
    cost rules are not built, so the editions that have them still show the current rules' figures; (2) the
    Internal Combustion Engine is offered to BattleMechs under the editions that list it, though the
    BattleTech Manual gives it to vehicles only (BTM pp.78-84); (3) play mode follows an edition's own rules
    for Battledroids only, and the other creators (vehicles, fighters, infantry, buildings) do not read the
    edition; (4) the missile damage per missile and
    shots per ton an edition prints are not applied (none differs from the catalog today).
  - [ ] Wanted for the library: the Introduction to BattleTech book (Fourth Edition box). Since found: the
    Fourth Edition 'Mech sheets (`rulebooks-legacy/BattleTech, Fourth Edition box - 'Mech sheets and tables
    (FASA 1604, 32p scan).pdf`, OCR text: all 24 designs, including the four missing from the edition, WTH-1
    Whitworth, VND-1R Vindicator, CP-10-Z Cyclops and BNC-3E Banshee, and the Assassin as ASN-21; check the
    page images before entering them); the 1992 Third Edition record sheets
    (`record-sheets/Battletech-3rd-Edition-RecordSheets.pdf`, added 2026-10-17: 14 sheets, "Copyright 1992",
    plus the 3025 'Mech Stats sheet).
  - [ ] Model the Core Rulebook's changes to the Total Warfare rules (CRB p.247 describes their scope).
- [ ] `refactor/catalog-by-category`: step 1 done, every equipment record states
  `techBase` (commit c959dbc8). Review the 62 custom records, whose tech base was set from tag and name. Next:
  move records into `<category>-canon.ts` / `-apocryphal.ts` / `-custom.ts` / `-munchkin.ts`, one category per
  commit, registry and tests following; then the component catalogs (engines, structure, armor, cockpits). ([#74](https://github.com/ngcfells/battletech-tools/discussions/74))
- [ ] 1.6 `security/sanitizer-hardening`: decided 2026-10-06: keep the strict whitelist on the normal path and run
  DOMPurify only on the reviewed `raw` sites. JBTIICRework's DOMPurify swap drops the strict tag
  whitelist on the non-raw path and breaks `security-guards.test.ts`. ([#74](https://github.com/ngcfells/battletech-tools/discussions/74))
- [ ] Catalog rework: one catalog per category (Energy, Ballistic, Missile, Melee incl. Shields, Electronics,
  Engines, Structure, Myomer, Armor, Cockpits, ...) holding IS, Clan and universal entries, split by rules level:
  0-4 canon, 5 Apocryphal, 6 Custom Homebrew (balanced), 7 Munchkin (cheese). Custom moves from 5 to 6. ([#74](https://github.com/ngcfells/battletech-tools/discussions/74))
- [ ] Manufacturers: an entry-level array on every catalog record, shown on the tabletop record sheet when the
  user turns the option on. Brand data needs a source per entry. ([#74](https://github.com/ngcfells/battletech-tools/discussions/74))
- [ ] 3.2 The background import still parses all 512 bundled 'Mechs on every launch; precompile them to
  lightweight descriptors or parse on demand. ([#74](https://github.com/ngcfells/battletech-tools/discussions/74))
- [ ] 1.5 Remove the CRA `serviceWorker.ts` boilerplate or replace it with `vite-plugin-pwa`. ([#74](https://github.com/ngcfells/battletech-tools/discussions/74))
- [ ] 3.4 Measure before batching the 44 MUL chunk loads; 3.5 replace hot-path `JSON.parse(JSON.stringify())`
  clones; 3.6 split `src/utils.ts`; 3.7 `appGlobals` re-renders; 3.8 trim the Bootstrap CSS; 3.9 replace
  `process.env.PUBLIC_URL`. ([#74](https://github.com/ngcfells/battletech-tools/discussions/74))
