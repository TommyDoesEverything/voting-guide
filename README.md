# Voter Guide

An independent, non-partisan, sourced voter guide. Every candidate appears in their own words, party platforms are shown side by side, every added fact links to a source, and results are posted after voting day.

**Live site:** https://tommydoeseverything.github.io/voting-guide/

The first election covered is Burnaby's **October 17, 2026** general local election: all 64 candidates for mayor, council and school trustee. The site is built so more elections can be added as data, without changing code.

It's a static site with no build step, frameworks or tracking. It's designed for phones first.

## Run it

Open `index.html` in a browser, or serve the folder with `python -m http.server` and visit <http://localhost:8000>.

To view a specific election, add `?election=<id>` to the URL, for example `index.html?election=burnaby-2026`.

## What's in it

| Section | What it shows |
| --- | --- |
| **Overview** | Voting-day facts, how the ballot works, alerts, key issues and polling. After voting day: who was elected. |
| **Candidates** | Every candidate as a card. The full profile shows their statement, sourced notes, and labelled arguments for and against. |
| **Parties** | Each party's platform in its own words, a side-by-side comparison, and its candidates. |
| **Issues** | Background facts, where each party stands, and what candidates have said. |
| **Results** | Official vote counts once declared (past elections). |
| **My ballot** | A personal checklist, stored only in your browser (upcoming elections only). |
| **Elections** | Every election the guide covers, upcoming and past. |
| **About** | Neutrality rules, corrections and all sources. |

## Project layout

```
index.html                    page shell and icon set
assets/css/style.css          styles (mobile-first, light/dark)
assets/js/loader.js           picks the election and loads its data
assets/js/app.js              renders everything from the election's data
elections/index.js            registry of all elections (dates, status, default)
elections/<id>/               one folder per election:
  profiles.js / .json           official candidate statements (generated)
  guide.js                      election details, sources, parties, notes, issues
  opinions.js                   attributed arguments for and against
  polls.js                      published polling
  results.js                    official results (after voting day)
elections/_template/          templates for new data files
scripts/check_data.js         validates every election's data
scripts/<id>/                 election-specific data scripts
docs/                         how-to guides
archive/                      the original AI-generated prototype (reference only)
```

## Updating and adding elections

- **Refresh Burnaby candidate statements:** run `python scripts/burnaby-2026/fetch_profiles.py`. If Python can't verify the City's certificate, see the script's docstring for the curl workaround. Afterwards, check the diff to make sure each candidate's key points still match their statement.
- **Refresh BC 2026 provincial candidates (Burnaby and Richmond ridings):** run `python scripts/bc-2026/fetch_candidates.py`. It keeps only names, ridings and parties from Elections BC's list. To cover another riding, add its code to `RIDINGS` and its candidates' bio pages to `BIOS`, then run `python scripts/bc-2026/fetch_boundaries.py` to refresh the boundaries used by "Find my riding".
- **Add an election or post results:** see [docs/adding-an-election.md](docs/adding-an-election.md).
- **Before committing:** run `node scripts/check_data.js`.

## Neutrality and sourcing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before editing content. In short:

- Candidates speak for themselves. Key points come only from their own statements.
- Every fact we add has a source.
- Arguments for and against are labelled opinion, each naming who said it. The guide never writes its own.
- There are no ratings, predictions or endorsements. Every candidate and party gets the same treatment.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for what's next, including ideas for saving your ballot across devices.
