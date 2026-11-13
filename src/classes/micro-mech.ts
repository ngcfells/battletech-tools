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
    MICRO_MECH_QUARTER_TON_KG,
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
import {
    IMicroMechItem,
    MicroMechAmmoType,
    findMicroMechItem,
    getMicroMechAmmoShots,
    isMicroMechWeapon,
} from "../data/micro-mech-equipment-custom";

// A Micro-Mech (#173): a fan-made 10 to 19 ton walker with one torso, built in kilograms. Custom Homebrew.
// Construction: "Micro-Mechs" 6.1.0.2 or Solarmech's 2019 post, chosen by `version`; every rule that differs is a
// field of MICRO_MECH_VERSION_RULES. Equipment comes from the 6.1.0.2 table (micro-mech-equipment-custom.ts). Cost,
// Battle Value and play are later chunks of the plan (docs/superpowers/plans/2026-11-13-micro-mechs.md).

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
/** "A maximum of 4 weapons can be mounted on a Micro-Mech" (both texts). */
export const MICRO_MECH_MAX_WEAPONS = 4;
/** "Each critical slot can hold up to 1000kg of ammo" (6.1.0.2); "Ammunition amounts one ton or less are located in single slot" (both). */
const AMMO_KG_PER_SLOT = 1000;
/** A sanity cap on extra heat sinks where the text states no limit (2019). */
const MAX_EXTRA_HEAT_SINKS_UNLIMITED = 99;

export interface IMicroMechAmmoExport {
    type: MicroMechAmmoType;
    kg: number;
    location: MicroMechLocation;
}

export interface IMicroMechMountExport {
    tag: string;
    location: MicroMechLocation;
    /** The weapon's ammunition, one lot per type; each lot sits in one location. */
    ammo?: IMicroMechAmmoExport[];
}

export interface IMicroMechMount extends IMicroMechMountExport {
    item: IMicroMechItem;
    ammo: IMicroMechAmmoExport[];
}

export interface IMicroMechAmmoLot extends IMicroMechAmmoExport {
    mountIndex: number;
    tag: string;
    name: string;
    shots: number;
    /** Slots this lot fills by itself (lots that share a slot are counted in getSlots). */
    slots: number;
}

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
    /** Equipment, in the order it was added; absent in a Chunk A save. */
    mounts?: IMicroMechMountExport[];
    /** Heat sinks beyond the engine's free ones; absent means none. */
    extraHeatSinks?: number;
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
    private _mounts: { tag: string; location: MicroMechLocation; ammo: IMicroMechAmmoExport[] }[] = [];
    private _extraHeatSinks: number = 0;
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
            for (const mount of this._mounts) {
                if (mount.location === from) mount.location = to;
                for (const lot of mount.ammo) if (lot.location === from) lot.location = to;
            }
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

    // Heat sinks and power amplifiers --------------------------------------------------------------------------------

    public getExtraHeatSinks(): number { return this._extraHeatSinks; }
    /** "A maximum of ten single heat sinks can be added on the engine" (6.1.0.2); the 2019 post states no limit. */
    public getMaxExtraHeatSinks(): number { return this.getRules().maxExtraHeatSinks ?? MAX_EXTRA_HEAT_SINKS_UNLIMITED; }
    public setExtraHeatSinks(count: number): void { this._extraHeatSinks = clampInt(count, 0, this.getMaxExtraHeatSinks(), 0); }
    /** Heat sinks "are mounted on the engine and do not take up location slots". */
    public getHeatSinks(): number { return this.getFreeHeatSinks() + this._extraHeatSinks; }
    public getHeatSinkWeight(): number { return this._extraHeatSinks * this.getRules().heatSinkKg; }
    /** "enough heat sinks to dissipate all the heat generated by firing all its energy weapons in the same turn". */
    public getEnergyHeat(): number {
        return this.getMounts().filter((mount) => mount.item.kind === "energy").reduce((sum, mount) => sum + mount.item.heat, 0);
    }
    public getEnergyWeaponWeight(): number {
        return this.getMounts().filter((mount) => mount.item.kind === "energy").reduce((sum, mount) => sum + mount.item.weightKg, 0);
    }
    /**
     * An ICE's power amplifiers. 6.1.0.2: "1 ton per 10 tons of energy weapons or fraction there of". 2019: "10% of the
     * tonnage of the energy weapons rounded up to the nearest .25 ton". A fusion engine needs none.
     */
    public getPowerAmplifierWeight(): number {
        const energy = this.getEnergyWeaponWeight();
        if (this._engineKind !== "ice" || energy <= 0) return 0;
        if (this.getRules().powerAmplifiers === "per-10-tons") return Math.ceil(energy / 10000) * 1000;
        return ceilToQuarterTonKg(energy / 10);
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

    /**
     * The location's slots: the fixed items, the equipment in the order added, the ammunition, then null for each free
     * slot. A location holding more than it has is longer than its slot count (an issue). Jump jets are counted by
     * getJumpJetSlotsFree, not placed.
     */
    public getSlots(location: MicroMechLocation): (string | null)[] {
        if (!this.getLocations().includes(location)) return [];
        const used = this._usedSlots(location);
        return [...used, ...new Array(Math.max(0, MICRO_MECH_SLOTS[location].slots - used.length)).fill(null)];
    }
    private _usedSlots(location: MicroMechLocation): string[] {
        const fixed = [...MICRO_MECH_SLOTS[location].fixed];
        if ((location === "la" && this.hasLowerArm("left")) || (location === "ra" && this.hasLowerArm("right"))) fixed.push(MICRO_MECH_LOWER_ARM);
        const items: string[] = [];
        const ammo = new Map<string, { name: string; kg: number }>();
        for (const mount of this.getMounts()) {
            if (mount.location === location) for (let i = 0; i < mount.item.slots; i++) items.push(mount.item.name);
            for (const lot of mount.ammo) {
                if (lot.location !== location) continue;
                // One slot holds up to 1,000 kg "for the same weapon class" (6.1.0.2), or of one ammunition type (2019).
                const key = this.getRules().ammoSlots === "weapon-class" ? mount.tag : `${mount.tag}|${lot.type}`;
                const group = ammo.get(key) ?? { name: mount.item.name, kg: 0 };
                group.kg += lot.kg;
                ammo.set(key, group);
            }
        }
        for (const group of ammo.values()) for (let i = 0; i < Math.ceil(group.kg / AMMO_KG_PER_SLOT); i++) items.push(`Ammo (${group.name})`);
        return [...fixed, ...items];
    }
    public getFreeSlots(location: MicroMechLocation): number { return this.getSlots(location).filter((slot) => slot === null).length; }
    public getTotalFreeSlots(): number { return this.getLocations().reduce((sum, location) => sum + this.getFreeSlots(location), 0); }
    public getTotalSlots(): number { return this.getLocations().reduce((sum, location) => sum + MICRO_MECH_SLOTS[location].slots, 0); }
    /** Every slot filled, jump jets included. */
    public getTotalUsedSlots(): number {
        return this.getLocations().reduce((sum, location) => sum + (location === "torsoRear" ? 0 : this._usedSlots(location).length), 0) + this._jumpJets;
    }

    // Equipment --------------------------------------------------------------------------------------------------

    public getMounts(): IMicroMechMount[] {
        return this._mounts.flatMap((mount) => {
            const item = findMicroMechItem(mount.tag);
            return item ? [{ tag: mount.tag, location: mount.location, item, ammo: mount.ammo.map((lot) => ({ ...lot })) }] : [];
        });
    }
    public getWeaponCount(): number { return this.getMounts().filter((mount) => isMicroMechWeapon(mount.item)).length; }

    /** Where the version allows this item. 2019: "Weapons cannot be mounted in the legs or the Head". */
    private _allowsItemAt(item: IMicroMechItem, location: MicroMechLocation): boolean {
        if (!this.getLocations().includes(location) || location === "torsoRear") return false;
        if (isMicroMechWeapon(item) && this.getRules().weaponLocations === "not-head-or-legs") return location === "la" || location === "ra" || location === "torso";
        return true;
    }
    /** 2019: "All ammunition must be mounted in the Torso". */
    private _allowsAmmoAt(location: MicroMechLocation): boolean {
        if (!this.getLocations().includes(location) || location === "torsoRear") return false;
        return this.getRules().ammoLocations === "any" || location === "torso";
    }
    private _fits(location: MicroMechLocation): boolean { return this._usedSlots(location).length <= MICRO_MECH_SLOTS[location].slots; }

    /**
     * Mounts a table item in one location. Refused: an unknown tag (the banned items have no row), a location the
     * version does not allow, or too few free slots there ("A Micro-Mech cannot spit weapons over multiple locations").
     * A fifth weapon is mounted and reported as an issue.
     */
    public addMount(tag: string, location: MicroMechLocation): boolean {
        const item = findMicroMechItem(tag);
        if (!item || !this._allowsItemAt(item, location)) return false;
        if (this.getFreeSlots(location) < item.slots) return false;
        this._mounts.push({ tag, location, ammo: [] });
        return true;
    }
    /** Removes the mount and its ammunition. */
    public removeMount(index: number): boolean {
        if (!Number.isInteger(index) || index < 0 || index >= this._mounts.length) return false;
        this._mounts.splice(index, 1);
        return true;
    }

    /**
     * Sets a weapon's ammunition of one type: "quarter ton, half ton, three-quarter ton or full ton lots", so a
     * multiple of 250 kg (0 removes it). The location defaults to the lot's own, else the torso where the version
     * keeps ammunition there, else the weapon's. Refused where there is no such ammunition, the location is not
     * allowed, or it has no free slot for it.
     */
    public setAmmo(mountIndex: number, kg: number, location?: MicroMechLocation, type: MicroMechAmmoType = "standard"): boolean {
        const mount = this._mounts[mountIndex];
        const item = mount ? findMicroMechItem(mount.tag) : undefined;
        if (!mount || !item?.ammo?.some((ammo) => ammo.type === type)) return false;
        if (!Number.isInteger(kg) || kg < 0 || kg % MICRO_MECH_QUARTER_TON_KG !== 0) return false;
        const before = mount.ammo.map((lot) => ({ ...lot }));
        const existing = mount.ammo.find((lot) => lot.type === type);
        mount.ammo = mount.ammo.filter((lot) => lot.type !== type);
        if (kg === 0) return true;
        const where = location ?? existing?.location ?? (this.getRules().ammoLocations === "torso" ? "torso" : mount.location);
        if (!this._allowsAmmoAt(where)) {
            mount.ammo = before;
            return false;
        }
        mount.ammo.push({ type, kg, location: where });
        mount.ammo.sort((a, b) => (item.ammo ?? []).findIndex((ammo) => ammo.type === a.type) - (item.ammo ?? []).findIndex((ammo) => ammo.type === b.type));
        if (!this._fits(where)) {
            mount.ammo = before;
            return false;
        }
        return true;
    }
    public getAmmoLots(): IMicroMechAmmoLot[] {
        const rule = this.getRules().ammoShots;
        return this.getMounts().flatMap((mount, mountIndex) => mount.ammo.map((lot) => {
            const ammo = mount.item.ammo?.find((each) => each.type === lot.type);
            return {
                ...lot,
                mountIndex,
                tag: mount.tag,
                name: mount.item.name,
                shots: ammo ? getMicroMechAmmoShots(ammo, lot.kg, rule) : 0,
                slots: Math.ceil(lot.kg / AMMO_KG_PER_SLOT),
            };
        }));
    }
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
        if (this._extraHeatSinks > 0) lines.push({ name: `Heat sinks (${this._extraHeatSinks} extra)`, kg: this.getHeatSinkWeight() });
        if (this.getPowerAmplifierWeight() > 0) lines.push({ name: "Power amplifiers", kg: this.getPowerAmplifierWeight() });
        for (const mount of this.getMounts()) lines.push({ name: `${mount.item.name} (${this.getLocationName(mount.location)})`, kg: mount.item.weightKg });
        for (const lot of this.getAmmoLots()) {
            const type = lot.type === "cluster" ? ", cluster" : "";
            lines.push({ name: `Ammo (${lot.name}${type}), ${lot.shots} shots (${this.getLocationName(lot.location)})`, kg: lot.kg });
        }
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
        for (const location of this.getLocations()) {
            if (location === "torsoRear" || this._fits(location)) continue;
            issues.push(`${this.getLocationName(location)} holds ${this._usedSlots(location).length} slots of items in ${MICRO_MECH_SLOTS[location].slots} slots.`);
        }
        const weapons = this.getWeaponCount();
        if (weapons > MICRO_MECH_MAX_WEAPONS) issues.push(`${weapons} weapons are mounted; a Micro-Mech mounts at most ${MICRO_MECH_MAX_WEAPONS}.`);
        for (const mount of this.getMounts()) {
            const at = `${mount.item.name} (${this.getLocationName(mount.location)})`;
            if (!this._allowsItemAt(mount.item, mount.location)) issues.push(`${mount.item.name} is in the ${this.getLocationName(mount.location)}; ${rules.name} allows no weapon in the head or legs.`);
            if (mount.item.ammo && mount.ammo.length === 0) issues.push(`${at} carries no ammunition: at least 250 kg is needed.`);
            for (const lot of mount.ammo) {
                if (!this._allowsAmmoAt(lot.location)) issues.push(`${mount.item.name} ammunition is in the ${this.getLocationName(lot.location)}; ${rules.name} allows ammunition only in the torso.`);
            }
        }
        if (this._extraHeatSinks > this.getMaxExtraHeatSinks()) issues.push(`${this._extraHeatSinks} extra heat sinks exceed the ${this.getMaxExtraHeatSinks()} the engine may carry.`);
        const heat = this.getEnergyHeat();
        if (heat > this.getHeatSinks()) issues.push(`The energy weapons make ${heat} heat; the heat sinks dissipate ${this.getHeatSinks()}.`);
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
        if (this.getMounts().some((mount) => mount.ammo.length > 0)) {
            notes.push(rules.ammoSlots === "weapon-class"
                ? "One slot holds up to 1,000 kg of ammunition for one weapon, of any type: the document's LB-5X example, followed where its LB-2X example says each type takes its own slot."
                : "Each ammunition type takes its own slot, up to 1,000 kg.");
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
            mounts: this._mounts.map((mount) => ({ tag: mount.tag, location: mount.location, ...(mount.ammo.length ? { ammo: mount.ammo.map((lot) => ({ ...lot })) } : {}) })),
            ...(this._extraHeatSinks > 0 ? { extraHeatSinks: this._extraHeatSinks } : {}),
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
        this._importMounts(data, issues);
        this._era = this.getAvailableEras().find((era) => era.tag === data.era) ?? this._era;
        const saved = typeof data.lastUpdated === "string" ? new Date(data.lastUpdated) : new Date();
        this.lastUpdated = Number.isNaN(saved.getTime()) ? new Date() : saved;
        this._importIssues = issues;
        return true;
    }

    /** Mounts and heat sinks from a save. Rules issues (a fifth weapon, a version's location) stay for getIssues. */
    private _importMounts(data: IMicroMechExport, issues: string[]): void {
        this._mounts = [];
        const saved = Array.isArray(data.mounts) ? data.mounts : [];
        const layoutName = this._layout === "quad" ? "a quad" : "a biped";
        for (const raw of saved) {
            const tag = typeof raw?.tag === "string" ? raw.tag : "";
            const item = findMicroMechItem(tag);
            if (!item) {
                issues.push(`Unknown item "${tag.slice(0, 40)}": dropped.`);
                continue;
            }
            if (!this.getLocations().includes(raw.location) || raw.location === "torsoRear") {
                const name = ALL_LOCATIONS.includes(raw.location) ? MICRO_MECH_LOCATION_NAMES[this._layout][raw.location] : `"${String(raw.location).slice(0, 40)}"`;
                issues.push(`${item.name}: no ${name} on ${layoutName}: dropped.`);
                continue;
            }
            const ammo: IMicroMechAmmoExport[] = [];
            for (const lot of Array.isArray(raw.ammo) ? raw.ammo : []) {
                if (!item.ammo?.some((each) => each.type === lot?.type) || ammo.some((each) => each.type === lot.type)) {
                    issues.push(`${item.name} has no ${String(lot?.type).slice(0, 20)} ammunition: dropped.`);
                    continue;
                }
                if (!this.getLocations().includes(lot.location) || lot.location === "torsoRear") {
                    issues.push(`${item.name} ammunition: no such location on ${layoutName}: dropped.`);
                    continue;
                }
                const kg = clampInt(Math.round(Number(lot.kg) / MICRO_MECH_QUARTER_TON_KG) * MICRO_MECH_QUARTER_TON_KG, MICRO_MECH_QUARTER_TON_KG, 20000, MICRO_MECH_QUARTER_TON_KG);
                if (kg !== lot.kg) issues.push(`${item.name} ammunition ${String(lot.kg)} kg is not a 250 kg lot: set to ${kg} kg.`);
                ammo.push({ type: lot.type, kg, location: lot.location });
            }
            this._mounts.push({ tag, location: raw.location, ammo });
        }
        const extra = clampInt(data.extraHeatSinks ?? 0, 0, MAX_EXTRA_HEAT_SINKS_UNLIMITED, 0);
        if (extra !== (data.extraHeatSinks ?? 0)) issues.push(`Extra heat sinks ${String(data.extraHeatSinks)} are out of range: set to ${extra}.`);
        this._extraHeatSinks = extra;
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
