// Arguments for and against candidates and parties - OPINION content.
//
// Every item records WHO is speaking, so readers can weigh the voice.
// The guide never writes its own pros or cons. Rules:
//   - stance: "for" | "against" | "reported"
//       for / against = an opinion voiced by the named speaker
//       reported      = a fact reported by news coverage (not an opinion,
//                       but included because it is part of the debate)
//   - voice: who said it. Use `org` to link a party (its sourced lean is shown
//     automatically), `role` for their position in the race.
//   - src:   where it was said. Required.
// Keyed by candidate id (data/profiles.js) or party id (GUIDE.orgs).
// Where nothing is listed, the guide says no published argument was found.

window.OPINIONS = {
  // ---------------------------------------------------------------- Mayor
  "mayor-mike-hurley": [
    { stance: "for", text: "\"I now want to finish what I started and continue building a Burnaby that works for everyone.\"", voice: { name: "Mike Hurley", role: "Incumbent mayor (speaking for himself)" }, src: ["sun-giant"] },
    { stance: "for", text: "The BCA-dominated council has worked \"really well\" with Hurley, who \"continues to be a popular mayor\".", voice: { name: "Sav Dhaliwal", org: "bca", role: "Retiring councillor" }, src: ["freshet-bca-slate"] },
    { stance: "against", text: "\"After eight years, ask yourself: Are you better off?\"", voice: { name: "Bill Petrovas", role: "Mayoral challenger (independent)" }, src: ["city-profiles-mayor"] },
    { stance: "against", text: "On housing rules under his administration: \"Burnaby is the only municipality that supersized the zoning to a six-plex ... And even removed all parking off properties.\"", voice: { name: "Heymann Yip", org: "burnaby-first", role: "Mayoral challenger" }, src: ["sun-giant"] },
    { stance: "against", text: "Points to about $15.8 million the city spent on the Confederation Park Community Centre project before council abandoned it in January 2025.", voice: { name: "Heymann Yip", org: "burnaby-first", role: "Mayoral challenger" }, src: ["sun-giant"] },
    { stance: "against", text: "Says council is \"acting as a rubber stamp for the Mayor and provincial agencies instead of standing up for taxpayers.\"", voice: { name: "Daniel Cheung", org: "restore", role: "Council candidate" }, src: ["city-profiles-council"] },
    { stance: "reported", text: "Earned at least $358,000 in 2024: his $235,000 mayor's salary plus regional roles, including $73,000 from Metro Vancouver and $48,000 from TransLink.", voice: { name: "Vancouver Sun", role: "News coverage" }, src: ["sun-giant"] },
    { stance: "reported", text: "Declined to sign a Metro Vancouver accountability charter that says mayors shouldn't get extra pay for regional roles, calling it \"just a publicity stunt\".", voice: { name: "Vancouver Sun", role: "News coverage" }, src: ["sun-giant"] },
  ],
  "mayor-heymann-yip": [
    { stance: "for", text: "Running to change what he sees as council's \"lack of meaningful consultation with residents\", especially over so-called \"monster homes\": \"Everybody is upset about it.\"", voice: { name: "Heymann Yip", org: "burnaby-first", role: "Mayoral challenger (speaking for himself)" }, src: ["sun-giant"] },
    { stance: "reported", text: "Has signed the Metro Vancouver accountability charter, which calls for more financial oversight. Received 6,328 votes running for council as an independent in 2022.", voice: { name: "Vancouver Sun", role: "News coverage" }, src: ["sun-giant"] },
    { stance: "against", text: "On the accountability charter Yip signed: \"it's just a publicity stunt.\"", voice: { name: "Mike Hurley", role: "Incumbent mayor" }, src: ["sun-giant"] },
  ],

  // ---------------------------------------------------------------- Council
  "council-richard-t-lee": [
    { stance: "for", text: "\"We are up against a giant, but we are determined.\" Says the city should be \"accountable, responsive and worth trusting again\".", voice: { name: "Richard T. Lee", org: "new-burnaby", role: "Councillor (speaking for himself)" }, src: ["sun-giant"] },
    { stance: "reported", text: "His March 2025 motion asking staff for a public report on what elected officials earn from government appointments never came to a council vote.", voice: { name: "Vancouver Sun", role: "News coverage" }, src: ["sun-giant"] },
  ],
  "council-daniel-cheung": [
    { stance: "for", text: "Running \"to give citizens their voices back\"; wants 60 days' notice and a town hall for provincial housing and shelter projects.", voice: { name: "Daniel Cheung", org: "restore", role: "Council candidate (speaking for himself)" }, src: ["city-profiles-council"] },
  ],

  // ---------------------------------------------------------------- Parties
  "bca": [
    { stance: "for", text: "\"Burnaby is headed in the right direction, but we've got more to do.\" \"We can't risk changing course right now.\"", voice: { name: "Burnaby Citizens Association", org: "bca", role: "Speaking for itself" }, src: ["party-bca-home", "sun-giant"] },
    { stance: "against", text: "\"When I propose a motion, most of the time it's not even seconded ... It is bad news for democracy.\"", voice: { name: "Richard T. Lee", org: "new-burnaby", role: "The only non-BCA councillor" }, src: ["sun-giant"] },
    { stance: "against", text: "Pledges increases no higher than inflation \"while the NDP/BCA's own financial plan projects 7% annual increases every year through 2030.\" (The City says those later-year projections are reassessed each budget.)", voice: { name: "New Burnaby Party", org: "new-burnaby", role: "Challenger" }, src: ["party-newburnaby", "city-budget-2026"] },
    { stance: "against", text: "Calls the mayor and BCA's 8 of 9 seats \"a NDP supermajority\" and cites its own figures: \"$1.6 Billion capital reserve funds spent\", \"15.8 Million wasted on Confederation Rec Centre plans\", \"Zero new police hires since 2019\" and a projected \"33.62% increase in property taxes over the next 3 years\". These are the party's numbers.", voice: { name: "Burnaby First", org: "burnaby-first", role: "Challenger" }, src: ["party-first-home"] },
    { stance: "against", text: "\"Don't let a single party dominate your ballot, vote for new voices.\"", voice: { name: "Nash Milani", role: "Independent council candidate" }, src: ["city-profiles-council"] },
  ],
  "new-burnaby": [
    { stance: "for", text: "Lee calls it a \"grassroots party\": \"We are up against a giant, but we are determined.\"", voice: { name: "Richard T. Lee", org: "new-burnaby", role: "Councillor" }, src: ["sun-giant"] },
  ],
  "burnaby-first": [
    { stance: "for", text: "Says it offers \"a clear alternative at City Hall\", guided by \"public safety, transparency, environmental stewardship, and fiscal responsibility\".", voice: { name: "Burnaby First", org: "burnaby-first", role: "Speaking for itself" }, src: ["party-first-home"] },
  ],
  "green": [
    { stance: "for", text: "Says every commitment will get targets and timelines, with annual progress reports that \"report honestly when targets are not being met\".", voice: { name: "Burnaby Green Party", org: "green", role: "Speaking for itself" }, src: ["party-green"] },
  ],
  "restore": [
    { stance: "for", text: "Says Burnaby's growth has outpaced policy and it is time to \"demand accountability from our municipal governments and seriously address public safety concerns\".", voice: { name: "Restore Burnaby Alliance", org: "restore", role: "Speaking for itself" }, src: ["party-restore"] },
  ],
};
