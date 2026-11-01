# Cloud routine: Genshin 7.3 Special Program code watch

A cloud routine that checks for new redeem codes on its own schedule, whether or
not Claude Code happens to be open. **Not yet created** — the remote-trigger API
returned `essential-traffic-only` (a capacity restriction) on 1 Nov 2026, so
local one-shot tasks are covering 4–5 Dec in the meantime.

Retry the creation with the `RemoteTrigger` tool, `action: "create"`, and the
body below. Load the tool first with `ToolSearch select:RemoteTrigger`; the OAuth
token is added in-process, so do not reach for curl.

## Once it exists

- Cancel any remaining retry tasks (`CronList`, then `CronDelete`).
- The cloud agent pushes to `main` on GitHub, while the local 4–5 Dec tasks read
  this working copy. Either delete the local tasks or make them `git pull` first,
  or the two will report different states.

## Why these dates

Version 7.2 shipped 4 Nov 2026 (officially confirmed during the 23 Oct stream).
The 42-day cadence puts 7.3 on 16 Dec, and its Special Program on Fri 4 Dec at
12:00 UTC — the same slot 7.2 used. HoYoverse only confirms a stream date about
two days ahead, so 4 Dec is an estimate. The cron covers 1–8 Dec daily to absorb
a slip; a daily check always lands inside a 24-hour code window.

## Body

```json
{
  "name": "Genshin 7.3 Special Program code watch",
  "cron_expression": "0 13 1-8 12 *",
  "enabled": true,
  "job_config": {
    "ccr": {
      "environment_id": "env_01URSoJYJxrVfGaLQoDndsYp",
      "session_context": {
        "model": "claude-sonnet-5-5",
        "sources": [
          { "git_repository": { "url": "https://github.com/gatispriede/Genshin" } }
        ],
        "allowed_tools": ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch"]
      },
      "events": [
        {
          "data": {
            "uuid": "GENERATE_A_FRESH_LOWERCASE_V4_UUID",
            "session_id": "",
            "type": "user",
            "parent_tool_use_id": null,
            "message": { "role": "user", "content": "SEE PROMPT BELOW" }
          }
        }
      ]
    }
  }
}
```

`cron_expression` is UTC. `0 13 1-8 12 *` is 13:00 UTC daily on 1–8 December —
an hour after the expected stream, 15:00 Riga. Because the month is pinned to
December it will not fire again until Dec 2027.

## Prompt

Paste this as `events[].data.message.content`.

> You are checking for new Genshin Impact redeem codes and recording them in this
> repository. You have no prior context; everything you need is below.
>
> **Background.** This repo is a personal Genshin Impact guide site.
> `reference/data/codes.json` is a dated snapshot of redeem codes, rendered by
> `codes.html` via `app/codes.js`. Read all three before editing anything so you
> match the existing shape exactly.
>
> **What you are watching for.** Genshin Impact Version 7.3 releases 16 December
> 2026. The Version 7.3 Special Program is expected Friday 4 December 2026 at
> 12:00 UTC, the same slot Version 7.2 used on 23 October 2026. During that stream
> HoYoverse gives out three redeem codes worth roughly 300 Primogems in total.
> These codes expire about 24 hours after the stream. That short life is the
> entire reason this job exists.
>
> **Task.**
> 1. Search the web for Genshin Impact redeem codes live today. Useful queries:
>    "Genshin Impact 7.3 livestream codes", "Genshin Impact Special Program codes
>    December 2026", "Genshin Impact active redeem codes". Also fetch
>    `https://genshin.hoyoverse.com/en/news` and
>    `https://www.gachafeed.moe/genshin/codes` directly.
> 2. Cross-check every code against at least two independent sources before
>    calling it active. This repo has been burned by a single aggregator listing
>    long-dead codes as live — `reference/corrections.md` records it. A code
>    confirmed by only one source goes in with a note saying so, not silently as
>    active.
> 3. Compare against the codes already in `reference/data/codes.json`. Add what is
>    missing. Move any code your sources now call expired to status `expired`.
> 4. Set `_checked` to today's date as YYYY-MM-DD. Keep `_sources` accurate to
>    what you actually used.
> 5. Each new code needs `code`, `primogems` (integer, 0 if no Primogems),
>    `rewards`, `added` (today), `status`, and an optional `note`. For 7.3
>    Special Program codes, note that they are livestream codes expiring about
>    24 hours after the stream.
> 6. Validate the file parses:
>    `python -c "import json;json.load(open('reference/data/codes.json'))"`.
> 7. Commit and push to `main`. Subject should name what you found — "Add three
>    7.3 Special Program codes", or "No new codes on 2026-12-03". Put the sources
>    you checked in the body.
>
> **If there is nothing new**, still set `_checked` to today and still commit, so
> the repo records that the check ran and found nothing. Do not invent codes, do
> not copy a code you cannot confirm from a real source, and do not guess at a
> code's reward contents.
>
> Do not add a `Co-Authored-By` trailer or a "Generated with Claude Code" line.
> The repo owner has asked for neither.
>
> Finish by stating plainly, in one short paragraph: which codes are newly live,
> how many Primogems they are worth in total, and when they expire.
