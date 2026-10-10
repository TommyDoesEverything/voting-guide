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
    var cand = Object.assign({}, c, { points: extra.points || [], flags: extra.flags || [], notes: extra.notes || [], ops: OPS[c.id] || [], sig: (G.signature || {})[c.id] || [] });
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
  // Colour class for a party key (or null for independents). Colours are each
  // party's own branding; independents get a neutral slate.
  function pc(key) { return " pc-" + (key && G.orgs[key] ? key : "independent"); }

  // Build CSS custom properties for every party from the data, for light and dark themes.
  function injectPartyColors() {
    var all = {};
    Object.keys(G.orgs).forEach(function (k) { all[k] = G.orgs[k].color; });
    all.independent = G.independentColor;
    var light = "", dark = "";
    Object.keys(all).forEach(function (k) {
      var c = all[k];
      light += ".pc-" + k + "{--pc:" + c.brand + ";--pc-ink:" + c.ink + ";}";
      dark += ".pc-" + k + "{--pc-ink:" + c.inkDark + ";}";
    });
    var css = light +
      "@media (prefers-color-scheme: dark){:root:not([data-theme=light]) " + dark.replace(/\}\./g, "} :root:not([data-theme=light]) .") + "}" +
      ":root[data-theme=dark] " + dark.replace(/\}\./g, "} :root[data-theme=dark] .");
    var el = document.createElement("style");
    el.id = "party-colors";
    el.textContent = css;
    document.head.appendChild(el);
  }
  // Party badge that links to the party (or the Independents card) on the Parties page.
  function orgBadge(c) {
    var target = c.org || "independent";
    return '<a class="badge badge-link party-badge' + pc(c.org) + '" href="#parties/' + target + '" title="About ' + esc(c.org ? G.orgs[c.org].name : "independent candidates") + '">' + esc(orgShort(c)) + "</a>";
  }
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
  // A speaker's name as a link: to their candidate profile if they're running,
  // to their party if the speaker is the party itself, otherwise plain text.
  // Colour is only used when the name links somewhere.
  function speakerLink(name, orgKey) {
    if (orgKey && G.orgs[orgKey] && G.orgs[orgKey].name === name) {
      return '<a class="party-link' + pc(orgKey) + '" href="#parties/' + orgKey + '">' + esc(name) + "</a>";
    }
    var c = CANDS.filter(function (x) { return plainName(x) === name; })[0];
    if (c) return '<a class="party-link' + pc(c.org) + '" href="#candidates/' + c.office + "/" + c.id + '">' + esc(name) + "</a>";
    return "<b>" + esc(name) + "</b>";
  }
  function voiceLine(v) {
    var parts = [speakerLink(v.name, v.org)];
    var org = v.org && G.orgs[v.org];
    if (org && org.name !== v.name) parts.push('<a class="party-link' + pc(v.org) + '" href="#parties/' + v.org + '">' + esc(org.short) + "</a>");
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
      var cls = r.id && BY_ID[r.id] ? pc(BY_ID[r.id].org) + " party-bar" : "";
      return '<div class="bar-row' + (r.other ? " other" : "") + cls + '">' + nm +
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
          '<div class="stat"><b>5</b><span>Civic parties ' + srcChips(["freshet-council-race"]) + "</span></div>" +
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

      keyIssues() +

      pollSection();
  }

  // Compact preview of the Issues tab; each card links to the full, sourced issue.
  function keyIssues() {
    return '<div><h2>Key issues in this election</h2><p class="small muted">The debates candidates and parties return to most. Each links to sourced background and what each side has said.</p></div>' +
      '<div class="grid-3 issue-previews">' + G.issues.map(function (iss, i) {
        return '<a class="card issue-preview" href="#issues/' + iss.id + '">' +
          '<div class="issue-head"><span class="issue-num">' + (i + 1) + "</span><h3>" + esc(iss.title) + "</h3></div>" +
          '<p class="sum">' + esc(iss.summary) + "</p>" +
          '<span class="more-link">Facts and positions →</span></a>';
      }).join("") + "</div>";
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
      var more = ev.target.closest(".focus-toggle");
      if (more) {
        var expanded = more.getAttribute("aria-expanded") !== "true";
        more.previousElementSibling.classList.toggle("clamped", !expanded);
        more.setAttribute("aria-expanded", expanded);
        more.textContent = expanded ? "Show less" : "Show all";
        return;
      }
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

  // Status flags, then the candidate's two signature tags, then broad topics.
  function tagRow(c, topicLimit) {
    return c.flags.map(function (f) { return '<span class="tag ' + FLAGS[f].cls + '">' + esc(FLAGS[f].text) + "</span>"; })
      .concat(c.sig.map(function (t) { return '<span class="tag sig">' + esc(t) + "</span>"; }))
      .concat(c.topics.slice(0, topicLimit).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; })).join("");
  }

  function candidateCard(c) {
    var tags = tagRow(c, 2);
    var debate = debateCount(c.ops);
    return '<article class="cc party-edge' + pc(c.org) + (isPicked(c.id) ? " is-picked" : "") + '" id="card-' + esc(c.id) + '">' +
      "<div>" +
        '<div class="cc-top"><span class="badge' + (c.office === "mayor" ? " solid" : "") + '">' + esc(OFFICES[c.office].label) + '</span>' + orgBadge(c) + "</div>" +
        '<h3 class="cc-name">' + esc(c.name) + "</h3>" +
        (tags ? '<div class="cc-tags">' + tags + "</div>" : "") +
        '<div class="cc-focus-wrap"><p class="cc-focus-label">Focus</p>' +
          '<ul class="cc-focus clamped">' + c.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" +
          '<button type="button" class="focus-toggle" aria-expanded="false" hidden>Show all</button></div>' +
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
    var hay = [c.name, orgName(c), c.points.join(" "), c.sig.join(" "), c.topics.join(" "), c.statement.join(" ")].join(" ").toLowerCase();
    return state.query.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
  }

  function renderCandidateList() {
    var list = CANDS.filter(matches);
    $("#cand-list").innerHTML = list.length ? list.map(candidateCard).join("") :
      '<div class="card empty"><p>No candidates match that search.</p><button class="btn" type="button" id="clear-filters">Reset filters</button></div>';
    var clr = $("#clear-filters");
    if (clr) clr.addEventListener("click", function () { state.query = ""; state.org = "all"; $("#cand-q").value = ""; $("#cand-org").value = "all"; renderCandidateList(); });
    fitFocusLists();
  }

  // Show the whole focus list unless it is unusually long; only then keep it
  // clamped and reveal a Show all / Show less toggle.
  function fitFocusLists() {
    $all("#cand-list .cc-focus").forEach(function (ul) {
      var btn = ul.nextElementSibling;
      ul.classList.add("clamped");
      var overflows = ul.scrollHeight > ul.clientHeight + 2;
      ul.classList.toggle("clamped", overflows);
      btn.hidden = !overflows;
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = "Show all";
    });
  }
  var fitTimer;
  window.addEventListener("resize", function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(function () { if (route.view === "candidates") fitFocusLists(); }, 150);
  });

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
    var badges = '<span class="badge' + (c.office === "mayor" ? " solid" : "") + '">' + esc(o.label) + '</span>' + orgBadge(c) +
      c.flags.map(function (f) { return '<span class="badge' + (FLAGS[f].cls === "warn" ? " warn" : "") + '">' + esc(FLAGS[f].text) + "</span>"; }).join("");

    function noteList(list) { return list.map(function (n) { return "<li>" + esc(n.text) + srcChips(n.src) + "</li>"; }).join(""); }
    var facts = c.notes.filter(function (n) { return n.kind !== "jurisdiction"; });
    var juris = c.notes.filter(function (n) { return n.kind === "jurisdiction"; });
    var notes = (facts.length ? '<div class="pf-sec"><p class="label">Good to know</p><div class="pf-box"><ul>' + noteList(facts) + "</ul></div></div>" : "") +
      (juris.length ? '<div class="pf-sec"><p class="label">Who decides this?</p><div class="pf-box juris"><p class="juris-intro">Some of these promises depend on another level of government. These notes say who controls them; a mayor or council can still advocate.</p><ul>' +
        noteList(juris) + "</ul></div></div>" : "");

    var links = [];
    c.website.forEach(function (u) { links.push(ext(u, "Website")); });
    c.social.forEach(function (s) { links.push(ext(s.url, socialName(s.url))); });
    if (c.phone) links.push('<a href="tel:' + esc(c.phone.replace(/[^\d+]/g, "")) + '">' + esc(c.phone) + "</a>");
    var docs = [ext(c.profileUrl, "Official City profile")];
    if (c.nomination) docs.push(ext(c.nomination, "Nomination papers"));
    if (c.disclosure) docs.push(ext(c.disclosure, "Financial disclosure"));

    var statement = '<div class="statement">' + c.statement.map(function (p) { return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>"; }).join("") +
      '<p class="small muted">Written by the candidate, as published by the City of Burnaby.' + srcChips([o.src]) + "</p></div>";

    dlg.innerHTML = '<div class="pf party-edge' + pc(c.org) + '">' +
      '<div class="pf-head"><div><div class="badges">' + badges + '</div><h2 class="pf-name" id="pf-name">' + esc(c.name) + '</h2><div class="pf-aff"><span class="party-dot' + pc(c.org) + '"></span>' + esc(orgName(c)) + '</div><div class="cc-tags pf-tags">' +
        c.sig.map(function (t) { return '<span class="tag sig">' + esc(t) + "</span>"; }).join("") +
        c.topics.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div></div>" +
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
      '<div class="cue-anchor"><button type="button" class="scroll-cue cue-down" tabindex="-1" aria-hidden="true">›</button></div>' +
      '<div class="pf-foot"><span class="meta">' + esc(orgShort(c)) + " · " + esc(o.plural) + '</span><span class="btns">' + pickButton(c) +
        '<button type="button" class="btn sm" data-close>Close</button></span></div>' +
      "</div>";
    if (!dlg.open) dlg.showModal();
    var body = $(".pf-body", dlg);
    body.scrollTop = 0;
    watchScroll(body, $(".cue-anchor", dlg), "y");
  }

  // Fade + arrow on an edge while there is more to scroll in that direction.
  // `holder` gets the "more" class; its .scroll-cue button scrolls one step.
  function watchScroll(el, holder, axis) {
    function update() {
      var more = axis === "y"
        ? el.scrollTop + el.clientHeight < el.scrollHeight - 8
        : el.scrollLeft + el.clientWidth < el.scrollWidth - 8;
      holder.classList.toggle("more", more);
    }
    if (!el._cueBound) {
      el.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      el._cueBound = true;
    }
    var cue = $(".scroll-cue", holder);
    if (cue && !cue._cueBound) {
      cue.addEventListener("click", function () {
        if (axis === "y") el.scrollBy({ top: el.clientHeight * 0.7, behavior: "smooth" });
        else el.scrollBy({ left: el.clientWidth * 0.6, behavior: "smooth" });
      });
      cue._cueBound = true;
    }
    // Re-check after layout settles (details opening, fonts, images).
    update();
    requestAnimationFrame(update);
    if (axis === "y") $all("details", el).forEach(function (d) { d.addEventListener("toggle", update); });
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

  function candLink(c) { return '<a href="#candidates/' + c.office + "/" + c.id + '">' + esc(plainName(c)) + "</a>"; }

  // Mayor / Council / Trustee count tiles for a group of candidates.
  function countTiles(people) {
    return '<div class="party-counts">' + Object.keys(OFFICES).map(function (off) {
      var n = people.filter(function (c) { return c.office === off; }).length;
      return '<div class="' + (n ? "" : "none") + '"><b>' + (n || "-") + "</b><span>" + esc(OFFICES[off].label) + "</span></div>";
    }).join("") + "</div>";
  }

  function rosterBlock(people) {
    return Object.keys(OFFICES).map(function (off) {
      var list = people.filter(function (c) { return c.office === off; });
      return list.length ? '<p class="small"><strong>' + esc(OFFICES[off].plural) + ":</strong> " + list.map(candLink).join(", ") + "</p>" : "";
    }).join("");
  }

  // Side-by-side table of what each party's platform says on the same topics.
  function compareTable() {
    var keys = Object.keys(G.orgs);
    var head = "<tr><th scope=\"col\">Topic</th>" + keys.map(function (k) {
      return '<th scope="col" class="' + pc(k).trim() + '"><a class="party-text" href="#parties/' + k + '"><span class="party-dot"></span>' + esc(G.orgs[k].short) + "</a></th>";
    }).join("") + "</tr>";
    var rows = G.compareTopics.map(function (t) {
      return '<tr><th scope="row"><a href="#issues/' + t.issue + '">' + esc(t.label) + "</a></th>" + keys.map(function (k) {
        var st = (G.orgs[k].stances || {})[t.id];
        return '<td class="' + pc(k).trim() + '" data-label="' + esc(G.orgs[k].short) + '">' +
          "<div>" + (st ? esc(st.text) + srcChips(st.src) : '<span class="na">Not in their platform</span>') + "</div></td>";
      }).join("") + "</tr>";
    }).join("");
    return '<div class="card compare-card"><h2>Compare their platforms</h2>' +
      '<p class="small muted">What each party\'s published platform says on the same five topics, quoted or closely paraphrased. "Not in their platform" means we didn\'t find it there, not that they oppose it. Tap a topic for background facts.</p>' +
      '<div class="compare-scroll"><table class="compare"><thead>' + head + "</thead><tbody>" + rows + "</tbody></table></div></div>";
  }

  function renderParties() {
    var cards = Object.keys(G.orgs).map(function (k) {
      var o = G.orgs[k];
      var mine = CANDS.filter(function (c) { return c.org === k; });
      // Their mayoral candidate and anyone currently in office.
      var notable = mine.filter(function (c) { return c.office === "mayor" || c.flags.indexOf("incumbent") > -1; });
      return '<article class="card party party-top-edge' + pc(k) + '" id="org-' + k + '">' +
        '<div class="party-top"><span class="badge' + (o.role === "Governing party" ? " solid" : "") + '">' + esc(o.role) + "</span>" +
          ext(o.website, "Website") + "</div>" +
        '<h2><span class="party-dot"></span>' + esc(o.name) + "</h2>" +
        (o.tagline ? '<p class="tagline">“' + esc(o.tagline.text) + "”" + srcChips(o.tagline.src) + "</p>" : "") +
        countTiles(mine) +
        '<dl class="kv"><div><dt>Political lean</dt><dd>' + leanText(o) + "</dd></div>" +
          (notable.length ? "<div><dt>Notable</dt><dd>" + notable.map(function (c) {
            return candLink(c) + ' <span class="muted small">(' + (c.office === "mayor" ? "for mayor" : "incumbent " + OFFICES[c.office].label.toLowerCase()) + ")</span>";
          }).join("<br>") + "</dd></div>" : "") +
        "</dl>" +
        (o.context && o.context.length ? '<ul class="party-context">' + o.context.map(function (x) { return "<li>" + esc(x.text) + srcChips(x.src) + "</li>"; }).join("") + "</ul>" : "") +
        '<p class="label">Key promises, in their words</p>' +
        '<ul class="says">' + o.says.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" +
        '<p class="small">' + srcChips(o.moreSrc || [o.platform]) + "</p>" +
        '<p class="label">Arguments for & against</p>' + opinionsBox(OPS[k] || [], o.name) +
        more("More of their platform", '<ul class="says">' + o.more.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" +
          "<p>" + ext(G.sources[o.platform].url, "Read the full platform") + "</p>") +
        more("All " + mine.length + " candidates", rosterBlock(mine)) +
        "</article>";
    }).join("");

    var indep = CANDS.filter(function (c) { return !c.org; });
    var indepNotable = indep.filter(function (c) { return c.flags.indexOf("incumbent") > -1; });
    $("#view-parties").innerHTML =
      intro("Parties", "Candidates can run with a civic party (officially an \"elector organization\") or on their own. These are local groups, separate from provincial and federal parties. Listed alphabetically. Promises are quoted or closely paraphrased from each party's platform. A political lean is shown only where an independent source states one.") +
      compareTable() +
      '<div class="grid-2 party-grid">' + cards +
      '<article class="card party party-top-edge' + pc(null) + '" id="org-independent"><div class="party-top"><span class="badge">No party</span></div><h2><span class="party-dot"></span>Independents</h2>' +
        '<p class="tagline">' + indep.length + " candidates have no party listed on their City profile. Each sets out their own priorities on their candidate card.</p>" +
        countTiles(indep) +
        (indepNotable.length ? '<dl class="kv"><div><dt>Notable</dt><dd>' + indepNotable.map(function (c) {
          return candLink(c) + ' <span class="muted small">(incumbent ' + OFFICES[c.office].label.toLowerCase() + ")</span>";
        }).join("<br>") + "</dd></div></dl>" : "") +
        '<div class="indep-roster">' + rosterBlock(indep) + "</div>" +
      "</article></div>";
  }

  // ------------------------------------------------------------------ ISSUES
  function renderIssues() {
    var jump = '<nav class="issue-jump" aria-label="Jump to issue">' + G.issues.map(function (iss, i) {
      return '<a href="#issues/' + iss.id + '"><span>' + (i + 1) + "</span>" + esc(iss.title) + "</a>";
    }).join("") + "</nav>";

    $("#view-issues").innerHTML =
      intro("Issues", "The big debates in this election. Each starts with sourced background facts, then where every party stands (the same positions as the comparison on the Parties page), then examples of individual candidates who have spoken to it.") +
      jump +
      G.issues.map(function (iss, i) {
        var topic = G.compareTopics.filter(function (t) { return t.issue === iss.id; })[0];
        var parties = Object.keys(G.orgs).map(function (k) {
          var st = topic && (G.orgs[k].stances || {})[topic.id];
          return '<div class="stance' + pc(k) + (st ? "" : " empty") + '">' +
            '<a class="stance-name party-link' + pc(k) + '" href="#parties/' + k + '"><span class="party-dot"></span>' + esc(G.orgs[k].short) + "</a>" +
            (st ? "<p>" + esc(st.text) + srcChips(st.src) + "</p>" : '<p class="na">Not in their platform</p>') + "</div>";
        }).join("");
        var voices = (iss.candidates || []).map(function (v) {
          var c = BY_ID[v.id];
          return '<li class="' + pc(c.org).trim() + '"><a class="party-link' + pc(c.org) + '" href="#candidates/' + c.office + "/" + c.id + '"><span class="party-dot"></span>' + esc(plainName(c)) + "</a>" +
            '<span class="voice-meta">' + esc(OFFICES[c.office].label) + " · " + esc(orgShort(c)) + "</span>" +
            "<p>" + esc(v.text) + srcChips(v.src) + "</p></li>";
        }).join("");
        return '<article class="card issue" id="issue-' + iss.id + '">' +
          '<div class="issue-head"><span class="issue-num">' + (i + 1) + "</span><h2>" + esc(iss.title) + "</h2></div>" +
          '<p class="sum">' + esc(iss.summary) + "</p>" +
          '<div class="issue-body">' +
            '<div class="issue-facts"><p class="label">The facts</p><ul>' + iss.facts.map(function (f) { return "<li>" + esc(f.text) + srcChips(f.src) + "</li>"; }).join("") + "</ul></div>" +
            '<div class="issue-parties"><p class="label">Where the parties stand <span class="muted">(from their platforms)</span></p><div class="stances">' + parties + "</div></div>" +
          "</div>" +
          (voices ? more("Candidates who've spoken to this (" + iss.candidates.length + ")", '<p class="small muted">Examples from candidates\' own statements and news coverage, not a complete list.</p><ul class="voices">' + voices + "</ul>") : "") +
          (iss.further ? more("Further reading", "<ul>" + iss.further.map(function (id) {
            var s = G.sources[id];
            return "<li>" + ext(s.url, s.title) + ' <span class="muted small">(' + esc(s.publisher) + ". Note the publisher's interest in the topic.)</span></li>";
          }).join("") + "</ul>") : "") +
          '<p class="issue-foot"><a href="#parties">Compare all party platforms →</a></p>' +
          "</article>";
      }).join("");
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
          return '<li class="' + pc(c.org).trim() + '"><span><a href="#candidates/' + o + "/" + id + '">' + esc(c.name) + '</a><small><span class="party-dot"></span>' + esc(orgName(c)) + "</small></span>" +
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
        "<li><strong>Who decides this?</strong> When a candidate promises to directly do something another government controls (like setting tuition), a sourced note says who controls it. Promises to advocate don't get one. The same test applies to everyone.</li>" +
        "<li><strong>Facts carry a source.</strong> Tap the small ↗ tags to see where anything came from.</li>" +
        "<li><strong>Party colours are their own.</strong> Each party is shown in the main colour from its own website; independents are a neutral grey. No predictions.</li>" +
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
    if (view === "issues") {
      if (!rendered.issues) { renderIssues(); rendered.issues = true; }
      var issue = parts[1] && document.getElementById("issue-" + parts[1]);
      if (issue) {
        issue.scrollIntoView({ block: "start" });
        $all("details", issue).forEach(function (d) { d.open = true; });
        keepScroll = true;
      }
    }
    if (view === "picks") renderPicks();
    if (view === "about" && !rendered.about) { renderAbout(); rendered.about = true; }

    if (!keepScroll) window.scrollTo(0, 0);
    var tabName = activeTab ? activeTab.textContent.replace(/[^\w\s]/g, "").replace(/\d+$/, "").trim() : "";
    document.title = (view === "start" ? "" : tabName + " · ") + "Burnaby Votes 2026 - Voter Guide";
  }

  injectPartyColors();
  initTheme();
  initDialog();
  updatePickCount();
  window.addEventListener("hashchange", route);
  route();
  watchScroll($(".tabs"), $(".tabs-wrap"), "x");
})();
