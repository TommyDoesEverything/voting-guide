// Sanity checks for the data files. Run: node scripts/check_data.js
// Fails (exit 1) on unknown candidate ids, unknown source ids, malformed
// opinion items, or em/en dashes in site content.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
global.window = {};
for (const f of ["data/profiles.js", "data/guide.js", "data/opinions.js", "data/polls.js"]) {
  new Function(fs.readFileSync(path.join(root, f), "utf8"))();
}
const { GUIDE: g, PROFILES: p, OPINIONS: ops, POLLS: polls } = window;
const problems = [];
const ids = new Set(p.candidates.map((c) => c.id));
const sources = new Set(Object.keys(g.sources));

function checkSources(list, where) {
  if (!Array.isArray(list) || !list.length) return problems.push(`${where}: missing src`);
  list.forEach((s) => sources.has(s) || problems.push(`${where}: unknown source "${s}"`));
}
function walk(o, where) {
  if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${where}[${i}]`));
  if (!o || typeof o !== "object") return;
  for (const [k, v] of Object.entries(o)) {
    if (["src", "moreSrc", "further"].includes(k)) checkSources(v, `${where}.${k}`);
    else if (k === "signature") continue;
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
  pl.mayor.results.forEach((r) => r.id && !ids.has(r.id) && problems.push(`polls[${i}]: unknown candidate "${r.id}"`));
});

for (const f of ["index.html", "assets/js/app.js", "assets/css/style.css", "data/guide.js", "data/opinions.js", "data/polls.js", "data/profiles.js", "README.md", "CONTRIBUTING.md"]) {
  if (/[–—]/.test(fs.readFileSync(path.join(root, f), "utf8"))) problems.push(`${f}: contains an em or en dash`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`data ok: ${p.candidates.length} candidates, ${sources.size} sources, ${Object.values(ops).flat().length} opinion items`);
