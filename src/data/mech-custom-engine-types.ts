import { IEngineType } from "./data-interfaces";

/*
 * DISCLAIMER: This file processes gameplay data derived from the BattleTech universe. 
 * All official lore, trademarks, and intellectual property belong strictly to 
 * Catalyst Game Labs, Topps, and/or their respective corporate rights holders. 
 * Any original, fan-made content or custom homebrew data processed by this tool 
 * remains the exclusive property of its respective community creators, which,
 * where known, has been appropriately attributed.
 *
 * This open-source utility is a non-commercial fan project designed purely for 
 * tabletop gameplay assistance. Content processed by this file is not intended 
 * to challenge any copyright or trademark status, and this data is explicitly 
 * excluded from the software's underlying license (GNU GPLv3).
 */

export const mechCustomEngineTypes: IEngineType[] = [
	{
		// r/battletech post 1nk9g3e (#249). Weight is read from the light engine's column and movement heat follows
		// the XXL engine (battlemech.ts: getEngineWeightTag, isXXLEngine).
		name: "Mini Engine",
		alternateName: "Minimally Shielded Fusion Engine",
		tag: "mini-engine",
		rulesLevel: 6,
		techBase: "is",
		editions: [],
		criticals: {
			is: { ct: 6 }
		},
		// Not given in the post: the light engine's cost and dates.
		costMultiplier: 15000,
		introduced: 3062,
		extinct: null,
		reintroduced: null,
		rating: 0,
		book: "https://www.reddit.com/r/battletech/comments/1nk9g3e/",
		page: 0,
		notes: "Custom Homebrew by u/VanillaPhysics, 'Homebrew Experimental Tech #2: The Mini Engine', r/battletech: "
			+ "https://www.reddit.com/r/battletech/comments/1nk9g3e/. Made by General Motors (Inner Sphere). From the post: the critical "
			+ "slots of a standard fusion engine, placed the same way; the weight of a light fusion engine of the same rating; heat "
			+ "exactly as an XXL engine (2 standing, 4 walking, 6 running, double jumping heat; the author confirmed this in the "
			+ "comments). In play it is destroyed after two engine hits: mark the first hit as two. "
			+ "Engine-hit heat follows the XXL engine, which has no rule of its own for it (TO:AUE p.121), so the Heat Point Table "
			+ "applies (TW p.159): the first hit, marked as two, adds 10 heat a turn (owner ruling, 2026-11-12; the post left "
			+ "this open when u/Bookwyrm517 asked). "
			+ "Inspired by: u/VanillaPhysics. Ours, not in the post: Battle Value counts it as a standard engine (engine modifier 1.0, "
			+ "no side torso slots); cost and introduction date are the light engine's; it is not offered above a rating of 400 or on "
			+ "superheavy 'Mechs, which the post does not cover. "
			+ "Why Custom Homebrew and not Munchkin: it trades rather than outclasses. Against a light engine it frees four side "
			+ "torso slots and survives losing a side torso, but it carries XXL heat all game and dies at two hits instead of "
			+ "three. On a 200-rated engine the 2 tons saved over a standard engine go back into the heat sinks the extra "
			+ "running heat needs; the saving grows with larger engines. Why engine modifier 1.0: the modifier prices losing "
			+ "the engine with a side torso, and this engine has no side torso slots; its higher heat is already charged "
			+ "through heat efficiency."
	}
];
