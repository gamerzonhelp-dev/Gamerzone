/* GAMERZONE · Admin: check result screenshots and pay winners
   File 4 of 9 in this group. Keep the load order shown in admin.html. */
"use strict";
/* ---------- results: check screenshots, pay winners ---------- */
function resultMatches() {
  return matchList()
    .map((m) => Object.assign(m, { _s: mstate(m) }))
    .filter((m) => subsFor(m.id).length || ["live", "ended", "completed"].includes(m._s))
    .sort((a, b) => b.startAt - a.startAt);
}
function renderRsel() {
  const sel = $("#rsel");
  if (!sel) return;
  const M = resultMatches();
  if (!M.find((m) => m.id === F.rm)) F.rm = (M[0] || {}).id || "";
  const html = M.length
    ? M.map((m) => {
        const p = subsFor(m.id).filter((s) => s.status === "pending").length;
        return (
          '<option value="' +
          esc(m.id) +
          '"' +
          (m.id === F.rm ? " selected" : "") +
          ">" +
          esc(m.name) +
          " · " +
          when(m.startAt) +
          " · " +
          LAB[m._s] +
          (p ? " · " + p + " to check" : "") +
          "</option>"
        );
      }).join("")
    : '<option value="">No matches to review yet</option>';
  if (sel.innerHTML !== html) sel.innerHTML = html;
}
function flagsFor(s) {
  const f = [],
    o = subsFor(s.matchId).filter((x) => x.id !== s.id);
  if (IMH[s.id] && o.some((x) => IMH[x.id] && IMH[x.id] === IMH[s.id]))
    f.push("Same screenshot used by another player");
  if (o.some((x) => x.rank === s.rank && x.status !== "rejected") && s.status !== "rejected")
    f.push("Rank #" + s.rank + " claimed by more than one player");
  return f;
}
function winnersOf(m) {
  return subsFor(m.id)
    .filter((s) => s.status === "approved")
    .sort((a, b) => a.rank - b.rank || a.createdAt - b.createdAt)
    .slice(0, (m.prizes || []).length);
}
function checkDeclare(m) {
  const all = subsFor(m.id),
    pd = all.filter((s) => s.status === "pending").length,
    ap = all.filter((s) => s.status === "approved");
  if (pd) return "Check all screenshots first (" + pd + " waiting).";
  if (ap.length < (m.prizes || []).length)
    return "Approve at least " + (m.prizes || []).length + " results first.";
  const rk = ap.map((s) => s.rank);
  if (new Set(rk).size !== rk.length)
    return "Two approved players claim the same rank. Reject one of them.";
  const w = winnersOf(m);
  for (const s of w) {
    const u = D.users[s.uid];
    if (!u) return s.name + " no longer has an account.";
    if (u.status === "blocked") return s.name + " is blocked. Unblock them or reject their result.";
  }
  return "";
}
function resultsHtml() {
  const m0 = D.matches[F.rm];
  if (!m0)
    return '<p class="empty">Pick a match above. Matches show here once they are live or players send screenshots.</p>';
  const m = Object.assign({ id: F.rm }, m0),
    st = mstate(m),
    subs = subsFor(m.id);
  subs.sort(
    (a, b) =>
      ({ pending: 0, approved: 1, rejected: 2 })[a.status] -
        { pending: 0, approved: 1, rejected: 2 }[b.status] || a.rank - b.rank,
  );
  const cnt = (s) => subs.filter((x) => x.status === s).length;
  let h =
    '<div class="sumbar"><span class="badge b-' +
    st +
    '">' +
    LAB[st] +
    "</span><small>" +
    (m.joined || 0) +
    " joined</small><small>" +
    subs.length +
    " screenshots</small><small>" +
    cnt("pending") +
    " to check</small><small>" +
    cnt("approved") +
    " approved</small><small>" +
    cnt("rejected") +
    " rejected</small></div>";
  if (st === "upcoming")
    h +=
      '<div class="panel" style="margin-bottom:14px"><p class="empty" style="padding:0">This match has not started yet. Players can send screenshots after it ends.</p></div>';
  h +=
    '<div class="mlist" style="margin-top:0">' +
    (subs.length
      ? subs
          .map((s) => {
            const fl = flagsFor(s),
              done = m.status === "completed";
            return (
              '<div class="srow" data-sid="' +
              esc(s.id) +
              '"><div class="sthumb" data-act="zoom">' +
              (s.imgId
                ? '<img data-img="' + esc(s.imgId) + '" alt="Result screenshot">'
                : "No image") +
              "</div>" +
              '<div class="sinfo"><b>' +
              esc(s.name) +
              "</b>" +
              (s.team ? "<small>Team " + esc(s.team) + " (captain)</small>" : "") +
              "<small>" +
              (s.ign ? "In-game " + esc(s.ign) + " · " : "") +
              "ID " +
              esc(s.gameUid) +
              "</small><small>Claims rank #" +
              s.rank +
              " · " +
              s.kills +
              " kills · " +
              when(s.createdAt) +
              "</small>" +
              '<span><span class="badge b-' +
              s.status +
              '">' +
              { pending: "To check", approved: "Approved", rejected: "Rejected" }[s.status] +
              "</span></span>" +
              fl.map((t) => '<span class="flag">⚠ ' + esc(t) + "</span>").join("") +
              (s.status === "rejected" && s.why
                ? "<small>Reason: " + esc(s.why) + "</small>"
                : "") +
              "</div>" +
              '<div class="sacts">' +
              (done
                ? ""
                : s.status === "pending"
                  ? '<button class="btn ok sm" data-act="sapp">Approve</button><button class="btn danger sm" data-act="srej">Reject</button>'
                  : '<button class="btn sm" data-act="sund">Undo</button>') +
              "</div></div>"
            );
          })
          .join("")
      : '<p class="empty">No screenshots yet.</p>') +
    "</div>";
  if (m.status === "completed") {
    h +=
      '<section class="panel" style="margin-top:18px"><h2>Winners paid</h2>' +
      (m.results || [])
        .filter(Boolean)
        .map(
          (r) =>
            '<div class="row"><div><b>' +
            ["1st", "2nd", "3rd"][r.place - 1] +
            " · " +
            esc(r.name) +
            "</b></div><b>" +
            inr(r.prize) +
            "</b></div>",
        )
        .join("") +
      "</section>";
  } else if (st !== "upcoming" && st !== "cancelled") {
    const err = checkDeclare(m),
      w = winnersOf(m);
    h +=
      '<section class="panel" style="margin-top:18px"><h2>Declare winners</h2>' +
      (w.length
        ? w
            .map(
              (s, i) =>
                '<div class="row"><div><b>' +
                ["1st", "2nd", "3rd"][i] +
                " · " +
                esc(s.name) +
                "</b><small>Rank #" +
                s.rank +
                "</small></div><b>" +
                inr(m.prizes[i]) +
                "</b></div>",
            )
            .join("")
        : '<p class="empty" style="padding:0 0 10px">Approved players will appear here, best rank first.</p>') +
      (err ? '<p class="hint" style="margin-top:10px">' + esc(err) + "</p>" : "") +
      '<div style="margin-top:14px"><button class="btn primary" data-act="declare"' +
      (err ? " disabled" : "") +
      ">Pay prizes and declare winners</button></div></section>";
  }
  return h;
}
async function setSub(s, status, why) {
  await DB.update("submissions/" + s.id, { status, why: why || "", checkedAt: Date.now() });
  toast(
    status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Moved back to check",
  );
}
async function declare(m) {
  const err = checkDeclare(m);
  if (err) return toast(err, true);
  const w = winnersOf(m),
    total = w.reduce((a, s, i) => a + m.prizes[i], 0);
  const ok = await ask({
    title: "Pay " + inr(total) + " to the winners?",
    ok: "Pay prizes",
    body:
      w
        .map(
          (s, i) =>
            '<div class="kvr"><span>' +
            ["1st", "2nd", "3rd"][i] +
            " " +
            esc(s.name) +
            "</span><b>" +
            inr(m.prizes[i]) +
            "</b></div>",
        )
        .join("") +
      '<p style="margin:10px 0 0">The money goes to their wallets straight away. This cannot be undone.</p>',
  });
  if (!ok) return;
  if (!(await DB.claim("matches/" + m.id + "/status", m.status, "completed")))
    return toast("This match was already changed.", true);
  const res = w.map((s, i) => ({ place: i + 1, uid: s.uid, name: s.name, prize: m.prizes[i] }));
  for (const r of res)
    await DB.set("wins/" + m.id + "/" + r.uid, { place: r.place, prize: r.prize });
  await DB.update("matches/" + m.id, { results: res, completedAt: Date.now() });
  for (const r of res) {
    await DB.inc("users/" + r.uid + "/wallet", r.prize, { min: 0 });
    await DB.inc("users/" + r.uid + "/earned", r.prize, { min: 0 });
    await DB.inc("users/" + r.uid + "/winBal", r.prize, { min: 0 });
    if (r.place === 1) await DB.inc("users/" + r.uid + "/wins", 1, { min: 0 });
    const u = await DB.get("users/" + r.uid);
    await DB.update("leaderboard/" + r.uid, {
      n: u.name,
      earned: u.earned || 0,
      wins: u.wins || 0,
    });
  }
  /* every player who played this match gets +1 finished contest (used for milestones) */
  const E = (await DB.get("entries/" + m.id)) || {};
  for (const uid of Object.keys(E)) {
    if (E[uid] && E[uid].refunded !== true) await DB.inc("users/" + uid + "/played", 1);
  }
  toast("Winners declared. " + inr(total) + " paid.");
}
