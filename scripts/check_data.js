// Sanity checks for every election in elections/index.js.
// Run: node scripts/check_data.js
// Fails (exit 1) on unknown candidate ids, unknown source ids, malformed
// opinion items, bad results, or em/en dashes in site content.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const allProblems = [];
const summary = [];

global.window = {};
new Function(fs.readFileSync(path.join(root, "elections/index.js"), "utf8"))();
const registry = window.ELECTIONS;
if (!registry.list.some((e) => e.id === registry.default)) allProblems.push(`registry: default "${registry.default}" is not in the list`);

for (const meta of registry.list) {
  const dir = `elections/${meta.id}`;
  global.window = { ELECTIONS: registry };
  for (const f of ["profiles.js", "guide.js", "opinions.js", "polls.js", "results.js"]) {
    const file = path.join(root, dir, f);
    if (fs.existsSync(file)) new Function(fs.readFileSync(file, "utf8"))();
    else if (["profiles.js", "guide.js"].includes(f)) allProblems.push(`${dir}: missing ${f}`);
  }
  if (meta.results && !window.RESULTS) allProblems.push(`${dir}: registry says results: true but results.js is missing`);
  if (!window.GUIDE || !window.PROFILES) continue;
  const problems = checkElection(meta, window.GUIDE, window.PROFILES, window.OPINIONS || {}, window.POLLS || [], window.RESULTS);
  problems.forEach((x) => allProblems.push(`${meta.id}: ${x}`));
  summary.push(`${meta.id}: ${window.PROFILES.candidates.length} candidates, ${Object.keys(window.GUIDE.sources).length} sources, ${Object.values(window.OPINIONS || {}).flat().length} opinion items${window.RESULTS ? ", results" : ""}`);
}

function checkElection(meta, g, p, ops, polls, res) {
const problems = [];
const ids = new Set(p.candidates.map((c) => c.id));
const sources = new Set(Object.keys(g.sources).concat(Object.keys((res && res.sources) || {})));
const offices = new Set((g.election.offices || []).map((o) => o.id));
p.candidates.forEach((c) => offices.has(c.office) || problems.push(`candidate "${c.id}": office "${c.office}" not in election.offices`));

function checkSources(list, where) {
  if (!Array.isArray(list) || !list.length) return problems.push(`${where}: missing src`);
  list.forEach((s) => sources.has(s) || problems.push(`${where}: unknown source "${s}"`));
}
function walk(o, where) {
  if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${where}[${i}]`));
  if (!o || typeof o !== "object") return;
  for (const [k, v] of Object.entries(o)) {
    if (k === "src" && typeof v === "string") sources.has(v) || problems.push(`${where}.src: unknown source "${v}"`);
    else if (["src", "moreSrc", "further"].includes(k)) checkSources(v, `${where}.${k}`);
    else if (k === "signature") continue;
    else if (k === "color") { if (v.src && !sources.has(v.src)) problems.push(`${where}.color: unknown source "${v.src}"`); }
    else if (k === "platform") sources.has(v) || problems.push(`${where}: unknown platform source "${v}"`);
    else walk(v, `${where}.${k}`);
  }
}

for (const k of Object.keys(g.candidates)) ids.has(k) || problems.push(`guide: unknown candidate "${k}"`);
for (const c of p.candidates) {
  const sig = (g.signature || {})[c.id];
  if (!Array.isArray(sig) || sig.length !== 2) problems.push(`signature: "${c.id}" needs exactly 2 tags`);
  else sig.forEach((t) => t.length > 40 && problems.push(`signature: "${c.id}" tag too long: "${t}"`));
}
for (const k of Object.keys(g.signature || {})) ids.has(k) || problems.push(`signature: unknown candidate "${k}"`);
for (const c of p.candidates) g.candidates[c.id] || problems.push(`guide: no curation for "${c.id}"`);
walk(g, "guide");
for (const iss of g.issues) {
  (iss.candidates || []).forEach((c) => ids.has(c.id) || problems.push(`issues.${iss.id}: unknown candidate "${c.id}"`));
  if (!g.compareTopics.some((t) => t.issue === iss.id)) problems.push(`issues.${iss.id}: no matching compareTopics entry`);
}

for (const [k, list] of Object.entries(ops)) {
  if (!ids.has(k) && !g.orgs[k]) problems.push(`opinions: unknown subject "${k}"`);
  list.forEach((o, i) => {
    const w = `opinions.${k}[${i}]`;
    ["for", "against", "reported"].includes(o.stance) || problems.push(`${w}: bad stance "${o.stance}"`);
    o.voice && o.voice.name || problems.push(`${w}: missing voice.name`);
    if (o.voice && o.voice.org && !g.orgs[o.voice.org]) problems.push(`${w}: unknown voice.org "${o.voice.org}"`);
    checkSources(o.src, w);
  });
}
polls.forEach((pl, i) => {
  checkSources(pl.src, `polls[${i}]`);
  (pl.mayor ? pl.mayor.results : []).forEach((r) => r.id && !ids.has(r.id) && problems.push(`polls[${i}]: unknown candidate "${r.id}"`));
});

if (res) {
  checkSources(res.src, "results");
  Object.entries(res.races || {}).forEach(([o, rows]) => {
    offices.has(o) || problems.push(`results: unknown office "${o}"`);
    rows.forEach((r) => {
      if (r.id && !ids.has(r.id)) problems.push(`results.${o}: unknown candidate "${r.id}"`);
      if (typeof r.votes !== "number") problems.push(`results.${o}: "${r.id || r.name}" needs numeric votes`);
    });
  });
}
return problems;
}

const siteFiles = ["index.html", "assets/js/app.js", "assets/js/loader.js", "assets/css/style.css", "elections/index.js", "README.md", "CONTRIBUTING.md", "ROADMAP.md"];
registry.list.forEach((m) => ["guide.js", "opinions.js", "polls.js", "profiles.js", "results.js"].forEach((f) => siteFiles.push(`elections/${m.id}/${f}`)));
for (const f of siteFiles) {
  const file = path.join(root, f);
  if (fs.existsSync(file) && /[–—]/.test(fs.readFileSync(file, "utf8"))) allProblems.push(`${f}: contains an em or en dash`);
}

if (allProblems.length) {
  console.error(allProblems.join("\n"));
  process.exit(1);
}
console.log("data ok\n  " + summary.join("\n  "));
