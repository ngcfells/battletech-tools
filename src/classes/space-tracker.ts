import { getSpaceTurn } from "../utils/space-turn";

/*
 * Space turn tracker (design 2026-10-22): the anti-orbital shots in flight, each gun's last space turn fired, and the
 * guns destroyed by firing early. Saved with the force while "Space forces in this game" is on.
 */

/** Far above any real battery: bounds what a saved force can hold. */
export const MAX_TRACKED_GUNS = 200;
export const MAX_SHOTS_IN_FLIGHT = 200;
const MAX_TURN = 10000;

export interface IAntiOrbitalShot {
    id: string;
    /** `${unitUuid}:${weaponUuid}` */
    gunKey: string;
    unitName: string;
    weaponName: string;
    aimedHex: string;
    targetName: string;
    firedGroundTurn: number;
    firedSpaceTurn: number;
}

export interface ISpaceTrackerExport {
    shotsInFlight: IAntiOrbitalShot[];
    /** gunKey to the space turn it last fired in */
    lastFired: Record<string, number>;
    destroyedGuns: string[];
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const savedTurn = (value: unknown): number | null =>
    typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= MAX_TURN ? value : null;

const savedText = (value: unknown, max: number): string => typeof value === "string" ? value.slice(0, max) : "";

const savedShot = (value: unknown): IAntiOrbitalShot | null => {
    if (!isPlainObject(value) || typeof value.id !== "string" || typeof value.gunKey !== "string") return null;
    const firedGroundTurn = savedTurn(value.firedGroundTurn);
    const firedSpaceTurn = savedTurn(value.firedSpaceTurn);
    if (firedGroundTurn === null || firedSpaceTurn === null) return null;
    return {
        id: value.id.slice(0, 64),
        gunKey: value.gunKey.slice(0, 200),
        unitName: savedText(value.unitName, 200),
        weaponName: savedText(value.weaponName, 200),
        aimedHex: savedText(value.aimedHex, 16),
        targetName: savedText(value.targetName, 60),
        firedGroundTurn,
        firedSpaceTurn,
    };
};

export class SpaceTracker {
    public shotsInFlight: IAntiOrbitalShot[] = [];
    public lastFired: Record<string, number> = {};
    public destroyedGuns: string[] = [];

    constructor(saved?: unknown) {
        if (!isPlainObject(saved)) return;
        if (Array.isArray(saved.shotsInFlight)) {
            this.shotsInFlight = saved.shotsInFlight.slice(0, MAX_SHOTS_IN_FLIGHT)
                .map(savedShot).filter((shot): shot is IAntiOrbitalShot => shot !== null);
        }
        if (isPlainObject(saved.lastFired)) {
            for (const key of Object.keys(saved.lastFired).slice(0, MAX_TRACKED_GUNS)) {
                const turn = savedTurn(saved.lastFired[key]);
                if (turn !== null) this.lastFired[key] = turn;
            }
        }
        if (Array.isArray(saved.destroyedGuns)) {
            this.destroyedGuns = Array.from(new Set(saved.destroyedGuns.filter((key): key is string => typeof key === "string")))
                .slice(0, MAX_TRACKED_GUNS);
        }
    }

    public export(): ISpaceTrackerExport {
        return {
            shotsInFlight: this.shotsInFlight.map((shot) => ({ ...shot })),
            lastFired: { ...this.lastFired },
            destroyedGuns: [...this.destroyedGuns],
        };
    }

    /** Shots fired in an earlier space turn than this ground turn's: resolved at the start of this space turn. */
    public getDueShots(groundTurn: number): IAntiOrbitalShot[] {
        const spaceTurn = getSpaceTurn(groundTurn);
        return this.shotsInFlight.filter((shot) => shot.firedSpaceTurn < spaceTurn);
    }
}
