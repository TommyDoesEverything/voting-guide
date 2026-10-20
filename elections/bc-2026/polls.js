// Published province-wide polling for the 2026 BC election. Copy numbers
// exactly from the source; never round, combine, average or project them.
// Listed newest fieldwork first. Parties are in each pollster's own order.
//
// No published poll covers a single Burnaby or Richmond riding, so the guide
// shows BC-wide and Metro Vancouver figures only, and says so.

window.POLLS = [
  {
    id: "angus-reid-2026-10-19",
    pollster: "Angus Reid Institute",
    fieldDates: "October 15-19, 2026",
    released: "2026-10-19",
    method: "Online survey of a randomized sample of 793 BC adults.",
    sample: "793 BC adults",
    moeNote: "Margin of error +/- 3 percentage points, 19 times out of 20, as reported.",
    undecided: "Angus Reid reports decided and leaning voters; we couldn't find the share who were undecided.",
    src: ["ari-2026-10", "voice-ari-2026-10"],
    bc: {
      label: "Decided and leaning voters",
      results: [
        { name: "Conservative", pct: 46, org: "bc-conservative" },
        { name: "NDP", pct: 43, org: "bc-ndp" },
        { name: "Green", pct: 8, org: "bc-green" },
        { name: "Other", pct: 3, other: true },
      ],
    },
    metro: {
      results: [
        { name: "NDP", pct: 46, org: "bc-ndp" },
        { name: "Conservative", pct: 45, org: "bc-conservative" },
      ],
      note: "Angus Reid published only the two largest parties for Metro Vancouver.",
    },
    findings: [
      "Best premier: Lorne Doerkson 36%, David Eby 34%, neither 30%.",
      "\"Very certain\" of their vote: 73% of Conservative, 54% of NDP and 41% of Green supporters.",
    ],
  },
  {
    id: "leger-2026-10",
    pollster: "Leger",
    fieldDates: "October 9-12, 2026",
    released: "2026-10-14",
    method: "Online survey of 1,000 BC adults from Leger's LEO panel, weighted by age, gender, region and education.",
    sample: "1,000 BC adults (832 decided voters; 500 in Metro Vancouver)",
    moeNote: "Online panels aren't random samples, so Leger gives no margin of error. For comparison, a random sample of 1,000 would have a margin of error of +/- 3.1 points, 19 times out of 20.",
    undecided: "12% of all respondents were undecided.",
    src: ["leger-bc-2026-10", "leger-bc-2026-10-page"],
    bc: {
      label: "Decided voters",
      question: "If a BC Provincial election were held here in BC tomorrow, which party's candidate would you vote for?",
      results: [
        { name: "Conservative", pct: 42, org: "bc-conservative" },
        { name: "NDP", pct: 40, org: "bc-ndp" },
        { name: "Green", pct: 9, org: "bc-green" },
        { name: "OneBC", pct: 4, org: "onebc" },
        { name: "CentreBC", pct: 3, org: "centrebc" },
        { name: "Another party or independent", pct: 2, other: true },
      ],
    },
    metro: {
      results: [
        { name: "NDP", pct: 42, org: "bc-ndp" },
        { name: "Conservative", pct: 41, org: "bc-conservative" },
        { name: "Green", pct: 8, org: "bc-green" },
        { name: "OneBC", pct: 4, org: "onebc" },
        { name: "CentreBC", pct: 4, org: "centrebc" },
        { name: "Another party or independent", pct: 1, other: true },
      ],
    },
    findings: [
      "26% say they are likely to switch their vote (29% in Metro Vancouver); 17% don't know.",
      "Smaller-party supporters, if their party has no candidate in their riding: 29% NDP, 21% Conservative, 22% another party, 11% don't know. Leger warns this is a small sample.",
    ],
  },
  {
    id: "research-co-2026-10",
    pollster: "Research Co.",
    fieldDates: "October 9-11, 2026",
    released: "2026-10-13",
    method: "Online survey of 808 likely BC voters, weighted by age, gender and region.",
    sample: "808 likely voters (687 decided)",
    moeNote: "Margin of error +/- 3.5 points for all respondents and +/- 3.7 points for decided voters, 19 times out of 20.",
    undecided: "15% of likely voters were undecided.",
    src: ["researchco-2026-10"],
    bc: {
      label: "Decided voters",
      question: "If a provincial election were held today, which party's candidate would you vote for in your constituency?",
      results: [
        { name: "Conservative", pct: 44, org: "bc-conservative" },
        { name: "NDP", pct: 42, org: "bc-ndp" },
        { name: "Green", pct: 8, org: "bc-green" },
        { name: "CentreBC", pct: 2, org: "centrebc" },
        { name: "OneBC", pct: 2, org: "onebc" },
        { name: "Another party or independent", pct: 1, other: true },
      ],
    },
    metro: {
      results: [
        { name: "Conservative", pct: 45, org: "bc-conservative" },
        { name: "NDP", pct: 43, org: "bc-ndp" },
      ],
      note: "Research Co. published only the two largest parties for Metro Vancouver.",
    },
    findings: [
      "Best premier, of five leaders: David Eby 36%, Lorne Doerkson 25%, Emily Lowan 7%, Elenore Sturko 4%, Dallas Brodie 4%, not sure 23%.",
      "19% of decided voters say they could change their mind before voting day.",
      "46% say they feel confused by municipal and provincial elections in the same month.",
    ],
  },
];
