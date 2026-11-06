# mordel.net API: Scott's 2026-11-05 update mapped against our wish list

Wish list: `2026-11-01-mordel-data-pipeline.md` (ticket #2611-001). Scott's update: "Mordel.Net API update for
testers" (2026-11-05). Where his model differs from the wish list, his model wins.

Tested on the sandbox 2026-11-06 with the documented example units, read-only, 1 s between requests. Raw
responses (no key in them) were saved as sample fixtures for the sync client.

## 1. What his update covers

| Wish list item | Status after this update | Our side |
|---|---|---|
| §1.5 stable ids | Done: `id` per unit, sandbox = live (checked 2026-11-04) | Key on `unit_type_short` + `id` |
| §1.6 change feed | `updated_since` (inclusive). Units never edited have `updated: null`, and `updated_since` still returns them by `created` (checked: bm 98087). No deletions feed. | One `updated_since` query per sync; weekly full list diff for removals |
| §1.7 data plus exports | JSON detail is here. Exports (record sheet, AS card, MegaMek) are "coming next" as files | Wait for files |
| §1.8 provenance | `canon` (true = designer "Catalyst Game Labs"), `sources` (title, publisher, year; no page), `created`/`updated`. No code release marker | Use `canon` instead of the designer test |
| §2.1 types | `bm`, `cv`, `im`, `pm` only | Others never come from mordel |
| §2.1 identity | `name_parts` (name, alternate_name, model), `mul_id`, `omni`, `omni_base_id`, `omni_variants` | Use `name_parts`; drop our `[BASE]` name parsing |
| §2.1 status | `canon`, `designer` (display name only, no member id), `created`, `updated`. No approved flag, no public flag (only public units are served) | Credit by display name |
| §2.1 rules | `tech_base`, `mixed_tech`, `era`, `year`, `rules_level` (word) + `extinct`. No designer's own level, no edition built under | Map levels as decided; drop `extinct`; grade by equipment |
| §2.1 construction | `configuration`, `engine`, `heat_sinks`, `structure`, `armor` (+ points), `gyro`, `cockpit`, `myomer`, `jump_jets`, `targeting`, `fire_control`, turrets, `locations` (armor, rear, structure, patchwork types), `equipment` by item `id` per location with slots, facing, links, flags, stacks | Map each to our classes. Equipment `id` is an instance id; matching to our catalog is by `name` + `technology` (see §3) |
| §2.1 values | `battle_value`, `point_value`, `cost`. No member rating | Compare with ours |
| §2.1 Alpha Strike | `type`, `size`, `move` (text, e.g. `12"j`), `tmm`, `armor`, `structure`, `damage` S/M/L (text, `0*` minimal), `overheat`, `point_value`, `specials`. No E range, no threshold, no role here (role is a top-level field) | Parse move and damage text |
| §2.1 quirks | Not coming (he has none) | None |
| §2.1 availability | Not in the update | None |
| §2.1 text | `fluff` (overview, capabilities, deployment, variants, notables) | Import as readout text, credited |
| §2.1 reviews | Not in the update (low priority anyway) | None |
| §2.1 bulk archive | Not offered | Capped detail batches per run |
| §2.2 equipment database | Not yet | Match by name |
| §2.3 quirks database | Not coming | None |
| §2.4 forum | Out (Scott, 2026-11-02) | None |
| §2.5 downloads, §2.6 products | Not yet | None |
| §3 errors | JSON `{"status":"Error","message":...}` with 400/401/404/405/503 | Handle each; 401 stops the run |
| §3 ETag / Last-Modified | Not sent; `Cache-Control: no-store` only (fixed as he said) | Use `updated` instead |
| §3 API key | `X-API-Key` header only; a key in the URL is refused | As is |
| §3 versioned paths | `/api/v1/` | As is |
| Pictures | `image_url` with `?v=` cache buster, no key, needs a real User-Agent | Fetch only when `?v=` changes |

## 2. What we checked on the sandbox (2026-11-06)

All as documented:

- `/units?limit=3`: the 21 fields in the stated order, `canon` and `omni` present.
- `/units/{type}/{id}` for bm 474, 2303, 123, 5280, 75003, cv 1, 2993, 4774, 4411, pm 14: list fields first in the
  same order, then every detail field in the stated order, none missing, none extra. Every equipment entry has
  exactly the 17 stated fields.
- Location armor adds up to `armor.points` on all 12 units fetched.
- Wasp WSP-3L (bm 474): no Endo Steel or Stealth entries in `equipment`; `structure.type` and `armor.type` name them.
- Goliath (bm 123): `LFL RFL LRL RRL`, no arms. Pwwka LAM (bm 5280): biped codes, `configuration` "Land-Air (Standard)".
- Gold Knight (bm 75003): the PPC Capacitor's `associated_id` is 90, the ER PPC entry's `id`.
- Schiltron PRIME (cv 2993): `omni_turret_tons` {turret 2}. Atlatl II (cv 4774): `Dual`, FT/RT locations.
  TNK-420 (cv 4411): `artemis` "IV-P". Ferret (cv 1): rotor `RO`.
- Errors: unknown id, leading zero and upper-case type give 404 "Unit not found"; a query parameter gives 400 with
  his message; no key gives 401; POST gives 405. Every response sends only `Cache-Control: no-store`.

Not as documented (for Scott):

1. **Hammer HMR-5M (bm 98087)** still shows `cost: 0` and `armor.tons: 0` (105 points, Impact-Resistant) in both
   `/units` and `/units/bm/98087`. The update says 7.5 tons and 5,167,240. Maybe the data fix is on live only.
2. **Sheinhardt Rokett Trukk (cv 5001)** still starts with a non-breaking space in `name` and `name_parts.name`.
3. A trailing slash (`/units/bm/474/`) gives 404 "Endpoint not found", not "Unit not found". Still a 404 as the
   update says; only the message differs.
4. An Omni base lists itself as its own base: Fire Falcon [BASE] (bm 2303) has `omni_base_id: 2303`. Fine for us,
   but the update only describes variants, so worth one line in the docs.
5. `updated` is `null` on units never edited, and `updated_since` returns them by `created`. That answers our earlier
   question (no need for `created_since` in a sync); worth one line in the docs.
6. Equipment `id` is a per-unit instance number (Heat Sink is 13 on bm 474 and on bm 123, ER Medium Laser 5 on
   bm 474 and 77 on bm 98087), and it is `null` on slotless items: the Centaur's (pm 14) ProtoMech ammo comes as five
   `LRM 3 (Ammo 1)` entries with `id` and `location` both null. The docs say only that `location` is null.

## 3. Open for our side

- **Equipment matching.** Unit `equipment[].id` is an instance id within the unit, not an equipment database id,
  so grading rules levels by equipment (wish list §4) means matching `name` + `technology` to our catalogs. Until
  his equipment database exists, unmatched names go to a review list, not a guess.
- **Load on his server.** A full detail pull is about 56,000 requests. The sync client takes the list in 57 pages,
  then details only for new or changed units, capped per run (like `mul:sync`), with a pause between requests.
  Ask Scott what pace he wants for the first full pull.
- **Where the copy lives.** The battletech-tools repo is public. Member designs should not be committed there
  until the user and Scott agree; the mirror stays git-ignored until then.

## 4. Reply to Scott (approved and sent by the user, 2026-11-06)

This final text replaces the first draft. Changes from the draft: the three mismatches are put down to a sandbox not
yet updated (to recheck after his next update), the pacing question is dropped, and the per-user key idea is added.

> Thanks, Scott. We ran your examples against the sandbox and nearly everything matched your notes: the field order,
> every detail field, the armor totals, the four-legged and LAM codes, the PPC Capacitor link, the turrets, the errors
> and the cache header. Nice work.
>
> Three items didn't match yet. We suspect the sandbox just hasn't picked up those fixes, which is no problem; we'll
> check them again after your next sandbox update:
>
> - Hammer HMR-5M (bm 98087) still shows cost 0 and 0 armor tons.
> - The Sheinhardt Rokett Trukk (cv 5001) name still starts with a non-breaking space.
> - `/units/bm/474/` returns "Endpoint not found" rather than "Unit not found".
>
> A few things work well for us as they are, and might be worth a line in the docs for other testers:
>
> - An Omni base lists its own id as `omni_base_id` (Fire Falcon [BASE], bm 2303).
> - `updated` is null on units that were never edited, and `updated_since` still finds them by `created`.
> - Equipment `id` is numbered within each unit, and it is null on slotless items. For example, the Centaur (pm 14)
>   has five `LRM 3 (Ammo 1)` entries with null `id` and `location`. The docs mention only the null `location`.
>
> One bigger idea we'd love your thoughts on. Rather than bundle unit details with the app, we'd like to ship only the
> list of units. Each user would get their own mordel.net API key, enter it in the app, and pull up details for just
> the units they want, straight from your server. That keeps our download small, keeps the data current, and leaves
> you in control of who has access and how much each person uses. Would you be open to that? If so, two practical
> questions: can any member request a key, and will the API accept calls made directly from a web browser (CORS),
> since the app runs in the browser?
>
> Our first full pull is running now at one request per second. Just say if you'd like it slower.

Follow-ups: recheck the three mismatches after Scott's next sandbox update. His answer on per-user keys and CORS
decides option (c) in the storage decision memo (tools handoff, step 2).
