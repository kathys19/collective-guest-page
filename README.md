# Sisters of the Heart Collective — Guest Page

The guest sign-up page for the Sisters of the Heart Collective, live at
**https://collective.wcsoulcare.com/guest**

Plain HTML, CSS and JavaScript. No framework, no build step. What is in the
repo is exactly what the browser gets.

---

## How do I change the gathering dates?

**Edit `js/schedule.js` — and nothing else.** It is the only place any date
exists. The page fills every date in for itself when it loads.

At the top of that file is a list that looks like this:

```js
var SCHEDULE = [
  { type: "fri", y: 2026, m: 8,  d: 7  },
  { type: "thu", y: 2026, m: 8,  d: 20 },
  ...
];
```

- `type: "thu"` = a Thursday gathering (4pm Pacific / 7pm Eastern)
- `type: "fri"` = a Friday gathering (9am Pacific / 12pm Eastern)
- `y` = year, `m` = month (1–12), `d` = day

**To add dates**, add lines, keeping the list in date order.
**To cancel one**, delete its line (or put `//` in front of it).
**To move one**, change its numbers.

Save, commit, push. Vercel redeploys on its own.

The page always shows the next Thursday and the next Friday that have not
happened yet. A gathering stays up for the whole of its own day, then rolls
over at **midnight Pacific** — so it changes at the same moment for everyone,
no matter what timezone the visitor is in.

If the list ever runs out, the page says the next dates are being scheduled
and shows the text number, rather than showing blanks.

### Changing the meeting times

Times live in the `TIMES` block just under `SCHEDULE`, in the same file.
Pacific and Eastern are always three hours apart and shift together for
daylight saving, so those strings stay correct year-round.

---

## Where the sign-ups go

Lead capture still runs entirely through GoHighLevel. Nothing was rebuilt —
these are the original form URLs.

| Button | Form |
| --- | --- |
| JOIN US THURSDAY (×5) | `links.alignedgrowthagency.co/widget/form/7ExaJOb2L3b0KaPODc6c` |
| JOIN US FRIDAY (×5) | `links.alignedgrowthagency.co/widget/form/vxVfqEe42YsXxeHZkEk5` |
| I Can't Make It — Keep Me in the Loop | `links.alignedgrowthagency.co/widget/form/SOIubLmoXX1Gwmz4aKxW` |
| Yes! Send Me the Free Ebook | `api.leadconnectorhq.com/widget/form/iK6ElkInSscqSfTl0imE` |

Thursday and Friday are deliberately **separate forms**, for tracking. Keep
them separate.

Also pointing off-site: the Drop In button goes to a GoHighLevel payment link,
while Monthly and Annual go to `sistersoftheheart.janieseltzer.com`.

---

## Layout

```
index.html          the whole page
css/styles.css      all styling
js/schedule.js      >>> dates live here <<<
js/main.js          scroll reveal + copy-link button
img/                all images, served locally (nothing loads from GoHighLevel)
favicon.svg         browser tab icon
vercel.json         serves the page at both / and /guest
```

## Notes

- **No navigation bar**, on purpose. This page is a focused funnel; the only
  goal is guest sign-ups.
- Images were pulled off the GoHighLevel/FileSafe CDN and compressed
  (24MB → 1.4MB). The page no longer depends on GoHighLevel to load.
- `prefers-reduced-motion` turns off all animation for anyone who asks for it.
- Body text is 19px at 1.8 line-height, and nothing on the page is under 16px.

## Running it locally

Any static server. For example:

```
npx serve .
```
