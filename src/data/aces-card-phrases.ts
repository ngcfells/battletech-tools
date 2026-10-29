/*
 * The wording Aces behavior cards print, as templates. The cards repeat a small set of phrases and change only a
 * number or a colour, so a card photo's OCR is matched to the nearest phrase and only the changing parts are taken
 * from the photo (an idea from Rekikire). From our card data (aces-cards.ts, aces-card-samples.ts) and the Missile
 * Boat and Scout (Hover) cards photographed for #591; more come from players' exported card libraries.
 *
 * Slots: {n} an inch distance or count, {c} a Command card colour (blue, red or yellow).
 */

export const acesConditionPhrases: string[] = [
    "If there are any [moved] enemies in {n}\"",
    "If there are any [moved] enemies in {n}\" and no [notmoved] enemies in {n}\"",
    "If there are any [moved] enemies in {n}\", and no [notmoved] enemies in {n}\", and this unit has [nolos] any enemy",
    "If there are at least {n} enemies in [los] and {n}\"",
    "If there are more allies than enemies in {n}\"",
    "If the ideal [{c}] is [moved] and unit can move behind it",
    "If this unit is crippled",
];

export const acesMovementFilterPhrases: string[] = [
    "[closer] target",
    "[los] target",
    "[los] only to target",
    "[nolos] all enemies",
    "If sprinting, [nolos] all enemies",
    "{n}\" [spacing] target",
    "behind target",
    "cover vs [highest] enemies",
    "in [lowest] enemy [range]",
    "intervening woods vs [highest] other enemies",
    "no [notmoved] enemies in {n}\"",
    "occupy woods",
    "target has no cover",
];
