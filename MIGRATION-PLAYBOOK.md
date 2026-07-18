# Playbook — Moving a GoHighLevel Page to Vercel

The repeatable process, written down after doing it for the guest page
(July 2026). Follow it for `/join` or any other page. Includes the specific
things that went wrong the first time, so they don't go wrong again.

---

## The one rule that shapes everything

**DNS points a whole subdomain, not a path.**

You cannot send `collective.wcsoulcare.com/guest` to Vercel while
`collective.wcsoulcare.com/join` stays in GoHighLevel. It's all or nothing
for that subdomain.

So each page gets **its own subdomain** until you're ready to move the whole
subdomain at once:

| Page | Old URL | New home |
| --- | --- | --- |
| Guest | collective.wcsoulcare.com/guest | **guest.wcsoulcare.com** ✅ done |
| Join | collective.wcsoulcare.com/join | join.wcsoulcare.com (suggested) |

Old links keep working because the old GHL page becomes a redirect.

---

## How the pieces map: one page = one of everything

Keep the same name at every layer. One name, four places.

| Layer | Guest (done) | Join (next) |
| --- | --- | --- |
| Desktop folder | `collective-guest-page` | `collective-join-page` |
| GitHub repo | `collective-guest-page` | `collective-join-page` |
| Vercel project | `collective-guest-page` | `collective-join-page` |
| Live domain | guest.wcsoulcare.com | join.wcsoulcare.com |

Each page stays isolated, so breaking one can't affect another.

- **Repo** = backup + undo history
- **Vercel project** = the thing that publishes
- **Domain** = where people find it

**Later, once nothing is left in GoHighLevel on `collective.wcsoulcare.com`:**
combine the pages into one repo / one Vercel project and point
`collective.wcsoulcare.com` at it. Then `/guest` and `/join` work as real
paths again — original URLs, no subdomains, no redirects. Building page by
page now doesn't block that; consolidating is mostly moving folders together.

---

## Step 1 — Get the real page source

GoHighLevel does **not** serve your custom code as plain HTML. It hides it
inside a JSON blob with `<` written as `<`, so searching the page source
for your own markup finds nothing. Don't build from what you see in the
browser — extract the real thing:

```bash
curl -sSL "https://collective.wcsoulcare.com/join" -o live.html
```

Then pull the custom code out of the `__NUXT_DATA__` script block. Look for
the long strings containing `<div` or `<style`. (Ask Claude to do this — it's
one small script.)

**Audit before writing any code.** List every section, image, form URL,
outbound link, and script. Assumptions are where the time gets lost.

## Step 2 — Pull the images local

Images live on `assets.cdn.filesafe.space`. Download them all so the new page
has zero dependency on GoHighLevel:

```bash
curl -sS "https://assets.cdn.filesafe.space/<path>" -o img/name.jpg
```

**Compress them.** The guest page's photos totalled 24MB — one portrait was a
16MB PNG. After compression: 1.8MB. That matters on phones.

⚠️ **Check for transparency before converting.** The directors' photo was a
cut-out with a transparent background; converting it to JPEG put a black box
behind it. Transparent images must stay PNG or WebP.

## Step 3 — Build it

Plain HTML/CSS/JS. No framework, no build step.

```
index.html          the page
css/styles.css      styling
js/schedule.js      dates (if the page has them)
js/main.js          behaviour
img/                images
vercel.json         redirects + caching
```

**Things to strip out** (they only existed for GoHighLevel):
- Negative-margin "wrapper neutralizer" hacks
- Odd structures that dodged GHL's smart-quote mangling — normal
  `addEventListener` is fine now

**Things to keep exactly:**
- All GoHighLevel form URLs (lead capture must keep flowing to the CRM)
- The copy, unless you've decided to change it

### Mobile trap that bit us

A fixed `max-width` in pixels **overrides** the global `max-width:100%`, so
images blow past the screen edge on phones — and if a parent has
`overflow:hidden`, you can't even scroll to see it. Always write:

```css
max-width: min(470px, 100%);
```

Test at **320px**, not just 375px.

## Step 4 — Deploy

From the project folder:

```
cd "C:\Users\Owner\Desktop\...\<project-folder>"
vercel
```

**First run only**, answer carefully:

| Prompt | Answer |
| --- | --- |
| Set up and deploy? | `y` |
| Which scope? | Enter (kathyops) |
| Which project? | **arrow down to "Create a new project"** ⚠️ |
| Name? | Enter (uses folder name) |
| Code directory? | Enter (`./`) |
| Customize settings? | `n` |
| Customize advanced settings? | `n` |

⚠️ **The trap:** at "Which project?", the highlighted option is *Search all
projects*. Pressing Enter there links you to an **existing** project. Arrow
**down** to "Create a new project" first. Getting this wrong once linked the
guest page to the `kathyops` project.

Every deploy after that is just:

```
vercel --prod
```

**Use Command Prompt (cmd), not PowerShell.** PowerShell blocks the Vercel
script with a "running scripts is disabled" security error. cmd works fine and
requires changing no system settings.

## Step 5 — Point a subdomain at it

1. **Vercel** → project → Settings → Domains → add `<name>.wcsoulcare.com`
2. **Bluehost** (that's where wcsoulcare.com's DNS lives) → Domains →
   wcsoulcare.com → DNS / Zone Editor → **Add** a record:

   | Field | Value |
   | --- | --- |
   | Type | CNAME |
   | Host | `<name>` (just the prefix, e.g. `join`) |
   | Points to | `cname.vercel-dns.com` |

⚠️ **Only ADD. Never edit or delete an existing record** — especially anything
named `collective`, which serves the live GoHighLevel pages.

DNS takes minutes to an hour. Vercel issues the SSL certificate automatically.

Vercel may show "DNS Change Recommended" suggesting a newer record — it's
optional. Their own note says the legacy `cname.vercel-dns.com` keeps working.

## Step 6 — Verify before switching anything

- [ ] Page loads over **https** with no certificate warning
- [ ] Every date/dynamic bit fills in correctly
- [ ] **Submit each form** and confirm the contact reaches GoHighLevel
- [ ] Check on a **real phone**, in a private tab (caching lies to you)
- [ ] No leftover `filesafe` or CDN links in the source

## Step 7 — Redirect the old page (last)

Only after the above passes. In GoHighLevel, edit the **old** page so it
redirects to the new subdomain. Every existing link — emails, the homepage,
printed material — keeps working.

Then update links at your own pace. There's no rush; the redirect covers them.

**Never delete the old GHL page.** Leave it as the redirect.

---

## Backing this up

The source lives in one folder on the Desktop. That is a single point of
failure, so it also lives in a **GitHub repository**.

⚠️ **The GitHub repo is a backup only. Do NOT connect it to the Vercel
project.**

Connecting a repo makes Vercel auto-deploy from it. In July 2026 the
`kathys19/kas-team-site` repo got connected to this project, and Vercel
published the *kasteam site* onto `guest.wcsoulcare.com`. Disconnecting it
fixed it. Check under Settings → Git; "Connected Git Repository" should show
the provider buttons, meaning **nothing is connected**.

To save a checkpoint:

```
git add -A
git commit -m "what changed"
git push
```

Deploying stays separate and manual: `vercel --prod`.

---

## Quick reference

| Thing | Where |
| --- | --- |
| DNS | Bluehost |
| Hosting | Vercel, team `kathyops` |
| Forms / CRM | GoHighLevel (unchanged) |
| Old pages | GoHighLevel, `collective.wcsoulcare.com` |
| Deploy command | `vercel --prod` from the project folder (in **cmd**) |
| Roll back a bad deploy | Vercel dashboard → Deployments → promote an older one |
