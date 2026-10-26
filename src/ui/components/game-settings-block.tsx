import React, { useState, type JSX } from 'react';
import { findEraByTag } from '../../data/era-options';
import { changeGameSetting, describeGameSettingMove, GameSettingChange, getGameSettingOptions, getStaleGameSettingSteps, IGameSettings } from '../../data/game-settings';
import { RulesEditionUnitType } from '../../data/rules-editions';
import { getRulesetConflict, getSpecialRulesets } from '../../data/special-rulesets';
import { btTechOptions } from '../../data/tech-options';
import RulesEditionSelect from './rules-edition-select';
import RulesLevelSelect from './rules-level-select';
import StandardModal from './standard-modal';

const STALE_WARNING = "not offered under the ticked rulesets";

/**
 * The shared game settings block (#324): Special Rulesets, Edition, Rules Level, Tech Base and Era, first on every
 * builder. Each step offers only what the steps above allow; a change moves later steps that no longer fit and says
 * so in one line under the block. The parent keeps the settings (on its design) and passes them back in.
 */
export default function GameSettingsBlock(props: {
    unitType: RulesEditionUnitType;
    settings: IGameSettings;
    onChange: (settings: IGameSettings) => void;
}): JSX.Element {
    const [windowOpen, setWindowOpen] = useState(false);
    const [notice, setNotice] = useState("");
    const { settings } = props;
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
        setNotice(lines.join("; "));
        props.onChange(next);
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

            <RulesEditionSelect unitType={props.unitType} value={settings.edition} editions={options.editions} onChange={(value) => change({ step: "edition", value })} />
            {staleNote("edition")}
            <RulesLevelSelect editionTag={settings.edition} value={settings.rulesLevel} options={options.rulesLevels} onChange={(value) => change({ step: "rulesLevel", value })} />
            <label>
                Technology Base:
                <select value={settings.techBase} onChange={(e) => change({ step: "techBase", value: e.currentTarget.value })}>
                    {stale.includes("techBase") ? <option value={settings.techBase}>{techName(settings.techBase)} ({STALE_WARNING})</option> : null}
                    {options.techBases.map((tag) => <option key={tag} value={tag}>{techName(tag)}</option>)}
                </select>
            </label>
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
            {notice ? <p className="smaller-text" role="status">{notice}</p> : null}

            <StandardModal show={windowOpen} title="Special Rulesets" className="modal-xl" onClose={() => setWindowOpen(false)}>
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
                                    onChange={() => change({ step: "rulesets", toggle: ruleset.id })}
                                />{" "}
                                {ruleset.name}
                            </label>
                            <p className="smaller-text">
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
