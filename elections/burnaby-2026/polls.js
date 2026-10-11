// Published polling for Burnaby's 2026 races. Copy numbers exactly from the
// source; never round, combine or project them.

window.POLLS = [
  {
    id: "leger-2026-10",
    pollster: "Leger, in partnership with Postmedia",
    fieldDates: "September 23-30, 2026",
    released: "2026-10-07",
    method: "Online panel survey of Vancouver-area adults (n=1,207 region-wide). Burnaby results come from 107 Burnaby respondents (123 after weighting).",
    localN: 107,
    // Our calculation: 1.96 * sqrt(0.25 / 107). Leger notes online panels are not
    // random samples, so this is a rough guide only.
    moeNote: "Leger doesn't publish a margin of error for Burnaby alone. For comparison, a random sample of 107 people would have a margin of error of about +/-9.5 points (our calculation).",
    src: ["leger-poll", "leger-page", "sun-poll"],
    mayor: {
      question: "If the election for mayor were held today, which candidate would you be most likely to vote for?",
      results: [
        { name: "Mike Hurley", pct: 25, id: "mayor-mike-hurley" },
        { name: "Bill Petrovas", pct: 5, id: "mayor-bill-petrovas" },
        { name: "Sabina Hsu", pct: 4, id: "mayor-sabina-hsu" },
        { name: "Hanzhi Wang", pct: 3, id: "mayor-hanzhi-wang" },
        { name: "Heymann Yip", pct: 3, id: "mayor-heymann-yip" },
        { name: "Would leave mayor blank", pct: 10, other: true },
        { name: "Undecided / not sure", pct: 49, other: true },
      ],
      note: "Leger showed the top five named candidates. MichaelAngelo ABCROBINHOOD was not among the results shown.",
    },
    snapshot: [
      { label: "City is on the wrong track", value: "48%", detail: "36% say right direction" },
      { label: "Time for a change on council", value: "43%", detail: "26% no, 31% not sure. Lower than the region-wide 57%." },
      { label: "Approve of the mayor", value: "42%", detail: "38% disapprove" },
      { label: "Approve of council", value: "42%", detail: "32% disapprove" },
      { label: "Certain to vote", value: "46%", detail: "Actual local turnout was 19.3% in 2022", src: ["freshet-bca-slate"] },
    ],
    issues: [
      { label: "Cost of living", pct: 50 },
      { label: "Housing affordability", pct: 38 },
      { label: "Property taxes and spending", pct: 28 },
    ],
    issuesNote: "Share of Burnaby respondents ranking each among their top three local issues.",
  },
];
