"""Fetch the official City of Burnaby candidate profiles and save them as data.

The City publishes a profile for every candidate, written by the candidate.
This script downloads those pages, extracts each profile, and writes:

    data/profiles.json  - for humans / diffing
    data/profiles.js    - loaded by the site (works when opened from disk)

Statements are kept verbatim. Run again whenever the City updates the pages:

    python scripts/fetch_profiles.py

If Python can't verify the City's certificate on your machine, download the
three pages with curl (or a browser) into a folder, named mayor.html,
council.html and trustee.html, and parse those instead:

    python scripts/fetch_profiles.py --html-dir path/to/folder

Standard library only.
"""

import html
import json
import re
import sys
import urllib.request
from datetime import date
from pathlib import Path

BASE = "https://www.burnaby.ca"
PAGES = {
    "mayor": "/our-city/mayor-and-council/elections/candidates/office-of-mayor-candidate-profiles",
    "council": "/our-city/mayor-and-council/elections/candidates/office-of-councillor-candidate-profiles",
    "trustee": "/our-city/mayor-and-council/elections/candidates/office-of-school-trustees-candidate-profiles",
}

# Elector organizations as they appear at the top of a profile.
ORGS = {
    "BCA - Burnaby Citizens Association": "bca",
    "Burnaby Citizens Association": "bca",
    "Burnaby First": "burnaby-first",
    "Burnaby Green Party": "green",
    "New Burnaby": "new-burnaby",
    "New Burnaby Party": "new-burnaby",
    "Restore Burnaby Alliance": "restore",
}

ROOT = Path(__file__).resolve().parent.parent


def clean(fragment):
    text = re.sub(r"<br\s*/?>", "\n", fragment)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text).replace("\xa0", " ").replace(" ", " ")
    # House style: plain hyphens instead of em/en dashes.
    text = re.sub(r"\s* - \s*", " - ", text).replace("-", "-")
    return re.sub(r"[ \t]+", " ", text).strip()


def fetch(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "Mozilla/5.0 (voting-guide data script)"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse(page_html, office, page_url):
    candidates = []
    for item in page_html.split('<div  class="accordion__item">')[1:]:
        name = clean(re.search(r"accordion__item-toggle[^>]*>\s*(.*?)\s*</button>", item, re.S).group(1))
        body = item.split("accordion__item-content", 1)[1]
        body = body.split("\n  </div>\n</div>", 1)[0]  # drop page footer after the last profile
        paragraphs = [clean(p) for p in re.findall(r"<p>(.*?)</p>", body, re.S)]

        statement = []
        for p in paragraphs:
            if p.startswith(("Contact information", "Social media")):
                break
            if p:
                statement.append(p)

        org = None
        if statement and statement[0] in ORGS:
            org = ORGS[statement.pop(0)]

        links = {"website": [], "social": []}
        for href, label in re.findall(r'<a href="([^"]+)"[^>]*>(.*?)</a>', body, re.S):
            label = clean(label)
            if "email-protection" in href or href.startswith("/"):
                continue
            if label == "Nomination document":
                links["nomination"] = href
            elif label == "Financial disclosure statement":
                links["disclosure"] = href
            elif any(s in href for s in ("facebook.", "instagram.", "x.com", "twitter.", "linkedin.", "tiktok.", "youtube.", "bsky.app", "threads.")):
                links["social"].append({"url": href, "label": label})
            else:
                links["website"].append(href)

        phone = re.search(r"Phone:\s*(\(?\d[\d\-\s().]{6,}\d)", clean(body))
        surname = " ".join(w for w in name.split() if w.isupper() and w.isalpha() and len(w) > 1) or name.split()[-1]

        candidates.append({
            "id": f"{office}-{re.sub(r'[^a-z]+', '-', name.lower()).strip('-')}",
            "name": name,
            "surname": surname,
            "office": office,
            "org": org,
            "statement": statement,
            "website": links["website"],
            "social": links["social"],
            "phone": phone.group(1).strip() if phone else None,
            "nomination": links.get("nomination"),
            "disclosure": links.get("disclosure"),
            "profileUrl": page_url,
        })
    return candidates


def main():
    html_dir = None
    if "--html-dir" in sys.argv:
        html_dir = Path(sys.argv[sys.argv.index("--html-dir") + 1])

    data = {"fetched": date.today().isoformat(), "source": BASE + "/our-city/mayor-and-council/elections/candidates", "candidates": []}
    for office, path in PAGES.items():
        page = (html_dir / f"{office}.html").read_text(encoding="utf-8", errors="replace") if html_dir else fetch(path)
        found = parse(page, office, BASE + path)
        print(f"{office}: {len(found)} candidates", file=sys.stderr)
        data["candidates"].extend(found)

    (ROOT / "data").mkdir(exist_ok=True)
    as_json = json.dumps(data, ensure_ascii=False, indent=2)
    (ROOT / "data" / "profiles.json").write_text(as_json + "\n", encoding="utf-8")
    (ROOT / "data" / "profiles.js").write_text(
        "// Generated by scripts/fetch_profiles.py from the City of Burnaby's official\n"
        "// candidate profiles. Do not edit by hand - re-run the script instead.\n"
        f"window.PROFILES = {as_json};\n",
        encoding="utf-8",
    )
    print(f"wrote {len(data['candidates'])} candidates", file=sys.stderr)


if __name__ == "__main__":
    main()
