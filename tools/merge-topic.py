"""Wire a merged topic page into the catalogue and the flux tree.

    python -I tools/merge-topic.py <new.html> "<Title>" "<card blurb>" <section> \
        --after <existing card href> --old "<old href>=<old flux title>" ...

Adds the new page's card to index.html after an existing card, places it in
tools/flux-tree.mjs where the first old page was (replacing every old page),
retires the old pages (they stay in the repo as notes) and maps their old flux
titles to the new title so their URLs redirect. Then regenerate pages.ts with
tools/build-pages-index.py.
"""
import io, re, sys, json, argparse

ap = argparse.ArgumentParser()
ap.add_argument("href"); ap.add_argument("title"); ap.add_argument("blurb"); ap.add_argument("section")
ap.add_argument("--after", required=True)
ap.add_argument("--old", action="append", default=[])
a = ap.parse_args()
old = [o.split("=", 1) for o in a.old]

def rw(path, fn):
    s = io.open(path, encoding="utf-8").read()
    t = fn(s)
    io.open(path, "w", encoding="utf-8", newline="").write(t)

def index(s):
    if 'href="%s"' % a.href in s:
        return s
    m = re.search(r'(  <a class="card [a-z]+" href="%s">\n.*?</a>\n)' % re.escape(a.after), s, re.S)
    if not m:
        sys.exit("no card for --after " + a.after)
    card = '  <a class="card tool" href="%s">\n    <b>%s</b><span>%s</span></a>\n' % (a.href, a.title, a.blurb)
    return s[:m.end()] + card + s[m.end():]

def tree(s):
    hrefs = [h for h, _ in old]
    first = "'%s'" % hrefs[0]
    if first not in s:
        sys.exit("first old page not in the tree: " + hrefs[0])
    s = s.replace(first, "'%s'" % a.href, 1)
    for h in hrefs[1:]:
        # "'x', " in the middle of a list, or ", 'x'" at its end
        s, n = re.subn(r"\s*'%s'," % re.escape(h), "", s, count=1)
        if not n:
            s = re.sub(r",\s*'%s'" % re.escape(h), "", s, count=1)
    ren = "".join("  %s: %s,\n" % (json.dumps(t, ensure_ascii=False), json.dumps(a.title, ensure_ascii=False))
                  for _, t in old)
    s = s.replace("};\n\n/** Account-only pages", "  // %s: merged into %s.\n%s};\n\n/** Account-only pages"
                  % (a.title, a.href, ren), 1)
    ret = "".join('  \'%s\': "merged into %s; kept as notes",\n' % (h, a.href) for h, _ in old)
    return s.replace("export const RETIRED = {\n", "export const RETIRED = {\n" + ret, 1)

rw("index.html", index)
rw("tools/flux-tree.mjs", tree)
print("wired %s (%d old pages)" % (a.href, len(old)))
