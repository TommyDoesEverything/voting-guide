# Roadmap

What's done, what's next, and ideas under consideration. Open an issue to suggest something.

## Now (before October 17, 2026)

- [x] Re-run `scripts/burnaby-2026/fetch_profiles.py` (October 10: no candidate changes). Run once more before voting day.
- [ ] Check for late withdrawals, new polls or major news, and update notes, opinions and polls with sources.
- [ ] Ask a few people of different political views to review the guide for fairness before sharing it widely.

## Next (after October 17, 2026)

- [ ] Add Burnaby 2026 results (`elections/burnaby-2026/results.js`) once the City declares them (by October 21), then set `results: true`.
- [ ] Decide whether to keep this site, or move to its own domain, once more elections are added.
- [ ] Accessibility pass: screen reader walkthrough and keyboard-only use. (Party colour contrast checked October 10: all pass WCAG AA in both themes.)

## Later

- [ ] **More elections.** The site already supports multiple elections (see [docs/adding-an-election.md](docs/adding-an-election.md)). Candidates: the 2028 BC provincial election, other Metro Vancouver municipalities, by-elections.
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
