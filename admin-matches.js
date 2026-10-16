/* GAMERZONE · Admin: add and edit matches (Solo, Duo, Squad, 1v1, fan match)
   File 3 of 9 in this group. Keep the load order shown in admin.html. */
"use strict";
/* ---------- host panel: add match ---------- */
function hostForm() {
  return (
    '<section class="panel" aria-labelledby="nmh"><h2 id="nmh">Add a match</h2><form id="nm" class="grid" novalidate>' +
    '<label class="f">Game<select name="game"><option>FREE FIRE</option><option>BGMI</option></select></label>' +
    '<label class="f">Format<select name="mode"><option value="SOLO">Solo</option><option value="DUO">Duo (teams of 2)</option><option value="SQUAD">Squad (teams of 4)</option><option value="1V1">1 vs 1</option></select></label>' +
    '<label class="f">Who can join<select name="fan"><option value="">Everyone</option><option value="1">Fan match (followers of GAMERZONE Official)</option></select></label>' +
    '<label class="f span2">Match name<input name="name" maxlength="30" placeholder="e.g. Solo Clash" required></label>' +
    '<label class="f span2">Date and time<input name="when" type="datetime-local" required></label>' +
    '<label class="f">Match length (minutes)<input name="dur" type="number" min="10" max="180" step="1" inputmode="numeric" value="30" required></label>' +
    '<label class="f">Entry fee (₹)<input name="fee" type="number" min="0" max="100000" step="1" inputmode="numeric" placeholder="20" required></label>' +
    '<label class="f">1st prize (₹)<input name="p1" type="number" min="1" step="1" inputmode="numeric" placeholder="100" required></label>' +
    '<label class="f">2nd prize (₹, optional)<input name="p2" type="number" min="0" step="1" inputmode="numeric" placeholder="40"></label>' +
    '<label class="f">3rd prize (₹, optional)<input name="p3" type="number" min="0" step="1" inputmode="numeric" placeholder="0"></label>' +
    '<label class="f">Total slots<input name="slots" type="number" min="2" max="200" step="1" inputmode="numeric" value="48" required></label>' +
    '<label class="f">Minimum players<input name="minp" type="number" min="2" max="200" step="1" inputmode="numeric" value="25" required></label>' +
    '<label class="f">VIP reserved slots<input name="vip" type="number" min="0" max="50" step="1" inputmode="numeric" value="4" required></label>' +
    '<p class="hint full">For Duo and Squad, one slot is one team and the entry fee is per team. The captain pays and receives the prize. A fan match can be free (entry fee 0).</p><p class="hint full" id="nmpool">Prize pool: ₹0</p><p class="err full" id="nmerr" role="alert"></p>' +
    '<div class="full"><button class="btn primary">Add match</button></div></form></section>'
  );
}
function bindHostForm() {
  const f = $("#nm"),
    pad = (n) => String(n).padStart(2, "0"),
    n = new Date();
  f.elements.when.min =
    n.getFullYear() +
    "-" +
    pad(n.getMonth() + 1) +
    "-" +
    pad(n.getDate()) +
    "T" +
    pad(n.getHours()) +
    ":" +
    pad(n.getMinutes());
  const pool = () => {
    $("#nmpool").textContent =
      "Prize pool: " + inr(sum(["p1", "p2", "p3"].map((k) => Number(f.elements[k].value) || 0)));
  };
  ["p1", "p2", "p3"].forEach((k) => (f.elements[k].oninput = pool));
  f.onsubmit = async (e) => {
    e.preventDefault();
    const v = (k) => f.elements[k].value.trim(),
      er = $("#nmerr"),
      bad = (m) => {
        er.textContent = m;
      };
    const name = v("name"),
      fee = Number(v("fee")),
      slots = Number(v("slots")),
      minp = Number(v("minp")),
      vip = Number(v("vip")),
      dur = Number(v("dur"));
    const prizes = [Number(v("p1")), Number(v("p2") || 0), Number(v("p3") || 0)];
    const startAt = new Date(v("when")).getTime();
    if (!name) return bad("Enter a match name.");
    if (!Number.isInteger(fee) || fee < 0 || v("fee") === "")
      return bad("Entry fee must be a whole number, 0 or more.");
    if (!prizes.every((x) => Number.isInteger(x) && x >= 0) || prizes[0] < 1)
      return bad("Enter a 1st prize of at least ₹1. Other prizes are whole numbers.");
    if (prizes[2] > 0 && prizes[1] === 0) return bad("Add a 2nd prize before a 3rd prize.");
    if (!Number.isInteger(slots) || slots < 2 || slots > 200)
      return bad("Slots must be between 2 and 200.");
    if (!Number.isInteger(minp) || minp < 2 || minp > slots)
      return bad("Minimum players must be between 2 and the total slots.");
    if (!Number.isInteger(vip) || vip < 0 || vip > slots)
      return bad("VIP slots must be between 0 and the total slots.");
    if (!Number.isInteger(dur) || dur < 10 || dur > 180)
      return bad("Match length must be 10 to 180 minutes.");
    if (!startAt || startAt < Date.now() - 6e4) return bad("Pick a start time in the future.");
    er.textContent = "";
    const id = DB.newId();
    try {
      await DB.set("matches/" + id, {
        name,
        game: v("game"),
        mode: v("mode"),
        fanOnly: v("fan") === "1",
        fee,
        prizes: prizes.filter((x) => x > 0),
        slots,
        minPlayers: minp,
        startAt,
        durationMin: dur,
        vipSlots: vip,
        joined: 0,
        vipJoined: 0,
        roomId: "",
        roomPass: "",
        status: "upcoming",
        createdAt: Date.now(),
      });
      f.reset();
      f.elements.slots.value = 48;
      f.elements.minp.value = 25;
      f.elements.vip.value = 4;
      f.elements.dur.value = 30;
      pool();
      toast("Match added. Players can see it in the app now.");
    } catch (x) {
      bad("Could not save: " + x.message);
    }
  };
}
function renderMseg() {
  const el = $("#mseg");
  if (!el) return;
  const M = matchList(),
    c = (s) => M.filter((m) => mstate(m) === s).length;
  el.innerHTML = segHtml(
    [
      ["all", "All (" + M.length + ")"],
      ["upcoming", "Upcoming (" + c("upcoming") + ")"],
      ["live", "Live (" + c("live") + ")"],
      ["ended", "Awaiting results (" + c("ended") + ")"],
      ["completed", "Completed (" + c("completed") + ")"],
      ["cancelled", "Cancelled (" + c("cancelled") + ")"],
    ],
    F.mf,
  );
}
const RANK = { live: 0, ended: 1, upcoming: 2, completed: 3, cancelled: 4 };
function matchesHtml() {
  let M = matchList()
    .map((m) => Object.assign(m, { _s: mstate(m) }))
    .filter((m) => F.mf === "all" || m._s === F.mf);
  M.sort(
    (a, b) =>
      RANK[a._s] - RANK[b._s] ||
      (["completed", "cancelled"].includes(a._s) ? b.startAt - a.startAt : a.startAt - b.startAt),
  );
  if (!M.length) return '<p class="empty">No matches here yet.</p>';
  return M.map((m) => {
    const open = ["upcoming", "live", "ended"].includes(m._s),
      pool = sum(m.prizes),
      nsub = subsFor(m.id).length;
    return (
      '<article class="match' +
      (m._s === "live" ? " is-live" : "") +
      '" data-mid="' +
      esc(m.id) +
      '">' +
      '<div class="mh"><div><h3>' +
      esc(m.name) +
      '</h3><p class="sub">' +
      esc(m.game) +
      " · " +
      modeLabel(m.mode) +
      (m.fanOnly ? " · Fan match" : "") +
      " · " +
      when(m.startAt) +
      " · " +
      (m.durationMin || 30) +
      ' min</p></div><span class="badge b-' +
      m._s +
      '">' +
      LAB[m._s] +
      "</span></div>" +
      '<div class="facts"><div><span>Entry fee</span><b>' +
      inr(m.fee) +
      "</b></div><div><span>Prize pool</span><b>" +
      inr(pool) +
      "</b></div><div><span>" +
      (m.mode === "DUO" || m.mode === "SQUAD" ? "Teams" : "Players") +
      " joined</span><b>" +
      (m.joined || 0) +
      " / " +
      m.slots +
      "</b></div><div><span>Needs at least</span><b>" +
      m.minPlayers +
      " players</b></div></div>" +
      '<p class="sub" style="margin:-4px 0 14px">Prizes: ' +
      (m.prizes || []).map((p, i) => ["1st", "2nd", "3rd"][i] + " " + inr(p)).join(" · ") +
      " · " +
      (m.vipSlots || 0) +
      " VIP slots</p>" +
      (m.status !== "completed" &&
      (m.joined || 0) < m.minPlayers &&
      m._s === "cancelled" &&
      m.status !== "cancelled"
        ? '<p class="err">Not enough players joined, so this match was cancelled automatically and entry fees go back to the players.</p>'
        : "") +
      (open
        ? '<div class="room"><label class="f">Room ID<input name="rid" inputmode="numeric" maxlength="12" placeholder="6 to 12 digits" value="' +
          esc((D.rooms[m.id] || {}).roomId || "") +
          '"></label><label class="f">Room password<input name="rpw" maxlength="12" placeholder="Password" value="' +
          esc((D.rooms[m.id] || {}).roomPass || "") +
          '"></label><button class="btn" data-act="room">Save room details</button></div><p class="hint">Players see these 10 minutes before the match starts.</p><p class="err" role="alert"></p>'
        : "") +
      '<div class="macts"><button class="btn" data-act="players">Players (' +
      (m.joined || 0) +
      ")</button>" +
      (["live", "ended", "completed"].includes(m._s)
        ? '<button class="btn primary" data-act="review">' +
          (m._s === "completed"
            ? "View results"
            : "Review results" + (nsub ? " (" + nsub + ")" : "")) +
          "</button>"
        : "") +
      (open ? '<button class="btn danger" data-act="cancel">Cancel match</button>' : "") +
      "</div></article>"
    );
  }).join("");
}
async function saveRoom(card, m) {
  const rid = card.querySelector("[name=rid]").value.trim(),
    pw = card.querySelector("[name=rpw]").value.trim(),
    er = card.querySelector(".err");
  if (!/^\d{6,12}$/.test(rid)) {
    er.textContent = "Room ID should be 6 to 12 digits.";
    return;
  }
  if (pw.length < 3 || pw.length > 12) {
    er.textContent = "Password should be 3 to 12 characters.";
    return;
  }
  er.textContent = "";
  try {
    await DB.set("rooms/" + m.id, { roomId: rid, roomPass: pw });
    toast("Room details saved. Joined players will see them.");
  } catch (x) {
    er.textContent = "Could not save: " + x.message;
  }
}
async function cancelMatch(m) {
  if (
    !(await ask({
      title: "Cancel " + m.name + "?",
      body:
        "Every player who joined gets their entry fee (" +
        inr(m.fee) +
        ") back in their wallet. Keep this panel open for a minute so the refunds are paid. This cannot be undone.",
      ok: "Cancel match",
      danger: true,
    }))
  )
    return;
  if (await DB.claim("matches/" + m.id + "/status", m.status, "cancelled"))
    toast("Match cancelled");
  else toast("This match was already changed.", true);
}
async function showPlayers(m) {
  const E = await DB.get("entries/" + m.id),
    L = list(E).sort((a, b) => a.joinedAt - b.joinedAt);
  openDlg(
    '<div class="dlgf"><h3>Players in ' +
      esc(m.name) +
      '</h3><p class="sub">' +
      L.length +
      " joined through the app" +
      ((m.joined || 0) > L.length
        ? " (the match also shows " + ((m.joined || 0) - L.length) + " sample players)"
        : "") +
      "</p>" +
      (L.length
        ? '<div style="max-height:50vh;overflow:auto">' +
          L.map(
            (e) =>
              '<div class="row"><div><b>' +
              esc(e.name) +
              (e.vip ? " ⭐" : "") +
              "</b><small>" +
              esc(e.ign) +
              " · ID " +
              esc(e.gameUid) +
              "</small>" +
              (e.team
                ? "<small>Team " +
                  esc(e.team.name) +
                  ": " +
                  (e.team.mates || []).map((t) => esc(t.ign) + " (" + esc(t.uid) + ")").join(", ") +
                  "</small>"
                : "") +
              "</div><small>" +
              when(e.joinedAt) +
              "</small></div>",
          ).join("") +
          "</div>"
        : '<p class="empty">Nobody has joined yet.</p>') +
      '<div class="drow"><button type="button" class="btn" data-x>Close</button></div></div>',
  );
}
