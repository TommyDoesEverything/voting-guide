/* Picks the election from ?election=<id> (or the default), loads that
   election's data files, then starts the app. Plain <script> tags so the site
   also works when opened straight from disk. */
(function () {
  "use strict";

  var reg = window.ELECTIONS;
  var params = new URLSearchParams(location.search);
  var wanted = params.get("election");
  var meta = reg.list.filter(function (e) { return e.id === wanted; })[0] ||
    reg.list.filter(function (e) { return e.id === reg.default; })[0];

  var close = new Date(meta.date + "T" + (meta.close || "23:59") + ":00");
  meta.status = meta.status || (Date.now() > close.getTime() ? "past" : "upcoming");
  meta.isDefault = meta.id === reg.default;
  window.ELECTION = meta;

  var base = "elections/" + meta.id + "/";
  var files = ["profiles.js", "guide.js", "opinions.js", "polls.js"];
  if (meta.results) files.push("results.js");
  files.push("../../assets/js/app.js");

  (function next(i) {
    if (i >= files.length) return;
    var s = document.createElement("script");
    s.src = base + files[i];
    s.onload = function () { next(i + 1); };
    // Optional files (opinions, polls, results) may be missing; keep going.
    s.onerror = function () { next(i + 1); };
    document.body.appendChild(s);
  })(0);
})();
