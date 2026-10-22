import React, { type JSX } from 'react';
import { NOT_ENDORSED, TRADEMARK_NOTICE } from './svg/record-sheet-svg-kit';

/** The record sheets' trademark notice as paragraphs, for the footer of a printed page of sheets or cards. */
const TrademarkNoticeParagraphs = (): JSX.Element => (
    <>
        {TRADEMARK_NOTICE(new Date().getFullYear()).map((line) => <p key={line}>{line}</p>)}
        <p>{NOT_ENDORSED}</p>
    </>
);

export default TrademarkNoticeParagraphs;
