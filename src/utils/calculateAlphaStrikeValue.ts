import { IAlphaStrikeDamage } from "../classes/alpha-strike-unit";
import { calculateGroundPointValue } from "./alphaStrikeGroundPointValue";

/** Notes the conversion turns into damage codes below ("LRM" into "LRM 1/1/1", "Indirect Fire" into "IF 1"). */
const ALPHA_STRIKE_CONVERSION_KEYWORDS: readonly string[] = ["heat", "lrm", "flak", "ac", "srm", "missile", "msl", "rear", "indirect fire", "if"];

export function isAlphaStrikeConversionKeyword(note: string): boolean {
    return ALPHA_STRIKE_CONVERSION_KEYWORDS.includes(note.trim().toLowerCase());
}

export interface IAlphaStrikeExport {
    mechCreatorUUID: string;
    name: string;
    move: number;
    type: string;
    customName: string;
    role: string;
    jumpMove: number;
    pv: number;
    damage: IAlphaStrikeDamage;
    armor: number;
    structure: number;
    size: number;
    skill: number;
    overheat: number;
    notes: string;
    tmm: number;
    sizeClass: number;
    sizeClassName: string;
    ov: number;
    specialUnitAbilities: string[],
    longHeat: number;
    longOverheat: number;
    abilityCodes: string[],
}

export interface IAlphaStrikeCalculationResult {
    calcLogs: string;
    finalValue: number;
    alphaStrikeForceStats: IAlphaStrikeExport;
}

export function calculateAlphaStrikeValue(
    _alphaStrikeForceStats: IAlphaStrikeExport,
    rearDamage: IAlphaStrikeDamage,
    heatDamage: IAlphaStrikeDamage,
    lrmDamage: IAlphaStrikeDamage,
    flakDamage: IAlphaStrikeDamage,
    acDamage: IAlphaStrikeDamage,
    srmDamage: IAlphaStrikeDamage,
    mslDamage: IAlphaStrikeDamage,
    indirectFireRating: number,
): IAlphaStrikeCalculationResult {
    let _calcLogAS = "";
    _alphaStrikeForceStats.pv = 0;

    if (+rearDamage.short > 0 || +rearDamage.medium > 0 || +rearDamage.long > 0) {
        _alphaStrikeForceStats.abilityCodes.push("Rear");
    }

    // Write the damage-bearing special abilities onto the card ("LRM" becomes "LRM 1/1/1").
    const damageCode = (label: string, damage: IAlphaStrikeDamage) => {
        const adjusted = adjustAlphaStrikeDamage(damage);
        _calcLogAS += "<strong>Adding</strong> " + label + " Ability: " + adjusted.short + "/" + adjusted.medium + "/" + adjusted.long + "<br />\n";
        return label + " " + adjusted.short + "/" + adjusted.medium + "/" + adjusted.long;
    };
    const codes = _alphaStrikeForceStats.abilityCodes;
    for (let aC = 0; aC < codes.length; aC++) {
        const code = codes[aC].toLowerCase();
        if (code === "heat") codes[aC] = damageCode("Heat", heatDamage);
        if (code === "lrm") codes[aC] = damageCode("LRM", lrmDamage);
        if (code === "flak") codes[aC] = damageCode("Flak", flakDamage);
        if (code === "ac") codes[aC] = damageCode("AC", acDamage);
        if (code === "srm") codes[aC] = damageCode("SRM", srmDamage);
        if (code === "missile" || code === "msl") codes[aC] = damageCode("MSL", mslDamage);
        if (code === "rear") codes[aC] = damageCode("Rear", rearDamage);
        if (code === "indirect fire" || code === "if") {
            codes[aC] = "IF " + indirectFireRating;
            _calcLogAS += "<strong>Adding</strong> IF Ability: " + indirectFireRating + "<br />\n";
        }
    }

    /* Point Value: ASC pp.138-141 as corrected by errata v1.6, shared with the Alpha Strike unit creator. */
    _calcLogAS += "<div class=\"text-center\"><strong> - Calculating Point Value - </strong></div>\n";
    const stats = _alphaStrikeForceStats;
    const damageValue = (damage: number | string, minimal: boolean | undefined) => ({
        damage: damage.toString() === "-" || damage.toString() === "0*" ? 0 : +damage || 0,
        minimal: !!minimal || damage.toString() === "0*",
    });
    const pv = calculateGroundPointValue({
        type: stats.type,
        size: stats.sizeClass,
        moves: [{ inches: stats.move, mode: "" }],
        jump: stats.jumpMove,
        short: damageValue(stats.damage.short, stats.damage.shortMinimal),
        medium: damageValue(stats.damage.medium, stats.damage.mediumMinimal),
        long: damageValue(stats.damage.long, stats.damage.longMinimal),
        overheat: stats.ov,
        armor: stats.armor,
        structure: stats.structure,
        // The conversion writes Heat as "Heat 1/1/-"; its card code is HT.
        specials: [...new Set([...stats.abilityCodes, ...stats.specialUnitAbilities])].map((code) => code.replace(/^heat\b/i, "HT")),
    });
    for (const line of pv.log) _calcLogAS += line + "<br />\n";
    _alphaStrikeForceStats.pv = pv.pointValue;

    return {
        calcLogs: _calcLogAS,
        finalValue: pv.pointValue,
        alphaStrikeForceStats: _alphaStrikeForceStats,
    };
}


export function adjustAlphaStrikeDamage(
    incomingDamageObjects: IAlphaStrikeDamage,
    useZeros: boolean = false,
) {

    if( incomingDamageObjects.short.toString() === "0" ) {
        if( useZeros)
            incomingDamageObjects.short = 0;
        else
            incomingDamageObjects.short = 0;
    } else if( +incomingDamageObjects.short < .5) {
        incomingDamageObjects.shortMinimal = true;
        incomingDamageObjects.short= 0;
    } else {
        incomingDamageObjects.short = Math.round(+incomingDamageObjects.short);
    }

    if( incomingDamageObjects.medium.toString() === "0" ) {
        if( useZeros)
            incomingDamageObjects.medium = 0;
        else
            incomingDamageObjects.medium = 0;
    } else if( +incomingDamageObjects.medium < .5) {
        incomingDamageObjects.mediumMinimal = true;
        incomingDamageObjects.medium = 0;
    } else {
        incomingDamageObjects.medium = Math.round(+incomingDamageObjects.medium);
    }

    if( incomingDamageObjects.long.toString() === "0" ) {
        if( useZeros)
            incomingDamageObjects.long = 0;
        else
            incomingDamageObjects.long = 0;
    } else if( +incomingDamageObjects.long < .5) {
        incomingDamageObjects.long = 0;
        incomingDamageObjects.longMinimal = true;
    } else {
        incomingDamageObjects.long = Math.round(+incomingDamageObjects.long);
    }

    if( incomingDamageObjects.extreme.toString() === "0" ) {
        if( useZeros)
            incomingDamageObjects.extreme = 0;
        else
            incomingDamageObjects.extreme = 0;
    } else if( +incomingDamageObjects.extreme < .5) {
        incomingDamageObjects.extreme = 0;
        incomingDamageObjects.extremeMinimal= true;
    } else {
        incomingDamageObjects.extreme = Math.round(+incomingDamageObjects.extreme);
    }

    return incomingDamageObjects;
}
