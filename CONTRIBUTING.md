# Contributing: content rules

This guide is only useful if people of every political view can trust it. These rules apply to every change in `data/guide.js`.

## 1. Candidates speak for themselves

- `data/profiles.*` holds candidates' official statements, verbatim from the City of Burnaby. Never hand-edit it. Re-run `scripts/fetch_profiles.py` instead.
- A candidate's `points` (2-4 short items) must come **only** from their own statement. Paraphrase faithfully, and quote distinctive phrases. Don't add priorities they didn't state, and don't drop the ones they lead with.
- Keep `points` roughly the same length and number for everyone.
- Every candidate has exactly two `signature` tags: short phrases naming a specific promise or background fact from their own statement (for example "4-year tax freeze", "Doctor of Medicine"). Use quote marks only for their exact words. No adjectives or labels like "populist" or "anti-density".

## 2. Every added fact needs a source

- Each `note`, `fact` and `position` has a `src` list of IDs from `GUIDE.sources`.
- Prefer sources in this order: official (City, Province, Elections BC, school district), then the candidate's or party's own material, then news reporting, then other guides.
- A third-party source with a stake in an issue (for example, a real-estate marketplace writing about housing rules) can go in **Further reading**, labelled as such. It can't be the only source for a fact.
- Attribute claims a source makes but doesn't establish. Write "the party says…", not "…is true".
- If you can't link to it, leave it out.

## 3. Neutral language

- No em dashes; use a plain hyphen.
- Describe what people say and do, not whether it's good. No adjectives like "radical", "common-sense", "extreme", "boondoggle" or "populist", except inside a direct quote.
- No ratings, pros and cons, predictions, "front-runner" labels or endorsements.
- Context notes must be factual and verifiable, for example "Currently in office", "Says they are no longer running" or "Also on the provincial ballot". They must apply the same way to anyone they'd fit.

## 4. Opinions: arguments for and against

- They live only in `data/opinions.js`, never mixed into facts.
- Each item needs a `stance` (`for`, `against` or `reported`), a `voice` (who said it, plus `org` and `role` where relevant) and a `src`.
- Quote or closely paraphrase the speaker. Never write an argument in the guide's own voice.
- `reported` is for facts from news coverage that are part of the debate (pay, votes, records). Keep the reporter's wording.
- Political lean comes only from `GUIDE.orgs[...].lean`, and each label needs a source. If no source labels a party, leave `lean: null`; the site says so.
- Incumbents will collect more items because they have a record. Don't pad challengers with weak items to even it out, and don't drop sourced items to hide it.

## 5. Polls

- `data/polls.js` copies numbers exactly from the pollster's report: no rounding, combining or projecting.
- Always show sample size, field dates, undecided share and a caveat.

## 6. Equal treatment

- Candidates appear in the City's alphabetical order. Parties appear alphabetically.
- No party colours. The design uses one neutral palette.
- Issue sections list positions from whoever has published one. Silence isn't treated as a position.

## 7. Corrections

- Open an issue with a link to a source. Candidates and parties can request corrections the same way.
- Fix factual errors quickly. Disagreements about framing are settled by quoting the source directly.

## Checks before committing

```sh
node --check assets/js/app.js
node scripts/check_data.js
```

Then open the site at phone width (about 360px) and check that nothing scrolls sideways.
