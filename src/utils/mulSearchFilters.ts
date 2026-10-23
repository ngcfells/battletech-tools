import { DEFAULT_MUL_SOURCE_SELECTION, MULSourceSelection } from "../data/mul-list-items";

/** The filters of a Master Unit List search, shared by the Alpha Strike and Classic rosters. */
export interface IMULSearchFilters {
    term: string;
    rules: string;
    tech: string;
    role: string;
    era: number;
    type: number;
    factions: number[];
    factionSearchTerm: string;
    // Ability codes the unit must have; a "!" prefix means it must not have it.
    abilities: string[];
    abilitySearchTerm: string;
    sources: MULSourceSelection;
}

export function newMULSearchFilters(overrides: Partial<IMULSearchFilters> = {}): IMULSearchFilters {
    return {
        term: "",
        rules: "",
        tech: "",
        role: "",
        era: 0,
        type: 0,
        factions: [],
        factionSearchTerm: "",
        abilities: [],
        abilitySearchTerm: "",
        sources: DEFAULT_MUL_SOURCE_SELECTION,
        ...overrides,
    };
}
