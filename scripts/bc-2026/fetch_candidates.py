"""Fetch the 2026 BC provincial candidates for the Burnaby ridings, with bios.

Elections BC publishes every confirmed candidate as a CSV. This script keeps
the five ridings that cover Burnaby, then adds each candidate's bio from the
candidate page their party publishes, and writes:

    elections/bc-2026/profiles.json  - for humans / diffing
    elections/bc-2026/profiles.js    - loaded by the site

From the CSV, only each candidate's ballot name, riding and affiliation are
kept. It also lists financial agents' addresses and phone numbers; those are
never copied.

Elections BC doesn't publish candidate statements, so `statement` holds the
bio from the party's candidate page, verbatim (paragraphs re-joined where the
page wraps lines). `statementUrl` and `statementBy` record where it came from.
A candidate with no page in BIOS keeps an empty statement.

    python scripts/bc-2026/fetch_candidates.py

If Python can't download the CSV, save it with curl or a browser and pass it:

    python scripts/bc-2026/fetch_candidates.py --csv path/to/candidates.csv

Standard library only.
"""

import csv
import html
import io
import json
import re
import ssl
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

CSV_URL = "https://elections.bc.ca/2026election/2026-provincial-general-election-candidates.csv"
LIST_URL = "https://elections.bc.ca/2026-provincial-election/candidate-list/"

# Ridings covered, by Elections BC's district code -> office id in guide.js.
RIDINGS = {
    "BNC": "burnaby-centre",
    "BNE": "burnaby-east",
    "BNO": "burnaby-north",
    "BNS": "burnaby-south-metrotown",
    "BNN": "burnaby-new-westminster",
}

# Affiliation as Elections BC prints it -> party id in guide.js.
ORGS = {
    "BC NDP": "bc-ndp",
    "BC Green Party": "bc-green",
    "CentreBC": "centrebc",
    "Conservative Party": "bc-conservative",
    "OneBC": "onebc",
}

# The BC NDP's team page loads its candidates from this feed.
NDP_FEED = "https://www.bcndp.ca/team?action_handler=bcndp-2024/action--civic-profiles&action=action--civic-profiles--get&civic_tag=cand2026&json=1"
NDP_PAGE = "https://www.bcndp.ca/team"

# Each party's candidate page, by candidate id. "ndp" bios come from NDP_FEED.
BIOS = {
    "burnaby-centre-joshua-domnich": "https://conservativebc.ca/candidate/joshua-domnich/",
    "burnaby-centre-vikas-gautam": "https://www.centrebc.ca/candidates/vikas-gautam/",
    "burnaby-centre-anne-kang": "ndp",
    "burnaby-centre-shila-taheri": "https://bcgreens.ca/candidates-2026/shila-taheri/",
    "burnaby-east-rohini-reah-arora": "ndp",
    "burnaby-east-de-ding": "https://1bc.ca/candidates/dding",
    "burnaby-east-javad-shushtarian": "https://bcgreens.ca/candidates-2026/javad-shushtarian/",
    "burnaby-east-peter-si": "https://conservativebc.ca/candidate/peter-si/",
    "burnaby-north-simon-chandler": "https://conservativebc.ca/candidate/simon-chandler/",
    "burnaby-north-maddy-kennedy-parrott": "https://bcgreens.ca/candidates-2026/maddy-kennedy-parrott/",
    "burnaby-north-janet-routledge": "ndp",
    "burnaby-north-jenny-yamagata": "https://1bc.ca/candidates/jyamagata",
    "burnaby-south-metrotown-paul-choi": "ndp",
    "burnaby-south-metrotown-bryan-fockler": "https://bcgreens.ca/candidates-2026/bryan-fockler/",
    "burnaby-south-metrotown-andrew-rose": "https://1bc.ca/candidates/arose",
    "burnaby-south-metrotown-david-xie": "https://conservativebc.ca/candidate/david-xie/",
    "burnaby-new-westminster-raj-chouhan": "ndp",
    "burnaby-new-westminster-joe-latam": "https://conservativebc.ca/candidate/joe-latam/",
}

# Where the bio starts and ends on each party's page, as regexes matched
# against whole lines of the page text. The start line itself is skipped
# unless `keep_start` is set.
LAYOUTS = {
    "bcgreens.ca": {"start": r"^[“\"]", "keep_start": True, "end": r"^Events$"},
    "1bc.ca": {"start": r"^Candidate\s+[—-]", "end": r"^Keep up with$"},
    "conservativebc.ca": {"start": r"^VOLUNTEER$", "after": r"^DONATE TO ", "end": r"^Latest News and Updates$"},
    "www.centrebc.ca": {"start": r"^Volunteer$", "after": r"^Donate to ", "end": r"^(\[email|Request a sign)"},
}

PARTY_NAMES = {
    "bc-ndp": "BC NDP",
    "bc-green": "BC Green Party",
    "centrebc": "CentreBC",
    "bc-conservative": "Conservative Party of BC",
    "onebc": "OneBC",
}

OUT = Path(__file__).resolve().parents[2] / "elections" / "bc-2026"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36"


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def decode(data):
    # Elections BC's CSV is Windows-1252, but accept UTF-8 too.
    try:
        return data.decode("utf-8-sig")
    except UnicodeDecodeError:
        return data.decode("cp1252")


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read()
    except urllib.error.URLError as e:
        # Some party sites send a certificate chain Python's store rejects but
        # the system store accepts; curl uses the system store.
        if not isinstance(e.reason, ssl.SSLCertVerificationError):
            raise
        return subprocess.run(["curl", "-sSfL", "-A", UA, url], capture_output=True, check=True).stdout


def text_lines(page):
    """Visible text of an HTML page, one line per text node."""
    page = re.sub(r"(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>", " ", page)
    page = re.sub(r"(?s)<[^>]+>", "\n", page)
    page = html.unescape(page).replace("\xa0", " ")
    # House style: plain hyphens instead of em/en dashes.
    page = re.sub(r"[ \t]*—[ \t]*", " - ", page).replace("–", "-")
    return [re.sub(r"[ \t]+", " ", l).strip() for l in page.split("\n") if l.strip()]


def paragraphs(lines):
    """Re-join lines a page wrapped mid-sentence into paragraphs."""
    out = []
    for line in lines:
        if out and not re.search(r"[.!?:”\"’)]$", out[-1]):
            out[-1] += " " + line
        else:
            out.append(line)
    return out


def html_blocks(fragment):
    """Text of each heading and paragraph in an HTML fragment, in order."""
    out = []
    for m in re.finditer(r"(?is)<(h[1-6]|p)[^>]*>(.*?)</\1>", fragment):
        text = " ".join(text_lines(m.group(2)))
        if text:
            out.append(text)
    return out


def party_bio(url):
    layout = LAYOUTS[urllib.parse.urlsplit(url).hostname]
    lines = text_lines(fetch(url).decode("utf-8", errors="replace"))
    i = 0
    if "after" in layout:
        i = next(n for n, l in enumerate(lines) if re.search(layout["after"], l))
    start = next(n for n, l in enumerate(lines) if n >= i and re.search(layout["start"], l))
    end = next(n for n, l in enumerate(lines) if n > start and re.search(layout["end"], l))
    body = lines[start if layout.get("keep_start") else start + 1:end]
    if not body:
        sys.exit(f"no bio found on {url}; check LAYOUTS")
    return paragraphs(body)


def ndp_profiles():
    data = json.loads(fetch(NDP_FEED).decode("utf-8"))
    profiles = data["profiles"]
    if isinstance(profiles, dict):  # keyed by "Surname-Firstname"
        profiles = profiles.values()
    return {(p["riding_code"], p["fullname"]): p for p in profiles if isinstance(p, dict) and p.get("riding_code")}


def main():
    if "--csv" in sys.argv:
        raw = decode(Path(sys.argv[sys.argv.index("--csv") + 1]).read_bytes())
    else:
        raw = decode(fetch(CSV_URL))

    found = []
    for row in csv.DictReader(io.StringIO(raw)):
        office = RIDINGS.get(row["ED Code"].strip())
        if not office:
            continue
        name = " ".join(row["Candidate Ballot Name"].split())
        aff = row["Affiliation"].strip()
        if aff and aff not in ORGS:
            sys.exit(f"unknown affiliation {aff!r} for {name}; add it to ORGS and guide.js")
        found.append({
            "id": f"{office}-{slug(name)}",
            "name": name,
            "surname": name.split()[-1].upper(),
            "office": office,
            "code": row["ED Code"].strip(),
            "org": ORGS.get(aff),
            "statement": [],
            "statementUrl": None,
            "statementBy": None,
            "website": [],
            "social": [],
            "phone": None,
            "nomination": None,
            "disclosure": None,
            "profileUrl": LIST_URL,
        })

    ndp = None
    for c in found:
        src = BIOS.get(c["id"])
        if not src:
            print(f"no bio page listed for {c['id']}", file=sys.stderr)
            continue
        c["statementBy"] = PARTY_NAMES[c["org"]]
        if src == "ndp":
            ndp = ndp or ndp_profiles()
            # Elections BC uses the ballot name ("Rohini Reah Arora"); the party may not.
            p = ndp.get((c["code"], c["name"])) or next(
                (v for (code, full), v in ndp.items() if code == c["code"] and full.split()[-1] == c["name"].split()[-1]), None)
            if not p:
                sys.exit(f"{c['id']} not found in the BC NDP feed")
            c["statement"] = html_blocks(p["bio_text"])
            c["statementUrl"] = NDP_PAGE
            if p.get("website_link"):
                c["website"] = [p["website_link"]]
            c["social"] = [{"url": p[k]} for k in ("facebook_link", "instagram_link", "twitter_link") if p.get(k)]
        else:
            c["statement"] = party_bio(src)
            c["statementUrl"] = src
        print(f"{c['id']}: {len(c['statement'])} paragraphs", file=sys.stderr)

    # Riding order as in guide.js, then alphabetical by surname as Elections BC lists them.
    order = list(RIDINGS.values())
    found.sort(key=lambda c: (order.index(c["office"]), c["surname"], c["name"]))
    for c in found:
        del c["code"]

    data = {"fetched": date.today().isoformat(), "source": LIST_URL, "candidates": found}
    OUT.mkdir(parents=True, exist_ok=True)
    as_json = json.dumps(data, ensure_ascii=False, indent=2)
    (OUT / "profiles.json").write_text(as_json + "\n", encoding="utf-8", newline="\n")
    (OUT / "profiles.js").write_text(
        "// Generated by scripts/bc-2026/fetch_candidates.py from Elections BC's official\n"
        "// candidate list and each party's candidate pages. Do not edit by hand - re-run\n"
        "// the script instead.\n"
        f"window.PROFILES = {as_json};\n",
        encoding="utf-8", newline="\n",
    )
    print(f"wrote {len(found)} candidates", file=sys.stderr)


if __name__ == "__main__":
    main()
