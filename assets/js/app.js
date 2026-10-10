/* Burnaby Votes 2026 - renders the guide from the files in data/.
   No frameworks, no build step. */
(function () {
  "use strict";

  var G = window.GUIDE;
  var P = window.PROFILES;
  var OPS = window.OPINIONS || {};
  var POLLS = window.POLLS || [];

  var OFFICES = {
    mayor: { label: "Mayor", plural: "Mayor", seats: G.election.seats.mayor, src: "city-profiles-mayor" },
    council: { label: "Council", plural: "City Council", seats: G.election.seats.council, src: "city-profiles-council" },
    trustee: { label: "Trustee", plural: "School Trustees", seats: G.election.seats.trustee, src: "city-profiles-trustee" },
  };
  var FLAGS = {
    incumbent: { text: "Incumbent", cls: "strong" },
    withdrawn: { text: "Says no longer running", cls: "warn" },
    provincial: { text: "Also on provincial ballot", cls: "warn" },
  };
  // Topic tags are derived from each candidate's key points (which come from
  // their own statement) using the same whole-word keyword rules for everyone.
  var TOPICS = [
    ["Housing", /\bhous(ing|e)\b|\brental|\bhomes?\b|multiplex|density|missing-middle|co-op\b|rent-to-own/i],
    ["Budget & taxes", /\btax(es)?\b|\bbudget|\bspending|\bfiscal|tax dollars|public funds|waste\b|capital projects|cost overruns|\bcost\b|\bfunding\b/i],
    ["Public safety", /\bsafer (burnaby|communit|neighbou?rhoods|streets)|\bcrime|\bpolice|\brcmp\b|\bdrugs?\b|injection sites|community safety|public safety|safe communities/i],
    ["Transit & roads", /\btransit\b|\btraffic|\bbus(es)?\b|sidewalks?|cycling|\bbiking\b|\broads\b|\bstreets\b|transportation/i],
    ["Parks & environment", /\bparks?\b|green spaces?|\btrees?\b|\bclimate|environmental|canopy|wetlands?/i],
    ["Health care", /health ?care|hospital|clinics?\b|doctor|medical|dementia|diagnostics/i],
    ["Seniors", /\bseniors?\b/i],
    ["Families & child care", /child ?care|daycare|\bfamilies\b|family-centered/i],
    ["Jobs & business", /\bbusiness(es)?\b|\bjobs?\b|\beconomy\b|investment|apprenticeships?|corporate headquarters|innovation district/i],
    ["Accountability", /accountab|transparen|consultation|town hall|answer residents|heard early|open budget|\baudit/i],
    ["Accessibility", /accessib|\bramps?\b|disab|diverse learning needs/i],
    ["Arts & recreation", /\barts\b|cultur|recreation|music|\bband\b|community centres/i],
    ["Mental health", /mental[- ]health/i],
    ["Inclusion", /inclusi|belonging|\bequit/i],
    ["STEM & tech", /\bstem\b|coding|robotics|\bai\b|technology/i],
  ];
  var ELECTION_DAY = new Date(2026, 9, 17);
  var POLLS_CLOSE = new Date(2026, 9, 17, 20, 0);

  // Merge official profiles with curated content.
  var CANDS = P.candidates.map(function (c) {
    var extra = G.candidates[c.id] || {};
    var cand = Object.assign({}, c, { points: extra.points || [], flags: extra.flags || [], notes: extra.notes || [], ops: OPS[c.id] || [] });
    cand.topics = topicsFor(cand);
    return cand;
  });
  var BY_ID = {};
  CANDS.forEach(function (c) { BY_ID[c.id] = c; });

  var state = { office: "mayor", org: "all", query: "" };

  // ---------------------------------------------------------------- helpers
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function srcChips(ids) {
    if (!ids || !ids.length) return "";
    var seen = {};
    return '<span class="src">' + ids.map(function (id) {
      var s = G.sources[id];
      if (!s) return "";
      // Two pages from one publisher get numbered so the tags don't look duplicated.
      var label = shortPublisher(s.publisher);
      seen[label] = (seen[label] || 0) + 1;
      if (seen[label] > 1) label += " " + seen[label];
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" title="' + esc(s.title) + '">' + esc(label) + "</a>";
    }).join("") + "</span>";
  }
  function shortPublisher(p) { return p.replace(/\s*\(.*\)$/, "").replace(/, in partnership with .*/, "").replace("The Canadian Press via ", ""); }
  function ext(url, label) { return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + "</a>"; }
  function more(summary, body, open) {
    return '<details class="more"' + (open ? " open" : "") + "><summary>" + esc(summary) + '</summary><div class="more-body">' + body + "</div></details>";
  }
  function orgName(c) { return c.org ? G.orgs[c.org].name : "Independent / no organization listed"; }
  function orgShort(c) { return c.org ? G.orgs[c.org].short : "Independent"; }
  function plainName(c) {
    // "Mike HURLEY" -> "Mike Hurley" for running text.
    return c.name.replace(/\b([A-Z])([A-Z]+)\b/g, function (_, a, b) { return a + b.toLowerCase(); });
  }
  function topicsFor(c) {
    var pts = c.points.join(" \n ");
    function hits(re, text) { return (text.match(new RegExp(re.source, "gi")) || []).length; }
    return TOPICS.map(function (t) {
      var score = hits(t[1], pts);
      return { name: t[0], score: score };
    }).filter(function (t) { return t.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 3).map(function (t) { return t.name; });
  }
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 2600);
  }
  function intro(title, text) {
    return '<div class="card intro"><h1>' + esc(title) + "</h1><p>" + text + "</p></div>";
  }

  // ------------------------------------------------------------------ storage
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode: picks just won't persist */ } },
  };
  var picks = store.get("bv26-picks", { mayor: [], council: [], trustee: [] });
  Object.keys(OFFICES).forEach(function (o) {
    picks[o] = (picks[o] || []).filter(function (id) { return BY_ID[id]; });
  });

  function isPicked(id) { var c = BY_ID[id]; return picks[c.office].indexOf(id) > -1; }
  function togglePick(id) {
    var c = BY_ID[id], list = picks[c.office], seats = OFFICES[c.office].seats, i = list.indexOf(id);
    if (i > -1) {
      list.splice(i, 1);
      toast("Removed " + plainName(c));
    } else if (list.length >= seats) {
      toast("You've already picked " + seats + " for " + OFFICES[c.office].plural + ". Remove one first.");
      return false;
    } else {
      list.push(id);
      toast("Added " + plainName(c) + " (" + list.length + " of " + seats + ")");
    }
    store.set("bv26-picks", picks);
    updatePickCount();
    syncPickButtons(id);
    return true;
  }
  function syncPickButtons(id) {
    var on = isPicked(id);
    $all('.pick-btn[data-id="' + id + '"]').forEach(function (b) {
      b.setAttribute("aria-pressed", on);
      b.textContent = on ? "Picked" : "Pick";
    });
    var card = document.getElementById("card-" + id);
    if (card) card.classList.toggle("is-picked", on);
    if ($("#race-count")) renderRaceCount();
  }
  function updatePickCount() {
    var n = picks.mayor.length + picks.council.length + picks.trustee.length;
    var el = $("#picks-count");
    el.textContent = n;
    el.hidden = n === 0;
  }
  function pickButton(c) {
    var on = isPicked(c.id);
    return '<button type="button" class="btn sm ghost pick-btn" data-id="' + esc(c.id) + '" aria-pressed="' + on + '" aria-label="Pick ' + esc(plainName(c)) + '">' + (on ? "Picked" : "Pick") + "</button>";
  }

  // -------------------------------------------------------------------- theme
  function initTheme() {
    var btn = $("#theme-btn");
    var META = { auto: "System", light: "Light", dark: "Dark" };
    function label() {
      var t = document.documentElement.dataset.theme || "auto";
      $("#theme-label").textContent = "Theme: " + META[t];
      btn.setAttribute("aria-label", "Colour theme: " + META[t] + ". Tap to change.");
    }
    btn.addEventListener("click", function () {
      var order = ["auto", "light", "dark"];
      var cur = document.documentElement.dataset.theme || "auto";
      var next = order[(order.indexOf(cur) + 1) % order.length];
      if (next === "auto") { delete document.documentElement.dataset.theme; try { localStorage.removeItem("bv26-theme"); } catch (e) {} }
      else { document.documentElement.dataset.theme = next; try { localStorage.setItem("bv26-theme", next); } catch (e) {} }
      label();
      toast(next === "auto" ? "Theme: matching your device" : "Theme: " + next);
    });
    label();
  }

  // ---------------------------------------------------------------- OPINIONS
  function voiceLine(v) {
    var parts = ["<b>" + esc(v.name) + "</b>"];
    var org = v.org && G.orgs[v.org];
    if (org && org.name !== v.name) parts.push(esc(org.short));
    if (v.role) parts.push(esc(v.role));
    var lean = org && org.lean ? '<span class="lean-tags">' + leanTags(org) + "</span>" : "";
    return '<div class="voice"><span>Said by ' + parts.join(" · ") + "</span></div>" +
      (lean ? '<div class="voice voice-lean"><span>Lean:</span>' + lean + "</div>" : "");
  }
  function opinionsBox(list, subject) {
    var groups = [
      { key: "for", label: "Arguments for", tag: "For" },
      { key: "against", label: "Criticisms & arguments against", tag: "Against" },
      { key: "reported", label: "Reported in news coverage", tag: "Reported" },
    ];
    var body = groups.map(function (g) {
      var items = list.filter(function (o) { return o.stance === g.key; });
      if (!items.length) return "";
      return '<div class="op-group"><p class="label">' + esc(g.label) + '</p><ul class="ops">' + items.map(function (o) {
        return '<li class="op"><span class="op-tag">' + g.tag + '</span><div><div class="say">' + esc(o.text) + srcChips(o.src) + "</div>" + voiceLine(o.voice) + "</div></li>";
      }).join("") + "</ul></div>";
    }).join("");
    if (!body) body = '<p class="none-found">We haven\'t found published arguments for or against ' + esc(subject) + " beyond their own statement. No criticism listed isn't an endorsement.</p>";
    return '<div class="opinion-box"><p class="disclaim"><span class="badge opinion">Opinion</span> Claims made by the people named, not by this guide. Each shows who is speaking and, where a source states it, their political lean.</p>' + body + "</div>";
  }
  function debateCount(list) {
    var f = list.filter(function (o) { return o.stance === "for"; }).length;
    var a = list.filter(function (o) { return o.stance === "against"; }).length;
    var r = list.filter(function (o) { return o.stance === "reported"; }).length;
    var bits = [];
    if (f) bits.push(f + " for");
    if (a) bits.push(a + " against");
    if (r) bits.push(r + " reported");
    return bits.join(" · ");
  }

  // ---------------------------------------------------------------- OVERVIEW
  function countdownText() {
    var now = new Date();
    if (now > POLLS_CLOSE) return "Voting has closed. Results are posted by the City of Burnaby.";
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.round((ELECTION_DAY - today) / 86400000);
    if (days === 0) return "Today is General Voting Day. Polls are open 8 am to 8 pm.";
    if (days === 1) return "General Voting Day is tomorrow.";
    return days + " days until General Voting Day.";
  }

  function barRows(rows, linkOffice) {
    var max = Math.max.apply(null, rows.map(function (r) { return r.pct; }));
    return rows.map(function (r) {
      var name = r.name || r.label;
      var nm = r.id ? '<a class="nm" href="#candidates/' + linkOffice + "/" + r.id + '">' + esc(name) + "</a>" : '<span class="nm">' + esc(name) + "</span>";
      return '<div class="bar-row' + (r.other ? " other" : "") + '">' + nm +
        '<div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:' + (r.pct / max * 100) + '%"></div></div>' +
        '<span class="pct">' + r.pct + "%</span></div>";
    }).join("");
  }

  function pollSection() {
    var p = POLLS[0];
    if (!p) return "";
    var snap = p.snapshot.map(function (s) {
      return "<div><b>" + esc(s.value) + "</b><span>" + esc(s.label) + "</span><small>" + esc(s.detail) + (s.src ? srcChips(s.src) : "") + "</small></div>";
    }).join("");
    return '<div><h2>What Burnaby residents told pollsters</h2><p class="small muted">' + esc(p.pollster) + " · fieldwork " + esc(p.fieldDates) + " · " + p.burnabyN + " Burnaby respondents" + srcChips(p.src) + "</p></div>" +
      '<div class="grid-2">' +
        '<div class="card"><p class="label">Mayoral vote intention</p><p class="small muted">"' + esc(p.mayor.question) + '"</p><div class="bars">' + barRows(p.mayor.results, "mayor") + '</div><p class="small muted">' + esc(p.mayor.note) + "</p></div>" +
        '<div class="card"><p class="label">Burnaby mood</p><div class="snap">' + snap + '</div><p class="label" style="margin-top:16px">Top local issues</p><div class="bars">' + barRows(p.issues) + '</div><p class="small muted">' + esc(p.issuesNote) + "</p></div>" +
      "</div>" +
      '<div class="caveat"><strong>Read with care:</strong> nearly half of Burnaby respondents were undecided, and this is one online poll with a small local sample. ' + esc(p.moeNote) + " A poll is a snapshot, not a prediction. In local elections, who actually turns out matters most.</div>";
  }

  function renderStart() {
    var e = G.election;
    var tiles = Object.keys(OFFICES).map(function (o) {
      var n = CANDS.filter(function (c) { return c.office === o; }).length;
      return '<a class="tile" href="#candidates/' + o + '"><span><span class="label">' + esc(OFFICES[o].plural) + "</span>" +
        "<strong>Vote for " + (OFFICES[o].seats === 1 ? "1" : "up to " + OFFICES[o].seats) + "</strong>" +
        '<span class="small muted">' + n + ' candidates</span></span><span class="arrow" aria-hidden="true">→</span></a>';
    }).join("");

    var flagged = CANDS.filter(function (c) { return c.flags.indexOf("withdrawn") > -1 || c.flags.indexOf("provincial") > -1; });
    var notices = flagged.map(function (c) {
      return '<li><a href="#candidates/' + c.office + "/" + c.id + '">' + esc(plainName(c)) + "</a> (" + esc(OFFICES[c.office].label) + "): " +
        c.notes.map(function (n) { return esc(n.text) + srcChips(n.src); }).join(" ") + "</li>";
    }).join("");

    $("#view-start").innerHTML =
      '<div class="hero">' +
        '<div class="hero-text">' +
          '<span class="eyebrow">Municipal election · ' + esc(e.day) + "</span>" +
          "<h1>Burnaby votes on " + esc(e.day.replace(", 2026", "")) + "</h1>" +
          '<p><span class="countdown">' + esc(countdownText()) + "</span> You'll elect 1 mayor, 8 councillors and 7 school trustees for four-year terms. Every candidate is here in their own words, with sources for everything else.</p>" +
        "</div>" +
        '<div class="stats">' +
          '<div class="stat"><b>64</b><span>Candidates</span></div>' +
          '<div class="stat"><b>16</b><span>Seats</span></div>' +
          '<div class="stat"><b>5</b><span>Civic parties</span></div>' +
          '<div class="stat"><b>19.3%</b><span>Turnout in 2022 ' + srcChips(["freshet-bca-slate"]) + "</span></div>" +
        "</div>" +
      "</div>" +

      (notices ? '<div class="notice"><h2>Good to know</h2><ul>' +
        "<li>The <strong>provincial election on October 24</strong> is a separate vote, one week later. Some local candidates are on both ballots." + srcChips(["ebc-candidates"]) + "</li>" +
        notices + "</ul></div>" : "") +

      '<div class="grid-2">' +
        '<div class="card"><h2>Before you go</h2><ul class="facts">' +
          '<li><span><strong>' + esc(e.hours) + "</strong>, " + esc(e.day) + ". Advance voting: " + esc(e.advance) + "." + srcChips(["city-elections"]) + "</span></li>" +
          '<li><span><strong>Vote at any location.</strong> There are no assigned voting places. ' + ext(G.sources["city-map"].url, "Locations and wait times") + srcChips(["city-voters"]) + "</span></li>" +
          '<li><span><strong>Bring ID.</strong> Not registered? Bring two pieces showing who you are and where you live (one with your signature). You can register on the spot.' + srcChips(["city-voters"]) + "</span></li>" +
          '<li><span><strong>Need help?</strong> Curbside voting at every location; translation and interpreters available.' + srcChips(["city-voters"]) + "</span></li>" +
        "</ul>" +
        more("Who can vote, accepted ID and accessibility",
          "<p><strong>Residents:</strong> Canadian citizen, 18+ by voting day, living in BC for at least 6 months and in Burnaby when you register.</p>" +
          "<p><strong>Property owners who live elsewhere</strong> may vote as non-resident property electors after owning Burnaby property for 30+ days (one property; individuals only).</p>" +
          "<p><strong>ID:</strong> registered with a voter card? Bring the card plus one ID. Accepted ID includes a BC driver's licence, BC CareCard, passport, Social Insurance Card and utility bill. Questions: Election Office, 604-294-7088.</p>" +
          "<p><strong>Accessibility:</strong> an assisted ballot-marking device is at Edmonds Community Centre on all voting days.</p>" +
          '<p class="small muted">Mail-ballot applications closed October 5.' + srcChips(["city-voters", "city-elections"]) + "</p>") +
        "</div>" +
        '<div class="card"><h2>How your ballot works</h2>' +
          "<p>You vote for <strong>individual people</strong>, not a party list. People in the same party run as a team, but you can mix and match.</p>" +
          "<ul><li>Mayor: pick 1. Council: up to 8. School trustees: up to 7." + srcChips(["city-voters"]) + "</li>" +
          "<li>Picking <strong>fewer</strong> is fine. Marking <strong>more</strong> than the limit cancels your votes in that race only." + srcChips(["bc-lga"]) + "</li>" +
          "<li>The candidates with the most votes win.</li></ul>" +
          more("What do they actually decide?",
            "<p><strong>Mayor and council</strong> pass bylaws, set property taxes and fees, decide zoning and land use, and run local services like parks, recreation, roads and water." + srcChips(["bc-municipal-powers"]) + "</p>" +
            "<p><strong>School trustees</strong> sit on the Board of Education, which sets procedures for Burnaby's public schools and oversees the district budget." + srcChips(["sd41-board"]) + "</p>" +
            "<p><strong>Mostly provincial:</strong> BC Housing builds and funds shelters and supportive housing," + srcChips(["city-homelessness"]) + " the province decides hospital projects," + srcChips(["freshet-hospital"]) + " and provincial law sets minimum housing density on residential lots." + srcChips(["bc-ssmuh"]) + " Councils can still advocate on these.</p>") +
        "</div>" +
      "</div>" +

      "<div><h2>What's on your ballot</h2></div>" +
      '<div class="tiles">' + tiles + "</div>" +

      pollSection();
  }

  // -------------------------------------------------------------- CANDIDATES
  function renderCandidatesShell() {
    var seg = Object.keys(OFFICES).map(function (o) {
      var n = CANDS.filter(function (c) { return c.office === o; }).length;
      return '<button type="button" data-office="' + o + '">' + esc(OFFICES[o].plural) + "<span>" + n + " running</span></button>";
    }).join("");
    $("#view-candidates").innerHTML =
      intro("Candidates", "All 64 candidates, listed alphabetically by surname as the City lists them. Each card's focus comes only from the candidate's own statement. Tap <strong>View full profile</strong> for their full statement, sourced context, and arguments for and against.") +
      '<div class="card filters-card">' +
        '<div class="seg" role="group" aria-label="Choose a race">' + seg + "</div>" +
        '<div class="filter-row">' +
          '<label class="input"><span class="visually-hidden">Search</span><input type="search" id="cand-q" placeholder="Search names or topics, e.g. transit" autocomplete="off"></label>' +
          '<label><span class="visually-hidden">Party</span><select id="cand-org"></select></label>' +
        "</div>" +
        '<div class="race-bar"><strong id="race-title"></strong><span id="race-count"></span></div>' +
      "</div>" +
      '<div class="cards" id="cand-list"></div>';

    $all("#view-candidates .seg button").forEach(function (b) {
      b.addEventListener("click", function () { location.hash = "#candidates/" + b.dataset.office; });
    });
    $("#cand-q").addEventListener("input", function (ev) { state.query = ev.target.value.trim().toLowerCase(); renderCandidateList(); });
    $("#cand-org").addEventListener("change", function (ev) { state.org = ev.target.value; renderCandidateList(); });
    $("#cand-list").addEventListener("click", function (ev) {
      var pick = ev.target.closest(".pick-btn");
      if (pick) { togglePick(pick.dataset.id); return; }
      var open = ev.target.closest("[data-open]");
      if (open) location.hash = "#candidates/" + BY_ID[open.dataset.open].office + "/" + open.dataset.open;
    });
  }

  function renderOrgOptions() {
    var inOffice = CANDS.filter(function (c) { return c.office === state.office; });
    var counts = {};
    inOffice.forEach(function (c) { var k = c.org || "none"; counts[k] = (counts[k] || 0) + 1; });
    var opts = '<option value="all">All parties & independents (' + inOffice.length + ")</option>";
    Object.keys(G.orgs).forEach(function (k) {
      if (counts[k]) opts += '<option value="' + k + '">' + esc(G.orgs[k].name) + " (" + counts[k] + ")</option>";
    });
    if (counts.none) opts += '<option value="none">Independent / none listed (' + counts.none + ")</option>";
    var sel = $("#cand-org");
    sel.innerHTML = opts;
    if (state.org !== "all" && !counts[state.org]) state.org = "all";
    sel.value = state.org;
  }

  function renderRaceCount() {
    var o = OFFICES[state.office], n = picks[state.office].length;
    $("#race-title").textContent = o.plural + ": vote for " + (o.seats === 1 ? "1" : "up to " + o.seats);
    $("#race-count").innerHTML = '<span class="count' + (n >= o.seats ? " full" : "") + '">' + n + " / " + o.seats + " picked</span>";
  }

  function candidateCard(c) {
    var tags = c.flags.map(function (f) { return '<span class="tag ' + FLAGS[f].cls + '">' + esc(FLAGS[f].text) + "</span>"; })
      .concat(c.topics.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; })).join("");
    var debate = debateCount(c.ops);
    return '<article class="cc' + (isPicked(c.id) ? " is-picked" : "") + '" id="card-' + esc(c.id) + '">' +
      "<div>" +
        '<div class="cc-top"><span class="badge' + (c.office === "mayor" ? " solid" : "") + '">' + esc(OFFICES[c.office].label) + '</span><span class="badge">' + esc(orgShort(c)) + "</span></div>" +
        '<h3 class="cc-name">' + esc(c.name) + "</h3>" +
        (tags ? '<div class="cc-tags">' + tags + "</div>" : "") +
        '<p class="cc-focus"><strong>Focus:</strong> ' + esc(c.points.join(" · ")) + "</p>" +
      "</div>" +
      '<div class="cc-foot">' + pickButton(c) +
        (debate ? '<span class="cc-debate" title="Arguments for, against, and news reports in the full profile">' + debate + "</span>" : "") +
        '<button type="button" class="btn sm" data-open="' + esc(c.id) + '">View full profile →</button>' +
      "</div></article>";
  }

  function matches(c) {
    if (c.office !== state.office) return false;
    if (state.org !== "all" && (c.org || "none") !== state.org) return false;
    if (!state.query) return true;
    var hay = [c.name, orgName(c), c.points.join(" "), c.topics.join(" "), c.statement.join(" ")].join(" ").toLowerCase();
    return state.query.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
  }

  function renderCandidateList() {
    var list = CANDS.filter(matches);
    $("#cand-list").innerHTML = list.length ? list.map(candidateCard).join("") :
      '<div class="card empty"><p>No candidates match that search.</p><button class="btn" type="button" id="clear-filters">Reset filters</button></div>';
    var clr = $("#clear-filters");
    if (clr) clr.addEventListener("click", function () { state.query = ""; state.org = "all"; $("#cand-q").value = ""; $("#cand-org").value = "all"; renderCandidateList(); });
  }

  function showCandidates(office) {
    if (!OFFICES[office]) office = "mayor";
    var changed = office !== state.office;
    if (changed) state.org = "all";
    state.office = office;
    $all("#view-candidates .seg button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.office === office); });
    renderOrgOptions();
    renderRaceCount();
    if (changed || !$("#cand-list").children.length) renderCandidateList();
  }

  // ----------------------------------------------------------- PROFILE POPUP
  var dlg = null;
  var openedByNav = false;

  function openProfile(id) {
    var c = BY_ID[id];
    if (!c) return;
    var o = OFFICES[c.office];
    var badges = '<span class="badge' + (c.office === "mayor" ? " solid" : "") + '">' + esc(o.label) + '</span><span class="badge">' + esc(orgShort(c)) + "</span>" +
      c.flags.map(function (f) { return '<span class="badge' + (FLAGS[f].cls === "warn" ? " warn" : "") + '">' + esc(FLAGS[f].text) + "</span>"; }).join("");

    var notes = c.notes.length ? '<div class="pf-sec"><p class="label">Good to know</p><div class="pf-box"><ul>' +
      c.notes.map(function (n) { return "<li>" + esc(n.text) + srcChips(n.src) + "</li>"; }).join("") + "</ul></div></div>" : "";

    var links = [];
    c.website.forEach(function (u) { links.push(ext(u, "Website")); });
    c.social.forEach(function (s) { links.push(ext(s.url, socialName(s.url))); });
    if (c.phone) links.push('<a href="tel:' + esc(c.phone.replace(/[^\d+]/g, "")) + '">' + esc(c.phone) + "</a>");
    var docs = [ext(c.profileUrl, "Official City profile")];
    if (c.nomination) docs.push(ext(c.nomination, "Nomination papers"));
    if (c.disclosure) docs.push(ext(c.disclosure, "Financial disclosure"));

    var statement = '<div class="statement">' + c.statement.map(function (p) { return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>"; }).join("") +
      '<p class="small muted">Written by the candidate, as published by the City of Burnaby.' + srcChips([o.src]) + "</p></div>";

    dlg.innerHTML = '<div class="pf">' +
      '<div class="pf-head"><div><div class="badges">' + badges + '</div><h2 class="pf-name" id="pf-name">' + esc(c.name) + '</h2><div class="pf-aff">' + esc(orgName(c)) + "</div></div>" +
        '<button type="button" class="x-btn" data-close aria-label="Close profile">✕</button></div>' +
      '<div class="pf-body">' +
        '<div class="pf-sec"><p class="label">Campaign focus <span class="muted">(from their statement)</span></p><ul class="pf-focus">' +
          c.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul></div>" +
        notes +
        '<div class="pf-sec"><p class="label">Arguments for & against</p>' + opinionsBox(c.ops, plainName(c)) + "</div>" +
        '<div class="pf-sec">' + more("Read their full statement", statement) +
          more("Links & official documents", (links.length ? '<ul class="linkrow">' + links.map(function (l) { return "<li>" + l + "</li>"; }).join("") + "</ul>" : '<p class="small muted">No website or phone listed.</p>') +
            '<ul class="linkrow">' + docs.map(function (l) { return "<li>" + l + "</li>"; }).join("") + "</ul>" +
            (c.org ? '<p class="small"><a href="#parties/' + c.org + '">About ' + esc(G.orgs[c.org].name) + " →</a></p>" : "")) +
        "</div>" +
      "</div>" +
      '<div class="pf-foot"><span class="meta">' + esc(orgShort(c)) + " · " + esc(o.plural) + '</span><span class="btns">' + pickButton(c) +
        '<button type="button" class="btn sm" data-close>Close</button></span></div>' +
      "</div>";
    if (!dlg.open) dlg.showModal();
    $(".pf-body", dlg).scrollTop = 0;
  }

  function initDialog() {
    dlg = $("#profile");
    dlg.addEventListener("click", function (ev) {
      if (ev.target === dlg || ev.target.closest("[data-close]")) { dlg.close(); return; }
      var pick = ev.target.closest(".pick-btn");
      if (pick) togglePick(pick.dataset.id);
    });
    dlg.addEventListener("close", function () {
      var parts = location.hash.slice(1).split("/");
      if (parts[0] === "candidates" && parts[2]) {
        // Closing should feel like "back": undo the history entry we added, if any.
        if (openedByNav) history.back();
        else history.replaceState(null, "", "#candidates/" + parts[1]);
      }
      openedByNav = false;
    });
  }

  function socialName(url) {
    var map = { "facebook.": "Facebook", "instagram.": "Instagram", "x.com": "X", "twitter.": "X", "linkedin.": "LinkedIn", "tiktok.": "TikTok", "youtube.": "YouTube", "bsky.app": "Bluesky", "threads.": "Threads" };
    for (var k in map) if (url.indexOf(k) > -1) return map[k];
    return "Social";
  }

  // ----------------------------------------------------------------- PARTIES
  // Each lean label followed by its source tags.
  function leanTags(o) {
    return o.lean.map(function (l) {
      return '<span class="lean-item"><span class="lean-label">' + esc(l.label) + "</span>" + srcChips(l.src) + "</span>";
    }).join("");
  }
  function leanText(o) {
    if (!o.lean) return '<span class="muted">Not labelled by any source we found</span>';
    return '<span class="lean-tags">' + leanTags(o) + "</span>";
  }

  function renderParties() {
    var cards = Object.keys(G.orgs).map(function (k) {
      var o = G.orgs[k];
      var mine = CANDS.filter(function (c) { return c.org === k; });
      var counts = Object.keys(OFFICES).map(function (off) {
        var n = mine.filter(function (c) { return c.office === off; }).length;
        return n ? n + " " + OFFICES[off].label.toLowerCase() : "";
      }).filter(Boolean).join(" · ");
      var roster = Object.keys(OFFICES).map(function (off) {
        var people = mine.filter(function (c) { return c.office === off; });
        if (!people.length) return "";
        return "<p><strong>" + esc(OFFICES[off].plural) + ":</strong> " + people.map(function (c) {
          return '<a href="#candidates/' + off + "/" + c.id + '">' + esc(plainName(c)) + "</a>";
        }).join(", ") + "</p>";
      }).join("");
      var debate = debateCount(OPS[k] || []);
      return '<article class="card party" id="org-' + k + '">' +
        '<div><span class="badge' + (o.role === "Governing party" ? " solid" : "") + '">' + esc(o.role) + "</span></div>" +
        "<h2>" + esc(o.name) + "</h2>" +
        '<dl class="kv">' +
          "<div><dt>Candidates</dt><dd>" + esc(counts) + "</dd></div>" +
          "<div><dt>Political lean</dt><dd>" + leanText(o) + "</dd></div>" +
        "</dl>" +
        (o.context || []).map(function (x) { return '<p class="small muted">' + esc(x.text) + srcChips(x.src) + "</p>"; }).join("") +
        '<p class="label">Key promises, in their words</p>' +
        '<ul class="says">' + o.says.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" +
        '<p class="small">' + srcChips(o.moreSrc || [o.platform]) + "</p>" +
        more("More of their platform", '<ul class="says">' + o.more.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" +
          "<p>" + ext(G.sources[o.platform].url, "Read the full platform") + " · " + ext(o.website, "Website") + "</p>") +
        more("Arguments for & against" + (debate ? " (" + debate + ")" : ""), opinionsBox(OPS[k] || [], o.name)) +
        more("Their candidates", roster) +
        "</article>";
    }).join("");

    var indep = CANDS.filter(function (c) { return !c.org; });
    $("#view-parties").innerHTML =
      intro("Parties", "Candidates can run with a civic party (officially an \"elector organization\") or on their own. These are local groups, separate from provincial and federal parties. Listed alphabetically. Promises are quoted or closely paraphrased from each party's platform. A political lean is shown only where an independent source states one.") +
      '<div class="grid-3">' + cards +
      '<article class="card party"><div><span class="badge">No party</span></div><h2>Independents</h2>' +
        '<p class="small">' + indep.length + " candidates have no party listed on their City profile. Each one's priorities are on their candidate card.</p>" +
        Object.keys(OFFICES).map(function (off) {
          var people = indep.filter(function (c) { return c.office === off; });
          return people.length ? '<p class="small"><strong>' + esc(OFFICES[off].plural) + ":</strong> " + people.map(function (c) {
            return '<a href="#candidates/' + off + "/" + c.id + '">' + esc(plainName(c)) + "</a>";
          }).join(", ") + "</p>" : "";
        }).join("") +
      "</article></div>";
  }

  // ------------------------------------------------------------------ ISSUES
  function renderIssues() {
    $("#view-issues").innerHTML =
      intro("Issues", "The big debates in this election. Each starts with sourced background facts, then what candidates and parties have said. Positions are examples from published platforms and statements, not a ranking, and not everyone has spoken to every issue.") +
      '<div class="grid-2">' +
      G.issues.map(function (iss, i) {
        return '<article class="card issue" id="issue-' + iss.id + '">' +
          '<div class="issue-head"><span class="issue-num">' + (i + 1) + "</span><h2>" + esc(iss.title) + "</h2></div>" +
          '<p class="sum">' + esc(iss.summary) + "</p>" +
          more("The facts", "<ul>" + iss.facts.map(function (f) { return "<li>" + esc(f.text) + srcChips(f.src) + "</li>"; }).join("") + "</ul>") +
          more("What they say", '<ul class="positions">' + iss.positions.map(function (p) {
            return '<li><span class="who">' + esc(p.who) + "</span>" + esc(p.text) + srcChips(p.src) + "</li>";
          }).join("") + "</ul>") +
          (iss.further ? more("Further reading", "<ul>" + iss.further.map(function (id) {
            var s = G.sources[id];
            return "<li>" + ext(s.url, s.title) + ' <span class="muted small">(' + esc(s.publisher) + ". Note the publisher's interest in the topic.)</span></li>";
          }).join("") + "</ul>") : "") +
          "</article>";
      }).join("") + "</div>";
  }

  // ------------------------------------------------------------------- PICKS
  function sortByBallot(ids) {
    return ids.slice().sort(function (a, b) { return CANDS.indexOf(BY_ID[a]) - CANDS.indexOf(BY_ID[b]); });
  }
  function picksAsText() {
    var lines = ["My picks - " + G.election.name, G.election.day + ", " + G.election.hours, ""];
    Object.keys(OFFICES).forEach(function (o) {
      lines.push(OFFICES[o].plural + " (" + picks[o].length + " of " + OFFICES[o].seats + "):");
      if (!picks[o].length) lines.push("  (none)");
      sortByBallot(picks[o]).forEach(function (id) { lines.push("  - " + plainName(BY_ID[id])); });
      lines.push("");
    });
    return lines.join("\n").trim();
  }

  function renderPicks() {
    var total = picks.mayor.length + picks.council.length + picks.trustee.length;
    var races = Object.keys(OFFICES).map(function (o) {
      var seats = OFFICES[o].seats, ids = sortByBallot(picks[o]);
      return '<div class="ballot-race"><div class="race-bar"><strong>' + esc(OFFICES[o].plural) + "</strong>" +
        '<span class="count' + (ids.length >= seats ? " full" : "") + '">' + ids.length + " / " + seats + "</span></div>" +
        (ids.length ? "<ul>" + ids.map(function (id) {
          var c = BY_ID[id];
          return '<li><span><a href="#candidates/' + o + "/" + id + '">' + esc(c.name) + "</a><small>" + esc(orgName(c)) + "</small></span>" +
            '<button type="button" class="no-print" data-remove="' + esc(id) + '" aria-label="Remove ' + esc(plainName(c)) + '">Remove</button></li>';
        }).join("") + "</ul>" : '<p class="none">None picked yet. <a href="#candidates/' + o + '">Browse ' + esc(OFFICES[o].plural) + " →</a></p>") +
        "</div>";
    }).join("");

    $("#view-picks").innerHTML =
      intro("My ballot", "A personal checklist for voting day. Tap <strong>Pick</strong> on any candidate to add them. Your list is saved only in this browser on this device. Nothing is sent anywhere.") +
      '<div class="ballot"><h2>Your ballot</h2><div class="total">' + total + ' <span class="muted" style="font-size:1rem;font-weight:600">/ 16 votes</span></div>' +
        '<p class="muted small">You don\'t have to use every vote.</p>' + races + "</div>" +
      (total ? '<div class="btn-row no-print"><button class="btn" type="button" id="copy-picks">Copy list</button>' +
        '<button class="btn ghost" type="button" id="print-picks">Print</button>' +
        '<button class="btn ghost" type="button" id="clear-picks">Clear all</button></div>' : "");

    $all("[data-remove]", $("#view-picks")).forEach(function (b) {
      b.addEventListener("click", function () { togglePick(b.dataset.remove); renderPicks(); });
    });
    var copy = $("#copy-picks");
    if (copy) copy.addEventListener("click", function () {
      var txt = picksAsText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () { toast("Copied. Paste it into a note or message."); }, function () { fallbackCopy(txt); });
      } else fallbackCopy(txt);
    });
    var pr = $("#print-picks");
    if (pr) pr.addEventListener("click", function () { window.print(); });
    var clr = $("#clear-picks");
    if (clr) clr.addEventListener("click", function () {
      if (!confirm("Clear all your picks?")) return;
      picks = { mayor: [], council: [], trustee: [] };
      store.set("bv26-picks", picks);
      updatePickCount();
      renderPicks();
    });
  }
  function fallbackCopy(txt) {
    var ta = document.createElement("textarea");
    ta.value = txt; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast("Copied."); } catch (e) { toast("Couldn't copy. Try Print instead."); }
    document.body.removeChild(ta);
  }

  // ------------------------------------------------------------------- ABOUT
  function renderAbout() {
    var groups = { official: "Official sources", candidate: "Candidate statements (via the City)", party: "Party platforms", poll: "Polling", news: "News coverage", reference: "Reference", "third-party": "Other guides & analysis" };
    var srcList = Object.keys(groups).map(function (type) {
      var items = Object.keys(G.sources).filter(function (id) { return G.sources[id].type === type; }).map(function (id) {
        var s = G.sources[id];
        return "<li>" + ext(s.url, s.title) + '<br><span class="muted">' + esc(s.publisher) + (s.date ? " · " + esc(s.date) : "") + "</span></li>";
      }).join("");
      return items ? '<p class="label">' + esc(groups[type]) + '</p><ul class="source-list">' + items + "</ul>" : "";
    }).join("");

    $("#view-about").innerHTML =
      intro("About this guide", "An independent, non-partisan guide. It isn't affiliated with any candidate, party, or the City of Burnaby, and it doesn't endorse anyone.") +
      '<div class="grid-2">' +
      '<div class="card"><h2>How it stays neutral</h2><ul>' +
        "<li><strong>Candidates speak for themselves.</strong> Full statements are reproduced from the City's official profiles (punctuation lightly normalized). Card focus points come only from those statements.</li>" +
        "<li><strong>Same treatment for everyone.</strong> Same card layout, the City's alphabetical order, and topic tags assigned by the same keyword rules for every candidate.</li>" +
        '<li><strong>Opinions are labelled.</strong> Arguments for and against sit in a box marked <span class="badge opinion">Opinion</span>, and each one names who is speaking. A party\'s political lean is shown only when an independent source states it.</li>' +
        "<li><strong>Facts carry a source.</strong> Tap the small ↗ tags to see where anything came from.</li>" +
        "<li><strong>No party colours</strong> and no predictions.</li>" +
      "</ul></div>" +
      '<div class="card"><h2>Things to keep in mind</h2><ul>' +
        "<li><strong>Criticism isn't evenly spread.</strong> Incumbents have a record, so they attract more of it. A candidate with nothing listed hasn't been endorsed; we just haven't found published arguments about them.</li>" +
        "<li><strong>Polls are snapshots.</strong> The Leger poll had 107 Burnaby respondents and about half were undecided. We show it with that context.</li>" +
        "<li><strong>A correction from an earlier draft:</strong> an AI-generated prototype presented Metro Vancouver-wide figures from this Leger poll as if they were Burnaby's. This guide shows the Burnaby-specific numbers and labels them.</li>" +
      "</ul></div>" +
      "</div>" +
      '<div class="card"><h2>Corrections</h2>' +
        "<p>Found a mistake, a missing source, or wording that seems unfair to someone? Please open an issue or pull request on this guide's code repository, with a link to a source. Candidates and parties can request corrections the same way.</p>" +
        '<p class="small muted">Content last updated ' + esc(G.lastUpdated) + ". Candidate statements fetched " + esc(P.fetched) + ".</p></div>" +
      '<div class="card"><h2>All sources</h2>' + srcList + "</div>";
  }

  // ------------------------------------------------------------------ ROUTER
  var rendered = {};
  function route() {
    var parts = (location.hash || "#start").slice(1).split("/");
    var view = parts[0] || "start";
    if (!document.getElementById("view-" + view)) view = "start";
    var prevView = route.view;
    route.view = view;

    $all("main > section").forEach(function (s) { s.hidden = s.dataset.view !== view; });
    $all(".tabs a").forEach(function (a) {
      if (a.dataset.tab === view) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    var activeTab = $('.tabs a[data-tab="' + view + '"]');
    if (activeTab && activeTab.scrollIntoView) activeTab.scrollIntoView({ block: "nearest", inline: "nearest" });

    var keepScroll = false;
    if (view === "candidates") {
      if (!rendered.candidates) { renderCandidatesShell(); rendered.candidates = true; }
      var officeChanged = (parts[1] || state.office) !== state.office;
      showCandidates(parts[1] || state.office);
      keepScroll = prevView === "candidates" && !officeChanged;
      if (parts[2] && BY_ID[parts[2]]) {
        // A history entry exists to go "back" to only if we navigated here in this session.
        openedByNav = prevView !== undefined;
        openProfile(parts[2]);
      } else if (dlg.open) { openedByNav = false; dlg.close(); }
    } else if (dlg.open) { openedByNav = false; dlg.close(); }

    if (view === "start") renderStart();
    if (view === "parties") {
      if (!rendered.parties) { renderParties(); rendered.parties = true; }
      var target = parts[1] && document.getElementById("org-" + parts[1]);
      if (target) { target.scrollIntoView({ block: "start" }); keepScroll = true; }
    }
    if (view === "issues" && !rendered.issues) { renderIssues(); rendered.issues = true; }
    if (view === "picks") renderPicks();
    if (view === "about" && !rendered.about) { renderAbout(); rendered.about = true; }

    if (!keepScroll) window.scrollTo(0, 0);
    var tabName = activeTab ? activeTab.textContent.replace(/[^\w\s]/g, "").replace(/\d+$/, "").trim() : "";
    document.title = (view === "start" ? "" : tabName + " · ") + "Burnaby Votes 2026 - Voter Guide";
  }

  initTheme();
  initDialog();
  updatePickCount();
  window.addEventListener("hashchange", route);
  route();
})();
