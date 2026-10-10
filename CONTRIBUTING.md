# Contributing: content rules

This guide is only useful if people of every political view can trust it. These rules apply to every change in `data/guide.js`.

## 1. Candidates speak for themselves

- `data/profiles.*` holds candidates' official statements, verbatim from the City of Burnaby. Never hand-edit it. Re-run `scripts/fetch_profiles.py` instead.
- A candidate's `points` (2–4 short items) must come **only** from their own statement. Paraphrase faithfully, and quote distinctive phrases. Don't add priorities they didn't state, and don't drop the ones they lead with.
- Keep `points` roughly the same length and number for everyone.

## 2. Every added fact needs a source

- Each `note`, `fact` and `position` has a `src` list of IDs from `GUIDE.sources`.
- Prefer sources in this order: official (City, Province, Elections BC, school district), then the candidate's or party's own material, then news reporting, then other guides.
- A third-party source with a stake in an issue (for example, a real-estate marketplace writing about housing rules) can go in **Further reading**, labelled as such. It can't be the only source for a fact.
- Attribute claims a source makes but doesn't establish. Write "the party says…", not "…is true".
- If you can't link to it, leave it out.

## 3. Neutral language

- Describe what people say and do, not whether it's good. No adjectives like "radical", "common-sense", "extreme", "boondoggle" or "populist", except inside a direct quote.
- No ratings, pros and cons, predictions, "front-runner" labels or endorsements.
- Context notes must be factual and verifiable, for example "Currently in office", "Says they are no longer running" or "Also on the provincial ballot". They must apply the same way to anyone they'd fit.

## 4. Equal treatment

- Candidates appear in the City's alphabetical order. Parties appear alphabetically.
- No party colours. The design uses one neutral palette.
- Issue sections list positions from whoever has published one. Silence isn't treated as a position.

## 5. Corrections

- Open an issue with a link to a source. Candidates and parties can request corrections the same way.
- Fix factual errors quickly. Disagreements about framing are settled by quoting the source directly.

## Checks before committing

```sh
node --check assets/js/app.js
node -e "global.window={};require('./data/guide.js');require('./data/profiles.js');const g=window.GUIDE,ids=new Set(window.PROFILES.candidates.map(c=>c.id)),s=new Set(Object.keys(g.sources));for(const k in g.candidates)if(!ids.has(k))console.log('unknown candidate',k);const w=o=>{if(Array.isArray(o))o.forEach(w);else if(o&&typeof o=='object')for(const[k,v]of Object.entries(o)){if(['src','moreSrc','further'].includes(k))v.forEach(x=>s.has(x)||console.log('unknown source',x));else if(k=='platform'&&!s.has(v))console.log('unknown source',v);else w(v)}};w(g);console.log('data ok')"
```

Then open the site at phone width (about 360px) and check that nothing scrolls sideways.
