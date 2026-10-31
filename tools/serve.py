"""Serve this project with caching turned off for the files we actually edit.

`python -m http.server` lets the browser cache HTML, JS and CSS heuristically,
so an edited page keeps serving the old version until a hard refresh. That bit
us repeatedly while building the map pages: the file on disk was right and the
page was stale.

Map tiles are the opposite case - they never change and there are hundreds per
page - so those keep a long cache.

    python -I tools/serve.py [port] [--dir PATH]
"""

import functools
import os
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

NO_CACHE = (".html", ".js", ".css", ".json")


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        path = self.path.split("?")[0].lower()
        if path.endswith(NO_CACHE) or path.endswith("/"):
            self.send_header("Cache-Control", "no-cache, must-revalidate")
        else:
            self.send_header("Cache-Control", "max-age=86400")
        SimpleHTTPRequestHandler.end_headers(self)

    def log_message(self, fmt, *args):
        # One line per request is noise; only surface problems.
        if not str(args[1] if len(args) > 1 else "").startswith(("2", "3")):
            sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


def main():
    argv = sys.argv[1:]
    root = None
    if "--dir" in argv:
        i = argv.index("--dir")
        root = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    port = int(argv[0]) if argv else 8800

    if root is None:
        root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    handler = functools.partial(Handler, directory=root)
    print("serving %s at http://localhost:%d  (no-cache for html/js/css/json)"
          % (root, port))
    # Threading matters: a page pulls hundreds of tiles at once, and a
    # single-threaded server stalls every other request behind them.
    ThreadingHTTPServer(("", port), handler).serve_forever()


if __name__ == "__main__":
    main()
