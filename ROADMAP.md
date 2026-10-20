# Roadmap

What's done, what's next, and ideas under consideration. Open an issue to suggest something.

## Now: BC provincial election (before October 24, 2026)

The guide covers the nine ridings that include Burnaby or Richmond (`?election=bc-2026`). Burnaby's local election was October 17.

Before voting day:

- [ ] Re-check the party platforms for new announcements. October 17: added the NDP costed plan's Burnaby Hospital Phase 2 funding. October 19: added the Conservatives' costed platform (released October 18), including their housing plan, and each party's own deficit projection.
- [ ] Polls: check for final-week releases (Leger, Research Co., Angus Reid, others) and replace each firm's entry in `elections/bc-2026/polls.js` with its latest. Angus Reid's own methodology paragraph couldn't be read (its page blocks scripts); its sample and margin of error come from Indo-Canadian Voice coverage. Confirm them against Angus Reid if possible.
- [ ] Ask a few people of different political views to review the BC guide for fairness before sharing it widely.
- [ ] Ask someone to try "Find my riding" and the riding switcher on a phone with a few real addresses, including one near a riding boundary.

Richmond gaps:

- [ ] Robert Evans (independent, Richmond-Steveston) still has no bio or questionnaire. He told the Richmond News on October 9 that he planned to withdraw, but didn't before the deadline. Check for a follow-up story before voting day.
- [ ] Consider linking every Richmond candidate's Richmond News questionnaire (published October 12 to 17), not just the two CanWest candidates who have no party bio.

## Next: results

- [ ] After the October 21 official declarations in Burnaby and Richmond, update the local-ballot vote counts quoted in BC candidate notes (Jenny Yamagata, David Xie, Lawrence Chen, Calvin Dang) if they changed.
- [ ] Burnaby 2026: replace the unofficial results with the City's official declaration (due October 21 at 4 pm): update the counts and source, set `status: "official"` and `declared`, and drop `published`.
- [ ] Add BC 2026 results for the Burnaby and Richmond ridings after final count (planned November 6 to 10), then set `results: true`.

## After the elections

- [ ] Accessibility pass: screen reader walkthrough and keyboard-only use, including the riding switcher and the sideways-scrolling platform table. (Party colour contrast checked October 10: all pass WCAG AA in both themes.)
- [ ] Decide whether to keep this site, or move to its own domain, once more elections are added.

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

- [x] BC 2026: added province-wide polls (Angus Reid October 15-19, Leger October 9-12, Research Co. October 9-11) with BC-wide and Metro Vancouver vote intention; checked CTV's platform tracker against party platforms and added the missing promises to each party's list (October 19)
- [x] BC 2026: re-ran `scripts/bc-2026/fetch_candidates.py` (October 19: same 33 candidates; Barry Wosk's bio now ends with his website)
- [x] BC 2026: found the CanWest Party website and its one-line platform; added notes for Lawrence Chen and Keenan Yang linking their Richmond News questionnaires, and for Robert Evans's announced but unfiled withdrawal (October 19)
- [x] BC 2026: confirmed Lawrence Chen and Calvin Dang also ran for Richmond school trustee; added sourced notes, the `local` flag and their local results (October 19)
- [x] BC 2026: added Richmond candidates to the Issues pages from their own bios; replaced the expired vote-by-mail alert with an advance voting alert (October 19)
- [x] Burnaby 2026: unofficial results from the City's preliminary count (October 17), shown as unofficial until declared (October 19)
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
- [x] Riding switcher in the header: Candidates, Parties, Issues, the Overview's notices and Results show just your riding, with one tap to show all. The platform comparison scrolls sideways with the topic column pinned (October 17)
- [x] Burnaby: re-ran `scripts/burnaby-2026/fetch_profiles.py` before voting day (October 10 and 17: no candidate changes)
- [x] Burnaby: checked for late withdrawals, new polls and major news (October 17: the withdrawal deadline passed September 18; no new polls found)
- [x] BC 2026: re-ran `scripts/bc-2026/fetch_candidates.py` and checked focus points against bios (October 17: bios unchanged; added Green candidate Greg DePaco, who withdrew October 9 but is still on the Burnaby-New Westminster ballot)
- [x] BC 2026: reviewed OneBC's lean label ("Right-wing to far-right"): kept, now also citing Wikipedia's sources directly (The Tyee: "right-wing"; CFJC Today: "far-right") (October 17)
- [x] BC 2026: attributed arguments for and against (`elections/bc-2026/opinions.js`), from the October 14 leaders' debate coverage (October 17)
- [x] BC 2026: re-checked the Issues facts (October 17: added the July and August drug-death figures; the September 16 family doctor figure is still the latest)
