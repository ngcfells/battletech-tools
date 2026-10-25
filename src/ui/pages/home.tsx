import React, { type JSX } from 'react';
import { Link } from 'react-router';
import { IAppGlobals } from '../app-router';
import TextSection from '../components/text-section';
import UIPage from '../components/ui-page';
import './home.scss';

export default class Home extends React.Component<IHomeProps, IHomeState> {
    constructor(props: IHomeProps) {
        super(props);
        this.state = {
            updated: false,
        }

        this.props.appGlobals.makeDocumentTitle("Home");
    }

    render = (): JSX.Element => {
      return (
        <UIPage current="home" appGlobals={this.props.appGlobals}>
          <div className="row">
            <div className="col-md">
            <TextSection label="Jeff's Battletech Tools ilClan Edition BETA - State of the Site">
              The original <a href="https://jdgwf.github.io/battletech-tools">Jeff's BattleTech Tools</a> was created by Jeffrey D. Gordon. He passed from cancer in late 2024. This site is a fork of his original work, and is maintained by a group of volunteers. We are working to keep the site up to date and add new features. If you have any questions or suggestions, please feel free to reach out to us on the <a href="https://discord.gg/U539K45v8U">Discord</a>.<br/>
              <p><strong>Jeff wanted this app to be forever free and forever open source,</strong> even after his untimely demise. Having this app hosted at GitHub helps guarantee that.</p>
             <br /><br />Cancer sucks. Jeff's family has asked for any donations to be made to the <a href="https://colorectalcancer.org/?form=2024EOY" target="_blank" rel="noopener noreferrer">Colorectal Cancer Alliance</a><br /><br /></TextSection>
              </div>
          </div>
          <div className="row">
            <div className="col-md">
              <TextSection
                label="Available Tools"
                >
                  <ul className='styleless'>
                  <li>
                      <h3><Link to="alpha-strike/roster">Alpha Strike Roster</Link></h3>
                      <ul>
                        <li>The ability to search the <a href="http://masterunitlist.info" target="_blank" rel="noopener noreferrer">Master Unit List (MUL)</a> and add Alpha Strike Units to your Companies/Lances/Stars/Binaries, etc.</li>
                        <li>A copy of the Master Unit List is bundled with the app and kept current every week, so you can search it offline.</li>
                        <li>Filter the search by era, faction and special ability, and tick which unit lists to search: the live MUL, the MUL 1.0 leftovers and custom units such as the ArtVees.</li>
                        <li>After the MUL is searched and added to your forces, your units are stored offline on your local device.</li>
                        <li>You may print your AS forces here (which you can do on the MUL if you like), but more importantly you can...</li>
                        <li>Play your Alpha Strike games using a live in-play virtual stack of Alpha Strike Cards. When your unit takes damage or heat, the effects of the damage affect the card live and immediately. All your to-hit rolls are updated on-the-fly.</li>
                      </ul>
                      <br />
                      <h3>Advanced Search Terms</h3>
                      <ul>
                        <li><b>a:&lt;ability&gt;</b> - Search for abilities. Use <b>,</b> for AND (a:ECM,TAG), <b>!</b> for NOT (a:!CASE)</li>
                        <li><b>pv:30-50</b> - Point value ranges. Also supports &gt;, &lt;, &gt;=, &lt;=, = operators (e.g., pv&gt;=40)</li>
                        <li><b>short&gt;=x, medium&gt;=x, long&gt;=x</b> - Damage filters. Now supports all comparison operators and ranges</li>
                        <li><b>armor&gt;=x, structure&gt;=x</b> - Defensive stats. Supports ranges (armor:4-6)</li>
                        <li><b>year:3050-3067</b> - Introduction year ranges (replaces intro syntax)</li>
                        <li><b>mv&gt;=10, jump&gt;0</b> - Movement and jump filters</li>
                        <li><b>dmg:3/3/2</b> - Exact damage profiles (use * for wildcards: dmg:3/*/*)</li>
                        <li><b>defense&gt;12</b> - Combined armor+structure value</li>
                      </ul>
                      Examples:
                      <ul>
                        <li><i>timber wolf a:IF,ECM long&gt;=3</i> - Timber Wolves with both IF and ECM, long damage 3+</li>
                        <li><i>pv:20-40 a:ECM,TAG</i> - Units 20-40 PV with both ECM and TAG</li>
                        <li><i>role:Striker mv&gt;=10 jump&gt;0</i> - Fast jumping strikers</li>
                        <li><i>defense&gt;12 short&gt;=3 mv&lt;8</i> - Slow durable brawlers</li>
                        <li><i>tech:clan year:3050-3067 a:!CASE</i> - Clan Invasion era units without CASE</li>
                        <li><i>dmg:3/3/* armor:4-6</i> - Units with 3/3/any damage and 4-6 armor</li>
                      </ul>
                      <br />
                    </li>
                    <li>
                      <h3><Link to="alpha-strike/aces">BattleTech: Aces</Link></h3>
                      <ul>
                        <li>A companion for the solo and co-op <i>BattleTech: Aces</i> game: the card library, a card reader, the rules, a to-hit calculator and campaign tracking.</li>
                      </ul>
                      <br />
                    </li>
                    <li>
                      <h3><Link to="classic-battletech">Classic BattleTech Tools</Link></h3>
                      <p>Every creator follows the TechManual's construction steps and gives the unit a record sheet, Battle Value and C-Bill cost, and every unit but a building an Alpha Strike card. Each one starts with the Rules Edition, then that edition's own Rules Levels (Introductory to Experimental, plus Apocryphal, Custom Homebrew and Munchkin for non-canon play), and only offers what those allow. Before a load, import or start over replaces your design, each creator offers to save it. Saved units go into the Classic Roster.</p>
                      <ul>
                        <li>
                          <h4><Link to="classic-battletech/mech-creator">'Mech Creator</Link></h4>
                          <ul>
                            <li>Biped, Quad, Tripod, LAM and QuadVee BattleMechs, OmniMechs, Superheavy 'Mechs, IndustrialMechs and Primitive 'Mechs.</li>
                            <li>Inner Sphere, Clan and Mixed technology from the canon equipment catalogs.</li>
                            <li>Build under any rules edition from <i>Battledroids</i> (1984) to the 2026 Core Rulebook: each edition offers only what its rulebook prints, with that book's weights, heat, ranges and damage.</li>
                            <li>Pick a printed <i>Battledroids</i> droid: the ten in the box set, the Merlin from its construction example, the Spider from <i>Game News</i> #3 and the 1984 TCI kit-back sheets, built under that edition's rules.</li>
                            <li>Shields on the record sheet: a circle for each point of Damage Capacity and a diamond for each point of Damage Absorption, marked off in play.</li>
                            <li>Patchwork Armor, Fractional Accounting and FrankenMechs.</li>
                            <li>Import Solaris Skunk Werks (.ssw) designs.</li>
                          </ul>
                        </li>
                        <li>
                          <h4><Link to="classic-battletech/vehicle-creator">Vehicle Creator</Link></h4>
                          <p>Combat Vehicles of every motive type, OmniVehicles and Support Vehicles (chassis modifications, BAR and tech ratings, light and medium weapons), with turrets, transport bays, Patchwork Armor and Fractional Accounting.</p>
                        </li>
                        <li>
                          <h4><Link to="classic-battletech/fighter-creator">Fighter Creator</Link></h4>
                          <p>Aerospace and conventional fighters, OmniFighters, bombs and external stores, and Support Vehicle aircraft: airships, fixed-wing and satellites.</p>
                        </li>
                        <li>
                          <h4><Link to="classic-battletech/infantry-creator">Infantry Creator</Link></h4>
                          <p>Conventional infantry platoons: motive types, weapons by era, armor kits and specializations.</p>
                        </li>
                        <li>
                          <h4><Link to="classic-battletech/battle-armor-creator">Battle Armor Creator</Link></h4>
                          <p>Battle armor suits and squads, weapon loadouts, Tactical Operations equipment and mixed technology.</p>
                        </li>
                        <li>
                          <h4><Link to="classic-battletech/protomech-creator">ProtoMech Creator</Link></h4>
                          <p>ProtoMechs and Points, with MegaMek (.blk) import.</p>
                        </li>
                        <li>
                          <h4><Link to="classic-battletech/small-craft-creator">Small Craft Creator</Link></h4>
                          <p>Small Craft and DropShips, aerodyne and spheroid: fuel, crew, bays and doors, and capital weapons by arc, with MegaMek (.blk) import.</p>
                        </li>
                        <li>
                          <h4><Link to="classic-battletech/capital-ship-creator">JumpShip and WarShip Creator</Link></h4>
                          <p>JumpShips, WarShips and space stations: K-F drive, capital armor and weapons in up to eight arcs, docking collars, grav decks and bays, with Battle Value, a record sheet, an Alpha Strike card and play in the Classic Roster.</p>
                        </li>
                        <li>
                          <h4><Link to="classic-battletech/building-creator">Building Creator</Link></h4>
                          <p>Buildings, gun emplacements, advanced buildings and Castles Brian, with their weapons. In the roster they take damage, critical hits and breaches.</p>
                        </li>
                        <li>
                          <h4><Link to="classic-battletech/roster">Classic Roster</Link></h4>
                          <p>Electronic record sheets for every unit type above, grouped into lances and other formations. They let you:</p>
                          <ul>
                            <li>Search the Master Unit List by name, era, faction, tech, role and rules level and add the matching 'Mech, vehicle, fighter, infantry, battle armor or ProtoMech design to a group</li>
                            <li>Track your movement modes and to-hit numbers for each unit at a glance</li>
                            <li>Set your targets' speed, range and other to-hit modifiers (up to 3 targets at a time)</li>
                            <li>Assign your weapons to your targets: your GATOR and final to-hit are worked out for you</li>
                            <li>Fire everything from one sheet, mark attacks as resolved and track cluster hits</li>
                            <li>Take damage and critical hits by location, with each unit type's own damage rules</li>
                            <li>Apply heat for each 'Mech's movement mode and the weapons it fired</li>
                            <li>Play <i>Battledroids</i> (1984) rules games</li>
                            <li>Print the record sheets and Alpha Strike cards</li>
                          </ul>
                        </li>
                      </ul>
                      <br />
                    </li>
                    <li>
                      <h3><Link to="game-management/match-play">Alpha Strike Match Play</Link></h3>
                      <ul>
                        <li>Generates deployments and scenarios for the Alpha Strike Match Play format, with a custom ban system for variety.</li>
                      </ul>
                      <br />
                    </li>
                    <li>
                      <h4><Link to="settings/backup-and-restore">Backing up and Restoring</Link></h4>
                      <p className="alert alert-warning alert-thin">Your data is always private and stored on your own device. This means that if you lose your device you lose your data!</p>
                    </li>
                  </ul>
                  <h3>Why? What's the purpose of this app? I use Solaris Skunk Werks/Mech Factory/ etc.</h3>
                  <p>Each of these software packages are amazing tools! However what they lack is complete cross-platform compatibility and ease of tablet use. Sure, <a href="https://battletech.rpg.hu/mechfactory_frame.php">Mech Factory</a> comes close, but it can't be used offline.</p>
                  <p>Jeff created this app originally as an electronic Alpha Strike roster sheet, but it's grown into more.</p>

                  <h3>What's next?</h3>
                  <p>Plans will be updated on the <Link to="dev-status">Development Status Page</Link>.</p>
                </TextSection>
            </div>
            <div className="col-md">
            <TextSection
              label="News"
            >
                  {/* The news scrolls in its own box (discussion #13); it takes focus so a keyboard can scroll it. */}
                  <div className="news-scroll" role="region" aria-label="News" tabIndex={0}>
                  <ul className="news">
                  <li>
                  <h3>
                      <strong>October 25th, 2026</strong> - Primitive Small Craft and DropShips, and the VTOLAM
                    </h3>
                    <h4>Author - NGCFells</h4>
                      <ul>
                        <li>The Small Craft and DropShip creator builds Primitive craft (<i>Interstellar Operations: Alternate Eras</i> pp.119-121), by year of introduction from 2100 to 2499: engine, controls and fuel by year, the Primitive DropShip weight limits and free heat sinks, armor at 0.66, single heat sinks only, and a RetroTech note on later equipment. DropShips choose their K-F boom: standard, prototype or none. MegaMek Primitive craft files import as Primitive, with their boom.</li>
                        <li>The fighter, Small Craft and capital ship creators show heat as, for example, "20 dissipated of 34 generated".</li>
                        <li>The Merlin, the 60-ton droid the <i>Battledroids</i> rulebook builds as its construction example (pp.23-25), can be picked with the book's ten. The text prints the head's armor as 0 and each arm's as 28, which come to 199 instead of 192; the sheet beside it shows 9 and 20, which match, so those are used.</li>
                        <li>The VTOLAM, a LAM whose second mode is a VTOL, at the Custom Homebrew rules level, under two fan rule sets. BishopSteiner's (DeviantArt): conversion equipment 20% of tonnage, at most 30 tons, no jump jets needed, landing skids in the side torsos, and VTOL movement from the engine; with his Locust VTOLAM as a sample. professorheyteen's (<i>Battletech Into The Future</i>): 10% conversion equipment, at most 35 tons, any 'Mech equipment, and VTOL movement equal to the Jump MP; with all seven of his designs as samples (Locust for Hell's Horses and the LCAF, Firefly, Icestorm, Flea, Spider and Valkyrie), each at its published Battle Value. Pick the LAM type in the 'Mech Creator's step 1; in Play Mode a VTOLAM switches between 'Mech and VTOL.</li>
                        <li>A Custom Homebrew infantry weapon: the Ceres Arms Léitíng-23 heavy combat carbine, from is-the-battlemech-cool-or-not's Tumblr. Its <i>A Time of War</i> stats are converted by the <i>A Time of War Companion</i>'s rules (pp.169-171): damage 0.28, range 0, Battle Value 0.26, from 3100. Infantry platoons, battle armor anti-personnel mounts, buildings and Support Vehicles offer it only at the Custom Homebrew rules level.</li>
                        <li>Alpha Strike Roster: "Quickly add a ForcePack" now adds every unit in the pack. Most packs had been adding only some of their units, or none, because units were matched without their variant. Packs can now be added offline too, and the list has every opposing force from the <i>Aces: Scouring Sands</i> campaign book: two training forces and 21 sorties, each unit at the book's skill.</li>
                        <li>'Mech Creator: <i>Battledroids</i> droids now print on the book's own droid record sheet: armor and internal structure as boxes in the droid's shape, the DroidWarrior's name, skills and hits, heat sinks, ammunition, the Critical Hit Chart and the Heat Scale. Play mode keeps the sheet with the trackers.</li>
                      </ul>
                   </li>
                  <li>
                  <h3>
                      <strong>October 24th, 2026</strong> - Skunk Werks imports, Battle Value and DropShip ammunition
                    </h3>
                    <h4>Author - NGCFells</h4>
                      <ul>
                        <li>Skunk Werks imports: designs place every item where the file puts it (unplaced slots on the bundled designs down from 1,253), every canon item on them imports, the Torso-Mounted Cockpit can be built and imported, and files with a broken image attribute (the Summoner and Puma) load. A design that uses a draft item whose stats are not all entered says so on every creator step and on the saved list.</li>
                        <li>Battle Value now matches Skunk Werks' BV2 on 2,881 of its 2,934 BattleMechs, up from 2,285, and on its IndustrialMech and Primitive designs, among them split weapons, CASE with XL engines, Artemis on improved launchers, forward and rear weapons, and prototype improved jump jets.</li>
                        <li>DropShip ammunition sits in its weapons' bays and counts at the rate of the launchers in its bay and arc (<i>TechManual</i> p.311). MegaMek DropShip files import their internal weapon names, Artemis on MMLs, PPC Capacitors, Clan, MML, ATM, HAG and primitive rounds, bay quirks, Obsolete years and Narc pods. MML ammunition reads its shots at its own round's rate, Clan AMS fires 24 shots a ton, cruise missiles count their heat on aerospace units, and ammunition on fighters, Small Craft, DropShips and vehicles caps at its weapons' Battle Value.</li>
                        <li>Master Unit List: DropShip, Small Craft and capital ship Alpha Strike cards get a back with their damage by firing arc, read off all 437 MUL card backs, and their own unit type (they were taken for aerospace fighters). Records from the new MUL get their armor threshold, rules level, TRO and image.</li>
                        <li>Behind the scenes: every equipment catalog shares one record core and one registry, with each record's editions, tech base and Clan dates, so Clan units use the Clan dates everywhere and a mixed-tech fighter or Small Craft takes a production window over a prototype. The pre-<i>Total Warfare</i> expansions count as editions on one dated timeline, and every catalog was checked against MegaMek's 3,830 official items.</li>
                      </ul>
                   </li>
                  <li>
                  <h3>
                      <strong>October 23rd, 2026</strong> - Bug fixes, and the Classic Roster MUL search for every unit type
                    </h3>
                    <h4>Author - NGCFells</h4>
                      <ul>
                        <li>Each 'Mech's engine, armor, gyro, structure, heat sink, cockpit, myomer and jump jet lists show that 'Mech's own era availability; opening another 'Mech no longer changes them, or whether a design reads as Anachronistic.</li>
                        <li>Vehicles above engine rating 400 follow the large engine's own dates, as 'Mechs do: no Large Fusion before its 2630 prototype, and the Inner Sphere Large XL is out of reach between its loss in 2822 and its recovery in 3054.</li>
                        <li>Faster: importing a Small Craft or DropShip <i>.blk</i> file takes a fraction of a second instead of 5 to 15, every change in the Small Craft, fighter and capital ship creators is quicker on designs with Artemis launchers, and restoring a backup full of saved vehicles takes under a second.</li>
                        <li>The 'Mech Creator's Alpha Strike Role is a drop-down of the published ground roles instead of a text box.</li>
                        <li>The Classic BattleTech roster page's issue link goes to the current project instead of Jeff's original one.</li>
                        <li>The 'Mech sheet's "Created with" footer is on three lines, so a long site name no longer runs into the trademark notices.</li>
                        <li>Alpha Strike roster: each ForcePack's name and members wrap in their own column beside the add button.</li>
                        <li>The 'Mech Creator's Skunk Werks imports page describes the importer as it is now and explains the green check.</li>
                        <li>Classic BattleTech roster: the 2022 "In Development" banner is replaced with a description of what the roster does now, the page is titled as the Classic BattleTech roster, a one-unit favorite says "One Unit", and the printed force's tech is no longer "Mixed" because of an empty group or a group of <i>Battledroids</i> units.</li>
                        <li>Tripod 'Mechs have a proper record sheet: the armor, internal structure and damage transfer diagrams draw a Center Leg between the legs, with a bubble for every point of its armor and structure (a 100-ton Tripod's 42 Center Leg armor no longer stops at 30), and the 'Mech Creator's armor step shows the same Tripod. The Center Torso label closes its bracket again.</li>
                        <li>The structure record sheet prints all of a building's fittings: sealing, superstructure, ceilings, doors, elevators and storage past the first two lines are no longer cut off, and a long list carries on to a second page.</li>
                        <li>Anti-orbital Long Tom rounds now do 5 points of standard-scale damage instead of 2 capital, after a suggestion from Vehrec on the Star League Discord: the round is mostly propellant, made to buffet landing DropShips. Against capital armor, standard damage is totaled, divided by 10 and rounded normally.</li>
                        <li>Rules editions: the <i>BattleTech Manual</i>, both <i>Compendiums</i> and both <i>Master Rules</i> give the Internal Combustion Engine to vehicles and buildings only, so the 'Mech Creator offers it under them only at the Custom Homebrew level, an ICE 'Mech built to them is Custom Homebrew, and switching an ICE 'Mech to one of them lists the engine. From <i>Total Warfare</i> on, an ICE BattleMech is still Experimental.</li>
                        <li>Rules editions: under <i>Battledroids</i>, the second edition and the <i>BattleTech Manual</i>, each torso's front and rear armor has its own maximum of twice that location's structure, as those books print it. From the <i>BattleTech Compendium</i> on, front and rear share one maximum.</li>
                        <li>Classic Roster Master Unit List search, an idea from Camille, Centrella-Sworn on the Star League Discord: in a group's Add dialog, search the MUL by name, era, factions, tech, role and rules level at once, and add the 'Mech design that matches (your saved one first, else the bundled Skunk Werks one).</li>
                        <li>Both roster searches now take the unit lists as checkboxes, so the live MUL, the MUL 1.0 leftovers and custom units can be searched in any mix. The sample ArtVees are in the custom list, and their Alpha Strike cards now print IF0* and drop an empty REAR as the MUL does.</li>
                        <li>Alpha Strike Point Values follow the <i>Alpha Strike Companion</i> errata v1.6 for every ground unit, in the 'Mech conversion and the Alpha Strike creator alike, and a jumper is priced on its jump. A card's "IF 0*" no longer prints as "IFNaN".</li>
                        <li>Alternate munitions keep their standard round's Battle Value: IS LB 5-X cluster, Copperhead, Arrow IV homing and 22 more.</li>
                        <li>Restoring a backup keeps its favorite groups after the page reloads, and the Alpha Strike favorites are capped like the Classic ones.</li>
                        <li>Classic roster: both force total lines count every unit type and show the tonnage.</li>
                        <li>'Mech placement follows the rules for physical weapons (hatchets, swords, maces, vibroblades and claws need their actuators and go in the arms), spread equipment (stealth systems, Chameleon, partial wings, tracks), AES and the stealth system conflicts. Saved designs that break them are flagged.</li>
                        <li>The Classic Roster's Master Unit List search now finds vehicles, fighters, infantry, battle armor and ProtoMechs as well as 'Mechs, and adds each to its own table in the group. Every group table has a Search MUL button, the bundled ArtVee designs are found too, and each result has View (its record sheet) and TRO buttons beside Add.</li>
                        <li>Vehicles, fighters, infantry, battle armor and ProtoMechs now keep a Technical Readout in their saves, ready for each creator's own TRO step.</li>
                        <li>The Vehicle Creator has its Technical Readout step: Step 5, between Place Equipment and Summary. Enter the manufacturer, the makes of the chassis, engine, armor and each weapon, and the history text, then print the modern-style TRO sheet from that step or from the Summary.</li>
                        <li>The Fighter Creator has its Technical Readout step too: Step 4, between Weapons and Equipment and Summary, with the same printable TRO sheet.</li>
                        <li>The Infantry Creator has its Technical Readout step: Step 3, between Platoon Weaponry and Summary, with the same printable TRO sheet.</li>
                        <li>The Battle Armor Creator has its Technical Readout step: Step 6, after Loadouts and before Summary, with the same printable TRO sheet. Importing a MegaMek battle armor file now brings its manufacturer, factory, component makes and history text across too.</li>
                        <li>The ProtoMech Creator has its Technical Readout step: Step 6, between Weapons and Equipment and Summary, with the same printable TRO sheet. Importing a MegaMek ProtoMech file brings its TRO fields across too. The sheet now gives a ProtoMech's mass in tons (it printed the kilogram total as tons).</li>
                        <li>The vehicle TRO sheet's construction table now lists every ton, the way the printed TROs do: control systems, lift equipment, turrets, heat sinks, movement, armor factor, internal structure and armor by location, and ammunition, with locations by name.</li>
                        <li>The fighter TRO sheet's construction table does the same: engine with Safe and Maximum Thrust, structural integrity, cockpit, fuel, heat sinks, armor by arc and ammunition, adding up to the fighter's tonnage.</li>
                        <li>The infantry TRO sheet's table now gives transport weight, tech base, movement, formation, platoon make-up, armor kit and damage divisor, anti-'Mech training and special features, with each weapon's trooper count.</li>
                        <li>The Small Craft Creator has its Technical Readout step: Step 7, between Crew, Quarters and Bays and Summary, with the same printable TRO sheet. Its table lists every ton: engine with Safe and Maximum Thrust, structural integrity, fuel, heat sinks, quarters and bays, armor by side and the weapons by arc, capital weapons included for DropShips. Importing a MegaMek Small Craft or DropShip file brings its TRO fields across too.</li>
                        <li>The Classic Roster's Master Unit List search now finds Small Craft and DropShips too: the Small Craft table has its own Search MUL button, and each result has View, TRO and Add, landing in the group's Small Craft table. Before, the MUL's Small Craft and DropShips were taken for fighters and sent to the Fighter Creator.</li>
                        <li>The Master Unit List search now tells JumpShips, WarShips and space stations from Small Craft and DropShips: they match the vessels you saved in the JumpShip and WarShip Creator and go into the group's capital ship table, which has its own Search MUL button. One you have not built links to that creator, not the Small Craft Creator. Capital ships have no TRO button yet; their Technical Readout step comes next.</li>
                        <li>The JumpShip and WarShip Creator has its Technical Readout step: Step 7, between Crew, Quarters, Bays and Collars and Summary, with the same printable TRO sheet. Its table lists every ton: structural integrity, engine with Safe and Maximum Thrust (or the station-keeping drive), fuel, K-F drive and jump sail, controls, heat sinks, docking collars, grav decks, quarters and bays, armor by facing with the free armor counted, and the weapons by arc, capital weapons included. The vessel's K-F drive gets a make of its own. The Master Unit List search now has a TRO button for capital ships too.</li>
                        <li>Behind the scenes: every creator's Technical Readout step and printed TRO sheet are now one shared page instead of a copy per creator, so a fix to one reaches them all.</li>
                        <li>The Building Creator has its Technical Readout step: Step 4, between Weapons, Power and Equipment and Summary, with the same printable TRO sheet. Its table gives the superstructure and Construction Factor, size, weight capacity and modifications, then every ton of the load, with each weapon's hex.</li>
                        <li>Building Creator Summary: the total weight now matches the weight lines above it; a generator spread over several hexes could add a few kilograms of rounding (31.002 tons for a 31-ton generator).</li>
                        <li>Behind the scenes: the step menus beside every creator are now one shared menu instead of nine copies.</li>
                        <li><i>Battledroids</i> droids, the book's and your own Expert designs, have the same Technical Readout step and printed TRO sheet as any 'Mech (Step 7 of the 'Mech Creator). The 1984 and 1985 Engine Tables name a maker for every rating, so a droid's power plant reads as that maker until you enter another: the Merlin's 240 is a Pitban, the Griffin's 275 a CoreTek. The same holds for designs built under <i>BattleTech, Second Edition</i>.</li>
                        <li>Importing a MegaMek Support Vehicle file (ground, VTOL or Fixed-Wing) now brings its Technical Readout across too: manufacturer, factory, the makes of chassis, engine, armor, communications and targeting systems, and the overview, capabilities, deployment, history and notes text.</li>
                        <li>The Engine Table makers now cover designs built under <i>The BattleTech Manual</i>, <i>The BattleTech Compendium</i>, <i>BattleTech, Third Edition</i>, <i>The Rules of Warfare</i> and <i>BattleTech, Fourth Edition</i>: those books print one table of their own, which differs from the 1984 one at ratings 125 to 155 (a 130 is a Magna rather than a Vlar). The <i>Master Rules</i> tables give tonnages only, so designs under them get no default maker.</li>
                      </ul>
                   </li>
                  <li>
                  <h3>
                      <strong>October 22nd, 2026</strong> - Beta feedback and new record sheets for vehicles, fighters, Small Craft, DropShips, capital ships, battle armor, infantry, ProtoMechs, buildings, airships, satellites and <i>Battledroids</i> units
                    </h3>
                    <h4>Author - NGCFells</h4>
                      <p>New on the <a href="https://ngcfells.github.io/battletech-tools" target="_blank" rel="noopener noreferrer">beta test site</a> and offered to upstream</p>
                      <ul>
                        <li>Light and Clan XL engines survive the loss of a side torso; only the Inner Sphere XL and XXL engines are lost with one.</li>
                        <li>Battle Value counts prototype CASE as CASE, and Clan artillery (Long Tom 560, Sniper 96, Thumper 48) uses its own Battle Value on every unit that can mount it: 'Mechs, vehicles, fighters, Small Craft, DropShips and capital ships.</li>
                        <li>LRM launchers do 3 aerospace damage for every 5 missiles (LRM 20: 12), Inner Sphere and Clan, and the Clan Rotary ACs have the same aerospace heat as the Inner Sphere ones.</li>
                        <li>On the 'Mech sheet, a weapon with no medium or long range bracket (the Nail and Rivet Guns) prints a dash instead of 0.</li>
                        <li>Alpha Strike: heat only ever lowers a unit's damage, so two LRM 5s no longer show 5 short-range damage.</li>
                        <li>Importing a design no longer keeps the previous design's quirks.</li>
                        <li>Every builder asks for the era first, and the era decides which tech bases you can pick. The Clan tech base starts with the Clan Founding Years, not the Star League.</li>
                        <li>The equipment list shows only ammunition for the weapons you have mounted; tick "Show all ammunition" to see the rest. Ammunition sorts by weapon in every list.</li>
                        <li>A tonnage bar stays on screen while you add equipment, and turns red when you are over.</li>
                        <li>The 'Mech Creator has an optional Step 7, Technical Readout: who made the design and its engine, armor and each weapon (a weapon type can be marked mixed, with a make per copy), plus the Overview, Capabilities and other TRO text. Print it as a TRO sheet. The SSW importer now keeps these fields, and they are saved with the design.</li>
                        <li>Sponsons are placement choices: you decide which weapons go in them.</li>
                        <li>Vehicle ammunition goes in the Body, and the vehicle armor diagram has a top-down outline for each motive type.</li>
                        <li>Warnings and small print are larger and easier to read.</li>
                        <li>The vehicle record sheet is now one full page with every table the official sheets print: hit locations, motive system damage and critical hits, plus the VTOL elevation track, the submarine depth track and the super-heavy, Large Support Vehicle and Large Naval Vessel tables.</li>
                        <li>The fighter record sheet is one full page too: external stores boxes for your bombs, the armor diagram, critical damage, pilot data, the velocity record and the heat scale, or, for conventional fighters, the ground map straight movement and fighter return tables.</li>
                        <li>The 'Mech sheet's heat scale now runs from 30 at the top down to 0, with an Overflow box, as on the official sheet.</li>
                        <li>Small Craft and DropShips get full-page sheets for aerodyne and spheroid shapes. The Small Craft sheet adds a crew and cargo box; the DropShip sheet lists weapons by bay with their combined heat and damage, carried fighters and Small Craft with their launch rate, crew data, the K-F boom and docking collar, and heat generated per arc.</li>
                        <li>JumpShips, WarShips and space stations get full-page sheets laid out like the Strategic Operations ones: weapon bays in capital scale with standard scale in parentheses, each facing's armor in squares with its damage threshold, structural integrity, K-F drive, sail and docking collars in the hull, crew data, critical damage, heat generated per arc and the velocity record. Damage marked in play is filled in on the roster's printout.</li>
                        <li>The battle armor sheet holds five squads to a page, as the Total Warfare one does, with the leg attack, swarm attack, swarm attack modifier, swarm hit location and transport position tables beside them. The roster prints its battle armor five squads to a page, and the creator prints a design with its alternate loadouts.</li>
                        <li>The conventional infantry sheet holds four platoons to a page: thirty numbered troopers with the damage the platoon does under each, the range modifiers out to its reach, and its movement, armor and skills. Troopers it does not have and ranges it cannot reach are blacked out. An oversized platoon gets a block for each sub-platoon. Below them are the leg attack, swarm attack, swarm attack modifier, non-infantry weapon damage and burst-fire damage tables.</li>
                        <li>The ProtoMech sheet holds a Point of five to a page: each block has the weapons inventory, pilot data with the consciousness track, the hit location table with its critical hit boxes and an armor diagram. The torso weapon roll names your torso weapons, and quads and Gliders get their own hit tables.</li>
                        <li>Buildings print on a Structure Record Sheet like the Tactical Operations one: structure data, the weapons inventory, a line for every hex with its Construction Factor, armor and what entering it costs, crew data and a numbered map to mark the footprint on, level by level. Beside the map are the building critical hits table and the building's Damage Threshold and damage figures. Long walls run on to continuation pages.</li>
                        <li>Airships and satellites get their own sheets, laid out like the Total Warfare Airship and Tactical Operations Satellite ones: craft data and weapons, the armor diagram, crew data, and critical damage with the thrusters. An airship's sheet adds the velocity record and the Airship Velocity Table, which gives the Thrust Points for each turn of the four-turn cycle. Fixed-wing Support Vehicles stay on the conventional fighter sheet.</li>
                        <li>The <i>Battledroids</i> tanks, jeeps and infantry squads print two to a page, in the style of the book's droid record sheet: an armor diagram or damage boxes, the unit's data and weapons, and the rules the book gives it. Beside them are the To-Hit Number, movement, terrain and target modifiers, the Tank Hit Locations, the Missile Hit Table and the tank firing arc. Missile launchers show their damage per missile.</li>
                        <li>Anti-orbital Long Tom ammunition, a Custom round requested on the Star League Discord by SmilingNid: it fires surface-to-orbit under the Strategic Operations rules for 5 points of damage, 3 shots a ton. The Federated Suns built it after Edo, with a prototype in 3055 and production from 3062.</li>
                        <li>The Hailstorm, the towed artillery piece from the <i>MechWarrior 5</i> games, at the Apocryphal rules level: 35 points out to 12 mapsheets, with the rounds the other tubes fire. It mounts only on a Support Vehicle trailer.</li>
                        <li>For games with space forces, a space turn tracker in Play Mode: tick "Space forces in this game" on the roster page. It counts the space turn (6 ground turns each), tracks each anti-orbital Long Tom shot from firing to the space phase, and reminds you of the rolls for firing early and for resolving each shot.</li>
                        <li>The ArtVee (Artillery Vehicle), a Custom Homebrew tracked tank that transforms the way a LAM does, an idea put forward on the Star League Discord by kris (helvedes heste). Some powers call it a MAP (Mobile Artillery Platform). In Vehicle Mode it moves and fires an autocannon; in Siege Mode it stands still and fires real artillery. Both come from one combo gun: a Thumper, Sniper or Long Tom tube with a drop-in AC/5, AC/10 or AC/20 breech. Build one in the Combat Vehicle creator at the Custom Homebrew rules level: tracked, with an XL or XXL engine, at least 4/6 movement (3/5 with a Long Tom), the combo gun in a turret, and the Armored Motive System recommended. It has one blended Battle Value, as LAMs do, and its record sheet and single Alpha Strike card show both modes. In Play Mode a transformation is declared before the unit moves and is its only action that turn. The Star League built them from 2700 and the Inner Sphere lost them in the Succession Wars; the Clans kept theirs, and the Free Worlds League brought them back in 3071. Nine sample designs ship with the app: a Star League, a Clan and an Inner Sphere MAP pattern of each.</li>
                        <li>The Armored Motive System, Experimental technology from <i>Tactical Operations: Advanced Units &amp; Equipment</i>, for Combat Vehicles with tracked, wheeled, hover, hydrofoil, naval or WiGE motive: −2 on Motive System Damage rolls. And two smoke devices from <i>Future Wars</i> #32, the Smoker and the Buckler Smoke Dispenser, as Custom equipment.</li>
                        <li>Design quirks in play: tick "Use design quirks" on either roster page (it is off by default, and saved with the force). In Classic play a unit's quirks change its to-hit numbers (an Accurate Weapon, Improved Targeting in its range band), a Combat Computer cuts the heat it builds up, and the side's best Initiative quirk shows in the header. Each unit lists its quirks and what they do, including the ones you apply at the table. In Alpha Strike, units made from a design carry the quirks the Alpha Strike Companion lists, and their to-hit numbers change with them.</li>
                        <li>More quirks in play: a Game year on either roster (blank uses each unit's era start), so a quirk that has ended or not yet begun by then does not apply; an Airborne box on each target for Anti-Aircraft Targeting; cooling jacket quirks change a fired weapon's heat; Barrel Fist counts only for its own arm's punches; and a wrecked or engine-hit 'Mech drops out of its side's Initiative quirk. Improved Cooling Jacket can only go on a weapon or bay that makes heat. The <i>Campaign Operations</i> errata deletes No Torso Twist, so it stays for the designs that have it at the Apocryphal level, and Weak Legs follows the errata.</li>
                      </ul>
                   </li>
                  <li>
                  <h3>
                      <strong>October 16th, 2026</strong> - JumpShips, WarShips and <i>Battledroids</i>
                    </h3>
                    <h4>Author - NGCFells</h4>
                      <p>New on the <a href="https://ngcfells.github.io/battletech-tools" target="_blank" rel="noopener noreferrer">beta test site</a>, and offered to the main site for review:</p>
                      <ul>
                        <li>JumpShips, WarShips and space stations: a creator, Battle Value, record sheet, Alpha Strike card and play in the Classic Roster. Every unit type can now be built and played.</li>
                        <li>Each rules edition has its own rules levels. <i>Battledroids</i> has Basic, Advanced and Expert; below Expert you pick from the droids the books print: the box set's ten, the Spider and the 1984 TCI kit backs.</li>
                        <li><i>Battledroids</i> designs show only what that rulebook has, and undoing an edition switch brings back the design you had.</li>
                        <li>Every creator offers to save your design before a load, import or start over replaces it.</li>
                        <li>'Mech record sheets draw shields beside the arm, with Damage Capacity and Damage Absorption to mark off in play.</li>
                      </ul>
                   </li>
                  <li>
                  <h3>
                      <strong>October 15th, 2026</strong> - Every unit type, on the beta site
                    </h3>
                    <h4>Author - NGCFells</h4>
                      <p>The <a href="https://ngcfells.github.io/battletech-tools" target="_blank" rel="noopener noreferrer">beta test site</a> now builds and plays every ground and aerospace unit short of JumpShips. This work is offered to the main site for review.</p>
                      <ul>
                        <li>New creators: fighters (aerospace, conventional and OmniFighters), conventional infantry, battle armor, ProtoMechs, Small Craft and DropShips, and buildings, each with a record sheet, Battle Value, cost and a place in the Classic Roster.</li>
                        <li>Vehicles: Support Vehicles of every motive type and OmniVehicles.</li>
                        <li>'Mechs: Tripods, LAMs, QuadVees, Superheavy 'Mechs, IndustrialMechs and Primitive 'Mechs, with the canon Inner Sphere and Clan equipment checked against the rulebooks.</li>
                        <li>Rules levels from Introductory to Experimental, plus Apocryphal, Custom Homebrew and Munchkin for non-canon play.</li>
                        <li>Rules editions: build a 'Mech under any core rulebook from <i>Battledroids</i> (1984) to the 2026 Core Rulebook, and play <i>Battledroids</i> games. Every creator now starts with the rules edition.</li>
                        <li>Patchwork Armor, Fractional Accounting, FrankenMechs and the <i>Ghosts of Obeedah</i> units.</li>
                        <li>Solaris Skunk Werks import for 'Mechs, and MegaMek import for ProtoMechs and Small Craft.</li>
                        <li>Alpha Strike: a companion for <i>BattleTech: Aces</i>, special ability filters, search results in pages, and the bundled Master Unit List updated every week.</li>
                      </ul>
                   </li>
                  <li>
                  <h3>
                      <strong>October 1st, 2026</strong> - Vehicle Creator
                    </h3>
                    <h4>Author - NGCFells</h4>
                      <p>The Vehicle Creator now covers the full Combat Vehicle rules: every motive type, Battle Value, cost, Alpha Strike cards and play in the Classic Roster. Imports were hardened along the way.</p>
                   </li>
                  <li>
                  <h3>
                      <strong>September 29th, 2026</strong> - New Foundations
                    </h3>
                    <h4>Author - NGCFells</h4>
                      <ul>
                        <li>The app moved to current tools (Vite, React 19, TypeScript), with automated tests on every change.</li>
                        <li>The Alpha Strike Roster searches a copy of the Master Unit List bundled with the app, so it works offline.</li>
                        <li>Fixed: Battle Value for units faster than 25 MP (TechManual p.316), and engines with no matching rating.</li>
                        <li>The license is now GPLv3, matching the code it came from.</li>
                      </ul>
                   </li>
                  <li>
                  <h3>
                      <strong>July 26th, 2025</strong> - Enhanced Alpha Strike Search
                    </h3>
                    <h4>Author - Spork</h4>
                      <p>Patch Notes:</p>
                      <p>Major improvements to the Alpha Strike unit search system:</p>
                      <ul>
                        <li>New range syntax: <code>pv:30-50</code>, <code>year:3050-3067</code>, <code>armor:4-6</code></li>
                        <li>Movement filters: <code>mv&gt;=10</code>, <code>jump&gt;0</code> for finding mobile units</li>
                        <li>Advanced ability searches: <code>a:ECM,TAG</code> (both), <code>a:!CASE</code> (without)</li>
                        <li>Damage profile matching: <code>dmg:3/3/2</code> for exact profiles, <code>dmg:3/*/*</code> with wildcards</li>
                        <li>Combined defense values: <code>defense&gt;12</code> for total armor + structure</li>
                        <li>All comparison operators now support &gt;=, &lt;=, != for more precise filtering</li>
                      </ul>
                      <p>See the updated search guide on this page for full details and examples!</p>
                   </li>   
                  <li>
                  <h3>
                      <strong>April 14th, 2025</strong> - Play Mode Improvements
                    </h3>
                    <h4>Author - Spork</h4>
                      <p>Patch Notes:</p>
                      <p>Added advanced search terms. See search guide on the left hand side of this page.</p>
                      <p>Updated print mode to improve look and feel. Added mech tokens and ability cards.</p>
                      <p>Ability crits will now lower values of appropriate special weapon attacks. (LRM,SRM,IF,HT,ARTX,TUR,etc.)</p>
                      <p>Formations now require 3 units before they can be selected, per ASCE rules. This change aims to lower confusion about them for new players.</p>
                      <p>Added even more Forcepacks!</p>
                      <p>Added remaining formations from Kurita manual</p>
                   </li>   
                   <li>
                  <h3>
                      <strong>March 20th, 2025</strong> - Play Mode Improvements
                    </h3>
                    <h4>Author - Spork</h4>
                      <p>Patch Notes:</p>
                      <p>We've added a couple of improvements to the play mode feature!</p>
                      <p>First, you can now choose how many cards appear in each row. This should help users on smaller screens see easier.</p>
                      <p>Secondly, damage for a round is now tracked in a blue color and doesn't affect your stats until you hit 'Apply' or 'End Round'.</p>
                      <p>As always, feedback and bug reports can be made on our Discord!</p>

                   </li>   
                  <li>
                  <h3>
                      <strong>December 26th, 2024</strong> - Alpha Strike Match Play Generator
                    </h3>
                    <h4>Author - Spork</h4>
                      <p>Patch Notes:</p>
                      <p>The initial release of our matchplay generator can be found <Link to="game-management/match-play">here</Link>. This will allow you to generate deployments and scenarios for the Alpha Strike Match Play Beta, and includes a custom ban system to add some variety to the format.</p>

                   </li>                
                   <li>
                  <h3>
                      <strong>December 24th, 2024</strong> - More Force Packs!
                    </h3>
                    <h4>Author - Spork</h4>
                      <p>Patch Notes:</p>
                      <p>FleetFootMike and Shadoblade have been working to add several force packs to the Alpha Strike roster, as well as rework the way that system is architected. Enjoy!.</p>

                   </li>                
                  <li>
                  <h3>
                      <strong>December 16th, 2024</strong> - Tukayyid Formation Bonuses
                    </h3>
                    <h4>Author - Spork</h4>
                      <p>Patch Notes:</p>
                      <p>We've added the 3 formation bonuses from the Tukayyid campaign book: Phalanx Star, Rogue Star and Strategic Command Star. I'm convinced the last one only exists because of Phellan's Star Composition in the third Blood of Kerensky Book. We've also fixed a couple of bugs. Formation Bonuses will show up properly when you add a Force Pack to your force. Additionally, the Command Lance will show up along with all of the other formations for an empty lance.</p>

                   </li>                
                  <li> 
                  <h3>
                      <strong>December 13th, 2024</strong> - Faction Filtering
                    </h3>
                    <h4>Author - Spork</h4>
                      <p>We've added Faction Filters to the Alpha Strike Roster. It works identically to the <a href="http://masterunitlist.info" target="_blank" rel="noopener noreferrer">MUL</a> faction search on the unit page. The search will pull up a mech if it's available for ANY of the factions you pick, not ALL of them.</p>

                   </li>                
                  <li>
                  <h3>
                      <strong>December 12th, 2024</strong> - New Fork
                    </h3>
                    <h4>Author - Spork</h4>
                  <p>This is a development fork of <a href="https://jdgwf.github.io/battletech-tools/" target="_blank" rel="noopener noreferrer">Jeff's Battletech Tools</a>. The goal is to keep the project running and updated after Jeff's untimely passing, while leaving the original site as it was. The original code base can be found on <a href="https://github.com/jdgwf/battletech-tools">GitHub</a>.</p>

                    <p>This first push will have Formation Bonuses from the Davion Force Manual, as well as an Updated ReadMe as a test of the deployment systems.</p>
                    <p><strong>Patch Notes</strong></p>
                    <p>- Added Davion Force Manual Formations to AS Builder</p>
                    <p>- Updated ReadMes</p>
                    <p>- Removed extraneous console warnings</p>
                    <p>- Disabled custom analytics</p>
                    <p>- Made Special Pilot Ability rules more clear on pilot edit page</p>
                    <p>- Fixed bug where SPAs were being added to force PV totals.</p>
                    <p>- Fixed bug where first picked SPA description was showing for second and third SPAs</p>
                    <p>- All of a pilot's SPAs now show when printing your force.</p>

                  </li>
                  </ul>
                  </div>
              </TextSection>
            </div>
          </div>

        </UIPage>
      );
    }
}

interface IHomeProps {
  appGlobals: IAppGlobals;
}

interface IHomeState {
    updated: boolean;

}
