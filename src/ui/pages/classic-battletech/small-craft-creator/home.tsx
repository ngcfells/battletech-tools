import React, { type JSX } from 'react';
import { Link } from 'react-router';
import { FaArrowCircleRight, FaFile, FaFolderOpen, FaSave, FaTrash } from "react-icons/fa";
import SmallCraft, { ISmallCraftExport } from '../../../../classes/small-craft';
import BlkImportSection from '../../../components/blk-import-section';
import { IAppGlobals } from '../../../app-router';
import { SmallCraftCreatorSideMenu } from '../../../components/creator-side-menus';
import TextSection from '../../../components/text-section';
import UIPage from '../../../components/ui-page';
import { confirmReplaceDesign, designWouldBeLost } from '../../../components/confirm-replace-design';
const ArrowCircleRight = FaArrowCircleRight as any;
const File = FaFile as any;
const FolderOpen = FaFolderOpen as any;
const Save = FaSave as any;
const Trash = FaTrash as any;

export default class SmallCraftCreatorHome extends React.Component<IHomeProps> {
    constructor(props: IHomeProps) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("Small Craft Creator");
    }

    // A MegaMek file of the kind, read by the shared MegaMek reader.
    loadBlk = (unit: unknown): string[] => {
        const craft = unit as SmallCraft;
        this.replaceDesign(() => this.props.appGlobals.saveCurrentSmallCraft(craft));
        return craft.getIssues(4);
    }

    // Before the design is replaced, offer to save it first.
    replaceDesign = (replace: () => void): void => {
        confirmReplaceDesign(this.props.appGlobals, {
            what: "small craft",
            lost: designWouldBeLost(this.props.appGlobals.currentSmallCraft, () => new SmallCraft(), this.props.appGlobals.smallCraftSaves || []),
            save: () => this.saveAsNew({ preventDefault: () => {} } as React.FormEvent<HTMLButtonElement>),
            replace,
        });
    }

    startNew = (e: React.FormEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        this.replaceDesign(() => this.props.appGlobals.saveCurrentSmallCraft(new SmallCraft()));
    }

    saveAsNew = (e: React.FormEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const craft = this.props.appGlobals.currentSmallCraft;
        if (craft) {
            // A copy saved as new gets its own id, so it never overwrites the row it was loaded from.
            const copy = new SmallCraft(craft.exportJSON());
            if (this.props.appGlobals.smallCraftSaves.some((save) => save.uuid === copy.getUUID())) copy.newUUID();
            this.props.appGlobals.saveSmallCraftSaves([...this.props.appGlobals.smallCraftSaves, copy.export(true)]);
        }
    }

    loadSave = (e: React.FormEvent<HTMLButtonElement>, saveIndex: number): void => {
        e.preventDefault();
        const save = this.props.appGlobals.smallCraftSaves[saveIndex];
        if (save) this.replaceDesign(() => this.props.appGlobals.saveCurrentSmallCraft(new SmallCraft(JSON.stringify(save))));
    }

    saveOver = (e: React.FormEvent<HTMLButtonElement>, saveIndex: number): void => {
        e.preventDefault();
        const save = this.props.appGlobals.smallCraftSaves[saveIndex];
        if (!this.props.appGlobals.currentSmallCraft || !save) return;
        this.props.appGlobals.openConfirmDialog(
            "Overwrite Confirmation",
            "Are you sure you want to save the currently loaded design over the saved design \"" + save.name + "\"?",
            "Yes",
            "No, thank you",
            () => {
                const craft = this.props.appGlobals.currentSmallCraft;
                if (craft) {
                    const saves = [...this.props.appGlobals.smallCraftSaves];
                    saves[saveIndex] = craft.export(true);
                    this.props.appGlobals.saveSmallCraftSaves(saves);
                }
            }
        );
    }

    deleteSave = (e: React.FormEvent<HTMLButtonElement>, saveIndex: number): void => {
        e.preventDefault();
        const save = this.props.appGlobals.smallCraftSaves[saveIndex];
        if (!save) return;
        this.props.appGlobals.openConfirmDialog(
            "Deletion Confirmation",
            "Are you sure you want to delete the design \"" + save.name + "\"?",
            "Yes",
            "No, thank you",
            () => {
                const saves = [...this.props.appGlobals.smallCraftSaves];
                saves.splice(saveIndex, 1);
                this.props.appGlobals.saveSmallCraftSaves(saves);
            }
        );
    }

    render = (): JSX.Element => {
        if (!this.props.appGlobals.currentSmallCraft) return <></>;
        const saves = this.props.appGlobals.smallCraftSaves || [];

        return (
            <UIPage current="classic-battletech-small-craft-creator" appGlobals={this.props.appGlobals}>
                <div className="row">
                    <div className="d-none d-md-block col-md-3 col-lg-2">
                        <SmallCraftCreatorSideMenu appGlobals={this.props.appGlobals} current="home" />
                    </div>
                    <div className="col-md-9 col-lg-10">
                        <TextSection label="Small Craft Creator">
                            <p>
                                Build a Small Craft under the TechManual construction rules (pp. 180-197): an aerodyne or spheroid
                                craft of 100 to 200 tons. Choose its thrust, fuel and Structural Integrity, armor its four facings,
                                mount weapons by firing arc, and give its crew and passengers quarters and its cargo a bay.
                            </p>
                            <p className="smaller-text">
                                The creator checks the weight and the rules as you go, and the summary gives the Battle Value, the
                                cost, a record sheet and an Alpha Strike card. Primitive Small Craft are not built here yet.
                            </p>
                            <div className="clear-both overflow-hidden">
                                <hr />
                                <button className="btn btn-primary pull-left btn-sm" onClick={this.startNew} title="Click here to clear out your current design and start over.">
                                    <File />&nbsp;Start Over
                                </button>
                                <Link to={`${process.env.PUBLIC_URL}/classic-battletech/small-craft-creator/chassis`} className="btn btn-primary pull-right btn-sm">
                                    Start Building <ArrowCircleRight />
                                </Link>
                            </div>
                        </TextSection>

                        <BlkImportSection accept={["small-craft"]} testId="sc" onLoad={this.loadBlk} />

                        <TextSection
                            label="Your Saved Small Craft"
                            labelButton={
                                <button className="btn btn-primary btn-sm pull-right" title="Save the currently loaded design as a new row" onClick={this.saveAsNew}>
                                    <Save />&nbsp;Save as New
                                </button>
                            }
                        >
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Hull</th>
                                        <th><span className="visually-hidden">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {saves.length > 0 ? saves.map((save: ISmallCraftExport, saveIndex: number) => (
                                        <tr key={saveIndex}>
                                            <td title={"UUID: " + save.uuid}>{`${save.name} ${save.model}`.trim() || "(nameless)"}</td>
                                            <td>{save.tonnage} tons, {save.shape === "spheroid" ? "Spheroid" : "Aerodyne"}</td>
                                            <td className="text-right">
                                                <button className="btn btn-sm btn-primary" type="button" title={"Load " + save.name + " into the editor"} onClick={(e) => this.loadSave(e, saveIndex)}>
                                                    <FolderOpen />
                                                </button>
                                                &nbsp;
                                                <button className="btn btn-sm btn-primary" type="button" title={"Save current design over " + save.name} onClick={(e) => this.saveOver(e, saveIndex)}>
                                                    <Save />
                                                </button>
                                                &nbsp;
                                                <button className="btn btn-sm btn-danger" type="button" title={"Delete " + save.name} onClick={(e) => this.deleteSave(e, saveIndex)}>
                                                    <Trash />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3}>You have no saved Small Craft yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
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

