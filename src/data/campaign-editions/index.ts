import { ICampaignEdition } from "../../classes/campaign/campaign-types";

/* Campaign editions (one file each, added by the planet and unit editions plans). */
export const CAMPAIGN_EDITIONS: ICampaignEdition[] = [];

export const findCampaignEdition = ( id: string | null ): ICampaignEdition | undefined => {
    if( !id ) return undefined;
    return CAMPAIGN_EDITIONS.find( ( edition ) => edition.id === id );
}
