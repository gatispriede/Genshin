/**
 * Publishes the data-built pages (homepage, Builds, a page per character,
 * Teams, a page per team) to flux. Kept so the `flux-push` vault binding
 * still works; it no longer writes anything itself.
 *
 *     secrets run flux-push              # dry run: diff + bundle.plan
 *     secrets run flux-push -- --apply   # import the pages that changed
 *
 * Same as `secrets run flux-node tools/flux-bundle-publish.mjs --generated`:
 * one scoped-bundle diff and merge import (flux-bundle-publish.mjs), pages
 * built by flux-generated.mjs. It used to delete and recreate every page one
 * MCP call at a time (over 10 minutes on 20 Nov, mostly rate limits).
 */

process.argv.push('--generated');
await import('./flux-bundle-publish.mjs');
