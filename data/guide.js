// Curated content for the guide. Everything a reader sees that isn't a
// candidate's own statement lives here, and every fact points at a source id
// in SOURCES. See CONTRIBUTING.md for the rules on what goes in this file.
//
// Candidate statements themselves come from data/profiles.js (generated).

window.GUIDE = {
  lastUpdated: "2026-10-10",

  election: {
    name: "Burnaby General Local Election 2026",
    day: "Saturday, October 17, 2026",
    hours: "8 am to 8 pm",
    advance: "October 3, 7 and 10",
    seats: { mayor: 1, council: 8, trustee: 7 },
  },

  // ---------------------------------------------------------------------------
  // Sources. type: official | candidate | party | news | reference | third-party
  // ---------------------------------------------------------------------------
  sources: {
    "city-elections": { title: "General Local Election", publisher: "City of Burnaby", url: "https://www.burnaby.ca/elections", type: "official" },
    "city-voters": { title: "Your City - Your Choice: information for voters", publisher: "City of Burnaby", url: "https://www.burnaby.ca/our-city/mayor-and-council/elections/voters", type: "official" },
    "city-mail": { title: "Mail ballot voting", publisher: "City of Burnaby", url: "https://www.burnaby.ca/our-city/mayor-and-council/elections/mail-ballot-voting", type: "official" },
    "city-map": { title: "Voting locations map (wait times, accessibility)", publisher: "City of Burnaby", url: "https://gis.burnaby.ca/electionvotinglocations/", type: "official" },
    "city-declaration": { title: "Declaration of Candidates for 2026 City of Burnaby General Local Election", publisher: "City of Burnaby", date: "2026-09-11", url: "https://www.burnaby.ca/our-city/news/2026-09-11/declaration-candidates-2026-city-burnaby-general-local-election", type: "official" },
    "city-profiles-mayor": { title: "Office of Mayor - candidate profiles", publisher: "City of Burnaby", url: "https://www.burnaby.ca/our-city/mayor-and-council/elections/candidates/office-of-mayor-candidate-profiles", type: "candidate" },
    "city-profiles-council": { title: "Office of Councillor - candidate profiles", publisher: "City of Burnaby", url: "https://www.burnaby.ca/our-city/mayor-and-council/elections/candidates/office-of-councillor-candidate-profiles", type: "candidate" },
    "city-profiles-trustee": { title: "Office of School Trustee - candidate profiles", publisher: "City of Burnaby", url: "https://www.burnaby.ca/our-city/mayor-and-council/elections/candidates/office-of-school-trustees-candidate-profiles", type: "candidate" },
    "city-council-members": { title: "Mayor and Council", publisher: "City of Burnaby", url: "https://www.burnaby.ca/our-city/mayor-and-council", type: "official" },
    "city-budget-2026": { title: "Burnaby keeps tax rates affordable with latest financial plan", publisher: "City of Burnaby", date: "2026-01-28", url: "https://www.burnaby.ca/our-city/news/2026-01-28/burnaby-keeps-tax-rates-affordable-latest-financial-plan", type: "official" },
    "city-homelessness": { title: "Four realities every Burnaby resident should understand about homelessness", publisher: "City of Burnaby", date: "2026-07-16", url: "https://www.burnaby.ca/our-city/news/2026-07-16/four-realities-every-burnaby-resident-should-understand-about-homelessness", type: "official" },
    "sd41-board": { title: "Trustee Elections to the Burnaby Board of Education", publisher: "Burnaby School District", url: "https://burnabyschools.ca/trustee-elections-to-the-burnaby-board-of-education/", type: "official" },
    "bc-municipal-powers": { title: "Municipal powers & services", publisher: "Province of British Columbia", url: "https://www2.gov.bc.ca/gov/content/governments/local-governments/governance-powers/powers-services/municipal-powers-services", type: "official" },
    "bc-lga": { title: "Local Government Act, Part 3 (ballot marking and rejection rules)", publisher: "BC Laws", url: "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/r15001_03", type: "official" },
    "bc-voting": { title: "Voting in local elections", publisher: "Province of British Columbia", url: "https://www2.gov.bc.ca/gov/content/governments/local-governments/governance-powers/general-local-elections/voting-local-elections", type: "official" },
    "bc-tuition": { title: "Tuition Limit Policy", publisher: "Province of British Columbia", url: "https://www2.gov.bc.ca/gov/content/education-training/post-secondary-education/institution-resources-administration/tuition-limit-policy", type: "official" },
    "bc-health-plan": { title: "Ministry of Health 2025/26 Service Plan", publisher: "Province of British Columbia", url: "https://www.bcbudget.gov.bc.ca/2025/sp/pdf/ministry/hlth.pdf", type: "official" },
    "bc-hog-seniors": { title: "Home owner grant for seniors", publisher: "Province of British Columbia", url: "https://www2.gov.bc.ca/gov/content/taxes/property-taxes/annual-property-tax/home-owner-grant/senior", type: "official" },
    "bc-ssmuh": { title: "Small-scale, multi-unit housing (Bill 44)", publisher: "Province of British Columbia", url: "https://www2.gov.bc.ca/gov/content/housing-tenancy/local-governments-and-housing/housing-initiatives/smale-scale-multi-unit-housing", type: "official" },
    "ebc-candidates": { title: "2026 Provincial General Election - candidate list", publisher: "Elections BC", url: "https://www.elections.bc.ca/docs/fin/GE-2026-10-24-Candidate-Website-Report.PDF", type: "official" },
    "ebc-yamagata": { title: "2026 Provincial General Election candidates update", publisher: "Elections BC", url: "https://elections.bc.ca/news/2026-provincial-general-election-candidates-update/", type: "official" },

    "party-bca": { title: "BCA platform", publisher: "Burnaby Citizens Association", url: "https://www.burnaby-citizens.ca/platform", type: "party" },
    "party-first": { title: "Burnaby First platform", publisher: "Burnaby First", url: "https://burnabyfirst.ca/platform", type: "party" },
    "party-green": { title: "Our Platform", publisher: "Burnaby Green Party", url: "https://burnabygreenparty.com/our-platform/", type: "party" },
    "party-green-home": { title: "Burnaby Green Party home page", publisher: "Burnaby Green Party", url: "https://burnabygreenparty.com/", type: "party" },
    "party-newburnaby": { title: "Platform", publisher: "New Burnaby Party", url: "https://newburnaby.ca/platform/", type: "party" },
    "party-restore": { title: "Our Platform", publisher: "Restore Burnaby Alliance", url: "https://restoreburnaby.ca/?page_id=1282", type: "party" },
    "party-newburnaby-home": { title: "New Burnaby Party home page", publisher: "New Burnaby Party", url: "https://newburnaby.ca/", type: "party" },
    "party-restore-home": { title: "Restore Burnaby Alliance home page", publisher: "Restore Burnaby Alliance", url: "https://www.restoreburnaby.ca/", type: "party" },
    "party-restore-edu": { title: "Our Education", publisher: "Restore Burnaby Alliance", url: "https://restoreburnaby.ca/?page_id=1259", type: "party" },

    "freshet-bca-slate": { title: "Burnaby's ruling party announces council candidates for October election", publisher: "Freshet News", date: "2026-03-23", url: "https://www.freshetnews.ca/?p=7607", type: "news" },
    "dailyhive-hurley": { title: "Burnaby Mayor Mike Hurley promises 1,000 new affordable rental homes in bid for third term", publisher: "Daily Hive", date: "2026-09-29", url: "https://dailyhive.com/vancouver/burnaby-mayor-mike-hurley-election-platform-2026", type: "news" },
    "dailyhive-xie": { title: "David Xie says he is no longer pursuing a seat on Burnaby City Council", publisher: "Daily Hive", date: "2026-10-02", url: "https://dailyhive.com/vancouver/david-xie-bc-conservative-burnaby-south-metrotown", type: "news" },
    "freshet-hospital": { title: "Province cancels Burnaby Hospital agreement", publisher: "Freshet News", date: "2026-04-29", url: "https://www.freshetnews.ca/?p=8818", type: "news" },
    "freshet-hospital-50m": { title: "$50 million spent on cancelled Burnaby Hospital contract", publisher: "Freshet News", url: "https://www.freshetnews.ca/?p=9136", type: "news" },
    "ctv-hospital": { title: "Eby says Burnaby, B.C., hospital expansion will go ahead, despite cancelled contract", publisher: "The Canadian Press via CTV News", date: "2026-05-01", url: "https://www.ctvnews.ca/vancouver/politics/article/eby-says-burnaby-bc-hospital-expansion-will-go-ahead-despite-cancelled-contract/", type: "news" },
    "freshet-imperial": { title: "Controversial BC Housing project cancelled in Burnaby", publisher: "Freshet News", date: "2026-02-28", url: "https://www.freshetnews.ca/?p=6793", type: "news" },

    "sun-giant": { title: "'Up against a giant': Burnaby's political status quo faces biggest test in years this election", publisher: "Vancouver Sun (Sarah Grochowski)", date: "2026-09-23", url: "https://ca.news.yahoo.com/against-giant-burnaby-political-status-130026974.html", type: "news" },
    "sun-poll": { title: "'Room for movement': Leger poll shows B.C.'s municipal voters are searching for someone to get behind", publisher: "Vancouver Sun (Glenda Luymes)", date: "2026-10-08", url: "https://ca.news.yahoo.com/room-movement-leger-poll-shows-130012760.html", type: "news" },
    "freshet-council-race": { title: "Burnaby mayor's seat challenged, 42 vying for eight council spots", publisher: "Freshet News", date: "2026-09-11", url: "https://www.freshetnews.ca/burnaby-mayors-seat-challenged-42-vying-for-eight-council-spots/", type: "news" },
    "freshet-trustee-race": { title: "16 candidates vying for seven seats on Burnaby board of education", publisher: "Freshet News", date: "2026-09-13", url: "https://www.freshetnews.ca/16-candidates-vying-for-seven-seats-on-burnaby-board-of-education/", type: "news" },
    "leger-poll": { title: "Vancouver CMA Municipal Election Polling, October 2026 (report)", publisher: "Leger, in partnership with Postmedia", date: "2026-10-07", url: "https://documents.leger360.com/hubfs/%C3%89tudes%20M%C3%A9diatiques/%C3%89tudes%20M%C3%A9diatiques%20-%202026/10.%20October%202026/Media%20Release%20-%20BC%20Municipal%20Election%20Polling%20-%20October%207%2c%202026%20(1).pdf", type: "poll" },
    "leger-page": { title: "Metro Vancouver Municipal Election 2026: Voters Want Change", publisher: "Leger", date: "2026-10-09", url: "https://leger360.com/metro-vancouver-municipal-election-2026-poll/", type: "poll" },
    "wiki-bca": { title: "Burnaby Citizens Association", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Burnaby_Citizens_Association", type: "reference" },
    "wiki-green": { title: "Burnaby Green Party", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Burnaby_Green_Party", type: "reference" },
    "party-bca-home": { title: "BCA home page", publisher: "Burnaby Citizens Association", url: "https://www.burnaby-citizens.ca/", type: "party" },
    "party-first-home": { title: "Burnaby First home page", publisher: "Burnaby First", url: "https://burnabyfirst.ca/", type: "party" },

    "multiliving": { title: "Burnaby Mayor Candidates 2026: Where All 6 Stand on Multiplex Homes", publisher: "MultiLiving (a multiplex real-estate marketplace)", date: "2026-10-09", url: "https://multiliving.ca/pulse/burnaby-mayor-council-candidates-2026-multiplex-homes-buyers", type: "third-party" },
    "bbot": { title: "2026 Burnaby Election Candidates", publisher: "Burnaby Board of Trade", url: "https://www.bbot.ca/2026/09/15/election-candidates/", type: "third-party" },
    "votemate": { title: "VoteMate BC 2026 - Burnaby", publisher: "VoteMate", url: "https://en.votemate.org/bc2026/candidates/?riding=796&race=176", type: "third-party" },
  },

  // ---------------------------------------------------------------------------
  // Elector organizations (civic parties), alphabetical.
  // `says` are short items in the party's own words (quoted where marked).
  // ---------------------------------------------------------------------------
  orgs: {
    "bca": {
      color: { brand: "#f7632f", ink: "#b4451b", inkDark: "#fb8a5e", src: "party-bca-home" },
      tagline: { text: "Burnaby is headed in the right direction, but we've got more to do.", src: ["party-bca-home"] },
      stances: {
        taxes: { text: "“Maintain the City's track record of zero debt and low, predictable taxes”", src: ["party-bca"] },
        housing: { text: "“Start at least 1,000 new rental homes through the Housing Authority by 2030”", src: ["party-bca"] },
        safety: null,
        hospital: { text: "“Fight for Phase 2, the beds and the cancer centre”", src: ["party-bca"] },
        schools: { text: "“Keep the SOGI policy strong”; press the province to build for projected enrolment; grow school meals", src: ["party-bca"] },
      },
      name: "Burnaby Citizens Association",
      lean: [{ label: "Centre-left", src: ["wiki-bca"] }, { label: "NDP-affiliated", src: ["sun-giant", "wiki-bca"] }],
      role: "Governing party",
      short: "BCA",
      website: "https://www.burnaby-citizens.ca/",
      platform: "party-bca",
      context: [
        { text: "Holds 7 of the 8 current council seats and every current school board seat.", src: ["freshet-bca-slate", "freshet-trustee-race"] },
        { text: "The only group running a full council slate (8).", src: ["freshet-council-race"] },
        { text: "Is not running a candidate for mayor in 2026.", src: ["freshet-bca-slate"] },
      ],
      says: [
        "“Start at least 1,000 new rental homes through the Housing Authority by 2030”",
        "“Maintain the City's track record of zero debt and low, predictable taxes”",
        "Burnaby Hospital: “Fight for Phase 2, the beds and the cancer centre”",
        "Open the Cameron, Burnaby Lake and Brentwood community centres; build new libraries",
      ],
      more: [
        "“Build two new city-owned childcare facilities”",
        "“Prioritize and purchase more park space so everyone lives within walking distance of a park”",
        "Reach a 40% tree canopy by 2075; make Burnaby a certified “Bird Friendly City”",
        "“Expand the ‘School Streets’ pilot to more Burnaby schools”; advocate for more transit routes and better frequency",
        "“Deliver on the Task Force's 17 recommendations” for local jobs and business",
        "Schools: “Press the Ministry to build for projected enrolment”, “Keep the SOGI policy strong”, “Grow the school meals program”",
      ],
    },
    "burnaby-first": {
      color: { brand: "#1aa3c4", ink: "#0e7490", inkDark: "#5cc8e0", src: "party-first-home" },
      tagline: { text: "A clear alternative at City Hall.", src: ["party-first-home"] },
      stances: {
        taxes: { text: "“Open the books on major capital projects”; “Slow the property tax hikes”", src: ["party-first", "party-first-home"] },
        housing: { text: "“Rezone to reflect neighbourhood character”; more on-site parking; make it easier to add a suite or laneway home", src: ["party-first"] },
        safety: { text: "Hire more police; “Pause the approval of new low-barrier supportive housing projects”; no-drugs and no-weapons rules; more treatment and recovery", src: ["party-first"] },
        hospital: null,
        schools: { text: "“Plan schools and amenities alongside growth” (no trustee candidates)", src: ["party-first"] },
      },
      name: "Burnaby First",
      lean: null,
      role: "Challenger",
      short: "Burnaby First",
      website: "https://burnabyfirst.ca/",
      platform: "party-first",
      context: [
      ],
      says: [
        "“Open the books on major capital projects”, require “independent peer reviews”, “Hold Council accountable for cost overruns”",
        "Hire more police officers",
        "“Pause the approval of new low-barrier supportive housing projects”; “Establish clear no-(illicit)drugs and no-weapons rules”",
        "“Rezone to reflect neighbourhood character”; “Require more on-site parking where permitted”",
      ],
      more: [
        "“Hold regular public town halls” and “Create a public question period at Council meetings”",
        "“Provide semi-annual financial reports”",
        "“Expand access to treatment and recovery services”",
        "“Protect and properly maintain our parks and trails”; “Restore and expand our urban forest”",
        "“Cut red tape and permitting delays”; “Create a one-stop business support system”",
        "“Make it easier to add a suite or laneway home”",
        "“Build more soccer fields and recreation facilities”; “Make Swangard Stadium a hub for live events”",
      ],
    },
    "green": {
      color: { brand: "#3e9a35", ink: "#2f7a28", inkDark: "#7bd16f", src: "party-green-home" },
      tagline: { text: "A completely independent Party working inside Burnaby, for Burnaby residents.", src: ["party-green-home"] },
      stances: {
        taxes: null,
        housing: { text: "1,500+ non-market rental homes a year; 40,000 purpose-built rentals by 2050; “Never sell public land”", src: ["party-green"] },
        safety: { text: "A non-police response for non-violent mental-health and wellness calls", src: ["party-green"] },
        hospital: { text: "Advocate for completing Phase 2", src: ["party-green"] },
        schools: null,
      },
      name: "Burnaby Green Party",
      lean: [{ label: "Centre-left", src: ["wiki-green"] }],
      role: "Challenger",
      short: "Burnaby Greens",
      website: "https://burnabygreenparty.com/",
      platform: "party-green",
      context: [
        { text: "Describes itself as independent of the provincial and federal Green parties.", src: ["party-green-home"] },
        { text: "Councillor Joe Keithley, first elected as a Green, joined the BCA in December 2025.", src: ["freshet-bca-slate"] },
      ],
      says: [
        "Use the Burnaby Housing Authority to build 1,500+ non-market rental homes a year",
        "Make buses at least 20% faster at peak times within 2 years",
        "A connected sidewalk on every street within 5 years",
        "A non-police response for non-violent mental-health and wellness calls",
      ],
      more: [
        "Grow purpose-built rentals to 40,000 by 2050, with non-market housing at 20% of all homes",
        "“Never sell public land”",
        "A bench and shelter at every bus stop by 2030; complete the initial Major Cycling Network within 3 years",
        "Support north-south rapid transit, including upgrading the R2 to bus rapid transit",
        "Advocate for Burnaby Hospital Phase 2",
        "A Heat Resilience Strategy and cooling bylaw; clean-air spaces during wildfire smoke",
        "Tree canopy of 40% city-wide by 2050",
        "A low-income transit pass",
        "Publish annual progress reports and “Report honestly when targets are not being met”",
      ],
    },
    "new-burnaby": {
      color: { brand: "#dd1a60", ink: "#b8124c", inkDark: "#f47aa5", src: "party-newburnaby-home" },
      tagline: { text: "Safer Communities, Affordable Living & Responsible Growth.", src: ["party-newburnaby-home"] },
      stances: {
        taxes: { text: "“A 0% increase” in the first budget, then no more than inflation over four years", src: ["party-newburnaby"] },
        housing: null,
        safety: { text: "Ban illicit drug use in “public spaces and all government-funded housing”", src: ["party-newburnaby"] },
        hospital: { text: "Demand the province give “a start date” and the funds", src: ["party-newburnaby"] },
        schools: null,
      },
      name: "New Burnaby Party",
      lean: null,
      role: "Challenger",
      short: "New Burnaby",
      website: "https://newburnaby.ca/",
      platform: "party-newburnaby",
      context: [
        { text: "Includes current councillor Richard T. Lee, elected in 2022 with One Burnaby and described by the Vancouver Sun as \"the sole opposition councillor\".", src: ["freshet-council-race", "sun-giant"] },
        { text: "Council candidate David Xie says he is no longer seeking a council seat, though his name is still on the ballot.", src: ["dailyhive-xie"] },
      ],
      says: [
        "Limit the first budget's property tax change to “a 0% increase”, then keep increases at or below inflation over four years",
        "Ban illicit drug use in “public spaces and all government-funded housing”",
        "Fast-track permits so no daycare, renovation or small business “should wait months for an answer”",
        "Burnaby Hospital Phase 2: demand the province give “a start date”",
      ],
      more: [
        "Use “modern technology to allocate police resources more efficiently”",
        "Reduce business licence renewal fees; more zoning flexibility for local businesses",
        "Shorter waits at red lights “using smart sensors”; temporary pick-up and delivery zones",
        "“Access to a local park within a five-minute walk”; oppose reductions to existing parks",
        "Council “works with the province, not for the province”",
      ],
    },
    "restore": {
      color: { brand: "#1f4070", ink: "#1f4070", inkDark: "#93b4ea", src: "party-restore-home" },
      tagline: { text: "Demand accountability from our municipal governments and seriously address public safety concerns.", src: ["party-restore-home"] },
      stances: {
        taxes: { text: "Opposes the “perpetual increase of property tax”", src: ["party-restore"] },
        housing: { text: "“Blanket zoning threatens the sustainability of our neighborhoods”; supports “affordable housing for lower-income families”", src: ["party-restore"] },
        safety: { text: "“Firmly reject” open, supervised or concealed consumption of hard drugs; no “co-location of incompatible facility within residential area”", src: ["party-restore"] },
        hospital: null,
        schools: { text: "“Oppose gender education that is not suitable for children's age”; keep “partisan politics and ideology out of the classroom”", src: ["party-restore-edu"] },
      },
      name: "Restore Burnaby Alliance",
      lean: null,
      role: "Challenger",
      short: "Restore Burnaby",
      website: "https://www.restoreburnaby.ca/",
      platform: "party-restore",
      context: [
      ],
      says: [
        "“Firmly reject” open, supervised or concealed consumption of hard drugs in Burnaby",
        "Opposes the “perpetual increase of property tax”",
        "“Blanket zoning threatens the sustainability of our neighborhoods”",
        "Schools: “Oppose gender education that is not suitable for children's age”",
      ],
      more: [
        "Prohibit “co-location of incompatible facility within residential area”",
        "Supports “affordable housing for lower-income families”",
        "“Adopt a comprehensive economic strategy to attract investment and entrepreneurs”",
        "Opposes “taxpayer-funded, municipally run daycare centers” competing with independent providers",
        "“Community-based Traditional Chinese Medicine and acupuncture clinics”",
        "“Protect parents' rights and access to information”",
        "Schools: “Keeping partisan politics and ideology out of the classroom”; “Support schools in prioritizing academic excellence”",
      ],
      moreSrc: ["party-restore", "party-restore-edu"],
    },
  },

  // Neutral colour for independents (no party branding).
  independentColor: { brand: "#64748b", ink: "#475569", inkDark: "#cbd5e1" },

  // Topics for the party comparison table on the Parties page.
  compareTopics: [
    { id: "taxes", label: "Property taxes", issue: "taxes" },
    { id: "housing", label: "Housing", issue: "housing" },
    { id: "safety", label: "Public safety & drug use", issue: "safety" },
    { id: "hospital", label: "Burnaby Hospital", issue: "hospital" },
    { id: "schools", label: "Schools", issue: "schools" },
  ],

  // ---------------------------------------------------------------------------
  // Per-candidate curation, keyed by the id in data/profiles.js.
  //   points  - 2-4 short items taken from the candidate's own statement
  //   flags   - badges: incumbent | provincial | withdrawn
  //   notes   - factual, sourced context. No opinions.
  // ---------------------------------------------------------------------------
  candidates: {
    // ----- Mayor -----
    "mayor-michaelangelo-abcrobinhood": {
      points: ["Nearly 40-year resident; runs painting and renovation businesses; does free small repairs for seniors and people with disabilities", "Donate 100% of the mayor's salary to school lunches, single parents and people in need", "10% property-tax discount for seniors, and for homeowners who grow fruit and vegetables", "Cut tuition and student-housing costs by 50%", "Oppose injection sites; build recovery centres outside urban centres; expand senior-care homes"],
      notes: [
        { kind: "jurisdiction", text: "Tuition at public colleges and universities is set by each institution's board, within a provincial cap of 2% a year, not by the City.", src: ["bc-tuition"] },
        { kind: "jurisdiction", text: "Health services, including addiction treatment and recovery beds and publicly funded care homes, are mainly delivered by the Province's health authorities (here, Fraser Health).", src: ["bc-health-plan", "city-homelessness"] },
        { kind: "jurisdiction", text: "Property tax relief for seniors currently comes from the Province's additional Home Owner Grant for owners 65 and older.", src: ["bc-hog-seniors"] },
      ],
    },
    "mayor-sabina-hsu": {
      points: ["Committee oversight aimed at lowering property taxes", "Expand remote AI diagnostics", "Strict smoking bylaws to protect green spaces and reduce wildfire risk", "Sign language and AI/science courses in local schools"],
      notes: [
        { text: "Her City profile opens with the words “Action One”.", src: ["city-profiles-mayor"] },
        { kind: "jurisdiction", text: "Health services such as diagnostics are mainly delivered by the Province's health authorities (here, Fraser Health), not the City.", src: ["bc-health-plan"] },
      ],
    },
    "mayor-mike-hurley": {
      flags: ["incumbent"],
      points: ["1,000 new affordable rental homes", "Three new community centres; finish the RCMP detachment expansion", "A “Burnaby Innovation District” for business investment and jobs", "Press the province to return zoning control and repeal Bill 44"],
      notes: [
        { text: "Mayor since 2018; re-elected by acclamation (no opponent) in 2022.", src: ["freshet-bca-slate", "dailyhive-hurley"] },
        { text: "No elector organization is listed for him. The BCA is not running a mayoral candidate, and several BCA candidates say they have worked alongside him.", src: ["city-profiles-mayor", "freshet-bca-slate", "city-profiles-council"] },
        { text: "Platform also includes keeping the city debt-free and taxes at or below the regional average, and relocating the Buller Ave. temporary shelter when its lease ends in 2028.", src: ["dailyhive-hurley"] },
      ],
    },
    "mayor-bill-petrovas": {
      points: ["Improve transportation and infrastructure", "Attract corporate headquarters and well-paying jobs", "Expand rent-to-own housing", "Background: teacher, principal, COO of BC Diabetes"],
    },
    "mayor-hanzhi-wang": {
      points: ["Allow more “missing-middle” density and mixed-use development", "Invest in public spaces and cultural events", "Better streets and transit for walking, biking, bus and driving", "Taxes that are “fair for everyone”"],
    },
    "mayor-heymann-yip": {
      points: ["Co-founder of Burnaby First; 35 years in business", "Budget management and job creation", "Founded “Save Burnaby Parks & Green Spaces” (Fraser Foreshore Park wetlands)", "Past member of Burnaby's Public Safety and RCMP community policing committees"],
    },

    // ----- Council -----
    "council-akmal-bazarov": { points: ["An “Open Budget Initiative” so residents can propose neighbourhood projects", "Promote Burnaby for investment, tourism and technology", "Workable housing and fair parking policies", "Promote Canadian products and services"] },
    "council-natalia-bember": { points: ["Ramps in older buildings", "Roads and sidewalks that work", "A voice for seniors, families and disabled residents", "Founder of the Access World Foundation; uses a mobility scooter"] },
    "council-jessica-cai": { points: ["Licensed acupuncturist and TCM practitioner since 2007", "A safer Burnaby and a healthy environment for children", "Quality of life for seniors", "Responsible development"] },
    "council-neil-chapman": { points: ["Runs three businesses", "Accountable taxation", "Efficient public services", "“Practical policies for the people keeping this city running”"] },
    "council-allen-chen": { points: ["Doctor of Medicine; founded seven senior day programs for people with dementia", "More community-based medical clinics, using City-owned space for non-profit providers", "Advocate for Burnaby Hospital Phase 2", "Senior services, safer streets, parks"] },
    "council-daniel-chen": { points: ["Co-founder of Burnaby First; 20+ years in branding", "Sound planning and fiscal responsibility", "Keep property taxes from overburdening residents and businesses", "Represent families and young adults"] },
    "council-daniel-cheung": { points: ["Former longshoreman executive and ship captain", "60-day notice and a public town hall for all provincial housing/shelter projects", "Require councillors to answer residents' concerns in public sessions", "Stop concentrating supportive facilities in working-class transit corridors"] },
    "council-larry-chin": { points: ["30+ year resident; engineer and tech company founder", "Serves on Burnaby's Public Art Committee", "“Independent thinking”", "Finding common ground"] },
    "council-avtar-dhinsa": { points: ["Lawyer practising in Burnaby for nearly 30 years; teaches business and real estate law", "“Practical, thoughtful, and accountable local leadership”", "Keep Burnaby livable and fair for families, seniors and local businesses"] },
    "council-rocky-dong": { points: ["Freeze property tax increases for four years", "Oppose drug-use housing developments", "Oppose major projects built without community consultation", "Job creation and community safety"] },
    "council-ryan-erwin": { points: ["Heiltsuk First Nation lawyer, born and raised in Burnaby", "Pro bono legal support for seniors (Seniors First BC)", "Provincial constituency advisor in Burnaby", "“Results-oriented, community-first approach”"] },
    "council-tina-fiorda": { points: ["26 years as a costume designer in film and TV", "Major projects should be effective, affordable and accountable", "“Meet the need. Know the cost. Make sure it works.”", "Public safety and local economy"] },
    "council-gulam-firdos": {
      points: ["City planner; former Board of Variance member", "Faster building permit approvals and a better Official Community Plan", "Social housing for low-income residents, families and seniors", "Better local health care and crime prevention"],
      notes: [{ text: "Describes himself as running “as an Independent Liberal”. No elector organization is listed for him on the City's profile.", src: ["city-profiles-council"] }],
    },
    "council-joel-gibbs": { points: ["Build 1,500+ non-market rental homes a year", "Make transit 20% faster within 2 years", "A sidewalk on every street within 5 years", "A connected cycling network by 2030"] },
    "council-garnet-heidt": { points: ["Running “no party, no slate”", "Financial accountability", "Community engagement", "Responsible growth"] },
    "council-darren-inouye": { points: ["Software developer, grew up in Burnaby", "Special Olympics BC Leadership Council volunteer", "Recreation programs", "A Burnaby “that makes room for everyone” at every stage of life"] },
    "council-joe-keithley": {
      flags: ["incumbent"],
      points: ["Seeking a third term", "Affordable housing and child care", "Helping vulnerable residents", "Created the Harmony for All music program; chairs the Environment Committee"],
      notes: [{ text: "First elected with the Burnaby Green Party; joined the BCA in December 2025.", src: ["freshet-bca-slate"] }],
    },
    "council-martin-kendell": { points: ["Founded the Clean Up Burnaby Campaign", "“Honesty, accountability and community involvement” at City Hall", "Advocated for an LED light-pollution bylaw", "Responsible spending"] },
    "council-cindy-lee": { points: ["Lawyer; six years at S.U.C.C.E.S.S. helping newcomers and seniors", "Champion workers and families", "Support local businesses", "Strengthen accountability"] },
    "council-lynette-hyerin-lee": { points: ["Public-sector experience in healthcare and policy; founded Care Without Barriers", "Safer neighbourhoods and responsible growth", "Stronger language access", "Careful stewardship of public resources"] },
    "council-richard-t-lee": {
      flags: ["incumbent"],
      points: ["Current councillor; MLA for Burnaby North for 16 years", "Make Burnaby “safer and more affordable for families”", "22 years at TRIUMF before politics"],
      notes: [
        { text: "Current councillor, elected in 2022 with One Burnaby; the only councillor not from the BCA.", src: ["city-council-members", "freshet-council-race", "sun-giant"] },
        { text: "Former B.C. Liberal MLA.", src: ["sun-giant"] },
      ],
    },
    "council-jason-martin": { points: ["Capital projects shouldn't be an automatic reason to raise taxes", "Question waste; scale back programs that don't serve Burnaby as a whole", "Protect parks and trees", "Vice-president of a 280-unit strata"] },
    "council-carrie-mclaren": { points: ["Board member of her housing co-op", "Expand affordable housing", "Local climate action", "“Housing is a human right”"] },
    "council-nash-milani": { points: ["Former city employee; former federal Green candidate", "Fix recreation centres; reduce traffic", "Reject development without substantive amenities", "End city partnerships with American companies"] },
    "council-ragina-naidu": { points: ["Scientist (cancer drug research) and business leader", "Affordability and responsible use of tax dollars", "Community safety", "Support for seniors and families"] },
    "council-morgan-nicholsfigueiredo": { points: ["Third-generation resident; 30 years managing commercial property", "Resident member of the Burnaby Transportation Committee", "Non-profit and co-op housing alongside responsible growth", "Climate resilience and green space"] },
    "council-rea-park": { points: ["Constituency advisor; BCGEU member", "Founder of CANAREA (youth, newcomer and senior programs)", "Endorsed by the New Westminster & District Labour Council", "Bring “a resident voice” to City Hall"] },
    "council-janet-poon": { points: ["Former financial regulator in Hong Kong", "Residents should be “heard early”", "Affordability and safer communities", "Transparent, accountable government"] },
    "council-fiorella-ravelli": { points: ["Born and raised in Burnaby; advises businesses on employment law", "“A long-term lens” on planning decisions", "Efficient, transparent use of public funds"] },
    "council-konstantine-roccas": { points: ["Get more young people involved in local decisions", "New ideas at City Hall", "Promises to respond to every message"] },
    "council-maita-santiago": {
      flags: ["incumbent"],
      points: ["First elected in 2022", "Affordable housing, accessibility and climate action", "Chairs the Access Advisory Committee; on the Library Board", "Advocates for seniors, youth, women, newcomers and working families"],
    },
    "council-tara-shushtarian": { points: ["Environmental, social justice and Indigenous rights activist", "Affordable housing", "Transit accessibility", "Safe community spaces and parks"] },
    "council-kiran-singh": { points: ["Former CBC investigative and municipal reporter", "Investment in arts and recreation", "“Increased political accountability”", "Equitable transit and active transportation"] },
    "council-philip-stojanovski": { points: ["Workplace investigator", "Better traffic flow", "Safer streets for walking, biking and driving", "Better planning before approving large buildings"] },
    "council-tom-tao": { points: ["82 years old", "A “senior friendly” Burnaby", "Emergency plans to protect water and food", "Better escape tools in high-rises; a winter night market"] },
    "council-daniel-tetrault": {
      flags: ["incumbent"],
      points: ["Former teacher and Burnaby Teachers' Association president", "Cut swimming-lesson waitlists; build more sidewalks", "Fast-track affordable housing"],
    },
    "council-vincent-tong": { points: ["BC Public Service professional (homelessness, disability, healthcare)", "“Safe communities - no drug houses”", "Affordability and lower taxes", "Keep green space"] },
    "council-neha-unadkat": { points: ["Founding director of the Burnaby Builders and Developers Association", "Responsible, transparent spending", "Make Burnaby Hospital Phase 2 a priority", "Apprenticeships and career pathways"] },
    "council-mary-b-villa-y-battenberg": { points: ["Non-profit professional; licensed financial professional", "Organized 200+ community events", "Bring people together and turn community ideas into action"] },
    "council-james-wang": {
      flags: ["incumbent"],
      points: ["On council since 2014; previously two terms as school trustee", "Keep property tax increases “among the lowest in the region”", "Housing affordability, climate action, community safety"],
    },
    "council-david-xie": {
      flags: ["withdrawn", "provincial"],
      points: ["Recruitment and executive search background", "Advocated for Burnaby Hospital Phase 2", "Transparency and meaningful consultation"],
      notes: [
        { text: "Said on October 2 that he is “no longer seeking a seat on City Council”. It was too late to remove his name, so it is still on the ballot.", src: ["dailyhive-xie"] },
        { text: "Is the BC Conservative candidate for Burnaby South-Metrotown in the October 24 provincial election.", src: ["ebc-candidates", "dailyhive-xie"] },
        { text: "Provincial law bars someone from serving as both an MLA and a municipal elected official.", src: ["dailyhive-xie"] },
      ],
    },
    "council-sabrina-yang": { points: ["Realtor since 2011; parent of two", "Accountable leadership that listens", "Keep Burnaby safe, affordable and inclusive"] },

    // ----- School trustee -----
    "trustee-stephen-andrada": { points: ["Works on newcomer settlement and job training", "Public education with “minimum barriers”", "Parent of Burnaby public school graduates"] },
    "trustee-hillary-bergshoeff": { points: ["Labour activist and parent", "A “fully funded public education system”", "Has worked on AI and new-technology policy (BC Federation of Labour committee)"] },
    "trustee-bill-brassington": {
      flags: ["incumbent"],
      points: ["Second-term trustee and former board chair", "Chaired the district's audit sub-committee", "Schools where children feel “safe, supported, and valued”"],
    },
    "trustee-jen-jang": { points: ["Parent; president and treasurer of a 340+ home strata", "Concerned about overcrowding and cuts to counselling and other programs", "Inclusive schools"] },
    "trustee-paul-kwon": { points: ["Former chair of the Burnaby District Parent Advisory Council", "Protect student supports", "Plan school space as Burnaby grows", "Make budget decisions “openly and responsibly”"] },
    "trustee-jen-mezei": {
      flags: ["incumbent"],
      points: ["Seeking a third term; current vice-chair", "Transparency in governance; equitable funding", "Support for students with disabilities and diverse learning needs"],
    },
    "trustee-jasmine-nicholsfigueiredo": { points: ["Parent and teacher", "Restore Grade 7 band", "Stronger mental health supports", "Support for diverse learning needs"] },
    "trustee-diane-pearce": { points: ["Lunch hour supervisor in School District 41", "Parent of a child with autism", "Managed a hot lunch program for students with learning difficulties"] },
    "trustee-kristin-schnider": {
      flags: ["incumbent"],
      points: ["Current trustee and board chair", "Equitable funding for public education", "Community school model and accessible childcare"],
    },
    "trustee-benita-sun": { points: ["Ran a family daycare for 10 years", "“Putting students first”; student safety", "Opposes “drugs and harmful experiments that put children at risk”", "Bring parents' voices to the board"] },
    "trustee-daisy-wei": { points: ["Founder of an early learning centre", "Student well-being and quality education", "Transparency and accountability", "Partnerships between schools and families"] },
    "trustee-john-wong": { points: ["Engineer; Navy League board member", "“Practicality instead of ideology” in education", "“Authentic, family-centered perspectives” on the board"] },
    "trustee-haini-xiao": { points: ["Legal and civic literacy plus substance-abuse prevention", "Direct resources to Parent Advisory Councils", "Expand STEM, coding and robotics programs"] },
    "trustee-jenny-yamagata": {
      flags: ["provincial"],
      points: ["Improve mental health supports", "Revitalize Grade 7 band", "“Reinstate fiscal responsibility”", "Running as an independent"],
      notes: [{ text: "Is also the OneBC candidate for Burnaby North in the October 24 provincial election.", src: ["ebc-candidates", "ebc-yamagata"] }],
    },
    "trustee-angel-yeh": { points: ["Early childhood educator", "Children's well-being, belonging and learning", "Build trust with families and educators"] },
    "trustee-colin-zuo": { points: ["Former Vancouver Community College board member", "Predictable provincial funding for classroom supports", "Plan for the schools Burnaby needs as it grows", "Endorsed by the New Westminster & District Labour Council"] },
  },

  // ---------------------------------------------------------------------------
  // Signature tags: exactly two per candidate, shown on their card. Each names
  // a specific promise or background fact from the candidate's OWN statement,
  // in plain words. No adjectives or characterizations (see CONTRIBUTING.md).
  // ---------------------------------------------------------------------------
  signature: {
    "mayor-michaelangelo-abcrobinhood": ["Donate mayor's salary", "Cut tuition costs 50%"],
    "mayor-sabina-hsu": ["Launched a Block Watch", "Remote AI diagnostics"],
    "mayor-mike-hurley": ["1,000 affordable rentals", "Repeal Bill 44"],
    "mayor-bill-petrovas": ["Rent-to-own housing", "Former school principal"],
    "mayor-hanzhi-wang": ["Missing-middle housing", "Mixed-use development"],
    "mayor-heymann-yip": ["Founded Save Burnaby Parks", "35 years in business"],

    "council-akmal-bazarov": ["Open Budget Initiative", "Promote Canadian products"],
    "council-natalia-bember": ["Ramps in older buildings", "Mobility scooter user"],
    "council-jessica-cai": ["Acupuncturist since 2007", "Senior quality of life"],
    "council-neil-chapman": ["Runs three businesses", "Accountable taxation"],
    "council-allen-chen": ["Doctor of Medicine", "More community clinics"],
    "council-daniel-chen": ["Burnaby First co-founder", "Branding professional"],
    "council-daniel-cheung": ["60-day notice for shelters", "Former ship captain"],
    "council-larry-chin": ["Engineer", "Public Art Committee"],
    "council-avtar-dhinsa": ["Burnaby lawyer", "Teaches business law"],
    "council-rocky-dong": ["4-year tax freeze", "Opposes drug-use housing"],
    "council-ryan-erwin": ["Heiltsuk First Nation lawyer", "Pro bono for seniors"],
    "council-tina-fiorda": ["\"Know the cost\"", "Former costume designer"],
    "council-gulam-firdos": ["City planner", "Faster building permits"],
    "council-joel-gibbs": ["1,500+ non-market homes a year", "Sidewalks on every street"],
    "council-garnet-heidt": ["\"No party, no slate\"", "Works in pest control"],
    "council-darren-inouye": ["Software developer", "Special Olympics volunteer"],
    "council-joe-keithley": ["Created Harmony for All", "Chairs Environment Committee"],
    "council-martin-kendell": ["Founded Clean Up Burnaby", "LED light-pollution bylaw"],
    "council-cindy-lee": ["Lawyer", "6 years at S.U.C.C.E.S.S."],
    "council-lynette-hyerin-lee": ["Language access", "Founded Care Without Barriers"],
    "council-richard-t-lee": ["MLA for 16 years", "22 years at TRIUMF"],
    "council-jason-martin": ["Scrutinize capital spending", "Strata vice-president"],
    "council-carrie-mclaren": ["Housing co-op board member", "\"Housing is a human right\""],
    "council-nash-milani": ["Fund the MJF Theatre", "Former city employee"],
    "council-ragina-naidu": ["Cancer drug researcher", "Put residents first"],
    "council-morgan-nicholsfigueiredo": ["Transportation Committee member", "Non-profit & co-op housing"],
    "council-rea-park": ["Founded CANAREA", "BCGEU member"],
    "council-janet-poon": ["Former financial regulator", "Hear residents early"],
    "council-fiorella-ravelli": ["Long-term planning lens", "Employment law advisor"],
    "council-konstantine-roccas": ["Involve young people", "Replies to every message"],
    "council-maita-santiago": ["Chairs Access Advisory Committee", "Library Board representative"],
    "council-tara-shushtarian": ["Free transit for kids campaign", "Climate activist"],
    "council-kiran-singh": ["Former CBC reporter", "Speaks four languages"],
    "council-philip-stojanovski": ["Better traffic flow", "Workplace investigator"],
    "council-tom-tao": ["Senior-friendly city", "High-rise escape planning"],
    "council-daniel-tetrault": ["Former teachers' association president", "Shorter swim waitlists"],
    "council-vincent-tong": ["\"No drug houses\"", "BC Public Service"],
    "council-neha-unadkat": ["Hospital Phase 2 priority", "Builders association founding director"],
    "council-mary-b-villa-y-battenberg": ["200+ community events", "Non-profit professional"],
    "council-james-wang": ["On council since 2014", "Former school trustee"],
    "council-david-xie": ["Recruitment professional", "Hospital Phase 2 advocate"],
    "council-sabrina-yang": ["Realtor since 2011", "Parent of two"],

    "trustee-stephen-andrada": ["Newcomer settlement work", "Low-barrier education"],
    "trustee-hillary-bergshoeff": ["Labour activist", "AI policy experience"],
    "trustee-bill-brassington": ["Former board chair", "Chaired audit committee"],
    "trustee-jen-jang": ["Strata president", "Concerned about overcrowding"],
    "trustee-paul-kwon": ["Former DPAC chair", "Open budget decisions"],
    "trustee-jen-mezei": ["Current vice-chair", "Disability inclusion"],
    "trustee-jasmine-nicholsfigueiredo": ["Restore Grade 7 band", "Teacher"],
    "trustee-diane-pearce": ["Lunch hour supervisor", "Parent of a child with autism"],
    "trustee-kristin-schnider": ["Current board chair", "Community school model"],
    "trustee-benita-sun": ["\"Putting students first\"", "Ran a family daycare"],
    "trustee-daisy-wei": ["Early learning centre founder", "Transparency"],
    "trustee-john-wong": ["\"Practicality instead of ideology\"", "Navy League board"],
    "trustee-haini-xiao": ["STEM & robotics access", "Fund PACs directly"],
    "trustee-jenny-yamagata": ["Revitalize Grade 7 band", "Mental health supports"],
    "trustee-angel-yeh": ["Early childhood educator", "Children first"],
    "trustee-colin-zuo": ["Predictable provincial funding", "Former VCC governor"],
  },

  // ---------------------------------------------------------------------------
  // Issues. `facts` are sourced background. Party positions come from
  // GUIDE.orgs[...].stances (shared with the Parties comparison table).
  // `candidates` are examples of individual candidates who have spoken to the
  // issue in their own statement or in coverage; not a complete list.
  // ---------------------------------------------------------------------------
  issues: [
    {
      id: "housing",
      icon: "home",
      title: "Housing & multiplexes (Bill 44)",
      summary: "Provincial law now requires cities to allow 3-6 homes on most single-family lots. Candidates disagree about that and about how much new housing the city should build itself.",
      facts: [
        { text: "Bill 44 (2023) requires municipalities over 5,000 people to allow at least 3 units on lots of 280 m² or less, at least 4 on larger lots, and 6 near frequent bus service.", src: ["bc-ssmuh"] },
        { text: "Bill 25 (2025) tightened those rules; cities had until June 30, 2026 to update bylaws.", src: ["bc-ssmuh"] },
      ],
      candidates: [
        { id: "mayor-mike-hurley", text: "Wants the province to “repeal Bill 44” and return zoning control to the city; 1,000 new affordable rental homes.", src: ["city-profiles-mayor"] },
        { id: "mayor-hanzhi-wang", text: "Allow “more missing-middle density and mixed-use developments”.", src: ["city-profiles-mayor"] },
        { id: "mayor-bill-petrovas", text: "Expand rent-to-own housing.", src: ["city-profiles-mayor"] },
        { id: "council-daniel-cheung", text: "60 days' notice and a public town hall for all provincial housing and shelter projects.", src: ["city-profiles-council"] },
      ],
      further: ["multiliving"],
    },
    {
      id: "taxes",
      icon: "receipt",
      title: "Property taxes & city finances",
      summary: "Burnaby raised property taxes 2.9% for 2026. Its plan pencils in larger increases after that. Candidates range from tax freezes to keeping increases near the regional average.",
      facts: [
        { text: "Council approved a 2.9% property tax increase for 2026 - about $61 for an average home. The draft plan had needed 6.05% before savings and new revenue.", src: ["city-budget-2026"] },
        { text: "Water rates stayed flat and sewer rose 3.5%, even though Metro Vancouver's charges rose faster; the City covered the gap from reserves.", src: ["city-budget-2026"] },
        { text: "The five-year plan projects 7% annual increases for 2027-2030, to be reassessed each year. 2026 capital spending ($506.8 million) is funded from reserves rather than debt.", src: ["city-budget-2026"] },
      ],
      candidates: [
        { id: "mayor-mike-hurley", text: "Keep the city debt-free and taxes at or below the regional average.", src: ["dailyhive-hurley"] },
        { id: "council-rocky-dong", text: "Freeze property tax increases for four years.", src: ["city-profiles-council"] },
        { id: "council-jason-martin", text: "Capital projects shouldn't be “an automatic reason to raise taxes”.", src: ["city-profiles-council"] },
        { id: "council-james-wang", text: "Keep property tax increases “among the lowest in the region”.", src: ["city-profiles-council"] },
      ],
    },
    {
      id: "hospital",
      icon: "hospital",
      title: "Burnaby Hospital Phase 2",
      summary: "The province cancelled the construction contract for the hospital's next phase in April 2026. Hospitals are a provincial responsibility, but many local candidates say they'll press for it.",
      facts: [
        { text: "The province paused Phase 2 in February 2026 and cancelled the development agreement in late April, citing fiscal pressures.", src: ["freshet-hospital"] },
        { text: "Premier David Eby said the expansion will still go ahead, but gave no completion date.", src: ["ctv-hospital"] },
        { text: "Fraser Health says about $50 million was spent under the cancelled agreement.", src: ["freshet-hospital-50m"] },
      ],
      candidates: [
        { id: "mayor-mike-hurley", text: "“Fight to get the Burnaby Hospital redevelopment back on track.”", src: ["city-profiles-mayor"] },
        { id: "council-allen-chen", text: "Advocate for Phase 2; more community clinics to attract family doctors.", src: ["city-profiles-council"] },
        { id: "council-neha-unadkat", text: "Making Phase 2 a priority is “a key focus”.", src: ["city-profiles-council"] },
        { id: "council-david-xie", text: "Has spoken for completing Phase 2.", src: ["city-profiles-council"] },
      ],
    },
    {
      id: "safety",
      icon: "shield",
      title: "Shelters, supportive housing & drug use",
      summary: "Shelter and supportive-housing locations have drawn large protests. Some parties want to pause or restrict these projects. Others focus on health-based responses.",
      facts: [
        { text: "BC Housing (provincial) - not the City - is primarily responsible for building, funding and running shelters and supportive housing. The City advocates and sometimes provides land.", src: ["city-homelessness"] },
        { text: "The most recent count found 205 people experiencing homelessness in Burnaby, 97 of them unsheltered.", src: ["city-homelessness"] },
        { text: "BC Housing dropped a proposed 50-unit supportive and complex-care building at 5389 Imperial St. in February 2026 after protests.", src: ["freshet-imperial"] },
        { text: "The City says the temporary shelter at 7320 Buller Ave. will be removed for a park when its lease ends in 2028.", src: ["city-homelessness"] },
      ],
      candidates: [
        { id: "mayor-mike-hurley", text: "Relocate the Buller Ave. shelter when its lease ends; finish the RCMP detachment expansion.", src: ["dailyhive-hurley"] },
        { id: "mayor-michaelangelo-abcrobinhood", text: "Oppose injection sites; build recovery centres outside urban centres.", src: ["city-profiles-mayor"] },
        { id: "council-daniel-cheung", text: "Stop concentrating supportive facilities in working-class transit corridors.", src: ["city-profiles-council"] },
        { id: "council-vincent-tong", text: "“No drug houses”, with “practical, compassionate solutions” to homelessness.", src: ["city-profiles-council"] },
      ],
    },
    {
      id: "schools",
      icon: "school",
      title: "Schools (trustee race)",
      summary: "Trustee candidates talk about crowding, cuts to programs like Grade 7 band, mental-health supports, and sexual orientation and gender identity (SOGI) education.",
      facts: [
        { text: "The seven-member Board of Education sets procedures for Burnaby's public schools and oversees the district budget.", src: ["sd41-board"] },
      ],
      candidates: [
        { id: "trustee-jen-jang", text: "Concerned about overcrowding and cuts to counselling and other programs.", src: ["city-profiles-trustee"] },
        { id: "trustee-jasmine-nicholsfigueiredo", text: "Restore Grade 7 band; stronger mental-health supports.", src: ["city-profiles-trustee"] },
        { id: "trustee-haini-xiao", text: "Substance-abuse prevention, funding to parent advisory councils, more STEM and robotics.", src: ["city-profiles-trustee"] },
        { id: "trustee-jenny-yamagata", text: "Mental-health supports and revitalizing Grade 7 band.", src: ["city-profiles-trustee"] },
        { id: "trustee-diane-pearce", text: "Support for families and students with learning needs.", src: ["city-profiles-trustee"] },
      ],
    },
  ],
};
