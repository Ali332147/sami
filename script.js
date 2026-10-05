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

  function downloadLedger() {
    try {
      const source = document.documentElement;
      const clone = source.cloneNode(true);
      copyFormValues(document, clone);

      // Remove toolbar and all external dependencies.
      clone.querySelectorAll(".no-print, #downloadBtn, #printBtn").forEach(el => el.remove());
      clone.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());
      clone.querySelectorAll('script').forEach(el => el.remove());

      let cssText = "";
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) cssText += rule.cssText + "\n";
        } catch (e) {}
      }

      const style = document.createElement("style");
      style.textContent = cssText;
      clone.querySelector("head").appendChild(style);

      const output = "<!doctype html>\n" + clone.outerHTML;
      const blob = new Blob([output], {type: "text/html;charset=utf-8"});
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
      }, 1000);
    } catch (err) {
      // Fallback: download the current page as HTML.
      const output = "<!doctype html>\n" + document.documentElement.outerHTML;
      const blob = new Blob([output], {type: "text/html;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "BP-Wellwood-Ledger.html";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  function printLedger() {
    window.print();
  }

  window.downloadLedger = downloadLedger;
  window.printLedger = printLedger;

  document.addEventListener("DOMContentLoaded", () => {
    const d = document.getElementById("downloadBtn");
    const p = document.getElementById("printBtn");
    if (d) {
      d.type = "button";
      d.onclick = downloadLedger;
      d.addEventListener("click", downloadLedger);
    }
    if (p) {
      p.type = "button";
      p.onclick = printLedger;
    }
  });
})();
