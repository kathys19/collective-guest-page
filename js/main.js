/* ============================================================
   Sisters of the Heart Collective — page behaviour
   Scroll reveal + the "Copy Link" share button.
   Dates live in schedule.js — not here.
   ============================================================ */

(function () {
  "use strict";

  var root = document.querySelector(".sohc");
  if (!root) return;

  // ---- Scroll reveal: a gentle fade-up as each section comes into view.
  // The hidden starting state is only applied once we know JS is running,
  // so the page is never left blank if a script fails.
  var reduce = window.matchMedia &&
               window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduce && "IntersectionObserver" in window) {
    var blocks = root.querySelectorAll("section, .foot");
    root.classList.add("anim-ready");
    for (var r = 0; r < blocks.length; r++) blocks[r].classList.add("reveal");

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    for (var s = 0; s < blocks.length; s++) io.observe(blocks[s]);
  }

  // ---- Copy Link
  var copyBtns = root.querySelectorAll("[data-copy]");
  for (var j = 0; j < copyBtns.length; j++) {
    copyBtns[j].addEventListener("click", function () {
      var btn = this;
      var url = btn.getAttribute("data-copy");

      function done() {
        var original = btn.textContent;
        btn.textContent = "Link Copied!";
        setTimeout(function () { btn.textContent = original; }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, done);
      } else {
        // Older phones: the textarea-and-execCommand fallback.
        var ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) { /* nothing to do */ }
        document.body.removeChild(ta);
        done();
      }
    });
  }
})();
