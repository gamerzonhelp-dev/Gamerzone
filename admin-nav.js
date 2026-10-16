/* GAMERZONE · Admin: icons, navigation, dashboard
   File 2 of 9 in this group. Keep the load order shown in admin.html. */
"use strict";
/* ---------- icons + navigation ---------- */
const ICON = {
  dash: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
  host: '<svg viewBox="0 0 24 24"><path d="M6 12h4M8 10v4"/><circle cx="15" cy="13" r="1"/><circle cx="18" cy="11" r="1"/><path d="M17.3 5H6.7a4 4 0 0 0-3.9 3.2l-1.5 7A3 3 0 0 0 4.2 19a3 3 0 0 0 2.2-1l1.6-2h8l1.6 2a3 3 0 0 0 2.2 1 3 3 0 0 0 2.9-3.8l-1.5-7A4 4 0 0 0 17.3 5z"/></svg>',
  results:
    '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  users:
    '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  social:
    '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  pay: '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>',
};
const VIEWS = [
  ["dash", "Dashboard"],
  ["host", "Host panel"],
  ["results", "Results"],
  ["users", "Users"],
  ["social", "Social"],
  ["pay", "Payments"],
  ["settings", "Settings"],
];
const pendingPay = () =>
  list(D.payments).filter(
    (p) => (p.type === "deposit" || p.type === "withdrawal") && p.status === "pending",
  ).length;
const pendingSubs = () =>
  list(D.submissions).filter(
    (s) =>
      s.status === "pending" && D.matches[s.matchId] && D.matches[s.matchId].status !== "completed",
  ).length;

function renderNav() {
  const cnt = {
    pay: pendingPay(),
    results: pendingSubs(),
    social: Object.keys(D.reports || {}).length,
  };
  $("#nav").innerHTML = VIEWS.map(
    (v) =>
      '<button data-view="' +
      v[0] +
      '"' +
      (v[0] === view ? ' aria-current="page"' : "") +
      ">" +
      ICON[v[0]] +
      "<span>" +
      v[1] +
      "</span>" +
      (cnt[v[0]]
        ? '<span class="cnt" aria-label="' + cnt[v[0]] + ' waiting">' + cnt[v[0]] + "</span>"
        : "") +
      "</button>",
  ).join("");
}
function segHtml(items, cur) {
  return items
    .map(
      (i) =>
        '<button type="button" data-v="' +
        i[0] +
        '" aria-pressed="' +
        (cur === i[0]) +
        '">' +
        esc(i[1]) +
        "</button>",
    )
    .join("");
}

function setView(k) {
  view = k;
  dirty = false;
  renderNav();
  const m = $("#main");
  if (k === "dash")
    m.innerHTML =
      '<div class="ph"><h1>Dashboard</h1><p>What is happening in GAMERZONE right now.</p></div><div id="body"></div>';
  else if (k === "host") {
    m.innerHTML =
      '<div class="ph"><h1>Host panel</h1><p>Create matches, share room details and see who joined.</p></div>' +
      hostForm() +
      '<div class="toolbar" style="margin-top:22px"><div class="seg" id="mseg" role="group" aria-label="Filter matches"></div></div><div id="body" class="mlist" style="margin-top:0"></div>';
    bindHostForm();
    renderMseg();
  } else if (k === "results") {
    m.innerHTML =
      '<div class="ph"><h1>Results</h1><p>Check each player\u2019s screenshot, approve or reject it, then pay the winners.</p></div><div class="toolbar"><label class="f"><span>Match</span><select id="rsel"></select></label></div><div id="body"></div>';
    renderRsel();
    $("#rsel").onchange = (e) => {
      F.rm = e.target.value;
      renderBody();
    };
  } else if (k === "users") {
    m.innerHTML =
      '<div class="ph"><h1>Users</h1><p id="usum">Every player, with wallet, deposits, contests and friends. Block accounts you suspect of cheating or fraud.</p></div><div class="toolbar"><label class="f"><span>Search by name, phone or state</span><input id="uq" type="search" placeholder="Search players" value="' +
      esc(F.uq) +
      '"></label><div class="seg" id="useg" role="group" aria-label="Filter users"></div><button class="btn" id="uexp" type="button">Download list (CSV)</button></div><div id="body"></div>';
    $("#uexp").onclick = exportUsers;
    $("#uq").oninput = (e) => {
      F.uq = e.target.value;
      renderBody();
    };
    renderUseg();
  } else if (k === "social") {
    m.innerHTML =
      '<div class="ph"><h1>Social</h1><p>Manage posts, reports, Clip of the Week, the official account, story cards and clans.</p></div>' +
      socialStatic();
    fillStm();
  } else if (k === "pay") {
    m.innerHTML =
      '<div class="ph"><h1>Payments</h1><p>Approve or reject deposit and withdrawal requests.</p></div><div class="toolbar"><div class="seg" id="ptseg" role="group" aria-label="Request type"></div><div class="seg" id="psseg" role="group" aria-label="Request status"></div></div><div id="body"></div>';
    renderPseg();
  } else {
    m.innerHTML = settingsHtml();
    bindSettings();
  }
  renderBody();
  window.scrollTo(0, 0);
}
function refresh() {
  if (!$("#app") || $("#app").hidden) return;
  renderNav();
  if (view === "host") {
    const b = $("#body");
    if (
      b &&
      b.contains(document.activeElement) &&
      /INPUT|SELECT/.test(document.activeElement.tagName)
    ) {
      dirty = true;
      return;
    }
    renderMseg();
  } else if (view === "pay") renderPseg();
  else if (view === "users") renderUseg();
  else if (view === "results") renderRsel();
  else if (view === "social") {
    renderBody();
    fillStm();
    return;
  } else if (view === "settings") return;
  renderBody();
}
document.addEventListener("focusout", () => {
  if (dirty)
    setTimeout(() => {
      if (!document.activeElement || !/INPUT|SELECT/.test(document.activeElement.tagName)) {
        dirty = false;
        refresh();
      }
    }, 0);
});
function renderBody() {
  const b = $("#body");
  if (!b) return;
  b.innerHTML =
    view === "dash"
      ? dashHtml()
      : view === "host"
        ? matchesHtml()
        : view === "results"
          ? resultsHtml()
          : view === "users"
            ? usersHtml()
            : view === "social"
              ? socialHtml()
              : view === "pay"
                ? payHtml()
                : "";
  b.querySelectorAll("img[data-img]").forEach((im) => {
    const u = IMGC[im.dataset.img];
    if (u) im.src = u;
  });
}

/* ---------- dashboard ---------- */
function dashHtml() {
  const U = list(D.users),
    M = matchList().map((m) => Object.assign(m, { _s: mstate(m) }));
  const P = list(D.payments).filter((p) => p.type === "deposit" || p.type === "withdrawal");
  const live = M.filter((m) => m._s === "live").length,
    up = M.filter((m) => m._s === "upcoming").length;
  const blocked = U.filter((u) => u.status === "blocked").length;
  const depOk = P.filter((p) => p.type === "deposit" && p.status === "approved"),
    depSum = depOk.reduce((a, p) => a + (+p.amount || 0), 0);
  const depPend = P.filter((p) => p.type === "deposit" && p.status === "pending").length;
  const wPend = P.filter((p) => p.type === "withdrawal" && p.status === "pending"),
    wSum = wPend.reduce((a, p) => a + (+p.amount || 0), 0);
  const q = [];
  P.filter((p) => p.status === "pending").forEach((p) =>
    q.push({
      t: p.createdAt,
      a: uname(p.uid),
      b: (p.type === "deposit" ? "Deposit" : "Withdrawal") + " · " + when(p.createdAt),
      r: inr(p.amount),
      go: "pay",
    }),
  );
  list(D.submissions)
    .filter(
      (s) =>
        s.status === "pending" &&
        D.matches[s.matchId] &&
        D.matches[s.matchId].status !== "completed",
    )
    .forEach((s) =>
      q.push({
        t: s.createdAt,
        a: s.name,
        b: "Result screenshot · " + (s.matchName || ""),
        r: "Rank #" + s.rank,
        go: "results",
      }),
    );
  q.sort((a, b) => a.t - b.t);
  const next = M.filter((m) => m._s === "live" || m._s === "upcoming" || m._s === "ended")
    .sort((a, b) => a.startAt - b.startAt)
    .slice(0, 5);
  return (
    '<div class="stats">' +
    '<div class="stat"><span>Total users</span><strong>' +
    U.length +
    "</strong><small>" +
    blocked +
    " blocked</small></div>" +
    '<div class="stat"><span>Active matches</span><strong>' +
    (live + up) +
    "</strong><small>" +
    live +
    " live now, " +
    up +
    " upcoming</small></div>" +
    '<div class="stat"><span>Total deposits</span><strong>' +
    inr(depSum) +
    "</strong><small>" +
    depOk.length +
    " approved, " +
    depPend +
    " waiting</small></div>" +
    '<div class="stat warn"><span>Pending withdrawals</span><strong>' +
    wPend.length +
    "</strong><small>" +
    inr(wSum) +
    " to pay out</small></div></div>" +
    '<div class="two"><section class="panel"><h2>Waiting for you</h2>' +
    (q.length
      ? q
          .slice(0, 6)
          .map(
            (x) =>
              '<div class="row"><div><b>' +
              esc(x.a) +
              "</b><small>" +
              esc(x.b) +
              "</small></div><b>" +
              esc(x.r) +
              "</b></div>",
          )
          .join("") +
        '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-go="pay">Open payments</button><button class="btn sm" data-go="results">Open results</button></div>'
      : '<p class="empty">Nothing is waiting. All clear.</p>') +
    '</section><section class="panel"><h2>Next matches</h2>' +
    (next.length
      ? next
          .map(
            (m) =>
              '<div class="row"><div><b>' +
              esc(m.name) +
              "</b><small>" +
              when(m.startAt) +
              " · " +
              (m.joined || 0) +
              "/" +
              m.slots +
              ' joined</small></div><span class="badge b-' +
              m._s +
              '">' +
              LAB[m._s] +
              "</span></div>",
          )
          .join("") +
        '<div style="margin-top:12px"><button class="btn sm" data-go="host">Open host panel</button></div>'
      : '<p class="empty">No matches scheduled. Add one in the host panel.</p>') +
    "</section></div>"
  );
}
