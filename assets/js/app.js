/* Voter guide app - renders one election from elections/<id>/ (loaded by
   assets/js/loader.js). No frameworks, no build step. */
(function () {
  "use strict";

  var G = window.GUIDE;
  var P = window.PROFILES;
  var OPS = window.OPINIONS || {};
  var POLLS = window.POLLS || [];
  var RES = window.RESULTS || null;
  var META = window.ELECTION;            // registry entry for this election
  var REG = window.ELECTIONS;            // all elections
  var E = G.election;
  var PAST = META.status === "past";
  // Wording that differs between kinds of election; defaults fit a local election.
  var COPY = Object.assign({
    votingDay: "General Voting Day",
    ballotIntro: "You vote for <strong>individual people</strong>, not a party list. People in the same party run as a team, but you can mix and match.",
    partiesIntro: "Candidates can run with a civic party (officially an \"elector organization\") or on their own. These are local groups, separate from provincial and federal parties. Listed alphabetically. Promises are quoted or closely paraphrased from each party's platform. A political lean is shown only where an independent source states one.",
    independentsNote: "candidates have no party listed on their City profile. Each sets out their own priorities on their candidate card.",
    profileLink: "Official City profile",
    noStatement: "No statement published.",
    aboutStatements: "<strong>Candidates speak for themselves.</strong> Full statements are reproduced from the City's official profiles (punctuation lightly normalized). Card focus points come only from those statements.",
    aboutOrder: "<strong>Same treatment for everyone.</strong> Same card layout, the City's alphabetical order, and topic tags assigned by the same keyword rules for every candidate.",
    candidateSources: "Candidate statements (via the City)",
    listedAs: "as the " + E.authority + " lists them",
  }, E.copy || {});
  if (RES && RES.sources) Object.keys(RES.sources).forEach(function (k) { G.sources[k] = RES.sources[k]; });

  var OFFICES = {};
  E.offices.forEach(function (o) { OFFICES[o.id] = o; });
  var TOTAL_SEATS = E.offices.reduce(function (n, o) { return n + o.seats; }, 0);
  var FLAGS = {
    incumbent: { text: "Incumbent", cls: "strong" },
    withdrawn: { text: "Says no longer running", cls: "warn" },
    provincial: { text: "Also on provincial ballot", cls: "warn" },
    local: { text: "Also on local ballot", cls: "warn" },
  };
  var CROSS_FLAGS = ["withdrawn", "provincial", "local"];   // listed under "Good to know"
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
  var ELECTION_DAY = new Date(META.date + "T00:00:00");
  var POLLS_CLOSE = new Date(META.date + "T" + (META.close || "23:59") + ":00");

  // Merge official profiles with curated content.
  var CANDS = P.candidates.map(function (c) {
    var extra = G.candidates[c.id] || {};
    var cand = Object.assign({}, c, { points: extra.points || [], flags: extra.flags || [], notes: extra.notes || [], ops: OPS[c.id] || [], sig: (G.signature || {})[c.id] || [] });
    cand.topics = topicsFor(cand);
    return cand;
  });
  var BY_ID = {};
  CANDS.forEach(function (c) { BY_ID[c.id] = c; });

  var state = { office: E.offices[0].id, org: "all", query: "" };

  // ---------------------------------------------------------------- helpers
  // Inline line icon from the sprite in index.html (decorative).
  function icon(name, cls) { return '<svg class="i' + (cls ? " " + cls : "") + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>'; }
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
  var MORE_ICONS = { "Links & official documents": "link", "More of their platform": "file", "Further reading": "news", "Who can vote, accepted ID and accessibility": "id", "What do they actually decide?": "landmark" };
  function more(summary, body, open, ico) {
    ico = ico || MORE_ICONS[summary] || (/^All \d+ candidates/.test(summary) ? "users" : /^Candidates who/.test(summary) ? "users" : /^Arguments for/.test(summary) ? "scale" : null);
    return '<details class="more"' + (open ? " open" : "") + "><summary>" + (ico ? icon(ico) : "") + esc(summary) + '</summary><div class="more-body">' + body + "</div></details>";
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
  var PICKS_KEY = "vg-picks:" + META.id;
  function emptyPicks() { var o = {}; E.offices.forEach(function (x) { o[x.id] = []; }); return o; }
  var picks = store.get(PICKS_KEY, null) || (META.id === "burnaby-2026" && store.get("bv26-picks", null)) || emptyPicks();
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
    store.set(PICKS_KEY, picks);
    updatePickCount();
    syncPickButtons(id);
    return true;
  }
  function syncPickButtons(id) {
    var on = isPicked(id);
    $all('.pick-btn[data-id="' + id + '"]').forEach(function (b) {
      b.setAttribute("aria-pressed", on);
      b.innerHTML = icon(on ? "check" : "star") + (on ? "Picked" : "Pick");
    });
    var card = document.getElementById("card-" + id);
    if (card) card.classList.toggle("is-picked", on);
    if ($("#race-count")) renderRaceCount();
  }
  function updatePickCount() {
    var n = Object.keys(picks).reduce(function (t, k) { return t + picks[k].length; }, 0);
    var el = $("#picks-count");
    el.textContent = n;
    el.hidden = n === 0;
  }
  function pickButton(c) {
    var on = isPicked(c.id);
    return '<button type="button" class="btn sm ghost pick-btn" data-id="' + esc(c.id) + '" aria-pressed="' + on + '" aria-label="Pick ' + esc(plainName(c)) + '">' + icon(on ? "check" : "star") + (on ? "Picked" : "Pick") + "</button>";
  }

  // -------------------------------------------------------------------- theme
  function initTheme() {
    var btn = $("#theme-btn");
    var META = { auto: "System", light: "Light", dark: "Dark" };
    var ICONS = { auto: "monitor", light: "sun", dark: "moon" };
    function label() {
      var t = document.documentElement.dataset.theme || "auto";
      $("#theme-label").textContent = META[t];
      $("#theme-icon").setAttribute("href", "#i-" + ICONS[t]);
      btn.setAttribute("aria-label", "Colour theme: " + META[t] + ". Tap to change.");
    }
    btn.addEventListener("click", function () {
      var order = ["auto", "light", "dark"];
      var cur = document.documentElement.dataset.theme || "auto";
      var next = order[(order.indexOf(cur) + 1) % order.length];
      if (next === "auto") { delete document.documentElement.dataset.theme; try { localStorage.removeItem("vg-theme"); } catch (e) {} }
      else { document.documentElement.dataset.theme = next; try { localStorage.setItem("vg-theme", next); } catch (e) {} }
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
      { key: "for", label: "Arguments for", tag: "For", icon: "check" },
      { key: "against", label: "Criticisms & arguments against", tag: "Against", icon: "x" },
      { key: "reported", label: "Reported in news coverage", tag: "Reported", icon: "news" },
    ];
    var body = groups.map(function (g) {
      var items = list.filter(function (o) { return o.stance === g.key; });
      if (!items.length) return "";
      return '<div class="op-group"><p class="label">' + esc(g.label) + '</p><ul class="ops">' + items.map(function (o) {
        return '<li class="op"><span class="op-tag">' + icon(g.icon) + g.tag + '</span><div><div class="say">' + esc(o.text) + srcChips(o.src) + "</div>" + voiceLine(o.voice) + "</div></li>";
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
    if (now > POLLS_CLOSE) return "Voting has closed." + (RES ? "" : " " + (E.resultsNote || ""));
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.round((ELECTION_DAY - today) / 86400000);
    if (days === 0) return "Today is " + COPY.votingDay + ". Polls are open " + E.hours + ".";
    if (days === 1) return COPY.votingDay + " is tomorrow.";
    return days + " days until " + COPY.votingDay + ".";
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
    return '<div><h2 class="h-ico">' + icon("chart") + 'What ' + esc(E.place) + ' residents told pollsters</h2><p class="small muted">' + esc(p.pollster) + " · fieldwork " + esc(p.fieldDates) + " · " + p.localN + " " + esc(E.place) + " respondents" + srcChips(p.src) + "</p></div>" +
      '<div class="grid-2">' +
        '<div class="card"><p class="label">Mayoral vote intention</p><p class="small muted">"' + esc(p.mayor.question) + '"</p><div class="bars">' + barRows(p.mayor.results, "mayor") + '</div><p class="small muted">' + esc(p.mayor.note) + "</p></div>" +
        '<div class="card"><p class="label">' + esc(E.place) + ' mood</p><div class="snap">' + snap + '</div><p class="label" style="margin-top:16px">Top local issues</p><div class="bars">' + barRows(p.issues) + '</div><p class="small muted">' + esc(p.issuesNote) + "</p></div>" +
      "</div>" +
      '<div class="caveat"><strong>Read with care:</strong> nearly half of ' + esc(E.place) + ' respondents were undecided, and this is one online poll with a small local sample. ' + esc(p.moeNote) + " A poll is a snapshot, not a prediction. In local elections, who actually turns out matters most.</div>";
  }

  function htmlItems(list, tag) {
    return (list || []).map(function (x) {
      return "<" + tag + ">" + (x.icon ? icon(x.icon) + "<span>" : "") + x.html + srcChips(x.src) + (x.icon ? "</span>" : "") + "</" + tag + ">";
    }).join("");
  }

  function renderStart() {
    var e = E;
    var tiles = Object.keys(OFFICES).map(function (o) {
      var n = CANDS.filter(function (c) { return c.office === o; }).length;
      return '<a class="tile" href="#candidates/' + o + '"><span class="tile-ico">' + icon(OFFICES[o].icon) + '</span><span class="tile-text"><span class="label">' + esc(OFFICES[o].plural) + "</span>" +
        "<strong>" + (PAST ? (OFFICES[o].seats === 1 ? "1 seat" : OFFICES[o].seats + " seats") : "Vote for " + (OFFICES[o].seats === 1 ? "1" : "up to " + OFFICES[o].seats)) + "</strong>" +
        '<span class="small muted">' + n + ' candidates</span></span><span class="arrow">' + icon("arrow") + '</span></a>';
    }).join("");

    var flagged = PAST ? [] : CANDS.filter(function (c) { return c.flags.some(function (f) { return CROSS_FLAGS.indexOf(f) > -1; }); });
    var notices = (PAST ? "" : htmlItems(e.alerts, "li")) + flagged.map(function (c) {
      return '<li><a href="#candidates/' + c.office + "/" + c.id + '">' + esc(plainName(c)) + "</a> (" + esc(OFFICES[c.office].label) + "): " +
        c.notes.map(function (n) { return esc(n.text) + srcChips(n.src); }).join(" ") + "</li>";
    }).join("");

    var stats = '<div class="stat"><b>' + CANDS.length + "</b><span>Candidates</span></div>" +
      '<div class="stat"><b>' + TOTAL_SEATS + "</b><span>Seats</span></div>" +
      (e.stats || []).slice(0, 2).map(function (st) {
        return '<div class="stat"><b>' + esc(st.value) + "</b><span>" + esc(st.label) + " " + srcChips(st.src) + "</span></div>";
      }).join("");
    if (PAST && RES && RES.turnout) {
      stats = stats.replace(/<div class="stat"><b>[^<]*<\/b><span>Turnout[\s\S]*?<\/div>/, "") +
        '<div class="stat"><b>' + esc(RES.turnout.pct) + "</b><span>Turnout " + srcChips(RES.src) + "</span></div>";
    }

    var hero = '<div class="hero">' +
      '<div class="hero-text">' +
        '<span class="eyebrow">' + esc(e.kind) + " · " + esc(e.day) + "</span>" +
        "<h1>" + esc(e.place) + (PAST ? " voted on " : " votes on ") + esc(e.dayShort) + "</h1>" +
        '<p><span class="countdown">' + esc(countdownText()) + "</span> " +
          (PAST ? (RES ? "See who won, with official vote counts, on the Results tab. " : "") + "The candidates, parties and issues are kept here as they stood during the campaign."
                : esc(e.termNote) + " Every candidate is here in their own words, with sources for everything else.") + "</p>" +
        (PAST && RES ? '<p><a class="btn hero-btn" href="#results">' + icon("chart") + "See the results</a></p>" : "") +
      "</div>" +
      '<div class="stats">' + stats + "</div>" +
    "</div>";

    var voting = PAST ? "" :
      '<div class="grid-2">' +
        '<div class="card"><h2 class="h-ico">' + icon("pin") + 'Before you go</h2><ul class="facts">' + htmlItems(e.beforeYouGo, "li") + "</ul>" +
          (e.whoCanVote ? more("Who can vote, accepted ID and accessibility", htmlItems(e.whoCanVote, "p")) : "") +
        "</div>" +
        '<div class="card"><h2 class="h-ico">' + icon("ballot") + 'How your ballot works</h2>' +
          "<p>" + COPY.ballotIntro + "</p>" +
          "<ul>" + htmlItems(e.ballotRules, "li") + "</ul>" +
          (e.decides ? more("What do they actually decide?", htmlItems(e.decides, "p")) : "") +
        "</div>" +
      "</div>";

    $("#view-start").innerHTML = hero +
      (PAST && RES ? resultsSummary() : "") +
      (notices ? '<div class="notice"><h2 class="h-ico">' + icon("alert") + "Good to know</h2><ul>" + notices + "</ul></div>" : "") +
      voting +
      "<div><h2 class=\"h-ico\">" + icon("ballot") + (PAST ? "What was on the ballot" : "What's on your ballot") + "</h2></div>" +
      '<div class="tiles">' + tiles + "</div>" +
      keyIssues() +
      pollSection();
  }

  // Compact preview of the Issues tab; each card links to the full, sourced issue.
  function keyIssues() {
    if (!G.issues.length) return "";
    return '<div><h2 class="h-ico">' + icon("message") + 'Key issues in this election</h2><p class="small muted">The debates candidates and parties return to most. Each links to sourced background and what each side has said.</p></div>' +
      '<div class="grid-3 issue-previews">' + G.issues.map(function (iss, i) {
        return '<a class="card issue-preview" href="#issues/' + iss.id + '">' +
          '<div class="issue-head"><span class="issue-num">' + icon(iss.icon) + "</span><h3>" + esc(iss.title) + "</h3></div>" +
          '<p class="sum">' + esc(iss.summary) + "</p>" +
          '<span class="more-link">Facts and positions' + icon("arrow") + '</span></a>';
      }).join("") + "</div>";
  }

  // -------------------------------------------------------------- CANDIDATES
  function renderCandidatesShell() {
    var seg = Object.keys(OFFICES).map(function (o) {
      var n = CANDS.filter(function (c) { return c.office === o; }).length;
      return '<button type="button" data-office="' + o + '">' + esc(OFFICES[o].plural) + "<span>" + n + " running</span></button>";
    }).join("");
    $("#view-candidates").innerHTML =
      intro("Candidates", "All " + CANDS.length + " candidates, listed alphabetically by surname " + esc(COPY.listedAs) + ". Each card's focus comes only from the candidate's own statement. Tap <strong>View full profile</strong> for their full statement, sourced context, and arguments for and against.") +
      '<div class="card filters-card">' +
        '<div class="seg" role="group" aria-label="Choose a race">' + seg + "</div>" +
        '<div class="filter-row">' +
          '<label class="input">' + icon("search") + '<span class="visually-hidden">Search</span><input type="search" id="cand-q" placeholder="Search names or topics, e.g. transit" autocomplete="off"></label>' +
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
        (c.points.length ? '<div class="cc-focus-wrap"><p class="cc-focus-label">Focus</p>' +
          '<ul class="cc-focus clamped">' + c.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" +
          '<button type="button" class="focus-toggle" aria-expanded="false" hidden>Show all</button></div>'
          : '<p class="small muted">No statement added yet.</p>') +
      "</div>" +
      '<div class="cc-foot">' + pickButton(c) +
        (debate ? '<span class="cc-debate" title="Arguments for, against, and news reports in the full profile">' + debate + "</span>" : "") +
        '<button type="button" class="btn sm" data-open="' + esc(c.id) + '">View full profile' + icon("arrow") + '</button>' +
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
    if (!OFFICES[office]) office = E.offices[0].id;
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
    var notes = (facts.length ? '<div class="pf-sec"><p class="label">' + icon("info") + 'Good to know</p><div class="pf-box"><ul>' + noteList(facts) + "</ul></div></div>" : "") +
      (juris.length ? '<div class="pf-sec"><p class="label">' + icon("landmark") + 'Who decides this?</p><div class="pf-box juris"><p class="juris-intro">Some of these promises depend on another level of government. These notes say who controls them; a mayor or council can still advocate.</p><ul>' +
        noteList(juris) + "</ul></div></div>" : "");

    var links = [];
    c.website.forEach(function (u) { links.push(ext(u, "Website")); });
    c.social.forEach(function (s) { links.push(ext(s.url, socialName(s.url))); });
    if (c.phone) links.push('<a href="tel:' + esc(c.phone.replace(/[^\d+]/g, "")) + '">' + esc(c.phone) + "</a>");
    var docs = [ext(c.profileUrl, COPY.profileLink)];
    if (c.statementUrl) docs.push(ext(c.statementUrl, "Candidate page (" + c.statementBy + ")"));
    if (c.nomination) docs.push(ext(c.nomination, "Nomination papers"));
    if (c.disclosure) docs.push(ext(c.disclosure, "Financial disclosure"));

    var statement = '<div class="statement">' + c.statement.map(function (p) { return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>"; }).join("") +
      (c.statementUrl
        ? '<p class="small muted">' + esc(COPY.statementNote) + " " + ext(c.statementUrl, c.statementBy) + ".</p></div>"
        : '<p class="small muted">Written by the candidate, as published by the ' + esc(E.authority) + '.' + srcChips([o.src]) + "</p></div>");

    dlg.innerHTML = '<div class="pf party-edge' + pc(c.org) + '">' +
      '<div class="pf-head"><div><div class="badges">' + badges + '</div><h2 class="pf-name" id="pf-name">' + esc(c.name) + '</h2><div class="pf-aff"><span class="party-dot' + pc(c.org) + '"></span>' + esc(orgName(c)) + '</div><div class="cc-tags pf-tags">' +
        c.sig.map(function (t) { return '<span class="tag sig">' + esc(t) + "</span>"; }).join("") +
        c.topics.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div></div>" +
        '<button type="button" class="x-btn" data-close aria-label="Close profile">✕</button></div>' +
      '<div class="pf-body">' +
        '<div class="pf-sec"><p class="label">' + icon("target") + 'Campaign focus <span class="muted">(from their statement)</span></p>' +
          (c.points.length ? '<ul class="pf-focus">' + c.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>"
            : '<p class="small muted">' + esc(COPY.noStatement) + "</p>") + "</div>" +
        notes +
        '<div class="pf-sec"><p class="label">' + icon("scale") + 'Arguments for & against</p>' + opinionsBox(c.ops, plainName(c)) + "</div>" +
        '<div class="pf-sec">' + (c.statement.length ? more("Read their full statement", statement, false, "file") : "") +
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

  // "incumbent councillor" locally; "MLA, Burnaby North" where the office is a riding.
  function incumbentText(c) {
    var label = OFFICES[c.office].label;
    return COPY.incumbentLabel ? COPY.incumbentLabel + ", " + label : "incumbent " + label.toLowerCase();
  }

  function rosterBlock(people) {
    return Object.keys(OFFICES).map(function (off) {
      var list = people.filter(function (c) { return c.office === off; });
      return list.length ? '<p class="small"><strong>' + esc(OFFICES[off].plural) + ":</strong> " + list.map(candLink).join(", ") + "</p>" : "";
    }).join("");
  }

  // Side-by-side table of what each party's platform says on the same topics.
  function compareTable() {
    if (!G.compareTopics.length) return "";
    var keys = Object.keys(G.orgs);
    var head = "<tr><th scope=\"col\">Topic</th>" + keys.map(function (k) {
      return '<th scope="col" class="' + pc(k).trim() + '"><a class="party-text" href="#parties/' + k + '"><span class="party-dot"></span>' + esc(G.orgs[k].short) + "</a></th>";
    }).join("") + "</tr>";
    var rows = G.compareTopics.map(function (t) {
      return '<tr><th scope="row">' + (t.issue ? '<a href="#issues/' + t.issue + '">' + esc(t.label) + "</a>" : esc(t.label)) + "</th>" + keys.map(function (k) {
        var st = (G.orgs[k].stances || {})[t.id];
        return '<td class="' + pc(k).trim() + '" data-label="' + esc(G.orgs[k].short) + '">' +
          "<div>" + (st ? esc(st.text) + srcChips(st.src) : '<span class="na">Not in their platform</span>') + "</div></td>";
      }).join("") + "</tr>";
    }).join("");
    return '<div class="card compare-card"><h2 class="h-ico">' + icon("scale") + 'Compare their platforms</h2>' +
      '<p class="small muted">What each party\'s published platform says on the same ' + G.compareTopics.length + ' topics, quoted or closely paraphrased. "Not in their platform" means we didn\'t find it there, not that they oppose it.' + (G.issues.length ? " Tap a topic for background facts." : "") + "</p>" +
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
          (o.website ? '<a class="site-link" href="' + esc(o.website) + '" target="_blank" rel="noopener">' + icon("globe") + "Website</a>" : "") + "</div>" +
        '<h2><span class="party-dot"></span>' + esc(o.name) + "</h2>" +
        (o.tagline ? '<p class="tagline">“' + esc(o.tagline.text) + "”" + srcChips(o.tagline.src) + "</p>" : "") +
        countTiles(mine) +
        '<dl class="kv"><div><dt>Political lean</dt><dd>' + leanText(o) + "</dd></div>" +
          (notable.length ? "<div><dt>Notable</dt><dd>" + notable.map(function (c) {
            return candLink(c) + ' <span class="muted small">(' + (c.office === "mayor" ? "for mayor" : incumbentText(c)) + ")</span>";
          }).join("<br>") + "</dd></div>" : "") +
        "</dl>" +
        (o.context && o.context.length ? '<ul class="party-context">' + o.context.map(function (x) { return "<li>" + esc(x.text) + srcChips(x.src) + "</li>"; }).join("") + "</ul>" : "") +
        (o.says && o.says.length ? '<p class="label">Key promises, in their words</p>' +
          '<ul class="says">' + o.says.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" +
          '<p class="small">' + srcChips(o.moreSrc || [o.platform]) + "</p>"
          : "<p class=\"small muted\">We haven't added this party's platform yet.</p>") +
        '<p class="label">' + icon("scale") + 'Arguments for & against</p>' + opinionsBox(OPS[k] || [], o.name) +
        (o.more && o.more.length ? more("More of their platform", '<ul class="says">' + o.more.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" +
          "<p>" + ext(G.sources[o.platform].url, "Read the full platform") + "</p>") : "") +
        more("All " + mine.length + " candidates", rosterBlock(mine)) +
        "</article>";
    }).join("");

    var indep = CANDS.filter(function (c) { return !c.org; });
    var indepNotable = indep.filter(function (c) { return c.flags.indexOf("incumbent") > -1; });
    $("#view-parties").innerHTML =
      intro("Parties", esc(COPY.partiesIntro)) +
      compareTable() +
      '<div class="grid-2 party-grid">' + cards +
      '<article class="card party party-top-edge' + pc(null) + '" id="org-independent"><div class="party-top"><span class="badge">No party</span></div><h2><span class="party-dot"></span>Independents</h2>' +
        '<p class="tagline">' + indep.length + " " + esc(COPY.independentsNote) + "</p>" +
        countTiles(indep) +
        (indepNotable.length ? '<dl class="kv"><div><dt>Notable</dt><dd>' + indepNotable.map(function (c) {
          return candLink(c) + ' <span class="muted small">(' + incumbentText(c) + ")</span>";
        }).join("<br>") + "</dd></div></dl>" : "") +
        '<div class="indep-roster">' + rosterBlock(indep) + "</div>" +
      "</article></div>";
  }

  // ------------------------------------------------------------------ ISSUES
  function renderIssues() {
    var jump = '<nav class="issue-jump" aria-label="Jump to issue">' + G.issues.map(function (iss, i) {
      return '<a href="#issues/' + iss.id + '"><span>' + icon(iss.icon) + "</span>" + esc(iss.title) + "</a>";
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
          '<div class="issue-head"><span class="issue-num">' + icon(iss.icon) + "</span><h2>" + esc(iss.title) + "</h2></div>" +
          '<p class="sum">' + esc(iss.summary) + "</p>" +
          '<div class="issue-body">' +
            '<div class="issue-facts"><p class="label">' + icon("file") + 'The facts</p><ul>' + iss.facts.map(function (f) { return "<li>" + esc(f.text) + srcChips(f.src) + "</li>"; }).join("") + "</ul></div>" +
            '<div class="issue-parties"><p class="label">' + icon("landmark") + 'Where the parties stand <span class="muted">(from their platforms)</span></p><div class="stances">' + parties + "</div></div>" +
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

  // ----------------------------------------------------------------- RESULTS
  // Ranked candidates for one race. Elected = explicit flag, else top `seats`.
  function raceRows(officeId) {
    var rows = ((RES && RES.races && RES.races[officeId]) || []).slice().sort(function (a, b) { return b.votes - a.votes; });
    var seats = OFFICES[officeId].seats;
    rows.forEach(function (r, i) { if (r.elected === undefined) r.elected = i < seats; });
    return rows;
  }

  function resultsSummary() {
    return '<div class="card"><h2 class="h-ico">' + icon("check") + "Who was elected</h2>" +
      '<div class="elected-grid">' + Object.keys(OFFICES).map(function (o) {
        var won = raceRows(o).filter(function (r) { return r.elected && BY_ID[r.id]; });
        return '<div><p class="label">' + esc(OFFICES[o].plural) + '</p><ul class="elected-list">' + won.map(function (r) {
          var c = BY_ID[r.id];
          return '<li class="' + pc(c.org).trim() + '"><span class="party-dot"></span><a href="#candidates/' + o + "/" + c.id + '">' + esc(plainName(c)) + '</a> <span class="muted small">' + esc(orgShort(c)) + "</span></li>";
        }).join("") + "</ul></div>";
      }).join("") + '</div><p class="small"><a href="#results">Full results with vote counts' + icon("arrow") + "</a></p></div>";
  }

  function renderResults() {
    if (!RES) {
      $("#view-results").innerHTML = intro("Results", PAST
        ? "Voting has closed. " + esc(E.resultsNote || "Results will be added once they are officially declared.")
        : "Results will appear here after voting day, once they are officially declared.");
      return;
    }
    var races = Object.keys(OFFICES).map(function (o) {
      var rows = raceRows(o);
      var max = Math.max.apply(null, rows.map(function (r) { return r.votes; }).concat([1]));
      return '<div class="card"><div class="race-bar"><h2 class="h-ico">' + icon(OFFICES[o].icon) + esc(OFFICES[o].plural) + '</h2><span class="count">' + OFFICES[o].seats + (OFFICES[o].seats === 1 ? " seat" : " seats") + "</span></div>" +
        '<ol class="results">' + rows.map(function (r) {
          var c = BY_ID[r.id];
          var name = c ? '<a href="#candidates/' + o + "/" + c.id + '">' + esc(plainName(c)) + "</a>" : esc(r.name || r.id);
          return '<li class="' + (c ? pc(c.org).trim() : "pc-independent") + (r.elected ? " won" : "") + '">' +
            '<div class="res-name"><span class="party-dot"></span>' + name + (c ? ' <span class="muted small">' + esc(orgShort(c)) + "</span>" : "") + (r.elected ? ' <span class="badge solid">' + icon("check") + "Elected</span>" : "") + "</div>" +
            '<div class="res-bar"><div class="bar-track"><div class="bar-fill" style="width:' + (r.votes / max * 100) + '%"></div></div><span class="pct">' + r.votes.toLocaleString("en-CA") + "</span></div></li>";
        }).join("") + "</ol></div>";
    }).join("");
    $("#view-results").innerHTML =
      intro("Results", esc(RES.status === "official" ? "Official results" : "Unofficial results") + (RES.declared ? ", declared " + esc(RES.declared) : "") + ". Vote counts as published by the " + esc(E.authority) + "." + srcChips(RES.src)) +
      (RES.turnout ? '<div class="card"><p class="label">Turnout</p><p><strong>' + esc(RES.turnout.pct) + "</strong>" + (RES.turnout.ballots ? " · " + Number(RES.turnout.ballots).toLocaleString("en-CA") + " ballots" : "") + "</p></div>" : "") +
      races;
  }

  // --------------------------------------------------------------- ELECTIONS
  function renderElections() {
    function card(m) {
      var d = new Date(m.date + "T12:00:00").toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      var href = m.id === REG.default ? "./#start" : "?election=" + encodeURIComponent(m.id) + "#start";
      var status = m.id === META.id ? META.status : (Date.now() > new Date(m.date + "T" + (m.close || "23:59") + ":00").getTime() ? "past" : "upcoming");
      return '<a class="card election-card' + (m.id === META.id ? " current" : "") + '" href="' + href + '">' +
        '<div class="party-top"><span class="badge' + (status === "past" ? "" : " solid") + '">' + (status === "past" ? (m.results ? "Results available" : "Past") : "Upcoming") + "</span>" +
          (m.id === META.id ? '<span class="small muted">You are viewing this</span>' : "") + "</div>" +
        "<h2>" + esc(m.name) + "</h2>" +
        '<p class="small muted">' + esc(m.type) + " · " + esc(m.place) + " · " + esc(d) + "</p>" +
        '<span class="more-link">' + (status === "past" ? "View guide and results" : "Open the guide") + icon("arrow") + "</span></a>";
    }
    var all = REG.list.map(function (m) { return m; });
    var upcoming = all.filter(function (m) { return Date.now() <= new Date(m.date + "T" + (m.close || "23:59") + ":00").getTime(); });
    var past = all.filter(function (m) { return upcoming.indexOf(m) < 0; }).reverse();
    $("#view-elections").innerHTML =
      intro("Elections", "Every election this guide covers. Upcoming elections have the full voter guide; past ones keep the guide as it stood during the campaign, plus official results once declared.") +
      (upcoming.length ? '<h2 class="h-ico">' + icon("calendar") + 'Upcoming</h2><div class="grid-2">' + upcoming.map(card).join("") + "</div>" : "") +
      (past.length ? '<h2 class="h-ico">' + icon("chart") + 'Past elections</h2><div class="grid-2">' + past.map(card).join("") + "</div>" : "") +
      '<p class="small muted">Want to add an election? See <a href="https://github.com/TommyDoesEverything/voting-guide/blob/main/docs/adding-an-election.md" target="_blank" rel="noopener">adding an election</a>.</p>';
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
    var total = Object.keys(picks).reduce(function (t, k) { return t + picks[k].length; }, 0);
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
      '<div class="ballot"><h2 class="h-ico">' + icon("ballot") + 'Your ballot</h2><div class="total">' + total + ' <span class="muted" style="font-size:1rem;font-weight:600">/ ' + TOTAL_SEATS + ' votes</span></div>' +
        '<p class="muted small">You don\'t have to use every vote.</p>' + races + "</div>" +
      (total ? '<div class="btn-row no-print"><button class="btn" type="button" id="copy-picks">' + icon("copy") + 'Copy list</button>' +
        '<button class="btn ghost" type="button" id="print-picks">' + icon("print") + 'Print</button>' +
        '<button class="btn ghost" type="button" id="clear-picks">' + icon("trash") + 'Clear all</button></div>' : "");

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
      picks = emptyPicks();
      store.set(PICKS_KEY, picks);
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
    var groups = { official: "Official sources", candidate: COPY.candidateSources, party: "Party platforms", poll: "Polling", news: "News coverage", reference: "Reference", "third-party": "Other guides & analysis" };
    var srcList = Object.keys(groups).map(function (type) {
      var items = Object.keys(G.sources).filter(function (id) { return G.sources[id].type === type; }).map(function (id) {
        var s = G.sources[id];
        return "<li>" + ext(s.url, s.title) + '<br><span class="muted">' + esc(s.publisher) + (s.date ? " · " + esc(s.date) : "") + "</span></li>";
      }).join("");
      return items ? '<p class="label">' + esc(groups[type]) + '</p><ul class="source-list">' + items + "</ul>" : "";
    }).join("");

    $("#view-about").innerHTML =
      intro("About this guide", "An independent, non-partisan guide. It isn't affiliated with any candidate, party, or " + esc(E.authority) + ", and it doesn't endorse anyone.") +
      '<div class="grid-2">' +
      '<div class="card"><h2>How it stays neutral</h2><ul>' +
        "<li>" + COPY.aboutStatements + "</li>" +
        "<li>" + COPY.aboutOrder + "</li>" +
        '<li><strong>Opinions are labelled.</strong> Arguments for and against sit in a box marked <span class="badge opinion">Opinion</span>, and each one names who is speaking. A party\'s political lean is shown only when an independent source states it.</li>' +
        "<li><strong>Who decides this?</strong> When a candidate promises to directly do something another government controls (like setting tuition), a sourced note says who controls it. Promises to advocate don't get one. The same test applies to everyone.</li>" +
        "<li><strong>Facts carry a source.</strong> Tap the small ↗ tags to see where anything came from.</li>" +
        "<li><strong>Party colours are their own.</strong> Each party is shown in the main colour from its own website; independents are a neutral grey. No predictions.</li>" +
      "</ul></div>" +
      '<div class="card"><h2>Things to keep in mind</h2><ul>' +
        "<li><strong>Criticism isn't evenly spread.</strong> Incumbents have a record, so they attract more of it. A candidate with nothing listed hasn't been endorsed; we just haven't found published arguments about them.</li>" +
        htmlItems(E.aboutNotes, "li") +
      "</ul></div>" +
      "</div>" +
      '<div class="card"><h2>Corrections</h2>' +
        "<p>Found a mistake, a missing source, or wording that seems unfair to someone? Please <a href=\"https://github.com/TommyDoesEverything/voting-guide/issues/new\" target=\"_blank\" rel=\"noopener\">open an issue on GitHub</a> with a link to a source (or send a pull request to <a href=\"https://github.com/TommyDoesEverything/voting-guide\" target=\"_blank\" rel=\"noopener\">the repository</a>). Candidates and parties can request corrections the same way.</p>" +
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
    if (view === "results" && !rendered.results) { renderResults(); rendered.results = true; }
    if (view === "elections" && !rendered.elections) { renderElections(); rendered.elections = true; }
    if (view === "about" && !rendered.about) { renderAbout(); rendered.about = true; }

    if (!keepScroll) window.scrollTo(0, 0);
    var tabName = activeTab ? activeTab.textContent.replace(/[^\w\s]/g, "").replace(/\d+$/, "").trim() : "";
    document.title = (view === "start" ? "" : tabName + " · ") + E.brand + " - Voter Guide";
  }

  // Election-specific page chrome.
  function initChrome() {
    $("#brand-name").textContent = E.brand;
    $("#brand-sub").textContent = "Independent voter guide · " + E.kind + " · " + E.dayShort;
    $("#tab-results").hidden = !(PAST || RES);
    $("#tab-picks").hidden = PAST;
    $('.tabs a[data-tab="issues"]').hidden = !G.issues.length;
    $("#foot-authority").textContent = E.authority;
    $("#foot-profiles").href = E.profilesUrl;
    if (!META.isDefault) {
      $("#election-banner").hidden = false;
      $("#election-banner").innerHTML = icon("calendar") + "You're viewing <strong>" + esc(META.name) + "</strong>. " + '<a href="#elections">All elections</a>';
    }
  }
  injectPartyColors();
  initChrome();
  initTheme();
  initDialog();
  updatePickCount();
  window.addEventListener("hashchange", route);
  route();
  watchScroll($(".tabs"), $(".tabs-wrap"), "x");
})();
