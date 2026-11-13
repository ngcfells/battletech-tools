import { generateUUID } from "../utils/generateUUID";
import { IGameSettingsUnit, UnitGameSettings } from "./unit-game-settings";
import { TechnicalReadout } from "./technical-readout";
import type { ITechnicalReadoutExport } from "../data/technical-readout-interfaces";
import { DEFAULT_RULES_EDITION, getSelectableRulesEditionTag } from "../data/rules-editions";
import { IEras } from "../data/data-interfaces";
import { btEraOptions, findEraByTag } from "../data/era-options";
import { getUnitTypeEras } from "../data/game-settings";
import { CUSTOM_HOMEBREW_RULES_LEVEL } from "../data/rules-level-options";
import { mechEngineOptions } from "../data/mech-engine-options";
import {
    IMicroMechVersionRules,
    MICRO_MECH_ARMOR_KG_PER_POINT,
    MICRO_MECH_BORROWED_NOTE,
    MICRO_MECH_COCKPIT_KG,
    MICRO_MECH_CREDIT,
    MICRO_MECH_DEFAULT_VERSION,
    MICRO_MECH_LOCATIONS,
    MICRO_MECH_LOCATION_NAMES,
    MICRO_MECH_LOWER_ARM,
    MICRO_MECH_MAX_TONS,
    MICRO_MECH_MIN_TONS,
    MICRO_MECH_SLOTS,
    MICRO_MECH_VERSION_RULES,
    MicroMechArmorType,
    MicroMechEngineKind,
    MicroMechLayout,
    MicroMechLocation,
    MicroMechVersion,
    ceilToQuarterTonKg,
    getMicroMechStructureRow,
    isMicroMechVersion,
} from "../data/micro-mech-construction";

// A Micro-Mech (#173): a fan-made 10 to 19 ton walker with one torso, built in kilograms. Custom Homebrew.
// Construction: "Micro-Mechs" 6.1.0.2 or Solarmech's 2019 post, chosen by `version`; every rule that differs is a
// field of MICRO_MECH_VERSION_RULES. Equipment, cost, Battle Value and play are later chunks of the plan
// (docs/superpowers/plans/2026-11-13-micro-mechs.md).

export const MAX_MICRO_MECH_NAME_LENGTH = 120;
/** The highest rating in the standard engine table (TechManual p.49, as mech-engine-options.ts holds it). */
const MAX_ENGINE_RATING = 400;
const ALL_LOCATIONS: MicroMechLocation[] = ["head", "torso", "torsoRear", "la", "ra", "ll", "rl", "fll", "frl"];
const LAYOUTS: MicroMechLayout[] = ["biped", "quad"];
const ENGINE_KINDS: MicroMechEngineKind[] = ["fusion", "ice"];
/** The armor types the builder offers; the 2019 text also allows industrial armor (not built yet). */
const BUILT_ARMOR_TYPES: MicroMechArmorType[] = ["standard"];
/** A quad's front legs take the place of a biped's arms, for armor carried across a layout change. */
const QUAD_FOR_BIPED: Partial<Record<MicroMechLocation, MicroMechLocation>> = { la: "fll", ra: "frl" };

export type MicroMechSide = "left" | "right";

export interface IMicroMechExport {
    /** The save format. */
    format: 1;
    /** The rules text the design is built under; absent means 6.1.0.2. */
    version?: MicroMechVersion;
    rulesEdition?: string;
    rulesLevel?: number;
    rulesets?: string[];
    uuid: string;
    tro?: ITechnicalReadoutExport;
    name: string;
    tons: number;
    layout: MicroMechLayout;
    walkMP: number;
    engineKind: MicroMechEngineKind;
    jumpJets: number;
    sealed?: boolean;
    /** Lower Arm Actuator Groups fitted (a biped's); absent means both. */
    lowerArms?: { left: boolean; right: boolean };
    armor: Partial<Record<MicroMechLocation, number>>;
    era: string;
    lastUpdated?: string;
}

export interface IMicroMechWeightLine {
    name: string;
    kg: number;
}

const clampInt = (value: unknown, min: number, max: number, fallback: number): number => {
    const n = Math.round(Number(value));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const formatKg = (kg: number): string => `${kg.toLocaleString("en-US")} kg`;

/** Reads a saved Micro-Mech; null when the data is not one. Each value clamped on the way in gives an issue. */
export const normalizeMicroMechExport = (raw: unknown): { micro: IMicroMechExport | null; issues: string[] } => {
    const notOne = { micro: null, issues: ["Not a Micro-Mech record."] };
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return notOne;
    const data = raw as Partial<IMicroMechExport>;
    if (typeof data.tons !== "number" || typeof data.layout !== "string" || !data.armor || typeof data.armor !== "object") return notOne;
    const micro = new MicroMech();
    if (!micro.import(data as IMicroMechExport)) return notOne;
    return { micro: micro.export(), issues: micro.getImportIssues() };
};

export default class MicroMech implements IGameSettingsUnit {
    public lastUpdated: Date = new Date();

    private _uuid: string = generateUUID();
    public tro: TechnicalReadout = new TechnicalReadout();
    private _name: string = "";
    private _version: MicroMechVersion = MICRO_MECH_DEFAULT_VERSION;
    private _rulesEdition: string = DEFAULT_RULES_EDITION;
    /** The rules level and Special Rulesets the design is built under (#324). */
    public readonly gameSettings = new UnitGameSettings();
    private _tons: number = MICRO_MECH_MIN_TONS;
    private _layout: MicroMechLayout = "biped";
    private _walkMP: number = 4;
    private _engineKind: MicroMechEngineKind = "fusion";
    private _jumpJets: number = 0;
    private _sealed: boolean = false;
    private _lowerArms: Record<MicroMechSide, boolean> = { left: true, right: true };
    private _armor: Record<MicroMechLocation, number> = { head: 0, torso: 0, torsoRear: 0, la: 0, ra: 0, ll: 0, rl: 0, fll: 0, frl: 0 };
    private _era: IEras = findEraByTag("jihad") ?? btEraOptions[btEraOptions.length - 1];
    private _importIssues: string[] = [];

    constructor(json: string = "") {
        if (json) this.importJSON(json);
    }

    // Identity ---------------------------------------------------------------------------------------------------

    public getUUID(): string { return this._uuid; }
    public newUUID(): void { this._uuid = generateUUID(); }
    public getName(): string { return this._name; }
    public setName(name: string): void { this._name = String(name ?? "").slice(0, MAX_MICRO_MECH_NAME_LENGTH); }
    public getDisplayName(): string { return this._name.trim() || `${this._tons}-ton Micro-Mech`; }
    public getImportIssues(): string[] { return [...this._importIssues]; }

    /** A Micro-Mech follows the BattleMech rules except where noted, so it offers the 'Mech editions. */
    public getRulesEdition(): string { return this._rulesEdition; }
    public setRulesEdition(editionTag: string): string {
        this._rulesEdition = getSelectableRulesEditionTag(editionTag, "mech");
        return this._rulesEdition;
    }
    /** Inner Sphere: 6.1.0.2 uses the Inner Sphere table; the 2019 post allows "any tech base but Clan". */
    public getTechTag(): string { return this.getRules().techBase; }
    public setTechTag(_tag: string): void { /* Inner Sphere only */ }
    public chooseEra(tag: string): void { this.setEra(tag); }
    /** No date limit on the chassis (owner ruling 7): every Inner Sphere 'Mech era. */
    public getEra(): IEras { return this._era; }
    public getAvailableEras(): IEras[] { return getUnitTypeEras("mech", this.getTechTag()); }
    public setEra(tag: string): boolean {
        const era = this.getAvailableEras().find((item) => item.tag === tag);
        if (era) this._era = era;
        return !!era;
    }

    // Version ----------------------------------------------------------------------------------------------------

    public getVersion(): MicroMechVersion { return this._version; }
    public getRules(): IMicroMechVersionRules { return MICRO_MECH_VERSION_RULES[this._version]; }
    /** Changes the rules text. Nothing is removed or re-set: the design is re-checked and what is no longer legal is returned. */
    public setVersion(version: MicroMechVersion): string[] {
        if (isMicroMechVersion(version)) this._version = version;
        return this.getIssues();
    }

    // Chassis ----------------------------------------------------------------------------------------------------

    public getTons(): number { return this._tons; }
    public setTons(tons: number): boolean {
        if (!Number.isInteger(tons) || tons < MICRO_MECH_MIN_TONS || tons > MICRO_MECH_MAX_TONS) return false;
        this._tons = tons;
        this._walkMP = Math.min(this._walkMP, this.getMaxWalkMP());
        this._clampArmor();
        return true;
    }

    public getLayout(): MicroMechLayout { return this._layout; }
    public getLayoutOptions(): MicroMechLayout[] { return [...this.getRules().layouts]; }
    public isQuad(): boolean { return this._layout === "quad"; }
    /** A layout the version does not allow is refused. Arm armor moves to the front legs and back. */
    public setLayout(layout: MicroMechLayout): boolean {
        if (!this.getRules().layouts.includes(layout)) return false;
        if (layout === this._layout) return true;
        for (const [arm, frontLeg] of Object.entries(QUAD_FOR_BIPED) as [MicroMechLocation, MicroMechLocation][]) {
            const from = layout === "quad" ? arm : frontLeg;
            const to = layout === "quad" ? frontLeg : arm;
            this._armor[to] = this._armor[from];
            this._armor[from] = 0;
        }
        this._layout = layout;
        this._clampArmor();
        return true;
    }
    public getLocations(): MicroMechLocation[] { return [...MICRO_MECH_LOCATIONS[this._layout]]; }
    public getLocationName(location: MicroMechLocation): string { return MICRO_MECH_LOCATION_NAMES[this._layout][location]; }

    // Movement and engine -----------------------------------------------------------------------------------------

    public getWalkMP(): number { return this._walkMP; }
    public getMaxWalkMP(): number { return Math.floor(MAX_ENGINE_RATING / this._tons); }
    public setWalkMP(walk: number): boolean {
        if (!Number.isInteger(walk) || walk < 1 || walk > this.getMaxWalkMP()) return false;
        this._walkMP = walk;
        return true;
    }
    /** "The running MP of a Micro-Mechs is determined the same as for Battlemechs": Walking MP x 1.5, rounded up. */
    public getRunMP(): number { return Math.ceil(this._walkMP * 1.5); }

    /** Tonnage x Walking MP. */
    public getEngineRating(): number { return this._tons * this._walkMP; }
    /** "use the next highest rated engine on the table". */
    public getInstalledEngineRating(): number { return this._engineOption().rating; }
    private _engineOption() {
        const rating = this.getEngineRating();
        return mechEngineOptions.find((item) => item.rating >= rating) ?? mechEngineOptions[mechEngineOptions.length - 1];
    }

    public getEngineKind(): MicroMechEngineKind { return this._engineKind; }
    public getEngineKindOptions(): MicroMechEngineKind[] { return ENGINE_KINDS.filter((kind) => this.getRules().engineKinds.includes(kind)); }
    public setEngineKind(kind: MicroMechEngineKind): boolean {
        if (!this.getEngineKindOptions().includes(kind)) return false;
        this._engineKind = kind;
        return true;
    }

    /** The fusion engine's table weight times the version's shielding, rounded up to the quarter ton. */
    public getFusionEngineWeight(): number {
        return ceilToQuarterTonKg(Math.round(this._engineOption().weight.standard * 1000 * this.getRules().fusionShielding));
    }
    public getEngineWeight(): number {
        if (this._engineKind === "fusion") return this.getFusionEngineWeight();
        // 6.1.0.2: "2x the weight of a fusion engine of the same rating". The 2019 post states no ICE weight; it falls
        // back on the BattleMech ICE weight (2 x standard fusion, the table's ICE column), with no shielding.
        if (this.getRules().iceWeight === "twice-fusion") return this.getFusionEngineWeight() * 2;
        return ceilToQuarterTonKg(Math.round(this._engineOption().weight.ice * 1000));
    }

    /** Rating / 100, rounded up to the quarter ton (both texts). */
    public getGyroWeight(): number { return ceilToQuarterTonKg(this.getInstalledEngineRating() * 10); }
    public getCockpitWeight(): number { return MICRO_MECH_COCKPIT_KG; }
    public getStructureWeight(): number { return this.getRules().structureKg(this._tons); }

    public isSealed(): boolean { return this._sealed; }
    public setSealed(sealed: boolean): void { this._sealed = !!sealed; }
    /** "use the same weight as the internal structure". */
    public getSealingWeight(): number { return this._sealed ? this.getStructureWeight() : 0; }

    /** An ICE has no free heat sinks (both texts). */
    public getFreeHeatSinks(): number {
        return this._engineKind === "fusion" ? this.getRules().freeHeatSinks(this.getInstalledEngineRating()) : 0;
    }

    // Jump jets ----------------------------------------------------------------------------------------------------

    public getJumpJets(): number { return this._jumpJets; }
    /** One jet is one Jump MP; as for a BattleMech, at most Walking MP. */
    public setJumpJets(jets: number): void { this._jumpJets = clampInt(jets, 0, this._walkMP, 0); }
    public getJumpMP(): number { return this._jumpJets; }
    public getJumpJetWeight(): number { return this._jumpJets * this.getRules().jumpJetKg; }

    // Structure and armor -----------------------------------------------------------------------------------------

    /** Internal structure points. A quad's front legs take leg structure (the quad record sheet); the rear torso has none. */
    public getStructure(location: MicroMechLocation): number {
        if (!this.getLocations().includes(location)) return 0;
        const row = getMicroMechStructureRow(this._tons);
        switch (location) {
            case "head": return row.head;
            case "torso": return row.torso;
            case "torsoRear": return 0;
            case "la": case "ra": return row.arm;
            default: return row.leg;
        }
    }
    public getTotalStructure(): number { return this.getLocations().reduce((sum, location) => sum + this.getStructure(location), 0); }

    /**
     * Armor maximum: twice the location's structure (the 2019 post: three times, for the head). The torso's front and
     * rear share one maximum, twice the torso structure. With no location, the whole design's maximum.
     */
    public getMaxArmor(location?: MicroMechLocation): number {
        if (!location) return this.getLocations().filter((item) => item !== "torsoRear").reduce((sum, item) => sum + this.getMaxArmor(item), 0);
        if (!this.getLocations().includes(location)) return 0;
        if (location === "torsoRear") return this.getMaxArmor("torso");
        return this.getStructure(location) * (location === "head" ? this.getRules().headArmorPerStructure : 2);
    }
    public getArmor(location: MicroMechLocation): number { return this.getLocations().includes(location) ? this._armor[location] : 0; }
    /** Sets a location's armor, capped at its maximum; a torso front and rear over their shared maximum is an issue. */
    public setArmor(location: MicroMechLocation, points: number): void {
        if (!this.getLocations().includes(location)) return;
        this._armor[location] = clampInt(points, 0, this.getMaxArmor(location), 0);
    }
    public getArmorPoints(): number { return this.getLocations().reduce((sum, location) => sum + this._armor[location], 0); }
    public getArmorType(): MicroMechArmorType { return "standard"; }
    public getArmorTypeOptions(): MicroMechArmorType[] { return BUILT_ARMOR_TYPES.filter((type) => this.getRules().armorTypes.includes(type)); }
    /** 62.5 kg a point, in whole kilograms: an odd number of points is an issue, and its half kilogram is counted up. */
    public getArmorWeight(): number { return Math.ceil(this.getArmorPoints() * MICRO_MECH_ARMOR_KG_PER_POINT); }

    /** Lowers armor that a smaller tonnage or a layout change no longer allows. */
    private _clampArmor(): void {
        for (const location of ALL_LOCATIONS) {
            this._armor[location] = this.getLocations().includes(location) ? Math.min(this._armor[location], this.getMaxArmor(location)) : 0;
        }
    }

    // Slots ------------------------------------------------------------------------------------------------------

    public hasLowerArm(side: MicroMechSide): boolean { return !this.isQuad() && this._lowerArms[side]; }
    /** Only the lower arm group may be removed ("Only the lower arm actuator may be removed"); a quad has no arms. */
    public setLowerArm(side: MicroMechSide, fitted: boolean): boolean {
        if (this.isQuad() || (side !== "left" && side !== "right")) return false;
        this._lowerArms[side] = !!fitted;
        return true;
    }

    /** The location's slots: the fixed items, then null for each free slot. Equipment comes in Chunk B. */
    public getSlots(location: MicroMechLocation): (string | null)[] {
        if (!this.getLocations().includes(location)) return [];
        const layout = MICRO_MECH_SLOTS[location];
        const fixed = [...layout.fixed];
        if ((location === "la" && this.hasLowerArm("left")) || (location === "ra" && this.hasLowerArm("right"))) fixed.push(MICRO_MECH_LOWER_ARM);
        return [...fixed, ...new Array(Math.max(0, layout.slots - fixed.length)).fill(null)];
    }
    public getFreeSlots(location: MicroMechLocation): number { return this.getSlots(location).filter((slot) => slot === null).length; }
    public getTotalFreeSlots(): number { return this.getLocations().reduce((sum, location) => sum + this.getFreeSlots(location), 0); }
    /** Jump jets "may be mounted on the legs and torso only", one slot each. */
    public getJumpJetSlotsFree(): number {
        return this.getLocations().filter((location) => location === "torso" || MICRO_MECH_SLOTS[location].fixed.includes("Upper Leg Actuator Group"))
            .reduce((sum, location) => sum + this.getFreeSlots(location), 0);
    }

    // Weight -----------------------------------------------------------------------------------------------------

    public getWeightLog(): IMicroMechWeightLine[] {
        const lines: IMicroMechWeightLine[] = [
            { name: "Internal structure", kg: this.getStructureWeight() },
            { name: `Engine (${this.getInstalledEngineRating()} ${this._engineKind === "fusion" ? "fusion" : "ICE"})`, kg: this.getEngineWeight() },
            { name: "Gyro", kg: this.getGyroWeight() },
            { name: "Cockpit", kg: this.getCockpitWeight() },
            { name: `Armor (${this.getArmorPoints()} points)`, kg: this.getArmorWeight() },
        ];
        if (this._jumpJets > 0) lines.push({ name: `Jump jets (${this._jumpJets})`, kg: this.getJumpJetWeight() });
        if (this._sealed) lines.push({ name: "Environmental sealing", kg: this.getSealingWeight() });
        return lines;
    }
    public getWeight(): number { return this.getWeightLog().reduce((sum, line) => sum + line.kg, 0); }
    public getMaxWeight(): number { return this._tons * 1000; }
    public getRemainingWeight(): number { return this.getMaxWeight() - this.getWeight(); }

    // Rules level, issues, notes -----------------------------------------------------------------------------------

    /** Every Micro-Mech is Custom Homebrew. */
    public getRequiredRulesLevel(): number { return CUSTOM_HOMEBREW_RULES_LEVEL; }

    public getIssues(): string[] {
        const rules = this.getRules();
        const issues: string[] = [];
        if (!rules.layouts.includes(this._layout)) issues.push(`The ${rules.name} allows no ${this._layout === "quad" ? "quad" : this._layout} Micro-Mechs.`);
        if (!rules.engineKinds.includes(this._engineKind)) issues.push(`The ${rules.name} allows no ${this._engineKind} engine.`);
        const over = this.getWeight() - this.getMaxWeight();
        if (over > 0) issues.push(`The design weighs ${formatKg(this.getWeight())}, ${formatKg(over)} over the ${this._tons}-ton limit.`);
        if (this._jumpJets > this._walkMP) issues.push(`${this._jumpJets} jump jets exceed Walking MP ${this._walkMP}.`);
        for (const location of this.getLocations()) {
            if (location === "torsoRear") continue;
            const max = this.getMaxArmor(location);
            if (location !== "torso" && this._armor[location] > max) {
                issues.push(`${this.getLocationName(location)} armor ${this._armor[location]} is over its maximum of ${max}.`);
            }
        }
        const torso = this._armor.torso + this._armor.torsoRear;
        if (torso > this.getMaxArmor("torso")) issues.push(`Torso front and rear armor together (${torso}) exceed twice the torso structure (${this.getMaxArmor("torso")}).`);
        if (this.getArmorPoints() % 2 === 1) issues.push(`An odd number of armor points (${this.getArmorPoints()}) does not come to a whole kilogram (62.5 kg a point).`);
        if (this._jumpJets > this.getJumpJetSlotsFree()) issues.push(`The jump jets need ${this._jumpJets} slots in the torso and legs; ${this.getJumpJetSlotsFree()} are free.`);
        return issues;
    }
    public isLegal(): boolean { return this.getIssues().length === 0; }

    public getNotes(): string[] {
        const rules = this.getRules();
        const notes: string[] = [MICRO_MECH_CREDIT, `Built under ${rules.name}.`];
        if (rules.borrowsTablesFrom) notes.push(MICRO_MECH_BORROWED_NOTE);
        if (this.getArmorPoints() % 4 !== 0) {
            notes.push("The text buys armor by the quarter ton (4 points); the document's own samples use 2-point (125 kg) steps, as this design does.");
        }
        if (this._engineKind === "ice") {
            notes.push("An ICE engine has no free heat sinks and needs power amplifiers for energy weapons.");
            notes.push(`Only a ${rules.vacuumEngines.join(" or ")} Micro-Mech may be sealed for vacuum.`);
        }
        return notes;
    }

    // Save -------------------------------------------------------------------------------------------------------

    public export(): IMicroMechExport {
        const armor: Partial<Record<MicroMechLocation, number>> = {};
        for (const location of this.getLocations()) armor[location] = this._armor[location];
        return {
            format: 1,
            version: this._version,
            ...(this._rulesEdition !== DEFAULT_RULES_EDITION ? { rulesEdition: this._rulesEdition } : {}),
            ...this.gameSettings.export(),
            uuid: this._uuid,
            tro: this.tro.export(),
            name: this._name,
            tons: this._tons,
            layout: this._layout,
            walkMP: this._walkMP,
            engineKind: this._engineKind,
            jumpJets: this._jumpJets,
            ...(this._sealed ? { sealed: true } : {}),
            ...(!this.isQuad() && !(this._lowerArms.left && this._lowerArms.right) ? { lowerArms: { ...this._lowerArms } } : {}),
            armor,
            era: this._era.tag,
            lastUpdated: this.lastUpdated.toISOString(),
        };
    }
    public exportJSON(): string { return JSON.stringify(this.export()); }

    /** Reads a save. Each value out of range is clamped with an issue (getImportIssues); nothing is dropped silently. */
    public import(data: IMicroMechExport): boolean {
        if (!data || typeof data !== "object" || typeof data.tons !== "number") return false;
        const issues: string[] = [];
        this._uuid = typeof data.uuid === "string" && data.uuid ? data.uuid.slice(0, 64) : generateUUID();
        this.tro.import(data.tro);
        this.setName(typeof data.name === "string" ? data.name : "");
        if (data.version === undefined) this._version = MICRO_MECH_DEFAULT_VERSION;
        else if (isMicroMechVersion(data.version)) this._version = data.version;
        else {
            this._version = MICRO_MECH_DEFAULT_VERSION;
            issues.push(`Unknown rules version "${String(data.version).slice(0, 40)}": read as 6.1.0.2.`);
        }
        this._rulesEdition = getSelectableRulesEditionTag(data.rulesEdition, "mech");
        this.gameSettings.import(data);
        // A saved layout is kept even where the version does not allow it: the issue list says so.
        if (LAYOUTS.includes(data.layout)) this._layout = data.layout;
        else {
            this._layout = "biped";
            issues.push(`Unknown layout "${String(data.layout).slice(0, 40)}": read as biped.`);
        }
        const tons = clampInt(data.tons, MICRO_MECH_MIN_TONS, MICRO_MECH_MAX_TONS, MICRO_MECH_MIN_TONS);
        if (tons !== data.tons) issues.push(`Tonnage ${data.tons} is out of range: set to ${tons}.`);
        this._tons = tons;
        const walk = clampInt(data.walkMP, 1, this.getMaxWalkMP(), 1);
        if (walk !== data.walkMP) issues.push(`Walking MP ${String(data.walkMP)} is out of range: set to ${walk}.`);
        this._walkMP = walk;
        if (ENGINE_KINDS.includes(data.engineKind)) this._engineKind = data.engineKind;
        else {
            this._engineKind = "fusion";
            if (data.engineKind !== undefined) issues.push(`Unknown engine "${String(data.engineKind).slice(0, 40)}": read as fusion.`);
        }
        const jets = clampInt(data.jumpJets, 0, this._walkMP, 0);
        if (jets !== (data.jumpJets ?? 0)) issues.push(`Jump jets ${String(data.jumpJets)} are out of range: set to ${jets}.`);
        this._jumpJets = jets;
        this._sealed = data.sealed === true;
        this._lowerArms = {
            left: data.lowerArms?.left !== false,
            right: data.lowerArms?.right !== false,
        };
        this._armor = { head: 0, torso: 0, torsoRear: 0, la: 0, ra: 0, ll: 0, rl: 0, fll: 0, frl: 0 };
        for (const location of this.getLocations()) {
            const saved = data.armor?.[location];
            if (saved === undefined) continue;
            const points = clampInt(saved, 0, this.getMaxArmor(location), 0);
            if (points !== saved) issues.push(`${this.getLocationName(location)} armor ${String(saved)} is out of range: set to ${points}.`);
            this._armor[location] = points;
        }
        this._era = this.getAvailableEras().find((era) => era.tag === data.era) ?? this._era;
        const saved = typeof data.lastUpdated === "string" ? new Date(data.lastUpdated) : new Date();
        this.lastUpdated = Number.isNaN(saved.getTime()) ? new Date() : saved;
        this._importIssues = issues;
        return true;
    }

    public importJSON(json: string): boolean {
        try {
            return this.import(JSON.parse(json));
        } catch {
            this._importIssues = ["The saved Micro-Mech could not be read."];
            return false;
        }
    }
}
