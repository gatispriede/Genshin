# 15 · Earning money from the flux site — research and plan

*Researched 18 Nov 2026. Private planning note: deliberately **not** in index.html,
so it is not migrated to flux.*

## The one number that decides everything

Measured on flux (`site.analyticsSummary`, public audience, last 30 days):

| | |
|---|---|
| Page views | **201** |
| Unique visitors | **~10** |
| External referrers | **none**: every referrer is flux itself or its admin sign-in |
| Devices | 200 desktop Chrome on Windows, 1 phone |

That is the owner reading their own notes. **There is no audience yet, so there is
nothing to monetise yet.** Every option below is revenue = traffic × rate, and the
traffic term is zero. The plan is therefore *traffic first, money second*.

What the CMS already has, all switched off: AdSense integration with five ad zones
(header, between modules, sidebar, in content, footer) and an ad-free page list
(`ads.config.get`: `enabled: false`, `provider: none`, no units), plus commerce.

## What ads would pay

Gaming is one of the lowest-paying ad niches (young audience, ad blockers, low buyer
intent). Third-party 2026 estimates, which disagree with each other:

| Network | Entry bar | Gaming RPM (per 1,000 views) |
|---|---|---|
| AdSense | none | ~$1–6 |
| Ezoic | none to ~10k sessions/mo | ~$5–15 |
| Mediavine Journey | ~1k sessions/mo from US/UK/CA/AU (new 2026 tier) | ~$8–25 |
| Raptive | 25k–100k views/mo | higher |

| Monthly page views | AdSense at $1–6 | Ezoic/Journey at $5–15 |
|---|---|---|
| 200 (today) | $0.20–1.20 | — |
| 10,000 | $10–60 | $50–150 |
| 50,000 | $50–300 | $250–750 |

**Ads are worth switching on at roughly 10,000 views a month, not before.** Below
that, a consent banner and ad clutter cost more in credibility than they earn.

## Rules and risks to clear before any money flows

1. **HoYoverse IP.** HoYoverse's published fan rules cover *merchandise*: fan items can
   be sold (declare above 200 units for groups, 500 for individuals), no copyright fee,
   but **no direct use or retouching of official material** and no selling under the
   official name. I found **no published policy on ad-funded fan websites**. Large sites
   (Game8, Fandom) run ads on Genshin content, so ad revenue on original text and data
   is common practice, but it is not explicitly licensed. Treat it as tolerated, not
   granted.
2. **Images are the exposure.** These pages hotlink Fandom wiki art and HoYoLAB
   interactive-map screenshots. Fine for personal notes; **before ads, replace them**
   with own screenshots, or link out instead of embedding. Original writing, measured
   data (quest lengths, shield tables) and own maps are what to monetise.
3. **EU consent.** The site is run from Latvia; AdSense in the EEA needs a
   TCF-certified consent banner, and non-essential cookies need opt-in.
   GDPR: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679 ·
   ePrivacy: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32002L0058
4. **Personal data in the pages.** Pages name this account's UID, roster and
   "you said" notes. A public site should not lead with one person's account.

## Options, ranked

### 1. Make the unique parts public, generic and findable (prerequisite, no revenue)

The site is written *to one player*. Guides sites (Game8, Fandom, KQM) already own
generic builds, so do not compete there. What this project has that they don't:

- **Reputation quests ranked by measured length** (steps and dialogue size, per region),
  with the hidden prerequisite chains. Nobody else publishes "shortest first".
- **The Sumeru route map** with per-quest toggles, start screenshots and chains.
- **Enemy shield breaker table** per element, plus which team covers which ward.
- **Codes page that records the game's answer**, not just aggregator lists. On 17 Nov
  three of four "live" codes failed in game: that verification is the value.
- **Theater planner** (who to spend in which Act).

Work: strip the account-specific framing from those pages, give each a search-shaped
title and description (the CMS has `seo.update` / `seo.preflight`), and post each one
once where players ask that exact question (r/Genshin_Impact, HoYoLAB). Free, and the
only thing that moves the traffic term.

### 2. A "paste your UID" account check (the real product)

The engine already exists: gear-vs-target, ideal build, artifact and character
roadmaps, all computed from a live read. Today it reads HoYoLAB through the owner's
signed-in browser; **enka.network's public API returns any player's showcase from a
UID with no credentials**, which is what a public version would use.

The pitch: *"Enter your UID: here is what to fix next, in order"*: the plain-language
roadmap this site gives its owner. Existing tools are leaderboards (Akasha) or
optimisers that need manual input (Genshin Optimizer); a short prioritised to-do list
is a different product. It is also the thing people return to after every banner, which
is what ads and donations need.

Money from it, in order of realism: ads on the result page once traffic exists →
donations → a paid tier only if people demonstrably come back (e.g. saved history,
alerts when a new piece beats the current one).

### 3. Display ads (once ~10k views/month)

Built into the CMS: set `ads.provider = adsense` + publisher ID, add one unit in
`between-modules`, keep tools/maps ad-free. Graduate to Ezoic or Mediavine Journey when
traffic qualifies.

### 4. Donations (any time, tiny)

Ko-fi / Buy Me a Coffee link in the footer. Near-zero effort and no IP question,
because it is support for the author's work, not sale of game content. Expect cents
until option 2 exists.

### 5. Top-up affiliates (possible, check carefully)

Community sites do this: StarDB.gg partners with **LootBar** for a commission (rate not
published). **Codashop and Razer Gold are HoYoverse's official third-party top-up
partners**; one guide puts LootBar and LDShop in "a gray area, moderate risk". If done
at all, prefer the official partners, and disclose the link as affiliate.

### 6. HoYoverse creator programmes (validation, not income)

The version Creator Incentive pays **Primogems** for posts with ≥2,000 views; HoyoCreators
offers codes, spotlights and collaboration, not set pay. The one cash programme found is
the **Miliastra Wonderland Inspiration Incentive** (7.2, until 15 Dec), which pays for
user-made *stages*: a different skill, not this site.

### Not recommended

Selling guides or "premium" build content (free alternatives everywhere), and any
account services (against the game's terms).

## Plan with gates

| Step | Done when | Gate to next step |
|---|---|---|
| 1. Three public pages: reputation-by-length, Sumeru route, shield table. Own images, SEO titles | Live, posted once each to Reddit/HoYoLAB | Any organic referrer shows up in analytics |
| 2. UID check prototype on enka.network data, one page | A stranger's UID gives a correct roadmap | 1,000 views/month |
| 3. Donation link + consent banner | Live | 10,000 views/month |
| 4. AdSense, one between-modules unit | Revenue reported | Qualify for Ezoic/Journey |

**Recommendation:** do step 1 now; it costs a few hours and tells us within weeks
whether anyone outside this account wants these pages. Do not switch on ads yet.

## Sources

- flux analytics and ads config: `site.analyticsSummary` (30d), `ads.config.get`, `ads.unit.list`, 18 Nov 2026
- Fan merchandise rules: [Game World Observer](https://gameworldobserver.com/2021/11/11/mihoyo-lets-players-sell-genshin-impact-content-and-merch-with-no-copyright-fee) · [GamesRadar](https://www.gamesradar.com/genshin-impact-dev-mihoyo-allows-fans-to-make-money-on-fan-made-merchandise/) · [Techdirt](https://www.techdirt.com/2021/09/28/genshin-impact-developer-goes-with-extremely-fan-friendly-fan-art-commercial-sale-policy/) · [Fanlore](https://fanlore.org/wiki/Genshin_Impact)
- Ad rates: [appadrevenue — RPM by niche](https://www.appadrevenue.com/guides/how-much-do-websites-earn) · [Adstimate — AdSense niches 2026](https://adstimate.com/blog/highest-paying-adsense-niches.html) · [Mediavine RPM calculator](https://www.appadrevenue.com/mediavine-rpm-calculator) · [Ezoic vs Mediavine](https://monetizehelper.com/blog/ezoic-vs-mediavine-comparison)
- Top-up partners: [StarDB × LootBar](https://stardb.gg/en/posts/official-partnership-with-lootbar-for-top-ups) · [Third-party top-ups in gacha games](https://www.maecly.com/blog/gacha-topups-third-party-guide)
- Creator programmes: [Miliastra Wonderland incentive](https://www.hoyolab.com/article/47314815) · [Luna IV Creator Incentive](https://act.hoyoverse.com/puzzle/hk4e/pz_dS9duPo00l) · [HoyoCreators guide (2025, third party)](https://www.genshinrealm.com/articles/genshin-impact-hoyocreators-program-insider-guide-2025.html)
