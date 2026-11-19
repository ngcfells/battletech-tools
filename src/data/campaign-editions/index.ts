import { ICampaignEdition } from "../../classes/campaign/campaign-types";
import { MH1987_EDITION } from "./mercenarys-handbook-1987";

/* Campaign editions (one file each, added by the planet and unit editions plans). */
export const CAMPAIGN_EDITIONS: ICampaignEdition[] = [MH1987_EDITION];

export const findCampaignEdition = ( id: string | null ): ICampaignEdition | undefined => {
    if( !id ) return undefined;
    return CAMPAIGN_EDITIONS.find( ( edition ) => edition.id === id );
}
