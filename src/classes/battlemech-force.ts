import { generateUUID } from "../utils/generateUUID";
import { getCarrierInstalledUuids, getQuirkInitiative, IQuirkCarrier, IQuirkInitiative, normalizeGameYear } from "../utils/quirk-effects";
import { BattleMech } from "./battlemech";
import { BattleMechGroup, ICBTGroupExport } from "./battlemech-group";
import { ISpaceTrackerExport, SpaceTracker } from "./space-tracker";

/** Most groups read from one saved force. */
export const MAX_FORCE_GROUPS = 200;

export interface ICBTForceExport {
    groups: ICBTGroupExport[];
	uuid: string;
	lastUpdated: Date;

    heatApplied: boolean;
    turn: number;
    phase: number;
    hideHelp: boolean;

    /** "Space forces in this game": the space turn tracker (design 2026-10-22). Missing in older saves. */
    spaceInPlay?: boolean;
    /** Saved whenever it tracks anything, so turning the option off and on again keeps the shots in flight. */
    spaceTracker?: ISpaceTrackerExport;
    /** "Use design quirks": quirk effects apply in Play Mode. Missing in older saves. */
    quirksInPlay?: boolean;
    /** "Game year": the year play checks quirks' years against. Missing in older saves. */
    gameYear?: number | null;
}

export class BattleMechForce {

	// public members: BattleMechGroup[] = [];

	public groupLabel: string = "Lance";

	private _uuid: string = generateUUID();
	private _lastUpdated: Date = new Date();

	public customName : string= "";

    public groups: BattleMechGroup[] = [];

    public turn: number = 1;
    public phase: number = 0;

    public hideHelp: boolean = false;

    public heatApplied: boolean = false;

    public spaceInPlay: boolean = false;
    public spaceTracker: SpaceTracker = new SpaceTracker();

    public quirksInPlay: boolean = false;
    /** "Game year": play checks quirks' years against it; null for the start of each unit's era. */
    public gameYear: number | null = null;

    constructor(importObj: ICBTForceExport | null = null ) {
        if( importObj ) {
            this.import(importObj);
        }

        if( this.groups.length === 0 ) {
            this.groups.push( new BattleMechGroup() )
        }
    }

    setSelectedMech(
        uuid: string
    ) {
        for( let group of this.groups ) {
            for( let unit of group.members ) {
                if( unit.uuid === uuid ) {
                    unit.selectedMech = true;
                } else {
                    unit.selectedMech = false;
                }
            }
        }
    }

    getSelectedMech(): BattleMech | null {
        for( let group of this.groups ) {
            for( let unit of group.members ) {
                if( unit.selectedMech ) {
                    return unit;
                }
            }
        }
        return null;
    }

    public removeGroup(asGroupIndex: number) {
        if( this.groups.length > asGroupIndex && this.groups[asGroupIndex]) {
            this.groups.splice( asGroupIndex, 1);
        }
    }

    public renameGroup( newName: string, groupIndex: number ) {
        if( this.groups.length > groupIndex && this.groups[groupIndex]) {
            this.groups[groupIndex].customName = newName;
        }
    }

    public selectGroupLabel( newName: string, groupIndex: number ) {
        if( this.groups.length > groupIndex && this.groups[groupIndex]) {
            this.groups[groupIndex].groupLabel = newName;
        }
    }

    public export(
        noInPlayVariabless: boolean = false,
    ): ICBTForceExport {
        let returnValue: ICBTForceExport = {
            groups: [],
            uuid: this._uuid,
            lastUpdated: new Date(),
            turn: this.turn,
            phase: this.phase,
            hideHelp: this.hideHelp,
            heatApplied: this.heatApplied,
            spaceInPlay: this.spaceInPlay,
            quirksInPlay: this.quirksInPlay,
            gameYear: this.gameYear,
        }
        if( this.spaceTracker.hasState() ) {
            returnValue.spaceTracker = this.spaceTracker.export();
        }

        for( let group of this.groups) {
            returnValue.groups.push( group.export(noInPlayVariabless) );
        }

        return returnValue;
    }

    getUnitViaUUID(
        uuid: string
    ): BattleMech | null {
        for( let group of this.groups ) {
            for( let unit of group.members ) {
                if( unit.uuid === uuid )
                    return unit;
            }
        }
        return null;
    }

    updateUnitViaUUID(
        nv: BattleMech
    ): boolean {
        for( let groupIndex in this.groups ) {
            for( let unitIndex in this.groups[groupIndex].members ) {
                if( this.groups[groupIndex].members[unitIndex].uuid === nv.uuid ) {
                    this.groups[groupIndex].members[unitIndex] = nv;
                    return true;
                }
            }
        }
        return false;
    }

    public getPhaseName(
        num: number
    ): string {
        if( num === 0 ) {
            return "Initiative Phase"
        } else if( num === 1 ) {
            return "Movement Phase"
        } else if( num === 2 ) {
            return "Weapon Attack Phase"
        } else if( num === 3 ) {
            return "Physical Attack Phase"
        } else if( num === 4 ) {
            return "Heat Phase"
        } else if( num === 5 ) {
            return "End Phase"
        }

        return "???"
    }

    public import(importObj: ICBTForceExport) {
        // Forces come back from saves and other people's backups: read a bounded list of groups.
        const groups = Array.isArray(importObj.groups) ? importObj.groups.slice(0, MAX_FORCE_GROUPS) : [];
        for( let group of groups ) {
            this.groups.push( new BattleMechGroup( group) );
        }
        if( importObj.uuid ) {
            this._uuid = importObj.uuid;
        }

        if( typeof(importObj.turn) !== "undefined" ) {
            this.turn = importObj.turn;
        }
        if( typeof(importObj.phase) !== "undefined" ) {
            this.phase = importObj.phase;
        }

        if( typeof(importObj.hideHelp) !== "undefined" ) {
            this.hideHelp = importObj.hideHelp;
        }

        if( typeof(importObj.heatApplied) !== "undefined" ) {
            this.heatApplied = importObj.heatApplied;
        }

        this.spaceInPlay = importObj.spaceInPlay === true;
        this.quirksInPlay = !!importObj.quirksInPlay;
        this.gameYear = normalizeGameYear(importObj.gameYear);
        this.syncQuirkPlayYear();
        this.spaceTracker = new SpaceTracker( importObj.spaceTracker );

        if( importObj.lastUpdated ) {
            this._lastUpdated = new Date(importObj.lastUpdated);
        }

    }

    public setGameYear(year: number): void {
        this.gameYear = normalizeGameYear(year);
        this.syncQuirkPlayYear();
    }

    /** Hands the game year to every unit, which checks its quirks' years against it in play. */
    public syncQuirkPlayYear(): void {
        for( const group of this.groups ) {
            const units: IQuirkCarrier[] = [...group.members, ...group.vehicles, ...group.fighters, ...group.smallCraft, ...group.capitalShips, ...group.battleArmor];
            for( const unit of units ) {
                unit.quirkPlayYear = this.gameYear;
            }
        }
    }

    /**
     * The side's Initiative quirk: the largest of its units still in the game, never the sum (CO p.225). Null when
     * none has one. Read only with the game's "Use design quirks" switch on.
     */
    public getInitiativeModifier(): IQuirkInitiative | null {
        let best: IQuirkInitiative | null = null;
        for( const group of this.groups ) {
            const units: IQuirkCarrier[] = [...group.members, ...group.vehicles, ...group.fighters, ...group.smallCraft, ...group.capitalShips, ...group.battleArmor];
            for( const unit of units ) {
                if( unit.isDestroyed() ) continue;
                const initiative = getQuirkInitiative(unit.quirks, getCarrierInstalledUuids(unit), this.gameYear ?? unit.getEra().yearStart);
                if( initiative && (!best || initiative.modifier > best.modifier) ) best = initiative;
            }
        }
        return best;
    }

    public applyHeat() {
        this.heatApplied = true;
        for( let group of this.groups ) {
            for( let unit of group.members ) {
                unit.applyHeat(this.quirksInPlay);
            }
        }
    }

    public getTotalUnits(): number {
        let returnValue: number = 0;

        for( let group of this.groups ) {
            returnValue += group.getTotalUnits();
        }

        return returnValue;
    }

    public getTotalBV2(): number {
        let returnValue: number = 0;

        for( let group of this.groups ) {
            returnValue += group.getTotaBV2();
        }

        return returnValue;
    }

    getTech(): string {
        let rv = "";

        for( let group of this.groups ) {
            let tech = group.getTech();
            if( rv !== tech && rv !== "" ) {
                rv = "Mixed";
            }  else {
                if( rv !== "Mixed")
                    rv = tech;
            }
        }

        return rv;
    }

    getTotalTons(): number {
        let returnValue: number = 0;

        for( let group of this.groups ) {
            returnValue += group.getTotalTons();
        }

        return returnValue;
    }

    public newGroup() {
        this.groups.push( new BattleMechGroup() );
    }

    public getTotalGroups(): number {
        return this.groups.length;
    }

    public getTotaBV2(): number {
        let rv = 0;

        for( let group of this.groups ) {
            rv += group.getTotaBV2();
        }

        return rv;
    }
}