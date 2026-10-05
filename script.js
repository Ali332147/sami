(() => {
  function copyFormValues(source, target) {
    const a = source.querySelectorAll("input, textarea, select");
    const b = target.querySelectorAll("input, textarea, select");
    a.forEach((el, i) => {
      const out = b[i];
      if (!out) return;
      if (el.tagName === "TEXTAREA") {
        out.textContent = el.value;
      } else if (el.tagName === "SELECT") {
        Array.from(out.options).forEach((o, j) => {
          o.selected = !!el.options[j]?.selected;
        });
      } else {
        out.setAttribute("value", el.value);
      }
    });
  }

  function saveBlob(output) {
    const blob = new Blob([output], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BP-Wellwood-Ledger.html";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 5000);
  }

  function downloadLedger() {
    let output;
    try {
      const clone = document.documentElement.cloneNode(true);
      copyFormValues(document, clone);

      // Remove toolbar and all external dependencies.
      clone.querySelectorAll(".no-print, #downloadBtn, #printBtn").forEach(el => el.remove());
      clone.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());
      clone.querySelectorAll("script").forEach(el => el.remove());

      let cssText = "";
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) cssText += rule.cssText + "\n";
        } catch (e) {}
      }

      const style = document.createElement("style");
      style.textContent = cssText;
      clone.querySelector("head").appendChild(style);

      output = "<!doctype html>\n" + clone.outerHTML;
    } catch (err) {
      // Fallback: current page as plain HTML.
      output = "<!doctype html>\n" + document.documentElement.outerHTML;
    }
    saveBlob(output);
  }

  // iPhone prints at the phone width (~390px) => 2 pages.
  // Fix: tap 1 switches the page to Letter width (816px) and waits,
  // tap 2 ("Print Now") opens the print dialog on the settled layout.
  let printReady = false;
  let originalViewport = null;

  function leavePrintMode() {
    printReady = false;
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta && originalViewport !== null) meta.setAttribute("content", originalViewport);
    const p = document.getElementById("printBtn");
    if (p) p.textContent = "Print";
  }

  function printLedger() {
    const meta = document.querySelector('meta[name="viewport"]');
    const p = document.getElementById("printBtn");
    const isPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.platform));

    // Desktop / Android: print straight away.
    if (!isPhone || !meta) {
      window.print();
      return;
    }

    if (!printReady) {
      originalViewport = meta.getAttribute("content");
      meta.setAttribute("content", "width=816");
      printReady = true;
      if (p) p.textContent = "Print Now";
      return;
    }

    window.addEventListener("afterprint", leavePrintMode, { once: true });
    window.print();
    setTimeout(leavePrintMode, 20000);
  }

  window.downloadLedger = downloadLedger;
  window.printLedger = printLedger;

  // One handler per button only (so Download does not run twice).
  document.addEventListener("DOMContentLoaded", () => {
    const d = document.getElementById("downloadBtn");
    const p = document.getElementById("printBtn");
    if (d) { d.type = "button"; d.onclick = downloadLedger; }
    if (p) { p.type = "button"; p.onclick = printLedger; }
  });
})();
