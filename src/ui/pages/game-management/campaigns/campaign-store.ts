import { useCallback, useEffect, useState } from "react";
import { Campaign } from "../../../../classes/campaign/campaign";
import { ICampaignExport } from "../../../../classes/campaign/campaign-types";
import { getCampaigns, saveCampaigns } from "../../../../dataSaves";
import { IAppGlobals } from "../../../app-router";

export const formatMoney = ( amount: number ): string => amount.toLocaleString( "en-US" );

/** The campaign screens' dice; tests replace roll2d6. */
export const campaignDice = {
    roll2d6: (): number => 2 + Math.floor( Math.random() * 6 ) + Math.floor( Math.random() * 6 ),
};

/** Every saved campaign, and a save that writes the whole list (as the Aces campaign page does). */
export function useCampaigns( appGlobals: IAppGlobals ) {
    const [campaigns, setCampaigns] = useState<ICampaignExport[] | null>( null );
    useEffect( () => {
        let live = true;
        getCampaigns( appGlobals.appSettings ).then( ( list ) => { if( live ) setCampaigns( list ); } );
        return () => { live = false; };
    }, [appGlobals.appSettings] );
    const saveAll = useCallback( ( next: ICampaignExport[] ) => {
        setCampaigns( next );
        saveCampaigns( appGlobals.appSettings, next );
    }, [appGlobals.appSettings] );
    return { campaigns, saveAll };
}

/** One campaign by id; update() changes a copy through the class and saves it at once. */
export function useCampaign( appGlobals: IAppGlobals, id: string | undefined ) {
    const { campaigns, saveAll } = useCampaigns( appGlobals );
    const data = campaigns?.find( ( c ) => c.id === id ) ?? null;
    const campaign = data ? new Campaign( data ) : null;
    const update = ( change: ( c: Campaign ) => void ) => {
        if( !campaigns || !data ) return;
        const next = new Campaign( data );
        change( next );
        saveAll( campaigns.map( ( c ) => ( c.id === next.id ? next.export() : c ) ) );
    };
    return { loaded: campaigns !== null, campaign, update };
}
