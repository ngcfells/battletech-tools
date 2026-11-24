import * as React from "react";
import type { JSX } from "react";
import { Modal } from "react-bootstrap";
import {
    APOLOGY_DATE, APOLOGY_DISCUSSION_URL, APOLOGY_SECTIONS, APOLOGY_SEEN_KEY, APOLOGY_SIGNATURE, APOLOGY_TITLE,
} from "../../data/apology-2026-11-24";

/** True once this browser has closed the apology. Storage that cannot be read counts as not seen, so it shows. */
const apologySeen = (): boolean => {
    try {
        return window.localStorage.getItem(APOLOGY_SEEN_KEY) === "seen";
    } catch {
        return false;
    }
};

/** Remembers that this browser closed the apology. Where storage is blocked, it shows again on the next visit. */
const markApologySeen = (): void => {
    try {
        window.localStorage.setItem(APOLOGY_SEEN_KEY, "seen");
    } catch {
        // Private browsing or blocked storage: there is nowhere to remember it.
    }
};

/** NGCFells's apology of 24 November 2026 in a dialog named by its title. */
export function ApologyModal(props: { show: boolean; onClose: () => void }): JSX.Element {
    return (
        <Modal show={props.show} onHide={props.onClose} size="lg" scrollable aria-labelledby="apology-title">
            <Modal.Header closeButton closeLabel="Close the apology">
                <Modal.Title id="apology-title" as="h2" className="h4">{APOLOGY_TITLE}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="small-text">
                    {APOLOGY_DATE}. It is also posted in{" "}
                    <a href={APOLOGY_DISCUSSION_URL} target="_blank" rel="noopener noreferrer">{"the project's Discussions on GitHub"}</a>.
                </p>
                {APOLOGY_SECTIONS.map((section, index) => (
                    <React.Fragment key={index}>
                        {section.heading ? <h3 className="h5">{section.heading}</h3> : null}
                        {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                        {section.items ? (
                            <ul>
                                {section.items.map((item) => <li key={item.lead}><strong>{item.lead}:</strong> {item.text}</li>)}
                            </ul>
                        ) : null}
                    </React.Fragment>
                ))}
                <p>{APOLOGY_SIGNATURE}</p>
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-primary" onClick={props.onClose}>Close</button>
            </Modal.Footer>
        </Modal>
    );
}

/** Shows the apology once per browser: mounted at the app's root, it opens until this browser has closed it. */
export default function ApologyNotice(): JSX.Element {
    const [show, setShow] = React.useState(() => !apologySeen());
    const close = (): void => {
        markApologySeen();
        setShow(false);
    };
    return <ApologyModal show={show} onClose={close} />;
}

/** A button that reads as a link and opens the apology again, for Home and About. */
export function ApologyLink(props: { label?: string }): JSX.Element {
    const [show, setShow] = React.useState(false);
    return (
        <>
            <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => setShow(true)}>{props.label ?? "Read the apology"}</button>
            <ApologyModal show={show} onClose={() => setShow(false)} />
        </>
    );
}
