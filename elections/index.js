// Registry of every election this guide covers. Add an entry here and a
// folder under elections/<id>/ to publish a new election (see
// docs/adding-an-election.md).
//
//   id       folder name and the ?election= value in URLs
//   date     voting day (YYYY-MM-DD, local time)
//   close    when polls close on voting day (HH:MM); the election is shown as
//            "past" after this, with results if results.js exists
//   results  true once elections/<id>/results.js has official results
//
// The site opens on the earliest election whose voting day hasn't ended yet
// (switching at midnight after voting day), or the most recent one once all
// are over. assets/js/loader.js works this out; there's nothing to update.
window.ELECTIONS = {
  list: [
    {
      id: "burnaby-2026",
      name: "Burnaby General Local Election 2026",
      short: "Burnaby 2026",
      place: "Burnaby, BC",
      type: "Municipal",
      date: "2026-10-17",
      close: "20:00",
      results: false,
    },
    {
      id: "bc-2026",
      name: "2026 BC Provincial General Election (Burnaby ridings)",
      short: "BC 2026",
      place: "Burnaby ridings, BC",
      type: "Provincial",
      date: "2026-10-24",
      close: "20:00",
      results: false,
    },
  ],
};
