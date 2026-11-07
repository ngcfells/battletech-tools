import * as React from "react";
import { Link } from "react-router";
import { AlphaStrikeUnit } from "../../classes/alpha-strike-unit";
import type { BattleMech } from "../../classes/battlemech";
import type ProtoMech from "../../classes/protomech";
import type Vehicle from "../../classes/vehicle";
import { hideMordelUnit, loadMordelList } from "../../data/mordel-list";
import { mordelToASMULUnit } from "../../utils/mordel/mordel-alpha-strike";
import { fetchMordelDetail, fetchMyMordelUnits, MordelKeyError, MordelUnavailableError, parseMordelUnitRef } from "../../utils/mordel/mordel-api";
import { importMordelBlk } from "../../utils/mordel/mordel-blk";
import { getMordelKey } from "../../utils/mordel/mordel-key";
import { importMordelMech } from "../../utils/mordel/mordel-mtf";
import { IMordelDetail, IMordelListRow, mordelKeyOf, MordelType } from "../../utils/mordel/mordel-types";

// mordel.net units for a roster or the 'Mech designer: the shipped list to search, the user's own designs, and a box
// for a link to any unit. Alpha Strike cards come from the list itself; a Classic unit's full detail is pulled with
// the user's own key and built here, with a warning when our Battle Value is not mordel.net's.

export type MordelPanelMode = "alpha-strike" | "classic" | "designer";

interface IMordelUnitsPanelProps {
    mode: MordelPanelMode;
    onAddAS?: (unit: AlphaStrikeUnit) => void;
    onAddMech?: (mech: BattleMech) => void;
    onAddVehicle?: (vehicle: Vehicle) => void;
    onAddProtoMech?: (proto: ProtoMech) => void;
}

interface IStatus { tone: "success" | "warning" | "danger" | "info"; text: string; details?: string[]; settingsLink?: boolean }

const TYPE_LABELS: Record<MordelType, string> = { bm: "BattleMech", im: "IndustrialMech", cv: "Combat Vehicle", pm: "ProtoMech" };
const MAX_RESULTS = 50;
const SETTINGS_PATH = `${process.env.PUBLIC_URL ?? ""}/settings`;

const unitName = (unit: IMordelListRow): string => unit.name.trim();

export default function MordelUnitsPanel(props: IMordelUnitsPanelProps): React.JSX.Element {
    const { mode } = props;
    const [tab, setTab] = React.useState<"list" | "mine">("list");
    const [rows, setRows] = React.useState<IMordelListRow[] | null>(null);
    const [listError, setListError] = React.useState(false);
    const [term, setTerm] = React.useState("");
    const [busy, setBusy] = React.useState<string | null>(null);
    const [status, setStatus] = React.useState<IStatus | null>(null);
    const [mine, setMine] = React.useState<IMordelListRow[] | null>(null);
    const [mineNote, setMineNote] = React.useState<string | null>(null);
    const [link, setLink] = React.useState("");

    // The types this page can take.
    const types = React.useMemo<MordelType[]>(() => {
        if (mode === "alpha-strike") return ["bm", "im", "cv", "pm"];
        const list: MordelType[] = [];
        if (props.onAddMech) list.push("bm", "im");
        if (mode === "classic" && props.onAddVehicle) list.push("cv");
        if (mode === "classic" && props.onAddProtoMech) list.push("pm");
        return list;
    }, [mode, props.onAddMech, props.onAddVehicle, props.onAddProtoMech]);

    React.useEffect(() => {
        let live = true;
        loadMordelList().then((list) => { if (live) setRows(list); }).catch(() => { if (live) setListError(true); });
        return () => { live = false; };
    }, []);

    const results = React.useMemo(() => {
        const search = term.trim().toLowerCase();
        if (!rows || search.length < 3) return [];
        return rows.filter((row) => types.includes(row.unit_type_short)
            && (mode !== "alpha-strike" || !!row.alpha_strike)
            && (row.name.toLowerCase().includes(search) || (row.designer ?? "").toLowerCase().includes(search)));
    }, [rows, term, types, mode]);

    const showError = (error: unknown, name: string): void => {
        if (error instanceof MordelKeyError) {
            setStatus({ tone: "danger", text: error.message, settingsLink: true });
        } else if (error instanceof MordelUnavailableError) {
            setStatus({ tone: "danger", text: error.message });
        } else {
            setStatus({ tone: "danger", text: `${name} could not be built: ${(error as Error)?.message ?? error}` });
        }
    };

    /** Builds the unit from its detail and hands it to the page. */
    const addDetail = (detail: IMordelDetail): void => {
        const name = unitName(detail);
        if (mode === "alpha-strike") {
            const record = mordelToASMULUnit(detail);
            if (!record) { setStatus({ tone: "warning", text: `${name} has no Alpha Strike card on mordel.net.` }); return; }
            const unit = new AlphaStrikeUnit();
            unit.importMUL(record);
            props.onAddAS?.(unit);
            setStatus({ tone: "success", text: `${name} added.` });
            return;
        }
        const type = detail.unit_type_short;
        if (!types.includes(type)) {
            setStatus({ tone: "warning", text: `${name} is a ${TYPE_LABELS[type] ?? type}, which this page does not take.` });
            return;
        }
        let built: { ok: boolean; ourBV: number; issues: string[]; add: () => void } | null = null;
        if (type === "bm" || type === "im") {
            const result = importMordelMech(detail);
            if (result.mech) built = { ok: result.bvOk, ourBV: result.ourBV, issues: result.issues, add: () => props.onAddMech?.(result.mech!) };
        } else {
            const result = importMordelBlk(detail);
            if (result.unit) {
                const unit = result.unit;
                built = {
                    ok: result.bvOk, ourBV: result.ourBV, issues: result.issues,
                    add: () => (type === "cv" ? props.onAddVehicle?.(unit as Vehicle) : props.onAddProtoMech?.(unit as ProtoMech)),
                };
            }
        }
        if (!built) { setStatus({ tone: "danger", text: `${name} could not be built from its mordel.net detail.` }); return; }
        built.add();
        if (built.ok) {
            setStatus({ tone: "success", text: `${name} added.` });
        } else {
            const theirs = detail.battle_value ?? "none given";
            setStatus({
                tone: "warning",
                text: `${name} added, but check it: our Battle Value is ${built.ourBV} and mordel.net's is ${theirs}.`,
                details: built.issues,
            });
        }
    };

    /** Adds a row: an Alpha Strike card straight from the list, anything else from its detail. */
    const addRow = async (row: IMordelListRow): Promise<void> => {
        const name = unitName(row);
        setStatus(null);
        if (mode === "alpha-strike" && row.alpha_strike) { addDetail(row as IMordelDetail); return; }
        if (!getMordelKey()) {
            setStatus({ tone: "info", text: `Pulling ${name} from mordel.net needs your own mordel.net API key.`, settingsLink: true });
            return;
        }
        setBusy(mordelKeyOf(row));
        try {
            const detail = await fetchMordelDetail(row.unit_type_short, row.id, row.updated ?? row.created ?? null);
            if (!detail) {
                hideMordelUnit(mordelKeyOf(row));
                setRows((list) => list?.filter((entry) => mordelKeyOf(entry) !== mordelKeyOf(row)) ?? list);
                setMine((list) => list?.filter((entry) => mordelKeyOf(entry) !== mordelKeyOf(row)) ?? list);
                setStatus({ tone: "warning", text: `mordel.net no longer has ${name}, or your key may not see it. It is hidden from this list.` });
                return;
            }
            addDetail(detail);
        } catch (error) {
            showError(error, name);
        } finally {
            setBusy(null);
        }
    };

    const loadMine = async (): Promise<void> => {
        setStatus(null);
        if (!getMordelKey()) {
            setStatus({ tone: "info", text: "Your own designs come from mordel.net with your own API key.", settingsLink: true });
            return;
        }
        setBusy("mine");
        try {
            const list = await fetchMyMordelUnits();
            setMine(list ? list.filter((row) => types.includes(row.unit_type_short)) : []);
            setMineNote(list ? null : "mordel.net does not offer a list of your designs yet. Paste a link to one below instead.");
        } catch (error) {
            showError(error, "Your designs");
        } finally {
            setBusy(null);
        }
    };

    const addLink = async (): Promise<void> => {
        const ref = parseMordelUnitRef(link);
        if (!ref) { setStatus({ tone: "warning", text: "That is not a mordel.net unit link, or a type and id such as bm/23454." }); return; }
        await addRow({ unit_type_short: ref.type, id: ref.id, name: `${ref.type}/${ref.id}`, updated: null } as IMordelListRow);
    };

    const table = (list: IMordelListRow[]) => (
        <div className="table-wrapper">
            <table className="table">
                <thead>
                    <tr><th>Name</th><th>Type</th><th className="text-center">Tons</th><th className="text-center">BV</th><th>Designer</th><th>&nbsp;</th></tr>
                </thead>
                <tbody>
                    {list.slice(0, MAX_RESULTS).map((row) => (
                        <tr key={mordelKeyOf(row)}>
                            <td>{unitName(row)}</td>
                            <td>{TYPE_LABELS[row.unit_type_short] ?? row.unit_type}</td>
                            <td className="text-center">{row.tons}</td>
                            <td className="text-center">{row.battle_value ?? "-"}</td>
                            <td>{row.canon ? "Canon" : row.designer ?? ""}</td>
                            <td className="text-right">
                                <button type="button" className="btn btn-primary btn-sm no-right-margin" disabled={busy !== null}
                                    aria-label={`Add ${unitName(row)}`} onClick={() => void addRow(row)}>
                                    {busy === mordelKeyOf(row) ? "Pulling..." : mode === "designer" ? "Load" : "Add"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {list.length > MAX_RESULTS ? <p className="small">Showing {MAX_RESULTS} of {list.length}: narrow the search to see the rest.</p> : null}
        </div>
    );

    return (
        <div className="mordel-units-panel">
            <p className="small">
                Units designed on <a href="https://mordel.net" target="_blank" rel="noopener noreferrer">the mordel.net unit builder</a>.
                {mode === "alpha-strike" ? " Alpha Strike cards come with the list." : " Each unit is pulled with your own mordel.net API key."}
            </p>
            <div className="btn-group" role="tablist">
                <button type="button" role="tab" aria-selected={tab === "list"} className={`btn btn-sm ${tab === "list" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("list")}>Mordel.net units</button>
                <button type="button" role="tab" aria-selected={tab === "mine"} className={`btn btn-sm ${tab === "mine" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("mine")}>My Mordel designs</button>
            </div>

            {status ? (
                <div className={`alert alert-${status.tone}`} role="status">
                    {status.text}
                    {status.settingsLink ? <> <Link to={SETTINGS_PATH}>Open Settings</Link></> : null}
                    {status.details?.length ? <ul className="small">{status.details.map((line, index) => <li key={index}>{line}</li>)}</ul> : null}
                </div>
            ) : null}

            {tab === "list" ? (
                <>
                    <label className="width-100">
                        Search mordel.net units
                        <input type="search" className="form-control" value={term} placeholder="Name, model or designer"
                            onChange={(event) => setTerm(event.target.value)} />
                    </label>
                    {listError ? <div className="alert alert-danger">The mordel.net list could not be loaded.</div>
                        : rows === null ? <p>Loading the mordel.net list...</p>
                        : term.trim().length < 3 ? <p className="small">Type at least three letters.</p>
                        : results.length === 0 ? <p>No mordel.net units match.</p>
                        : table(results)}
                </>
            ) : (
                <>
                    <p>
                        <button type="button" className="btn btn-primary btn-sm" disabled={busy !== null} onClick={() => void loadMine()}>
                            {busy === "mine" ? "Loading..." : mine ? "Reload my designs" : "Load my designs"}
                        </button>
                    </p>
                    {mineNote ? <p className="small">{mineNote}</p> : null}
                    {mine && mine.length ? table(mine) : mine && !mineNote ? <p>No designs of a type this page takes.</p> : null}
                    <label className="width-100">
                        A mordel.net unit link, or a type and id (bm/23454)
                        <input type="text" className="form-control" value={link} onChange={(event) => setLink(event.target.value)} />
                    </label>
                    <button type="button" className="btn btn-primary btn-sm" disabled={busy !== null || !link.trim()} onClick={() => void addLink()}>
                        {mode === "designer" ? "Load this unit" : "Add this unit"}
                    </button>
                </>
            )}
        </div>
    );
}
