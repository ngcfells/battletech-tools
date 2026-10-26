import React, { useState, type JSX } from 'react';
import { findEraByTag } from '../../data/era-options';
import { changeGameSetting, describeGameSettingMove, GameSettingChange, getGameSettingOptions, getStaleGameSettingSteps, IGameSettings } from '../../data/game-settings';
import { isEarlierRulesEdition, RulesEditionUnitType } from '../../data/rules-editions';
import { GameSettingStep, getRulesetConflict, getSpecialRulesets } from '../../data/special-rulesets';
import { btTechOptions } from '../../data/tech-options';
import EditionChoice from './edition-choice';
import RulesEditionSelect from './rules-edition-select';
import RulesLevelSelect from './rules-level-select';
import StandardModal from './standard-modal';
import { applyUnitGameSettings, getUnitGameSettings, IGameSettingsUnit } from '../../classes/unit-game-settings';
import { IAppGlobals } from '../app-router';

export const STALE_WARNING = "not offered under the ticked rulesets";

/**
 * The shared game settings block (#324): Special Rulesets, Edition, Rules Level, Tech Base and Era, first on every
 * builder. Each step offers only what the steps above allow; a change moves later steps that no longer fit and says
 * so in one line under the block. The parent keeps the settings (on its design) and passes them back in, and learns
 * which step was edited.
 */
export default function GameSettingsBlock(props: {
    unitType: RulesEditionUnitType;
    settings: IGameSettings;
    onChange: (settings: IGameSettings, step: GameSettingStep | "rulesets") => void;
}): JSX.Element {
    const [windowOpen, setWindowOpen] = useState(false);
    // The notice describes the settings its change made; once the design differs (replaced, or restored by a way back
    // to an edition) it no longer applies.
    const [notice, setNotice] = useState({ text: "", made: "" });
    const { settings } = props;
    const shownNotice = notice.made === JSON.stringify(settings) ? notice.text : "";
    const options = getGameSettingOptions(settings, props.unitType);
    const stale = getStaleGameSettingSteps(settings, props.unitType);

    // Runs each change in turn and reports every move they made, or why a ruleset was refused.
    const change = (...changes: GameSettingChange[]): void => {
        let next = settings;
        const lines: string[] = [];
        for (const one of changes) {
            const result = changeGameSetting(next, one, props.unitType);
            next = result.settings;
            lines.push(...result.moves.map((move) => describeGameSettingMove(move, next.edition)));
            if (result.refused) lines.push("Clashes with " + result.refused.name);
        }
        setNotice({ text: lines.join("; "), made: JSON.stringify(next) });
        props.onChange(next, changes[0]?.step ?? "rulesets");
    };

    const chooseRulesets = (value: string): void => {
        if (value === "yes") {
            setWindowOpen(true);
        } else {
            change(...settings.rulesets.map((id): GameSettingChange => ({ step: "rulesets", toggle: id })));
        }
    };

    const staleNote = (step: "edition" | "techBase" | "era") => stale.includes(step)
        ? <p className="color-red smaller-text">The stored value is {STALE_WARNING}.</p> : null;
    const techName = (tag: string) => btTechOptions.find((option) => option.tag === tag)?.name ?? tag;
    const era = findEraByTag(settings.era);
    const using = settings.rulesets.length > 0 || windowOpen;

    return (
        <div className="game-settings-block">
            <label>
                Special Rulesets:
                <select value={using ? "yes" : "no"} onChange={(e) => chooseRulesets(e.currentTarget.value)}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </label>
            {using ? (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setWindowOpen(true)}>Choose rulesets</button>
            ) : null}
            <p className="smaller-text">
                Optional and homebrew rules that change how the game plays or how units are built. Leave this off for standard BattleTech.
            </p>

            <RulesEditionSelect unitType={props.unitType} value={settings.edition} editions={options.editions} staleLabel={STALE_WARNING} onChange={(value) => change({ step: "edition", value })} />
            {staleNote("edition")}
            <RulesLevelSelect editionTag={settings.edition} value={settings.rulesLevel} options={options.rulesLevels} staleLabel={STALE_WARNING} onChange={(value) => change({ step: "rulesLevel", value })} />
            {/* A unit type or an earlier rulebook with one tech base has no such choice: the field is hidden (call 6). */}
            <EditionChoice earlierEdition={isEarlierRulesEdition(settings.edition)} hidden={options.techBases.length === 1 && !stale.includes("techBase")}>
                <label>
                    Technology Base:
                    <select value={settings.techBase} onChange={(e) => change({ step: "techBase", value: e.currentTarget.value })}>
                        {stale.includes("techBase") ? <option value={settings.techBase}>{techName(settings.techBase)} ({STALE_WARNING})</option> : null}
                        {options.techBases.map((tag) => <option key={tag} value={tag}>{techName(tag)}</option>)}
                    </select>
                </label>
            </EditionChoice>
            {staleNote("techBase")}
            {options.eras.length > 0 ? (
                <>
                    <label>
                        Era:
                        <select value={settings.era} onChange={(e) => change({ step: "era", value: e.currentTarget.value })}>
                            {stale.includes("era") ? <option value={settings.era}>{era?.name ?? settings.era} ({STALE_WARNING})</option> : null}
                            {options.eras.map((option) => <option key={option.tag} value={option.tag}>{option.name}</option>)}
                        </select>
                    </label>
                    {staleNote("era")}
                    {era?.description ? <p className="smaller-text">{era.description}</p> : null}
                </>
            ) : null}
            {shownNotice ? <p className="smaller-text" role="status">{shownNotice}</p> : null}

            <StandardModal show={windowOpen} title="Special Rulesets" className="modal-xl" onClose={() => setWindowOpen(false)}>
                {/* The block's own notice sits behind the window. */}
                {shownNotice ? <p className="smaller-text">{shownNotice}</p> : null}
                {getSpecialRulesets().map((ruleset) => {
                    const ticked = settings.rulesets.includes(ruleset.id);
                    const clash = ticked ? undefined : getRulesetConflict(settings.rulesets, ruleset.id);
                    return (
                        <div key={ruleset.id}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={ticked}
                                    disabled={!!clash}
                                    aria-describedby={"ruleset-about-" + ruleset.id}
                                    onChange={() => change({ step: "rulesets", toggle: ruleset.id })}
                                />{" "}
                                {ruleset.name}
                            </label>
                            <p className="smaller-text" id={"ruleset-about-" + ruleset.id}>
                                {ruleset.description}{" "}
                                Source: {ruleset.source.url ? <a href={ruleset.source.url} target="_blank" rel="noopener noreferrer">{ruleset.source.title}</a> : ruleset.source.title}.
                                {clash ? <span className="color-red"> Clashes with {clash.name}.</span> : null}
                            </p>
                        </div>
                    );
                })}
            </StandardModal>
        </div>
    );
}

/** A design's own rules level, or the app-wide one for a save from before designs kept one (or no design). */
export function unitRulesLevel(unit: IGameSettingsUnit | undefined | null, appSettings: { mechRulesFilter: number }): number {
    return unit?.gameSettings.getRulesLevel(appSettings.mechRulesFilter) ?? appSettings.mechRulesFilter;
}

/** The last level picked is the default for the next new design and the roster searches (call 12). */
export function rememberRulesLevel(appGlobals: IAppGlobals, settings: IGameSettings, step: GameSettingStep | "rulesets"): void {
    if (step !== "rulesLevel") return;
    appGlobals.appSettings.mechRulesFilter = settings.rulesLevel;
    appGlobals.saveAppSettings(appGlobals.appSettings);
}

/**
 * The settings block wired to a design other than a 'Mech: the block's values go onto the design and a picked level
 * becomes the default. The builder saves the design (and does its own follow-up) in `onChange`.
 */
export function UnitGameSettingsBlock(props: {
    unitType: RulesEditionUnitType;
    unit: IGameSettingsUnit;
    appGlobals: IAppGlobals;
    onChange: (step: GameSettingStep | "rulesets") => void;
}): JSX.Element {
    const change = (settings: IGameSettings, step: GameSettingStep | "rulesets"): void => {
        applyUnitGameSettings(props.unit, settings);
        rememberRulesLevel(props.appGlobals, settings, step);
        props.onChange(step);
    };
    return <GameSettingsBlock unitType={props.unitType} settings={getUnitGameSettings(props.unit, props.appGlobals.appSettings.mechRulesFilter)} onChange={change} />;
}
