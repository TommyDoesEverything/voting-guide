# Roadmap

What's done, what's next, and ideas under consideration. Open an issue to suggest something.

## Now (before October 17, 2026)

- [x] Re-run `scripts/burnaby-2026/fetch_profiles.py` (October 10 and 17: no candidate changes).
- [x] Check for late withdrawals, new polls or major news (October 17: the withdrawal deadline passed September 18; no new Burnaby polls found).
- [ ] Ask a few people of different political views to review the guide for fairness before sharing it widely.

## Now: BC provincial election (before October 24, 2026)

The guide covers the nine ridings that include Burnaby or Richmond (`?election=bc-2026`).

- [x] Re-run `scripts/bc-2026/fetch_candidates.py` and check focus points against bios (October 17: bios unchanged; added Green candidate Greg DePaco, who withdrew October 9 but is still on the Burnaby-New Westminster ballot).
- [ ] Re-check the party platforms for new announcements. October 17: added the NDP costed plan's Burnaby Hospital Phase 2 funding. The Conservatives' plan still has no housing commitment, and their costed platform is described as imminent.
- [x] Review OneBC's lean label ("Right-wing to far-right"): kept, now also citing Wikipedia's sources directly (The Tyee: "right-wing"; CFJC Today: "far-right").
- [x] Add attributed arguments for and against (`elections/bc-2026/opinions.js`), from the October 14 leaders' debate coverage.
- [x] Re-check the Issues facts (October 17: added the July and August drug-death figures; the September 16 family doctor figure is still the latest).
- [ ] Re-run `scripts/bc-2026/fetch_candidates.py` once more before Final Voting Day, now that it covers the Richmond ridings, and check the Richmond focus points against any bio changes.
- [ ] Find bios for the candidates who have none: Lawrence Chen and Keenan Yang (CanWest Party) and Robert Evans (independent, Richmond-Steveston). If one turns up, add it to `BIOS` in the fetch script. Also look for a CanWest Party website or platform.
- [ ] Check whether Lawrence Chen and Calvin Dang, both Richmond MLA candidates, are the same people as the school trustee candidates of those names on Richmond's October 17 ballot (City of Richmond declaration). If confirmed, add a sourced note and the `local` flag, as for Jenny Yamagata.
- [ ] Add Richmond candidates to the Issues pages (`issues[].candidates`), where their own bios speak to an issue. Today these pages quote only Burnaby candidates.
- [ ] Ask someone to try "Find my riding" on a phone with a few real addresses, including one near a riding boundary.

## Next (after October 17, 2026)

- [ ] Add Burnaby 2026 results (`elections/burnaby-2026/results.js`) once the City declares them (by October 21), then set `results: true`.
- [ ] Decide whether to keep this site, or move to its own domain, once more elections are added.
- [ ] Add BC 2026 results for the Burnaby and Richmond ridings after final count (planned November 6 to 10), then set `results: true`.
- [ ] Accessibility pass: screen reader walkthrough and keyboard-only use. (Party colour contrast checked October 10: all pass WCAG AA in both themes.)

## Later

- [ ] **More elections.** The site already supports multiple elections (see [docs/adding-an-election.md](docs/adding-an-election.md)). Candidates: other Metro Vancouver municipalities, more BC ridings, by-elections.
- [ ] **Results history.** Add past Burnaby elections (2022, 2018) as results-only records for comparison.
- [ ] **Translations.** Burnaby has large Chinese-, Korean-, Punjabi- and Tagalog-speaking communities. Candidate statements would stay in their original language, with a note that they weren't translated by the candidate.
- [ ] **Candidate questionnaire.** Send every candidate the same short set of questions so answers can be compared directly, published unedited.
- [ ] **Offline support.** Cache the guide so it works on voting day with weak signal.
- [ ] **Accounts** (see below).

## Idea: accounts to save your ballot

Today your picks are saved only in your browser. An account would let you see them on any device. This would be the first thing on the site that stores personal data, and in this context what someone plans to vote for is sensitive information. So the default answer is **no account**, unless it can be done with very little risk.

### What it could look like

Three options, from least to most risky:

1. **No server: share or export a link (recommended first).** Your picks are encoded in a link or a QR code you can send to yourself or open on another device. Nothing is stored anywhere. This solves most of the "use it on my phone" need.
2. **End-to-end encrypted sync.** Picks are encrypted in your browser with a key that only you hold (a passkey or recovery phrase) before anything leaves your device. The server stores an unreadable blob and never sees who you picked. Even a full breach would reveal nothing.
3. **Standard accounts (not recommended).** A login with picks stored readable on a server. This is simpler to build, but creates a database of people's voting intentions. It should be avoided.

### Requirements if option 2 is pursued

- **Passkeys only** (WebAuthn): no passwords to leak or phish, and no email required.
- **End-to-end encryption:** keys are derived on the device. The server holds ciphertext only and cannot decrypt.
- **Minimal data:** no names, no email, no analytics, no IP logging tied to accounts. Data is deleted automatically after the election (for example 30 days after voting day).
- **One-tap delete:** a "delete my account and data" button that actually deletes everything.
- **Hosting:** a small, separate backend (GitHub Pages can't store data), with a published privacy policy, a security review and a threat model before launch.
- **Legal:** BC's privacy law (PIPA) applies to organizations collecting personal information, and voting intentions would likely count as sensitive. Get advice before collecting anything.
- **Open source:** the sync code is published so anyone can verify the claims.

### Open questions

- Is anyone actually asking for this, or is option 1 (share link) enough?
- Who would run and pay for the backend over time?
- Would people trust a voting site with an account, even an encrypted one? Being able to say "we store nothing" may be worth more.

## Done

- [x] Guide built from official candidate profiles, all 64 Burnaby candidates (October 2026)
- [x] Party platforms, issue explainers, attributed opinions, Leger poll with caveats
- [x] Party colours from each party's own branding; neutral line icons
- [x] Published on GitHub Pages
- [x] Multi-election support, a Results view for past elections, and an Elections page
- [x] Share preview image and link tags (Open Graph)
- [x] Automated data checks on every push and pull request (GitHub Actions)
- [x] Party colour contrast check (WCAG AA)
- [x] 2026 BC provincial election, Burnaby ridings: voting info from Elections BC's mailed Voter's Guide, all 18 candidates with bios from their party pages, incumbents, and five party platforms side by side (October 14)
- [x] BC Issues pages (cost of living, housing, health care, public safety) with official background facts, and "pick your riding" for the Overview, Candidates and My ballot (October 14)
- [x] The site now opens on the next election automatically, switching at midnight after voting day; no manual default to change
- [x] BC 2026: added the four Richmond ridings (14 candidates, incumbents, and the CanWest Party), and "Find my riding" from an address or your location, checked in the browser against Elections BC's boundaries (October 17)
