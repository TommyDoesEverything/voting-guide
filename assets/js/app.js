/* Burnaby Votes 2026 — renders the guide from data/profiles.js and data/guide.js.
   No frameworks, no build step. */
(function () {
  "use strict";

  var G = window.GUIDE;
  var P = window.PROFILES;
  var OFFICES = {
    mayor: { label: "Mayor", plural: "Mayor", seats: G.election.seats.mayor, src: "city-profiles-mayor" },
    council: { label: "Councillor", plural: "City Council", seats: G.election.seats.council, src: "city-profiles-council" },
    trustee: { label: "School Trustee", plural: "School Trustees", seats: G.election.seats.trustee, src: "city-profiles-trustee" },
  };
  var FLAG_LABELS = {
    incumbent: { text: "Currently in office", warn: false },
    withdrawn: { text: "Says no longer running", warn: true },
    provincial: { text: "Also running provincially", warn: true },
  };
  var ELECTION_DAY = new Date(2026, 9, 17); // Oct 17, 2026 (local time)
  var POLLS_CLOSE = new Date(2026, 9, 17, 20, 0);

  // Merge official profiles with curated notes.
  var CANDS = P.candidates.map(function (c) {
    var extra = G.candidates[c.id] || {};
    return Object.assign({}, c, { points: extra.points || [], flags: extra.flags || [], notes: extra.notes || [] });
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
      // Two different pages from one publisher get numbered so the tags don't look duplicated.
      var label = shortPublisher(s.publisher);
      seen[label] = (seen[label] || 0) + 1;
      if (seen[label] > 1) label += " (" + seen[label] + ")";
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" title="' + esc(s.title) + '">' + esc(label) + "</a>";
    }).join("") + "</span>";
  }
  function shortPublisher(p) { return p.replace(/\s*\(.*\)$/, "").replace("The Canadian Press via ", ""); }

  function ext(url, label) {
    return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + "</a>";
  }
  function more(summary, body, open) {
    return '<details class="more"' + (open ? " open" : "") + "><summary>" + esc(summary) + '</summary><div class="more-body">' + body + "</div></details>";
  }
  function orgName(c) { return c.org ? G.orgs[c.org].name : "Independent / no organization listed"; }
  function plainName(c) {
    // "Mike HURLEY" -> "Mike Hurley" for running text.
    return c.name.replace(/\b([A-Z])([A-Z]+)\b/g, function (_, a, b) { return a + b.toLowerCase(); });
  }

  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 2600);
  }

  // ------------------------------------------------------------------ storage
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode: picks just won't persist */ } },
  };
  var picks = store.get("bv26-picks", { mayor: [], council: [], trustee: [] });
  ["mayor", "council", "trustee"].forEach(function (o) {
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
    return true;
  }
  function updatePickCount() {
    var n = picks.mayor.length + picks.council.length + picks.trustee.length;
    var el = $("#picks-count");
    el.textContent = n;
    el.hidden = n === 0;
  }

  // -------------------------------------------------------------------- theme
  function initTheme() {
    var btn = $("#theme-btn");
    function label() {
      var t = document.documentElement.dataset.theme || "auto";
      $("#theme-icon").textContent = t === "dark" ? "☾" : t === "light" ? "☀" : "◐";
      btn.setAttribute("aria-label", "Colour theme: " + (t === "auto" ? "match device" : t) + ". Tap to change.");
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

  // ------------------------------------------------------------------- START
  function countdownText() {
    var now = new Date();
    if (now > POLLS_CLOSE) return "Voting has closed. Results are posted by the City of Burnaby.";
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.round((ELECTION_DAY - today) / 86400000);
    if (days === 0) return "Today is General Voting Day — polls are open 8 am to 8 pm.";
    if (days === 1) return "General Voting Day is tomorrow.";
    return days + " days until General Voting Day.";
  }

  function renderStart() {
    var e = G.election;
    var tiles = Object.keys(OFFICES).map(function (o) {
      var n = CANDS.filter(function (c) { return c.office === o; }).length;
      return '<a class="tile" href="#candidates/' + o + '"><span><span class="kicker">' + esc(OFFICES[o].plural) + "</span>" +
        "<strong>Vote for " + (OFFICES[o].seats === 1 ? "1" : "up to " + OFFICES[o].seats) + "</strong>" +
        '<span class="muted small">' + n + " candidates</span></span>" +
        '<span class="arrow" aria-hidden="true">→</span></a>';
    }).join("");

    var flagged = CANDS.filter(function (c) { return c.flags.indexOf("withdrawn") > -1 || c.flags.indexOf("provincial") > -1; });
    var notices = flagged.map(function (c) {
      return "<li><a href=\"#candidates/" + c.office + "/" + c.id + "\">" + esc(plainName(c)) + "</a> (" + esc(OFFICES[c.office].label) + "): " +
        c.notes.map(function (n) { return esc(n.text) + srcChips(n.src); }).join(" ") + "</li>";
    }).join("");

    $("#view-start").innerHTML =
      '<div class="hero">' +
        '<p class="kicker">Burnaby local election</p>' +
        "<h1>Burnaby votes on " + esc(e.day.replace(", 2026", "")) + "</h1>" +
        '<p class="lede"><span class="countdown">' + esc(countdownText()) + "</span> You'll choose a mayor, eight councillors and seven school trustees. Every candidate, in their own words, with sources.</p>" +
      "</div>" +

      '<div class="card"><h2>Before you go</h2><ul class="facts">' +
        '<li><span class="ico" aria-hidden="true">🕗</span><span><strong>' + esc(e.hours) + "</strong> on " + esc(e.day) + ". Advance voting: " + esc(e.advance) + "." + srcChips(["city-elections"]) + "</span></li>" +
        '<li><span class="ico" aria-hidden="true">📍</span><span><strong>Vote at any location</strong> — there are no assigned voting places. ' + ext(G.sources["city-map"].url, "See locations and wait times") + "." + srcChips(["city-voters"]) + "</span></li>" +
        '<li><span class="ico" aria-hidden="true">🪪</span><span><strong>Bring ID.</strong> Not registered? Bring two pieces of ID showing your identity and address (one with your signature) — you can register on the spot.' + srcChips(["city-voters"]) + "</span></li>" +
        '<li><span class="ico" aria-hidden="true">♿</span><span><strong>Need help?</strong> Curbside voting is available at every location, and translation and interpreter help is available.' + srcChips(["city-voters"]) + "</span></li>" +
      "</ul>" +
      more("Who can vote, accepted ID and accessibility",
        "<h3>Who can vote</h3><ul>" +
          "<li><strong>Residents:</strong> Canadian citizen, 18+ by voting day, living in BC for at least 6 months and in Burnaby when you register.</li>" +
          "<li><strong>Property owners who live elsewhere:</strong> may vote as a non-resident property elector if they've owned Burnaby property for at least 30 days (one property only, individuals not companies).</li></ul>" +
        "<h3>ID</h3><p>Already registered with a voter card? Bring the card plus one piece of ID. Accepted ID includes a BC driver's licence, BC CareCard, passport, Social Insurance Card and utility bill. Unsure? Call the Election Office at 604-294-7088.</p>" +
        "<h3>Accessibility</h3><p>An assisted ballot-marking device is available at Edmonds Community Centre on all voting days. Curbside voting at all locations.</p>" +
        "<p class=\"small muted\">Mail-ballot applications closed October 5." + srcChips(["city-voters", "city-elections"]) + "</p>") +
      "</div>" +

      "<div><h2>What's on your ballot</h2></div>" +
      '<div class="ballot-tiles">' + tiles + "</div>" +

      (notices ? '<div class="notice"><h2>Good to know</h2><ul>' +
        "<li>The <strong>provincial election on October 24</strong> is a separate vote, one week later. Some local candidates are on both ballots." + srcChips(["ebc-candidates"]) + "</li>" +
        notices + "</ul></div>" : "") +

      '<div class="card"><h2>How your ballot works</h2>' +
        "<p>You vote for <strong>individual people</strong>, not a party list. Candidates in the same organization run as a team, but you can mix and match any way you like.</p>" +
        "<ul><li>Mayor: pick 1. Council: up to 8. School trustees: up to 7." + srcChips(["city-voters"]) + "</li>" +
        "<li>Voting for <strong>fewer</strong> than the maximum is fine. Marking <strong>more</strong> than the limit means your votes in that race won't count — your other races still do." + srcChips(["bc-lga"]) + "</li>" +
        "<li>The candidates with the most votes win the seats.</li></ul>" +
        more("What do the mayor, council and trustees actually decide?",
          "<p><strong>Mayor and council</strong> pass bylaws, set property taxes and fees, decide land use and zoning, and run local services like parks, recreation, roads and water. Most services are the council's choice to provide." + srcChips(["bc-municipal-powers"]) + "</p>" +
          "<p><strong>School trustees</strong> sit on the seven-member Board of Education, which sets procedures for Burnaby's public schools and oversees the district budget." + srcChips(["sd41-board"]) + "</p>" +
          "<p><strong>What the city doesn't control:</strong> some issues that come up in this campaign are mainly provincial. BC Housing builds and funds shelters and supportive housing," + srcChips(["city-homelessness"]) + " the province decides on hospital projects like Burnaby Hospital," + srcChips(["freshet-hospital"]) + " and provincial law sets minimum housing density on residential lots." + srcChips(["bc-ssmuh"]) + " Councils can still advocate on these.</p>") +
      "</div>" +

      '<div class="card"><h2>How to use this guide</h2><ul>' +
        '<li><a href="#candidates">Candidates</a>: every candidate, with key points from their own statement. Tap “Read full statement” for their exact words.</li>' +
        '<li><a href="#parties">Parties</a>: what each civic organization promises, in its own words.</li>' +
        '<li><a href="#issues">Issues</a>: background facts on the big debates and who has said what.</li>' +
        '<li><a href="#picks">My picks</a>: tap “Pick” on candidates to build a list for voting day. It stays on this device only.</li>' +
      "</ul></div>";
  }

  // -------------------------------------------------------------- CANDIDATES
  function renderCandidatesShell() {
    var seg = Object.keys(OFFICES).map(function (o) {
      var n = CANDS.filter(function (c) { return c.office === o; }).length;
      return '<button type="button" data-office="' + o + '">' + esc(OFFICES[o].plural) + "<span>" + n + " running</span></button>";
    }).join("");
    $("#view-candidates").innerHTML =
      "<div><h1>Candidates</h1>" +
      '<p class="muted small">Listed alphabetically by surname, the same order the City uses. Key points are drawn only from each candidate\'s own statement.</p></div>' +
      '<div class="seg" role="group" aria-label="Choose a race">' + seg + "</div>" +
      '<div class="filters">' +
        '<label><span class="visually-hidden">Search</span><input type="search" id="cand-q" placeholder="Search names or topics (e.g. transit)" autocomplete="off"></label>' +
        '<label><span class="visually-hidden">Organization</span><select id="cand-org"></select></label>' +
      "</div>" +
      '<div class="race-note" id="race-note"></div>' +
      '<div class="cand-list" id="cand-list"></div>';

    $all("#view-candidates .seg button").forEach(function (b) {
      b.addEventListener("click", function () { location.hash = "#candidates/" + b.dataset.office; });
    });
    $("#cand-q").addEventListener("input", function (ev) { state.query = ev.target.value.trim().toLowerCase(); renderCandidateList(); });
    $("#cand-org").addEventListener("change", function (ev) { state.org = ev.target.value; renderCandidateList(); });
    $("#cand-list").addEventListener("click", function (ev) {
      var btn = ev.target.closest(".pick-btn");
      if (!btn) return;
      if (togglePick(btn.dataset.id)) {
        var on = isPicked(btn.dataset.id);
        btn.setAttribute("aria-pressed", on);
        btn.textContent = on ? "✓ Picked" : "Pick";
        btn.closest(".cand").classList.toggle("is-picked", on);
        renderRaceNote();
      }
    });
  }

  function renderOrgOptions() {
    var inOffice = CANDS.filter(function (c) { return c.office === state.office; });
    var counts = {};
    inOffice.forEach(function (c) { var k = c.org || "none"; counts[k] = (counts[k] || 0) + 1; });
    var opts = '<option value="all">All organizations (' + inOffice.length + ")</option>";
    Object.keys(G.orgs).forEach(function (k) {
      if (counts[k]) opts += '<option value="' + k + '">' + esc(G.orgs[k].name) + " (" + counts[k] + ")</option>";
    });
    if (counts.none) opts += '<option value="none">Independent / none listed (' + counts.none + ")</option>";
    var sel = $("#cand-org");
    sel.innerHTML = opts;
    if (state.org !== "all" && !counts[state.org]) state.org = "all";
    sel.value = state.org;
  }

  function renderRaceNote() {
    var o = OFFICES[state.office], n = picks[state.office].length;
    $("#race-note").innerHTML = "<strong>" + esc(o.plural) + ": vote for " + (o.seats === 1 ? "1" : "up to " + o.seats) + "</strong>" +
      '<span class="meter' + (n >= o.seats ? " full" : "") + '">' + n + " of " + o.seats + " picked</span>";
  }

  function candidateCard(c) {
    var picked = isPicked(c.id);
    var badges = c.flags.map(function (f) {
      var l = FLAG_LABELS[f];
      return '<span class="badge' + (l.warn ? " warn" : "") + '">' + esc(l.text) + "</span>";
    }).join("");

    var notes = c.notes.length ? '<ul class="cand-notes">' + c.notes.map(function (n) {
      return "<li>" + esc(n.text) + srcChips(n.src) + "</li>";
    }).join("") + "</ul>" : "";

    var links = [];
    c.website.forEach(function (u) { links.push(ext(u, "Website")); });
    c.social.forEach(function (s) { links.push(ext(s.url, socialName(s.url))); });
    if (c.phone) links.push('<a href="tel:' + esc(c.phone.replace(/[^\d+]/g, "")) + '">' + esc(c.phone) + "</a>");

    var docs = [ext(c.profileUrl, "Official City profile")];
    if (c.nomination) docs.push(ext(c.nomination, "Nomination papers"));
    if (c.disclosure) docs.push(ext(c.disclosure, "Financial disclosure"));

    var statement = '<div class="statement">' + c.statement.map(function (p) { return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>"; }).join("") +
      '<p class="small muted">Written by the candidate, as published by the City of Burnaby.' + srcChips([OFFICES[c.office].src]) + "</p></div>";

    return '<article class="card cand' + (picked ? " is-picked" : "") + '" id="' + esc(c.id) + '">' +
      '<div class="cand-head"><div>' +
        '<h3 class="cand-name">' + esc(c.name) + "</h3>" +
        '<div class="cand-aff">' + esc(orgName(c)) + "</div>" +
      "</div>" +
      '<button type="button" class="pick-btn" data-id="' + esc(c.id) + '" aria-pressed="' + picked + '" aria-label="Pick ' + esc(plainName(c)) + '">' + (picked ? "✓ Picked" : "Pick") + "</button>" +
      "</div>" +
      (badges ? '<div class="badges">' + badges + "</div>" : "") +
      (c.points.length ? '<ul class="points">' + c.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" : "") +
      notes +
      more("Read full statement", statement) +
      more("Links & official documents", (links.length ? '<ul class="linkrow">' + links.map(function (l) { return "<li>" + l + "</li>"; }).join("") + "</ul>" : '<p class="small muted">No website or phone listed.</p>') +
        '<ul class="linkrow">' + docs.map(function (l) { return "<li>" + l + "</li>"; }).join("") + "</ul>" +
        (c.org ? '<p class="small"><a href="#parties/' + c.org + '">About ' + esc(G.orgs[c.org].name) + " →</a></p>" : "")) +
      "</article>";
  }

  function socialName(url) {
    var map = { "facebook.": "Facebook", "instagram.": "Instagram", "x.com": "X", "twitter.": "X", "linkedin.": "LinkedIn", "tiktok.": "TikTok", "youtube.": "YouTube", "bsky.app": "Bluesky", "threads.": "Threads" };
    for (var k in map) if (url.indexOf(k) > -1) return map[k];
    return "Social";
  }

  function matches(c) {
    if (c.office !== state.office) return false;
    if (state.org !== "all" && (c.org || "none") !== state.org) return false;
    if (!state.query) return true;
    var hay = [c.name, orgName(c), c.points.join(" "), c.statement.join(" ")].join(" ").toLowerCase();
    return state.query.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
  }

  function renderCandidateList() {
    var list = CANDS.filter(matches);
    $("#cand-list").innerHTML = list.length ? list.map(candidateCard).join("") :
      '<div class="card empty"><p>No candidates match that search.</p><button class="btn secondary" type="button" id="clear-filters">Clear search</button></div>';
    var clr = $("#clear-filters");
    if (clr) clr.addEventListener("click", function () { state.query = ""; state.org = "all"; $("#cand-q").value = ""; $("#cand-org").value = "all"; renderCandidateList(); });
  }

  function showCandidates(office, focusId) {
    if (!OFFICES[office]) office = "mayor";
    if (office !== state.office) state.org = "all";
    state.office = office;
    $all("#view-candidates .seg button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.office === office); });
    renderOrgOptions();
    renderRaceNote();
    if (focusId) { state.query = ""; state.org = "all"; $("#cand-q").value = ""; $("#cand-org").value = "all"; }
    renderCandidateList();
    if (focusId && document.getElementById(focusId)) {
      var card = document.getElementById(focusId);
      card.scrollIntoView({ block: "start" });
      var d = card.querySelector("details");
      if (d) d.open = true;
      return true;
    }
    return false;
  }

  // ----------------------------------------------------------------- PARTIES
  function renderParties() {
    var cards = Object.keys(G.orgs).map(function (k) {
      var o = G.orgs[k];
      var mine = CANDS.filter(function (c) { return c.org === k; });
      var counts = Object.keys(OFFICES).map(function (off) {
        var n = mine.filter(function (c) { return c.office === off; }).length;
        return n ? '<span class="badge">' + n + " " + esc(OFFICES[off].plural.replace("City ", "")) + "</span>" : "";
      }).join("");
      var roster = Object.keys(OFFICES).map(function (off) {
        var people = mine.filter(function (c) { return c.office === off; });
        if (!people.length) return "";
        return "<p><strong>" + esc(OFFICES[off].plural) + ":</strong> " + people.map(function (c) {
          return '<a href="#candidates/' + off + "/" + c.id + '">' + esc(plainName(c)) + "</a>";
        }).join(", ") + "</p>";
      }).join("");
      return '<article class="card" id="org-' + k + '">' +
        "<h2>" + esc(o.name) + "</h2>" +
        '<div class="org-counts">' + counts + "</div>" +
        (o.context || []).map(function (x) { return '<p class="small muted">' + esc(x.text) + srcChips(x.src) + "</p>"; }).join("") +
        '<p class="kicker">Key promises, in their words</p>' +
        '<ul class="says">' + o.says.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" +
        '<p class="small">' + srcChips(o.moreSrc || [o.platform]) + "</p>" +
        more("More of their platform", '<ul class="says">' + o.more.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" +
          "<p>" + ext(G.sources[o.platform].url, "Read the full platform") + " · " + ext(o.website, "Website") + "</p>") +
        more("Their candidates", roster) +
        "</article>";
    }).join("");

    var indep = CANDS.filter(function (c) { return !c.org; });
    $("#view-parties").innerHTML =
      "<div><h1>Parties</h1>" +
      '<p class="muted">In Burnaby, candidates can run with a civic “elector organization” or on their own. These are local groups, separate from provincial and federal parties. Listed alphabetically; promises are quoted or closely paraphrased from each group\'s own platform.</p></div>' +
      cards +
      '<article class="card"><h2>Independents</h2>' +
        "<p>" + indep.length + " candidates have no organization listed on their City profile. Each one's priorities are on their candidate card.</p>" +
        more("See independent candidates", Object.keys(OFFICES).map(function (off) {
          var people = indep.filter(function (c) { return c.office === off; });
          return people.length ? "<p><strong>" + esc(OFFICES[off].plural) + ":</strong> " + people.map(function (c) {
            return '<a href="#candidates/' + off + "/" + c.id + '">' + esc(plainName(c)) + "</a>";
          }).join(", ") + "</p>" : "";
        }).join("")) +
      "</article>";
  }

  // ------------------------------------------------------------------ ISSUES
  function renderIssues() {
    $("#view-issues").innerHTML =
      "<div><h1>Issues</h1>" +
      '<p class="muted">Background facts first, then what candidates and parties have said. These are examples from their published platforms and statements, not a ranking — and not everyone has addressed every issue.</p></div>' +
      G.issues.map(function (iss) {
        return '<article class="card" id="issue-' + iss.id + '">' +
          "<h2>" + esc(iss.title) + "</h2>" +
          "<p>" + esc(iss.summary) + "</p>" +
          more("The facts", "<ul>" + iss.facts.map(function (f) { return "<li>" + esc(f.text) + srcChips(f.src) + "</li>"; }).join("") + "</ul>") +
          more("What they say", '<ul class="positions">' + iss.positions.map(function (p) {
            return '<li><span class="who">' + esc(p.who) + "</span>" + esc(p.text) + srcChips(p.src) + "</li>";
          }).join("") + "</ul>") +
          (iss.further ? more("Further reading", "<ul>" + iss.further.map(function (id) {
            var s = G.sources[id];
            return "<li>" + ext(s.url, s.title) + ' <span class="muted small">— ' + esc(s.publisher) + ". Note the publisher's interest in the topic.</span></li>";
          }).join("") + "</ul>") : "") +
          "</article>";
      }).join("");
  }

  // ------------------------------------------------------------------- PICKS
  function picksAsText() {
    var lines = ["My picks — " + G.election.name, G.election.day + ", " + G.election.hours, ""];
    Object.keys(OFFICES).forEach(function (o) {
      lines.push(OFFICES[o].plural + " (" + picks[o].length + " of " + OFFICES[o].seats + "):");
      if (!picks[o].length) lines.push("  —");
      sortByBallot(picks[o]).forEach(function (id) { lines.push("  • " + plainName(BY_ID[id])); });
      lines.push("");
    });
    return lines.join("\n").trim();
  }
  function sortByBallot(ids) {
    return ids.slice().sort(function (a, b) { return CANDS.indexOf(BY_ID[a]) - CANDS.indexOf(BY_ID[b]); });
  }

  function renderPicks() {
    var total = picks.mayor.length + picks.council.length + picks.trustee.length;
    var races = Object.keys(OFFICES).map(function (o) {
      var seats = OFFICES[o].seats, ids = sortByBallot(picks[o]);
      return '<div class="picks-race"><div class="race-note"><h2>' + esc(OFFICES[o].plural) + "</h2>" +
        '<span class="meter' + (ids.length >= seats ? " full" : "") + '">' + ids.length + " of " + seats + "</span></div>" +
        (ids.length ? '<ul class="picks-list">' + ids.map(function (id) {
          var c = BY_ID[id];
          return '<li><span><a href="#candidates/' + o + "/" + id + '">' + esc(c.name) + '</a><br><span class="small muted">' + esc(orgName(c)) + "</span></span>" +
            '<button type="button" class="no-print" data-remove="' + esc(id) + '" aria-label="Remove ' + esc(plainName(c)) + '">Remove</button></li>';
        }).join("") + "</ul>" : '<p class="muted small">None picked yet. <a href="#candidates/' + o + '">Browse ' + esc(OFFICES[o].plural) + "</a>.</p>") +
        "</div>";
    }).join("");

    $("#view-picks").innerHTML =
      "<div><h1>My picks</h1>" +
      '<p class="muted">A personal checklist for voting day. It\'s saved only in this browser on this device — nothing is sent anywhere.</p></div>' +
      '<div class="card">' + races + "</div>" +
      (total ? '<div class="btn-row no-print"><button class="btn" type="button" id="copy-picks">Copy list</button>' +
        '<button class="btn secondary" type="button" id="print-picks">Print</button>' +
        '<button class="btn secondary" type="button" id="clear-picks">Clear all</button></div>' : "");

    $all("[data-remove]", $("#view-picks")).forEach(function (b) {
      b.addEventListener("click", function () { togglePick(b.dataset.remove); renderPicks(); });
    });
    var copy = $("#copy-picks");
    if (copy) copy.addEventListener("click", function () {
      var txt = picksAsText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () { toast("Copied — paste it into a note or message."); }, function () { fallbackCopy(txt); });
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
    try { document.execCommand("copy"); toast("Copied."); } catch (e) { toast("Couldn't copy — try Print instead."); }
    document.body.removeChild(ta);
  }

  // ------------------------------------------------------------------- ABOUT
  function renderAbout() {
    var groups = { official: "Official sources", candidate: "Candidate statements (via the City)", party: "Party platforms", news: "News coverage", "third-party": "Other guides & analysis" };
    var srcList = Object.keys(groups).map(function (type) {
      var items = Object.keys(G.sources).filter(function (id) { return G.sources[id].type === type; }).map(function (id) {
        var s = G.sources[id];
        return "<li>" + ext(s.url, s.title) + '<br><span class="muted">' + esc(s.publisher) + (s.date ? " · " + esc(s.date) : "") + "</span></li>";
      }).join("");
      return items ? "<h3>" + esc(groups[type]) + '</h3><ul class="source-list">' + items + "</ul>" : "";
    }).join("");

    $("#view-about").innerHTML =
      "<div><h1>About this guide</h1>" +
      '<p class="lede">An independent, non-partisan guide. It isn\'t affiliated with any candidate, party, or the City of Burnaby, and it doesn\'t endorse anyone.</p></div>' +

      '<div class="card"><h2>How it stays neutral</h2><ul>' +
        "<li><strong>Candidates speak for themselves.</strong> Every full statement is reproduced word-for-word from the City's official candidate profiles. The short key points are taken only from those statements.</li>" +
        "<li><strong>Same treatment for everyone.</strong> Every candidate gets the same card layout. They're listed alphabetically, as the City lists them.</li>" +
        "<li><strong>No ratings, pros/cons or predictions.</strong> We don't score candidates or say who is likely to win.</li>" +
        "<li><strong>Facts carry a source.</strong> Any context we add (like “currently in office”) links to where it came from — tap the small grey tags.</li>" +
        "<li><strong>No party colours.</strong> The design uses one neutral palette so no group gets a visual association.</li>" +
      "</ul></div>" +

      '<div class="card"><h2>What we left out, and why</h2><ul>' +
        "<li><strong>Polling.</strong> We couldn't find any published poll of Burnaby's 2026 races. An earlier draft of this guide included poll figures that couldn't be traced to a real source, so they were removed.</li>" +
        "<li><strong>Written “pros and cons”.</strong> These are opinions. We link to news coverage and each group's platform instead, so you can judge.</li>" +
        "<li><strong>Claims we couldn't verify.</strong> If something couldn't be backed by a source we could link to, it isn't here.</li>" +
      "</ul></div>" +

      '<div class="card"><h2>Corrections</h2>' +
        "<p>Found a mistake, a missing source, or wording that seems unfair to a candidate? Please open an issue or pull request on this guide's code repository, with a link to a source. Candidates can ask for corrections the same way.</p>" +
        '<p class="small muted">Content last updated ' + esc(G.lastUpdated) + ". Candidate statements fetched " + esc(P.fetched) + ".</p></div>" +

      '<div class="card"><h2>All sources</h2>' + srcList + "</div>";
  }

  // ------------------------------------------------------------------ ROUTER
  var rendered = {};
  function route() {
    var parts = (location.hash || "#start").slice(1).split("/");
    var view = parts[0] || "start";
    if (!document.getElementById("view-" + view)) view = "start";

    $all("main > section").forEach(function (s) { s.hidden = s.dataset.view !== view; });
    $all(".tabs a").forEach(function (a) {
      if (a.dataset.tab === view) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    var activeTab = $('.tabs a[data-tab="' + view + '"]');
    if (activeTab && activeTab.scrollIntoView) activeTab.scrollIntoView({ block: "nearest", inline: "nearest" });

    var scrolled = false;
    if (view === "start") renderStart();
    if (view === "candidates") {
      if (!rendered.candidates) { renderCandidatesShell(); rendered.candidates = true; }
      scrolled = showCandidates(parts[1] || state.office, parts[2]);
    }
    if (view === "parties") {
      if (!rendered.parties) { renderParties(); rendered.parties = true; }
      if (parts[1] && document.getElementById("org-" + parts[1])) { document.getElementById("org-" + parts[1]).scrollIntoView({ block: "start" }); scrolled = true; }
    }
    if (view === "issues" && !rendered.issues) { renderIssues(); rendered.issues = true; }
    if (view === "picks") renderPicks();
    if (view === "about" && !rendered.about) { renderAbout(); rendered.about = true; }

    if (!scrolled) window.scrollTo(0, 0);
    document.title = (view === "start" ? "" : ($(".tabs a[aria-current]") || {}).textContent.replace(/\d+$/, "").trim() + " · ") + "Burnaby Votes 2026 – Voter Guide";
  }

  initTheme();
  updatePickCount();
  window.addEventListener("hashchange", route);
  route();
})();
