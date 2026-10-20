/* Picks the election from ?election=<id> (or the default), loads that
   election's data files, then starts the app. Plain <script> tags so the site
   also works when opened straight from disk. */
(function () {
  "use strict";

  var reg = window.ELECTIONS;
  // The default is worked out from the dates: the earliest election whose voting
  // day hasn't ended yet (it switches at midnight after voting day), or the
  // most recent one once they're all over.
  var byDate = reg.list.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  var next = byDate.filter(function (e) {
    var end = new Date(e.date + "T00:00:00");
    end.setDate(end.getDate() + 1);
    return Date.now() < end.getTime();
  })[0];
  reg.default = (next || byDate[byDate.length - 1]).id;

  var params = new URLSearchParams(location.search);
  var wanted = params.get("election");
  var meta = reg.list.filter(function (e) { return e.id === wanted; })[0] ||
    reg.list.filter(function (e) { return e.id === reg.default; })[0];

  var close = new Date(meta.date + "T" + (meta.close || "23:59") + ":00");
  meta.status = meta.status || (Date.now() > close.getTime() ? "past" : "upcoming");
  meta.isDefault = meta.id === reg.default;
  window.ELECTION = meta;

  // The ?v= stamp on this script's own URL (set in index.html) goes on every
  // file it loads, so a release never mixes new and cached old files.
  var me = document.currentScript && document.currentScript.src || "";
  var ver = me.indexOf("?") > -1 ? "?" + me.split("?")[1] : "";

  var base = "elections/" + meta.id + "/";
  var files = ["profiles.js", "guide.js", "opinions.js", "polls.js"];
  if (meta.results) files.push("results.js");
  files.push("../../assets/js/app.js");

  (function next(i) {
    if (i >= files.length) return;
    var s = document.createElement("script");
    s.src = base + files[i] + ver;
    s.onload = function () { next(i + 1); };
    // Optional files (opinions, polls, results) may be missing; keep going.
    s.onerror = function () { next(i + 1); };
    document.body.appendChild(s);
  })(0);
})();
