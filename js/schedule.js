/* ============================================================
   SISTERS OF THE HEART COLLECTIVE — SCHEDULE
   ============================================================

   >>> THIS IS THE ONLY FILE YOU EDIT TO CHANGE DATES. <<<

   Every gathering date on the page comes from the SCHEDULE list
   below. No date is written anywhere else in the site — the page
   fills itself in automatically when it loads.

   TO ADD A DATE:  add a line to SCHEDULE, keeping it in date order.
   TO CANCEL ONE:  delete its line (or comment it out with //).
   TO MOVE ONE:    change the numbers on its line.

   Each line means:
     type: "thu"  -> a Thursday gathering  (4pm Pacific / 7pm Eastern)
     type: "fri"  -> a Friday gathering    (9am Pacific / 12pm Eastern)
     y = year,  m = month (1-12),  d = day of month

   The page always shows the NEXT Thursday and the NEXT Friday that
   have not happened yet, judged by the clock in PACIFIC time — not
   by the visitor's own timezone. A gathering stays on the page for
   the whole of its own day, then rolls to the next one at midnight
   Pacific.

   If you change the meeting TIMES (not the dates), edit TIMES below.
   ============================================================ */

var SCHEDULE = [
  { type: "fri", y: 2026, m: 8,  d: 7  },
  { type: "thu", y: 2026, m: 8,  d: 20 },
  { type: "fri", y: 2026, m: 9,  d: 4  },
  { type: "thu", y: 2026, m: 9,  d: 17 },
  { type: "fri", y: 2026, m: 10, d: 2  },
  { type: "thu", y: 2026, m: 10, d: 15 },
  { type: "fri", y: 2026, m: 11, d: 6  },
  { type: "thu", y: 2026, m: 11, d: 19 },
  { type: "fri", y: 2026, m: 12, d: 4  },
  { type: "thu", y: 2026, m: 12, d: 17 },
  { type: "fri", y: 2027, m: 1,  d: 1  },   // New Year's Day — confirm this one is still on
  { type: "thu", y: 2027, m: 1,  d: 21 },
  { type: "fri", y: 2027, m: 2,  d: 5  },
  { type: "thu", y: 2027, m: 2,  d: 18 },
  { type: "fri", y: 2027, m: 3,  d: 5  },
  { type: "thu", y: 2027, m: 3,  d: 18 },
  { type: "fri", y: 2027, m: 4,  d: 2  },
  { type: "thu", y: 2027, m: 4,  d: 15 },
  { type: "fri", y: 2027, m: 5,  d: 7  },
  { type: "thu", y: 2027, m: 5,  d: 20 },
  { type: "fri", y: 2027, m: 6,  d: 4  },
  { type: "thu", y: 2027, m: 6,  d: 17 },
  { type: "fri", y: 2027, m: 7,  d: 2  },
  { type: "thu", y: 2027, m: 7,  d: 15 }
];

/* Meeting times. "long" is used in the big hero line and the time
   cards; "short" is used on the buttons, where space is tight.
   Pacific and Eastern are always 3 hours apart, so both shift
   together with daylight saving — these strings stay correct. */
var TIMES = {
  thu: {
    label: "Thursday",
    long:  "4pm Pacific / 7pm Eastern",
    short: "4pm PT / 7pm ET",
    hour24: 16
  },
  fri: {
    label: "Friday",
    long:  "9am Pacific / 12pm Eastern",
    short: "9am PT / 12pm ET",
    hour24: 9
  }
};

/* ============================================================
   Below this line is the machinery. You should not need to touch it.
   ============================================================ */

(function () {
  "use strict";

  var MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

  // "August 20th" — the ordinal suffix, spelled the way we say it.
  function ord(n) {
    var s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  // Today's date *in Pacific time*, regardless of where the visitor is.
  // en-CA formats as YYYY-MM-DD, which is easy to pull apart.
  // If a very old browser can't do timezones, fall back to local time.
  function pacificToday() {
    try {
      var s = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
      if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    } catch (e) { /* fall through */ }
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  // The next gathering of this type that hasn't happened yet.
  // ">=" keeps a gathering on the page all day on its own day.
  function nextOf(type, today) {
    for (var i = 0; i < SCHEDULE.length; i++) {
      var e = SCHEDULE[i];
      if (e.type !== type) continue;
      if (new Date(e.y, e.m - 1, e.d) >= today) return e;
    }
    return null;
  }

  function fill(selector, text) {
    var els = document.querySelectorAll(".sohc " + selector);
    for (var i = 0; i < els.length; i++) els[i].textContent = text;
  }

  // Pacific's UTC offset on a given date (-07:00 in summer, -08:00 in winter).
  function pacificOffset(date) {
    try {
      var s = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles", timeZoneName: "longOffset"
      }).format(date);
      var m = /GMT([+-]\d{2}:\d{2})/.exec(s);
      if (m) return m[1];
    } catch (e) { /* fall through */ }
    return "-08:00";
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  // Tell Google when the gatherings actually are.
  function addEventSchema(events) {
    var graph = events.map(function (ev) {
      var t = TIMES[ev.type];
      var when = new Date(ev.y, ev.m - 1, ev.d, t.hour24);
      var start = ev.y + "-" + pad(ev.m) + "-" + pad(ev.d) +
                  "T" + pad(t.hour24) + ":00:00" + pacificOffset(when);
      return {
        "@type": "Event",
        "name": "Sisters of the Heart Collective — " + t.label + " Gathering",
        "description": "A warm, grace-filled community of women gathering on Zoom. " +
                       "Personal & spiritual growth, encouragement & support, grace-filled relationships.",
        "startDate": start,
        "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "organizer": {
          "@type": "Organization",
          "name": "Women's Center for SoulCARE",
          "url": "https://wcsoulcare.com"
        },
        "location": {
          "@type": "VirtualLocation",
          "url": "https://collective.wcsoulcare.com/guest"
        },
        "image": "https://collective.wcsoulcare.com/img/og.jpg",
        "url": "https://collective.wcsoulcare.com/guest",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "description": "Free to attend as a guest",
          "url": "https://collective.wcsoulcare.com/guest",
          "validFrom": ev.y + "-01-01"
        }
      };
    });

    var tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    document.head.appendChild(tag);
  }

  function run() {
    var today = pacificToday();
    var found = [];

    ["thu", "fri"].forEach(function (type) {
      var ev = nextOf(type, today);
      if (!ev) return;
      found.push(ev);

      var t = TIMES[type];
      var date = MONTHS[ev.m - 1] + " " + ord(ev.d);

      // Hero line:  "Thursday, August 20th at 4pm Pacific / 7pm Eastern"
      fill(".full-" + type, t.label + ", " + date + " at " + t.long);
      // Buttons:    "August 20th · 4pm PT / 7pm ET"
      fill(".date-" + type, date + " · " + t.short);
    });

    if (found.length) addEventSchema(found);

    // If the year runs out, say so plainly rather than showing blanks.
    if (!found.length) {
      var rows = document.querySelectorAll(".sohc .details, .sohc .cta-row");
      for (var i = 0; i < rows.length; i++) {
        rows[i].insertAdjacentHTML("beforebegin",
          '<p class="note">Our next dates are being scheduled — ' +
          'text us at 866-628-0012 and we will let you know.</p>');
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
