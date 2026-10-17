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
// Keyed by candidate id (profiles.js) or party id (GUIDE.orgs).
// Where nothing is listed, the guide says no published argument was found.
//
// Most items are from the October 14 leaders' debate. CentreBC and OneBC
// leaders weren't on stage (their parties lack official status) and appeared
// only in video clips.

window.OPINIONS = {
  // ---------------------------------------------------------------- Parties
  "bc-conservative": [
    { stance: "for", text: "Closing pitch: \"I see an opportunity for you, and I am absolutely convinced it could be so much better.\"", voice: { name: "Lorne Doerkson", org: "bc-conservative", role: "Interim leader (speaking for his party)" }, src: ["tyee-debate"] },
    { stance: "for", text: "On health care: \"We will also commit a $50 million fund to bolster our ERs that are closing right now.\"", voice: { name: "Lorne Doerkson", org: "bc-conservative", role: "Interim leader (speaking for his party)" }, src: ["global-debate"] },
    { stance: "for", text: "On repealing DRIPA: \"It has not helped British Columbians.\"", voice: { name: "Lorne Doerkson", org: "bc-conservative", role: "Interim leader (speaking for his party)" }, src: ["tyee-debate"] },
    { stance: "against", text: "\"Mr. Doerkson and his team are unable to explain how they're going to fund the $5 billion in promises ...\"", voice: { name: "David Eby", org: "bc-ndp", role: "NDP leader and Premier" }, src: ["global-debate"] },
    { stance: "against", text: "\"In the Conservatives, we see opacity, an unwillingness to report where the cuts are coming from.\"", voice: { name: "Emily Lowan", org: "bc-green", role: "Green leader" }, src: ["tyee-debate"] },
    { stance: "against", text: "On DRIPA, says the Conservatives are \"constantly pushing misinformation and blatant fearmongering\".", voice: { name: "Emily Lowan", org: "bc-green", role: "Green leader" }, src: ["tyee-debate", "global-debate"] },
    { stance: "reported", text: "Had not released a costed platform as of the debate. Doerkson: \"I do not want to introduce a platform that I break promises on.\"", voice: { name: "The Canadian Press", role: "News coverage" }, src: ["cp-debate"] },
  ],
  "bc-green": [
    { stance: "for", text: "\"If the Greens held the balance of power, it would be my top priority to advocate for a better voting system.\"", voice: { name: "Emily Lowan", org: "bc-green", role: "Leader (speaking for her party)" }, src: ["cp-debate"] },
    { stance: "for", text: "\"The BC Greens are the only party with a credible plan to bring community-based, team-based, preventative health care ...\"", voice: { name: "Emily Lowan", org: "bc-green", role: "Leader (speaking for her party)" }, src: ["global-debate"] },
    { stance: "for", text: "\"I'm the only leader on this stage who has worked a minimum wage job in the last decade.\" \"I think my youth is an asset.\"", voice: { name: "Emily Lowan", org: "bc-green", role: "Leader (speaking for herself)" }, src: ["global-debate", "tyee-debate"] },
  ],
  "bc-ndp": [
    { stance: "for", text: "\"I'm not perfect,\" but says he will \"always act in the best interest of British Columbians.\"", voice: { name: "David Eby", org: "bc-ndp", role: "Leader and Premier (speaking for himself)" }, src: ["tyee-debate"] },
    { stance: "for", text: "On DRIPA: \"There's only one path forward, and that's in partnership with the Indigenous people in this province.\"", voice: { name: "David Eby", org: "bc-ndp", role: "Leader and Premier (speaking for his party)" }, src: ["tyee-debate", "global-debate"] },
    { stance: "against", text: "\"You've been running this province for a decade and nothing is better than it was years ago.\"", voice: { name: "Lorne Doerkson", org: "bc-conservative", role: "Conservative interim leader" }, src: ["cp-debate"] },
    { stance: "against", text: "\"David Eby called a cynical snap election because he saw an opportunity for himself.\"", voice: { name: "Lorne Doerkson", org: "bc-conservative", role: "Conservative interim leader" }, src: ["tyee-debate"] },
    { stance: "against", text: "\"This year's election bribes are next year's broken promises.\"", voice: { name: "Emily Lowan", org: "bc-green", role: "Green leader" }, src: ["tyee-debate"] },
    { stance: "against", text: "On the NDP's LNG strategy: \"how dare you gamble our economy on LNG when we are looking at every forecast ...\"", voice: { name: "Emily Lowan", org: "bc-green", role: "Green leader" }, src: ["cp-debate"] },
  ],
  "centrebc": [
    { stance: "for", text: "\"CentreBC is a socially progressive, environmentally pragmatic, and fiscally responsible party.\"", voice: { name: "Elenore Sturko", org: "centrebc", role: "Leader, in a video clip shown at the debate" }, src: ["cp-debate"] },
  ],
  "onebc": [
    { stance: "for", text: "\"We will push for a 25 per cent income tax cut for both individuals and corporations ...\"", voice: { name: "Dallas Brodie", org: "onebc", role: "Leader, in a video clip shown at the debate" }, src: ["cp-debate"] },
    { stance: "for", text: "\"We will stop the greed and corruption of the reconciliation industry in British Columbia.\"", voice: { name: "Dallas Brodie", org: "onebc", role: "Leader, in a video clip shown at the debate" }, src: ["cp-debate"] },
  ],
};
