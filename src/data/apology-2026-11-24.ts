/**
 * NGCFells's apology of 24 November 2026 about community homebrew content. The app shows it once per browser
 * (src/ui/components/apology-notice.tsx), Home and About link to it, and the same text is posted in the project's
 * Discussions on GitHub. The words are NGCFells's own, as approved: change them only on NGCFells's say.
 */

/** A bold lead-in and the text after it, as the apology's bullet lists have them. */
export interface IApologyItem { lead: string; text: string }

/** A run of paragraphs or a bullet list, with an optional heading. */
export interface IApologySection { heading?: string; paragraphs?: string[]; items?: IApologyItem[] }

export const APOLOGY_TITLE = "An Apology and Clarification Regarding Community Homebrew Content";
export const APOLOGY_DATE = "November 24th, 2026";
export const APOLOGY_SIGNATURE = "— NGCFells";

/** Where the apology is posted on GitHub: the Announcements category until the Discussion's own link is known. */
export const APOLOGY_DISCUSSION_URL = "https://github.com/ngcfells/battletech-tools/discussions/categories/announcements";

/** localStorage key, set once the pop-up is closed, so that it shows once per browser. */
export const APOLOGY_SEEN_KEY = "jbt-apology-2026-11-24-seen";

export const APOLOGY_SECTIONS: IApologySection[] = [
    {
        paragraphs: [
            "Hey everyone,",
            "I want to offer a sincere apology to the BattleTech community, specifically to the members and creators of the Star League and QueerTech Discord servers, and to the Catalyst Game Labs (CGL) Discord community, regarding homebrew ideas, equipment, and unit types that were recently added to this app. To be clear, nothing in the app ever came from the CGL Discord.",
            "Because I have been removed from those servers, I am posting this directly here on the app, on GitHub, and on our Discord so that my accountability and the steps I've taken to fix this remain publicly visible to anyone affected.",
            "When I first started gathering ideas from Star League and QueerTech, my goal was simple: I saw awesome concepts from passionate players and wanted to help turn them into playable rules and usable tools for everyone. I made serious mistakes in how I communicated, and I owe the community an honest explanation.",
            "First, I didn't properly account for the fact that not everyone reads every message in a fast-moving Discord feed. Because of that, some creators didn't realize their work was being added until after the fact. Even more importantly, I failed to disclose that I was using AI coding tools to help turn those concepts into the app. In a creative community like BattleTech, transparency about how things are made matters, and I took away your ability to give informed consent about how your ideas were being used. That was wrong, and I am truly sorry.",
            "Second, I want to clear up a misunderstanding caused by my own poor choice of words. Earlier, I used the term \"scrape\" to describe how I found content. What I meant was that I was reading through channel feeds myself, by hand, looking for cool ideas. No bots, data-miners, or automated scripts ever harvested server messages. I completely understand why that word, combined with my use of AI coding tools, made it look like I was feeding those servers into an automated scraper, and I apologize for the alarm and frustration that caused.",
        ],
    },
    {
        heading: "What I Have Already Done to Fix This",
        items: [
            {
                lead: "Removed Unconfirmed Server-Specific Homebrew",
                text: "I have gone through the app, its code history on GitHub, and my open pull request to the original project, and removed all content created by users from the Star League and QueerTech servers where I did not have explicit permission, including anything where I couldn't verify a public-forum counterpart posted by that same creator. I removed it everywhere I could. For the code history, that meant folding the project's last five weeks of commits into one commit that leaves it out. If you forked or cloned the project in that time, please re-clone it.",
            },
            {
                lead: "Removed My Own Work Built on Those Ideas",
                text: "I also took out pieces I wrote entirely myself but only built because someone on those servers asked for them or gave me the idea. That includes the ArtVee ruleset, which I made because a member asked for a way to field their StarCraft Siege Tank miniatures in BattleTech play. Those pieces come back only if the person behind them asks for them, knowing that I use AI tools to build the app.",
            },
            {
                lead: "What Remains",
                text: "Only two kinds of things are left: the ideas of one creator who has explicitly given me permission to keep them, and ideas their creators also posted publicly, such as on the BattleTech forums, which stay with full credit and a link to that public post.",
            },
            {
                lead: "Restoring Content Only by Permission",
                text: "Anything I removed will only ever be added back into the app if the person it came from reaches out and gives explicit permission to include it. I've kept one private, offline copy for that reason alone, so that anything a creator asks to have back can be restored exactly as it was. It is not shared or published anywhere.",
            },
            {
                lead: "Double-Checking Anything Missed",
                text: "I believe I have pulled everything else that belongs to others from those servers, but if I overlooked anything at all, please reach out to me via Discord DM or open an issue on GitHub, and I will remove it right away.",
            },
        ],
    },
    {
        heading: "How I Will Handle Things Moving Forward",
        items: [
            {
                lead: "Strict Opt-In for Private Servers",
                text: "I will never add any homebrew rules, units, or ideas from private Discord servers or closed communities without getting explicit, direct permission from the creator first.",
            },
            {
                lead: "Public & Archived Content",
                text: "For older or publicly posted homebrew found on open forums, Archive.org, or other public sites, I will make a genuine effort to reach out to the original author first. However, because many of these older creators are no longer active or reachable, I may still preserve and implement publicly available material, with full credit given to the author and an immediate takedown guarantee if they ever reach out and ask for it to be removed.",
            },
            {
                lead: "Full Transparency",
                text: "I will always be upfront about where AI assistance is used in the development of the app, so creators can make an informed decision when granting permission or requesting removal.",
            },
        ],
    },
    {
        heading: "To the Jeff's BattleTech Tools Team",
        paragraphs: [
            "You have my deepest apologies as well. This project carries Jeff's name, and I brought this onto it. If you feel it would be best for the project that I step away from it, I will, and I'll do everything I can to make that a clean handoff.",
        ],
    },
    {
        paragraphs: [
            "I respect the moderators' decisions to remove me, and I understand why trust was broken. I love this game and this community, and it was never my intention to disrespect the time, creativity, or boundaries of the people who make it great. Thank you for holding me accountable, and I appreciate your patience as I work to earn back trust the right way.",
        ],
    },
];
