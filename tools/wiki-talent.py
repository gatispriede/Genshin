"""Print the description of wiki talent or passive pages, cleaned of markup.

    python -I tools/wiki-talent.py "Chevreuse's 1st Ascension Passive" "Mona's Elemental Burst"

Used to check what a support's value scales on (talent level, ascension passive, or
a stat) before deciding how far to level them.
"""

import json
import re
import subprocess
import sys
import urllib.parse

API = "https://genshin-impact.fandom.com/api.php"
UA = "Mozilla/5.0 (compatible; genshin-notes/1.0)"


def clean(x):
    x = re.sub(r"\{\{Extra Effect\|[^|]*\|([^|]*)\|[^}]*\}\}", r"\1", x)
    x = re.sub(r"\{\{Color\|\w+\|([^}]*)\}\}", r"\1", x)
    x = re.sub(r"\{\{Color\|([^}|]*)\}\}", r"\1", x)
    x = re.sub(r"\[\[(?:[^]|]*\|)?([^]]*)\]\]", r"\1", x)
    x = re.sub(r"<[^>]+>", " ", x)
    return re.sub(r"\s+", " ", x).strip()


def main():
    width = 600
    for page in sys.argv[1:]:
        url = API + "?" + urllib.parse.urlencode({"action": "parse", "page": page, "prop": "wikitext",
                                                  "format": "json", "redirects": "1"})
        raw = subprocess.run(["curl", "-s", "-H", "User-Agent: " + UA, url], capture_output=True).stdout
        d = json.loads(raw.decode("utf-8"))
        if "parse" not in d:
            print("== %s: not found" % page)
            continue
        t = d["parse"]["wikitext"]["*"]
        m = re.search(r"\|(?:info|description)\s*=\s*(.*?)\n\|", t, re.S)
        print("== %s -> %s\n   %s" % (page, d["parse"]["title"], clean(m.group(1))[:width] if m else "(no description)"))


if __name__ == "__main__":
    main()
