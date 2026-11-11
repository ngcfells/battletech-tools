# Cited Battle Value: reading ledger (#599)

What was read, where, and how our code compares. Everything here is in our own words; no rulebook text is copied.
The step ids are the keys of the definition tables in `src/data/calc-steps-mech-*.ts`.

How pages were read: the text extracts in `C:/repo/ResourceLibrary` (`library_search.py --page`), and the page image
(`render_page.py`, or a crop of it) wherever a table was involved or the extract ran columns together. "Image" in the
last column means the page image was checked.

## Sources read

| Source id | Document | Printing |
|---|---|---|
| `tm` | TechManual | Corrected Sixth Printing (2021) |
| `tm-bv-tables-4.1` | TechManual Battle Value chapter, re-issued | v4.1 |
| `tw` | Total Warfare | Corrected Eleventh Printing (2024) |
| `toaue` | Tactical Operations: Advanced Units & Equipment | 2022 printing |
| `ioae` | Interstellar Operations: Alternate Eras | 2022 printing |
| `ioae-errata-3.01` | IO: Alternate Eras errata | v3.01 (17 January 2023) |

The v4.1 Battle Value chapter was compared with TM pp.302-304 line by line for the 'Mech rules: the rules text is
the same. The IO:AE errata v3.01 has one Battle Value entry (Dead-Fire ammunition, p.190); it does not touch any
'Mech step below.

## Sources to ask the owner for

None for 'Mech BV2.

## 'Mech BV2 (read 2026-11-10)

Code: `_calcBattleValue` and its helpers in `src/classes/battlemech.ts`.

### Defensive Battle Rating

| Step id | Read on | What the page says | Code agrees? | Check |
|---|---|---|---|---|
| `bv2.def.armor` | TM p.302, table p.315; TO:AUE p.192 table | Armor points x 2.5 x the armor type modifier. TM: standard, ferro-fibrous, industrial, heavy industrial and stealth 1.0, commercial 0.5. TO:AUE adds ferro-lamellor 1.2, hardened 2.0, laser-reflective 1.5, reactive 1.5. | Yes | Image (TO:AUE p.192) |
| `bv2.def.armor.dark-age` | IO:AE p.185 table, p.190 table | Two tables that disagree: see Finding 3. | Follows p.190 | Image (both) |
| `bv2.def.armor.patchwork` | TO:AUE p.194 | Work the armor location by location with each location's modifier, sum, then x 2.5. | Yes | |
| `bv2.def.armor.torso-cockpit` | TO:AUE p.193 | Count the center torso armor, front and rear, twice, before the armor type modifier. | Yes | |
| `bv2.def.armor.modular` | TO:AUE p.192 | Modular armor's points count with the modifier of the armor in the same location; stealth still counts at full effect; the speed penalty is ignored everywhere in BV. | Yes | |
| `bv2.def.armor.harjel` | IO:AE p.185 | HarJel II x 1.1 and HarJel III x 1.2 on the armor of the locations that hold one, stacking with the armor type modifier. | Yes | Image |
| `bv2.def.armor.blue-shield` | TO:AUE p.192 | A Blue Shield adds 0.2 to the armor type modifier and to the structure type modifier, and counts as a Gauss weapon with a slot in every location but the head. | Yes (the record is explosive and spread over those locations) | Image |
| `bv2.def.structure` | TM p.302, table p.315; TO:AUE p.194 table | Structure points x 1.5 x the structure type modifier. Standard and endo steel 1.0, industrial 0.5; composite 0.5, endo-composite 1.0, reinforced 2.0. | Yes | |
| `bv2.def.structure.frankenmech` | TM p.302 | No rule for mixed structure types. | Our reading: per location | |
| `bv2.def.engine` | TM p.302, table p.315; TO:AUE p.193 table | The structure figure x the engine modifier: standard (ICE, fuel cell, fission), compact 1.0; light 0.75; Inner Sphere XL 0.5; Clan XL 0.75; Inner Sphere XXL 0.25; Clan XXL 0.5; a large engine as its type. | Yes | |
| `bv2.def.engine.superheavy` | IO:AE pp.187-188 | A Superheavy uses its own table: light 0.825, XL (IS) 0.75, XL (Clan) 0.825, XXL (IS) 0.5, XXL (Clan) 0.75, others 1.0. | Yes | The extract's columns are shifted; read against the code's values row by row |
| `bv2.def.gyro` | TM p.302, table p.315; IO:AE p.187 | Tonnage x 0.5, or x 1.0 for a heavy-duty gyro. A Superheavy's gyro, and a gyroless interface-cockpit 'Mech, count as a standard gyro. | Yes | |
| `bv2.def.equipment` | TM p.302 | Add the BV of defensive equipment: active probes, anti-missile systems, A-pods, B-pods, bridgelayers, ECM, marked with a dagger in the tables. | Yes (`battleValueDefensive`) | |
| `bv2.def.equipment.ams-ammo` | TM p.302 | AMS ammunition counts here, up to the BV of the systems. | Yes | |
| `bv2.def.equipment.armored` | TO:AUE p.192, p.195 note J | 5 percent of the protected item's BV for each slot; 5 points a slot when the item has no BV. | Yes | |
| `bv2.def.equipment.armored-gyro` | TO:AUE p.192 | Same rule; a gyro has no table BV. | No: see Finding 5 | |
| `bv2.def.equipment.total` | TM p.302 | The sum of the above. | Yes | |
| `bv2.def.explosive.ammo` | TM pp.302-303; TO:AUE p.193 | 15 points for each slot of explosive ammunition: a Clan 'Mech in the center torso, legs or head; an Inner Sphere XL 'Mech anywhere; another Inner Sphere 'Mech in the center torso, legs or head, in a location without CASE, or in an arm when neither it nor the location inward has CASE. A Clan 'Mech with an XXL engine counts as an Inner Sphere XL. CASE II excuses its own location and the one outward of it, legs excepted. | Yes, except Findings 1, 2 | |
| `bv2.def.explosive.lam-store` | IO:AE p.186 | Each LAM fuel slot and bomb bay slot counts as explosive ammunition. | Yes | |
| `bv2.def.explosive.component` | TM p.303; TO:AUE pp.192-193, p.195 notes | 1 point for each slot of a Gauss weapon under the same location rules. TO:AUE marks more items "treat as Gauss" or "explodes"; an HVAC counts one slot; a coolant pod 1 point a slot. | Yes | |
| `bv2.def.explosive.jump-jet` | IO:AE p.97 | Prototype improved jump jets may explode when damaged; no BV rule. | Our reading: 1 a slot | |
| `bv2.def.explosive.protected` | TM pp.302-303; TO:AUE p.193 | The cases above where nothing is subtracted. | Yes | |
| `bv2.def.explosive.arm-case-xl` | TM p.302 | For an Inner Sphere XL engine the page says any location. | No: see Finding 1 | |
| `bv2.def.explosive.superheavy` | IO:AE p.188 | A Superheavy counts as a Clan 'Mech where the location has CASE, and as an Inner Sphere 'Mech where it has none; CASE II with a Gauss weapon subtracts nothing. | Mostly: see Finding 7 | |
| `bv2.def.harjel-slots` | IO:AE p.185 | Each HarJel slot takes 1 off the defensive figure. | Yes | Image |
| `bv2.def.subtotal` | TM pp.302-303 | Additions less subtractions. | Yes | |
| `bv2.def.floor` | TM p.302 | The subtractions cannot take the running total below 1. | Yes | |
| `bv2.def.tmm` | TM p.303, p.316 note; TW p.117; TO:AUE pp.192, 194 | The highest target movement modifier the 'Mech can reach, with the jump bonus, MASC, TSM, a supercharger, mechanical jump boosters and a partial wing counted. TW table: 0-2 hexes +0, 3-4 +1, 5-6 +2, 7-9 +3, 10-17 +4, 18-24 +5, 25 or more +6, jumping +1 more. | Yes | The TW extract's column is shifted; the row values are the standard table |
| `bv2.def.tmm.lam` | IO:AE p.186 | A standard LAM uses AirMech flank speed and +1 for being airborne; a bimodal LAM counts as a 'Mech. | Yes | |
| `bv2.def.tmm.umu` | TO:AUE p.192 | Calculate a UMU as if it were jump jets; with jump boosters too, use the better. | No: see Finding 6 | |
| `bv2.def.factor` | TM p.303, table p.316 | Defensive factor 1.0 at +0, rising 0.1 for each point of modifier. | Yes | Image |
| `bv2.def.factor.stealth` | TM p.303; TW p.142 | The factor counts stealth armor at its greatest effect; stealth armor gives +2 at long range. | Yes (+0.2) | |
| `bv2.def.factor.null-signature` | TO:AUE p.194, p.148 | Add the long-range modifier (+2). | Yes | |
| `bv2.def.factor.chameleon` | TO:AUE p.193, p.112 | Add the long-range modifier (+2). | Yes | |
| `bv2.def.factor.void-signature` | TO:AUE p.194 | Use the 'Mech's own modifier or the system's +3, whichever is higher; on a tie add 1. | Yes | |
| `bv2.def.rating` | TM p.303 | Running total x defensive factor. | Yes | |

### Offensive Battle Rating

| Step id | Read on | What the page says | Code agrees? | Check |
|---|---|---|---|---|
| `bv2.off.ammo` | TM p.303, tables pp.317-318 | Each weapon's and each ton of ammunition's BV comes from the tables. | Yes | |
| `bv2.off.ammo.unused` | TM p.303 | Ammunition cannot be worth more than the weapon it feeds. | Yes: no weapon, no value | |
| `bv2.off.ammo.cap` | TM p.303 | Total the BV of every weapon of one model and of all its ammunition; the ammunition counts up to the weapons' unmodified total. | Yes | |
| `bv2.off.ammo.total` | TM pp.303-304 (step 2) | Ammunition and non-defensive equipment are added to the weapon rating. | Yes | |
| `bv2.off.heat.efficiency` | TM p.303 | 6 + heat sink capacity (single 1, double 2) - the heat of the hottest movement, running or jumping. Stealth armor adds 10 to movement heat. An ICE IndustrialMech's movement heat is 0. | Yes | |
| `bv2.off.heat.radical` | IO:AE p.185, table p.190 | Text: capacity x 1.4, rounded up. Example and table: add heat sinks x 0.4, rounded up. | Follows the table: Finding 9 | Image |
| `bv2.off.heat.signature` | TM p.303; TO:AUE pp.112, 148, 161 | The systems make 6 (Chameleon) or 10 (Null, Void) heat while on. No BV rule for that heat. | Our reading: Finding 8 | |
| `bv2.off.heat.partial-wing` | TO:AUE p.192, p.105 | BV rule: use the jump distance with the wing bonus, standard atmosphere. The wing also sheds heat. | Our reading | |
| `bv2.off.heat.lam` | IO:AE p.186 | A LAM adds 9 in place of 6 and subtracts the movement heat of AirMech flank speed. | Yes | |
| `bv2.off.heat.emergency-coolant` | IO:AE p.190 table | RISC emergency coolant system: +4 heat efficiency. | Yes | Image |
| `bv2.off.heat.coolant-pod` | TO:AUE p.193 | Add heat sinks x (pods / 5), rounded up, at most twice the heat sinks. | Yes | |
| `bv2.off.heat.weapons` | TM p.303; TO:AUE p.194; IO:AE p.186 | The heat of firing every offensive weapon once, rear ones included: Ultra autocannons x 2, rotary x 6, Streak SRMs half, one-shot weapons a quarter. An insulated laser 1 less; a PPC capacitor's heat with its PPC; prototype ER large laser 13, prototype medium pulse laser 7. | Yes; see Finding 12 | |
| `bv2.off.weapon` | TM pp.303-304 (steps 1, 3-5), tables pp.317-318 | Heatless weapons at full value. If total weapon heat is no more than the efficiency, all at full value. Otherwise take weapons from the highest Modified BV down, the cooler one first between equals, adding their heat. | Yes | |
| `bv2.off.weapon.rear` | TM p.303 | Rear-firing torso, leg and head weapons count half, unless they are worth more than the forward ones there, when the forward ones count half. | Yes | |
| `bv2.off.weapon.turret` | TO:AUE p.194 | Turret weapons count as forward-firing when the forward non-turret weapons are worth more than the rear ones, otherwise as rear. | Yes | |
| `bv2.off.weapon.overheat` | TM p.304 (steps 6-7) | The weapon that reaches or passes the efficiency still counts in full; those after it count half. | Yes | |
| `bv2.off.weapons.total` | TM p.304 | The running weapon rating. | Yes | |
| `bv2.off.tonnage` | TM p.304 (step 8) | Add the 'Mech's tonnage. | Yes | |
| `bv2.off.tonnage.tsm` | TM p.304; IO:AE p.186 | TSM: tonnage x 1.5. Industrial TSM: x 1.15. Prototype TSM: x 1.5. | Yes | |
| `bv2.off.tonnage.aes` | TO:AUE p.192 | Add 10 percent of the tonnage for each limb with an AES. | Bipeds and quads yes; tripods no: Finding 4 | |
| `bv2.off.speed` | TM p.304, table p.316; TO:AUE p.192 | Running MP + half the Jumping MP rounded up, with MASC, TSM (not industrial TSM), a supercharger or jump boosters at their most; then the table, or (1 + (that - 5) / 10) to the power 1.2, to two places. | Yes | |
| `bv2.off.speed.lam` | IO:AE p.186 | A LAM adds half its AirMech flank MP, rounded normally, to its 'Mech running MP. | Yes | |
| `bv2.off.rating` | TM p.304 | Weapon rating x speed factor. | Yes | |
| `bv2.off.industrial` | TM p.304 | An IndustrialMech without advanced fire control: x 0.9. | Yes | |

Weapon modifiers inside a Modified BV (`MECH_BV2_WEAPON_CITES`):

| Modifier | Read on | What the page says |
|---|---|---|
| Targeting computer | TM p.303 | Each linked weapon x 1.25; not its ammunition. |
| Artemis IV | TM p.303 | The launcher + 20 percent; not its ammunition. |
| Machine gun array | TM p.317 note F | The total BV of the guns in the array x 0.67. |
| Actuator enhancement | TO:AUE p.192 | Weapons linked to an AES, physical ones included, x 1.25. |
| Drone operating system | TO:AUE p.193 | Every weapon x 0.8; not ammunition. |
| Apollo | TO:AUE p.195 note L | An MRM launcher with Apollo + 15 percent. |
| PPC capacitor | TO:AUE p.194 | The table lists the PPC and capacitor as one item; the capacitor's heat counts with the PPC's. |

### Final Battle Value

| Step id | Read on | What the page says | Code agrees? |
|---|---|---|---|
| `bv2.final.sum` | TM p.304 | Defensive + offensive ratings. | Yes |
| `bv2.final.cockpit` | TM p.304; TO:AUE p.193; IO:AE p.187 | Small cockpit x 0.95; torso-mounted cockpit x 0.95; interface cockpit x 1.30. | Yes |
| `bv2.final.drone` | TO:AUE p.193 | A drone operating system: final BV x 0.95, and no cockpit modifier. | Yes |
| `bv2.final.robotic` | IO:AE p.187 | Smart robotic control system: final BV x 0.85. | Yes |
| `bv2.final.override-kit` | IO:AE p.190 table | RISC heat sink override kit: final BV x 1.01. | Yes |
| `bv2.final.equipment` | none | A catch-all for any other record that multiplies the final BV. None exists today. | n/a |
| `bv2.final.round` | TM pp.302, 304 | Round to the nearest whole number, a half up. | Yes |
| `bv2.final.lam-bombs` | TM p.315; IO:AE p.186 | External stores add to a fighter's base BV before the skill multiplier. Nothing says LAM bombs do. | Our reading |

## Worked examples in the books

| Unit | Where | Numbers the book prints |
|---|---|---|
| MON-66 Mongoose | TM p.304 | Armor 89 x 2.5 = 222.5; structure 43 x 1.5 = 64.5; gyro 25 x 0.5 = 12.5; Beagle probe 10; subtotal 309.5; target modifier +4, factor 1.4; defensive rating 433.3. Medium laser 46 (three), small laser 9; heat efficiency 6 + 10 - 2 = 14; weapon heat 10; weapon rating 172; running MP 12, speed factor 1.89; offensive rating 325.08. Sum 758.38; BV 758. |
| TDR-10SE Thunderbolt | BV chapter v4.1 (the sixth printing's extract drops this example; TM p.302 names it) | Armor 200 x 2.5 = 500; structure 104 x 1.5 = 156; gyro 65 x 0.5 = 32.5; Guardian ECM 61; subtotal 749.5; one ton of LRM 10 ammunition in the left torso -15 = 734.5; target modifier +3 with MASC, factor 1.3; defensive rating 954.85. LRM 10 90, its ammunition 11, ER PPC 229 x 1.25 = 286.25, ER medium laser 62 x 1.25 = 77.5 (three); heat efficiency 6 + 24 - 4 = 26; weapon heat 34; order ER PPC (15), LRM 10 (19), ER medium (24), ER medium (29, over), third ER medium at half = 38.75; weapon rating 646; running MP 8 with MASC, jumping MP 4, speed factor 1.63; offensive rating 1,052.98. Sum 2,007.83 (BV 2,008). |
| WI-DM DemolitionMech | TM p.305 | Armor 85 x 2.5 = 212.5; structure 58 x 1.5 x 0.5 = 43.5; gyro 35 x 0.5 = 17.5; no defensive equipment; subtotal 273.5; target modifier +2, factor 1.2; defensive rating 328.2. Rock cutter 6, wrecking ball 8, small laser 9, tonnage 35; heat efficiency 6 + 1 - 2 = 5; weapon rating 58; running MP 5, speed factor 1.00; x 0.9 for no advanced fire control = 52.2. Sum 380.4; BV 380. |
| Phoenix Hawk LAM | IO:AE p.186 | Not yet usable: see Finding 10. |

## Findings

Differences between the page and our code, and places where the books disagree with themselves. Nothing here was
changed while reading. Each is decided in the queue (plan Task 11) or by the owner.

1. **Inner Sphere XL engine and CASE in an arm.** TM p.302 counts explosive ammunition in any location of a 'Mech
   with an Inner Sphere XL engine. Our code excuses an arm that has its own CASE. The code comment says this follows
   the MUL, SSW and MegaMek. By the page, such ammunition costs 15 a slot. Shown as `provisional`.
2. **Prototype CASE.** IO:AE p.189 (table, checked on the image): ammunition slots count 8, not 15. Our code treats
   prototype CASE as CASE, so those slots cost nothing. This looks like our bug.
3. **Dark Age armor multipliers.** IO:AE p.185 prints Anti-Penetrative Ablation 1.2, Heat-Dissipating 1.05,
   Impact-Resistant 1, Ballistic-Reinforced 1.2. IO:AE p.190 prints 1.2, 1.1, none, and 1.5. Errata v3.01 is silent.
   Our records use p.190's (heat-dissipating 1.1, ballistic-reinforced 1.5). A question for Catalyst; shown as
   `provisional`.
4. **AES on a tripod's legs.** TO:AUE p.192 adds 10 percent of the tonnage for each limb with an AES. Our code adds
   20 percent for a full set of legs unless the 'Mech is a quad (40), so a tripod's three legs give 20, not 30.
5. **An armored gyro.** TO:AUE p.192 gives 5 points a slot for an item with no BV. Our code uses 5 percent of the
   gyro points for each slot; the comment says this follows MegaMek and SSW. Shown as `provisional`.
6. **UMU and the jump bonus.** TO:AUE p.192 says to calculate a UMU as if it were jump jets. Our code leaves out the
   +1 a jump earns. Shown as `provisional`.
7. **A Superheavy with CASE in the center torso, legs or head.** IO:AE p.188 treats it as a Clan 'Mech there, and a
   Clan 'Mech still pays for those locations. Our code subtracts nothing in any Superheavy location with CASE.
8. **Heat of the signature systems.** No rule. The code comment says it follows MegaMek, SSW and the MUL. Shown as
   `provisional`.
9. **Radical heat sinks.** IO:AE p.185's text (x 1.4) disagrees with its own example and with the table on p.190
   (heat sinks x 0.4). We follow the table. Shown as `provisional`; a question for Catalyst.
10. **The Phoenix Hawk LAM example** (IO:AE p.186): the extract's columns run together and the printed arithmetic
    does not add up as extracted (a weapon rating of 271 x 3.00 is not 651). Read the page image before using it as
    a test.
11. **Dead branches.** `_calcBattleValue` carries camouflage, prototype, standard and improved stealth and mimetic
    cases that are always false for a 'Mech. They are the battle armor rows of the TM p.316 table. Drop them when
    converting; no number changes.
12. **Streak heat.** TM p.303 halves the heat of Streak SRMs. Our code halves every weapon flagged Streak (Streak
    LRMs too). Check TO:AUE's rule for Streak LRMs before changing anything.
13. **Stale note.** The Drone Operating System record's notes say its BV rule is not modelled. It is.
14. **"Greater than" against "at least".** TM p.304 starts the heat steps when total weapon heat is greater than the
    efficiency; our code starts them when it is equal too. The result is the same: at equality the last weapon is
    the one that reaches the limit and still counts in full.
