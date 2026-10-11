// Template for elections/<id>/results.js. Copy it into the election's folder
// as results.js once results are declared, then set `results: true` for that
// election in elections/index.js.
//
// Copy vote counts exactly from the official declaration. `elected` is
// optional: if omitted, the top N candidates by votes are marked elected,
// where N is the number of seats for that office.

window.RESULTS = {
  status: "official",            // "unofficial" on election night, "official" once declared
  declared: "2026-10-21",        // date the official results were declared
  src: ["official-results"],
  sources: {
    "official-results": { title: "Official election results", publisher: "City of ...", url: "https://...", type: "official" },
  },
  turnout: { pct: "00.0%", ballots: 0 },
  races: {
    // one array per office id in guide.js -> election.offices
    mayor: [
      { id: "mayor-firstname-lastname", votes: 0 },
    ],
    council: [],
    trustee: [],
  },
};
