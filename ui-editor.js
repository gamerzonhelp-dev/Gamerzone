/* GAMERZONE · Notes, story editor and drawing
   File 3 of 11 in this group. Keep the load order shown in index.html. */
const BG = [
  "#0f2f2b,#1a7f55",
  "#3b3f9c,#8a2a78",
  "#f97316,#c026d3",
  "#14b8a6,#2563eb",
  "#111827,#374151",
  "#ff2d96,#7c3aed",
];
const bgOf = (i) => "linear-gradient(160deg," + BG[i] + ")";
let MY = null,
  ED = null,
  editing = 0,
  tcol = "#ffffff",
  tsz = 9,
  svt,
  drag = null;
const clamp = (v) => Math.max(4, Math.min(96, v));
function rowH(n) {
  return (
    '<div class="nr' +
    (n.show ? " u" : "") +
    '"><div class="av" style="background:linear-gradient(135deg,' +
    n.g +
    ')">' +
    n.i +
    '</div><div class="nt"><b>' +
    esc(n.b) +
    "</b> " +
    esc(n.r) +
    ' <span class="tm">' +
    n.a +
    "</span>" +
    (n.msg ? '<a data-a="nmsg">Message</a>' : "") +
    "</div>" +
    (n.th
      ? '<div class="nth" style="background:linear-gradient(135deg,' +
        n.th[0] +
        ')">' +
        n.th[1] +
        "</div>"
      : "") +
    "</div>"
  );
}
function nlist(f) {
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c.dataset.f === f));
  const L = NT.filter((n) => f === "all" || n.ty === f);
  $("nl").innerHTML =
    ["Today", "Yesterday", "Last 7 days"]
      .map((g) => {
        const r = L.filter((n) => n.d === g);
        return r.length ? '<div class="ng">' + g + "</div>" + r.map(rowH).join("") : "";
      })
      .join("") || '<p class="mut" style="padding:30px 16px">Nothing here yet.</p>';
}
function openNt() {
  NT.forEach((n) => {
    n.show = n.n;
    n.n = 0;
  });
  badge();
  $("nwrap").innerHTML =
    '<div class="nh"><button data-a="nback" aria-label="Back">' +
    svg("back") +
    '</button><b>Notifications</b></div><div class="chips">' +
    [
      ["all", "All"],
      ["ppl", "People you follow"],
      ["comment", "Comments"],
      ["like", "Likes"],
    ]
      .map((c) => '<button class="chip" data-f="' + c[0] + '" data-a="nf">' + c[1] + "</button>")
      .join("") +
    '</div><div id="nl"></div>';
  nlist("all");
  $("nv").classList.add("on");
  $("nv").scrollTop = 0;
}

function closeEd() {
  $("se").classList.remove("on");
}

function closeSv() {
  clearTimeout(svt);
  window.storyMusicStop && storyMusicStop();
  $("sv").classList.remove("on");
  $("sv").innerHTML = "";
}
function ext(a, b) {
  const d = b.dataset;
  if (a === "nback") {
    $("nv").classList.remove("on");
    return 1;
  }
  if (a === "nf") {
    nlist(d.f);
    return 1;
  }
  if (a === "nmsg") {
    toast("Messages are coming soon");
    return 1;
  }
  if (a === "sadd" || (a === "sme" && !MY)) {
    openEd(0);
    return 1;
  }
  if (a === "sme") {
    openSv("me");
    return 1;
  }
  if (a === "sv") {
    openSv(+d.k);
    return 1;
  }
  if (a === "svclose") {
    closeSv();
    return 1;
  }
  if (a === "sedit") {
    closeSv();
    openEd(1);
    return 1;
  }
  if (a === "sdel") {
    if (d.c !== "1") {
      b.dataset.c = "1";
      b.textContent = "Tap again to delete";
      return 1;
    }
    MY = null;
    window.gzStoryDel && gzStoryDel();
    closeSv();
    renderStories();
    toast("Story deleted");
    return 1;
  }
  if (a === "sclose") {
    closeEd();
    return 1;
  }
  if (a === "sshare") {
    doTop();
    return 1;
  }
  if (a === "pm") {
    panel(d.m);
    return 1;
  }
  if (a === "photo") {
    $("sf").click();
    return 1;
  }
  if (a === "undo") {
    ED.items.pop();
    paint($("cv"), ED);
    return 1;
  }
  if (a === "bg") {
    ED.bgi = +d.i;
    ED.img = null;
    paint($("cv"), ED);
    b.parentNode.querySelectorAll("i").forEach((i) => i.classList.toggle("on", i === b));
    return 1;
  }
  if (a === "tc") {
    tcol = d.c;
    b.parentNode.querySelectorAll("i").forEach((i) => i.classList.toggle("on", i === b));
    return 1;
  }
  if (a === "tz") {
    tsz = Math.max(5, Math.min(16, tsz + +d.d));
    toast("Text size " + tsz);
    return 1;
  }
  if (a === "tadd") {
    const i = $("sti"),
      t = i.value.trim();
    if (!t) {
      i.focus();
      return 1;
    }
    ED.items.push({ k: "t", v: t, c: tcol, s: tsz, x: 50, y: 45 + (ED.items.length % 5) * 6 });
    i.value = "";
    paint($("cv"), ED);
    return 1;
  }
  if (a === "em") {
    ED.items.push({
      k: "e",
      v: d.e,
      c: "#fff",
      s: 16,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
    });
    paint($("cv"), ED);
    return 1;
  }
  return ext2(a, b);
}
const cvE = $("cv");
cvE.addEventListener("pointerdown", (e) => {
  const t = e.target.closest(".si");
  if (!t) return;
  drag = t;
  t.setPointerCapture(e.pointerId);
  e.preventDefault();
});
cvE.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const r = cvE.getBoundingClientRect(),
    it = ED.items[drag.dataset.i];
  it.x = clamp(((e.clientX - r.left) / r.width) * 100);
  it.y = clamp(((e.clientY - r.top) / r.height) * 100);
  drag.style.left = it.x + "%";
  drag.style.top = it.y + "%";
});
["pointerup", "pointercancel"].forEach((n) =>
  cvE.addEventListener(n, () => {
    drag = null;
  }),
);
