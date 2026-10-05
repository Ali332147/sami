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

  function printLedger() {
    // iPhone: lay the page out at Letter width while printing.
    // IMPORTANT: window.print() must run immediately inside the tap
    // (no setTimeout), otherwise iPhone Safari blocks it.
    const meta = document.querySelector('meta[name="viewport"]');
    const original = meta ? meta.getAttribute("content") : null;
    const restore = () => {
      if (meta && original !== null) meta.setAttribute("content", original);
    };
    try {
      if (meta) meta.setAttribute("content", "width=816");
    } catch (e) {}
    window.addEventListener("afterprint", restore, { once: true });
    document.addEventListener("pointerdown", restore, { once: true });
    window.print();
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
