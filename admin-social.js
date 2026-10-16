/* GAMERZONE · Admin: Social tab (posts, reports, clips, clans, story cards)
   File 8 of 9 in this group. Keep the load order shown in admin.html. */
"use strict";
/* ---------- social: posts, reports, Clip of the Week, official account, clans, story cards ---------- */
const OFFICIAL = "official",
  SAFE_IMG = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+\/=]+$/;
const BGN = ["Green", "Purple", "Orange", "Teal", "Dark", "Pink"];
const likeCnt = (id) => Object.keys(D.likes[id] || {}).length;
const cmtCnt = (id) => Object.keys(D.cmts[id] || {}).length;
const weekId = () => "w" + Math.floor(Date.now() / 6048e5);
const pname = (p) =>
  p.uid === OFFICIAL
    ? "GAMERZONE (official)"
    : (D.profiles[p.uid] || {}).name || p.name || uname(p.uid);
function thumbHtml(p) {
  const s = p.s || {},
    img = SAFE_IMG.test(s.img || "") ? s.img : "",
    t = ((s.items || []).find((i) => i.k === "t") || {}).v || "";
  return img
    ? '<img alt="" src="' +
        img +
        '" style="width:54px;height:54px;object-fit:cover;border-radius:10px;flex:none">'
    : '<span style="width:54px;height:54px;border-radius:10px;background:#232833;display:grid;place-items:center;font-size:11px;padding:4px;text-align:center;flex:none;overflow:hidden">' +
        esc(String(t).slice(0, 14) || "📝") +
        "</span>";
}
const postsSorted = () =>
  list(D.posts)
    .filter((p) => p && p.uid)
    .sort((a, b) => (b.t || 0) - (a.t || 0));
function socialStatic() {
  return (
    '<section class="panel" style="margin-top:16px"><h2>GAMERZONE Official account</h2><p class="sub" id="offst" style="margin-bottom:12px"></p><div class="grid">' +
    '<label class="f span2">Bio<input id="offbio" maxlength="120" value="Official updates, fan matches and Clip of the Week."></label>' +
    '<div class="full"><button class="btn primary" type="button" data-sact="offsave">Create / update official account</button></div></div>' +
    '<p class="hint" style="margin-top:10px">Players follow this account to unlock fan matches. Fan matches stay locked until it exists.</p></section>' +
    '<section class="panel" style="margin-top:16px"><h2>Post as GAMERZONE</h2><div class="grid">' +
    '<label class="f span2">Announcement<input id="annt" maxlength="100" placeholder="e.g. Fan match tonight at 8 PM. Follow us to join!"></label>' +
    '<label class="f">Background<select id="annbg">' +
    BGN.map((n, i) => '<option value="' + i + '">' + n + "</option>").join("") +
    "</select></label>" +
    '<div class="full"><button class="btn primary" type="button" data-sact="annpost">Post to feed</button></div></div></section>' +
    '<section class="panel" style="margin-top:16px"><h2>Match story card</h2><p class="sub" style="margin-bottom:12px">A story card is posted about 20 minutes before every match, while this panel is open. You can also post one now.</p><div class="grid">' +
    '<label class="f span2">Match<select id="stm"></select></label>' +
    '<div class="full" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="button" data-sact="stpost">Post story card now</button><button class="btn danger" type="button" data-sact="stdel">Remove official story</button></div></div></section>' +
    '<section class="panel" style="margin-top:16px"><h2>Clip of the Week</h2><div class="grid"><label class="f">Bonus for the winner (₹)<input id="cwb" type="number" min="0" max="500" step="1" value="20"></label>' +
    '<p class="hint span2">Pick a post below with the "Make Clip of the Week" button. The bonus goes to the player’s bonus balance (entry fees only).</p></div></section>' +
    '<div id="body" style="margin-top:16px"></div>'
  );
}
function fillStm() {
  const s = $("#stm");
  if (!s || document.activeElement === s) return;
  const cur = s.value,
    ms = matchList()
      .filter((m) => m.status === "upcoming" && m.startAt > Date.now() - 6e4)
      .sort((a, b) => a.startAt - b.startAt);
  s.innerHTML = ms.length
    ? ms
        .map(
          (m) =>
            '<option value="' +
            esc(m.id) +
            '">' +
            esc(m.name) +
            " · " +
            when(m.startAt) +
            "</option>",
        )
        .join("")
    : '<option value="">No upcoming match</option>';
  if (cur && ms.some((m) => m.id === cur)) s.value = cur;
  const st = $("#offst");
  if (st) {
    const o = D.profiles[OFFICIAL],
      n = Object.keys(D.offf || {}).length;
    st.textContent = o ? "Active · " + n + " follower" + (n === 1 ? "" : "s") : "Not created yet.";
  }
}
function socialHtml() {
  const P = postsSorted(),
    reps = list(D.reports),
    clans = list(D.clans);
  const likes = P.reduce((a, p) => a + likeCnt(p.id), 0),
    cm = P.reduce((a, p) => a + cmtCnt(p.id), 0);
  const byPost = {};
  reps.forEach((r) => {
    (byPost[r.post] = byPost[r.post] || []).push(r);
  });
  const week = Date.now() - 7 * 864e5,
    cand = P.filter((p) => (p.t || 0) > week && p.kind !== "win")
      .sort((a, b) => likeCnt(b.id) - likeCnt(a.id))
      .slice(0, 8);
  const cw = D.clip;
  let h =
    '<div class="stats">' +
    '<div class="stat"><span>Recent posts</span><strong>' +
    P.length +
    "</strong><small>latest " +
    P.length +
    " loaded</small></div>" +
    '<div class="stat"><span>Likes / comments</span><strong>' +
    likes +
    " / " +
    cm +
    "</strong><small>on these posts</small></div>" +
    '<div class="stat' +
    (reps.length ? " warn" : "") +
    '"><span>Reports</span><strong>' +
    reps.length +
    "</strong><small>" +
    Object.keys(byPost).length +
    " post(s) reported</small></div>" +
    '<div class="stat"><span>Clans</span><strong>' +
    clans.length +
    "</strong><small>" +
    Object.keys(D.offf || {}).length +
    " follow the official account</small></div></div>";
  h +=
    '<section class="panel" style="margin-top:16px"><h2>Current Clip of the Week</h2>' +
    (cw && cw.postId
      ? '<div class="row"><div><b>' +
        esc(cw.name || "Player") +
        "</b><small>" +
        esc(String(cw.cap || "").slice(0, 80)) +
        " · bonus " +
        inr(cw.bonus) +
        " · " +
        when(cw.t) +
        '</small></div><button class="btn sm danger" data-sact="cwclear">Remove</button></div>'
      : '<p class="sub">No clip chosen yet.</p>') +
    "</section>";
  h +=
    '<section class="panel" style="margin-top:16px"><h2>Best posts this week</h2>' +
    (cand.length
      ? cand
          .map(
            (p) =>
              '<div class="row" style="gap:12px">' +
              thumbHtml(p) +
              '<div style="flex:1;min-width:0"><b>' +
              esc(pname(p)) +
              "</b><small>" +
              esc(String(p.cap || "").slice(0, 70)) +
              " · ♥ " +
              likeCnt(p.id) +
              " · " +
              cmtCnt(p.id) +
              ' comments</small></div><button class="btn sm primary" data-sact="clip" data-pid="' +
              esc(p.id) +
              '">Make Clip of the Week</button></div>',
          )
          .join("")
      : '<p class="sub">No posts in the last 7 days.</p>') +
    "</section>";
  h +=
    '<section class="panel" style="margin-top:16px"><h2>Reported posts' +
    (reps.length ? " (" + reps.length + ")" : "") +
    "</h2>" +
    (Object.keys(byPost).length
      ? Object.keys(byPost)
          .map((pid) => {
            const p = D.posts[pid] ? Object.assign({ id: pid }, D.posts[pid]) : null,
              rs = byPost[pid];
            return (
              '<div class="row" style="gap:12px">' +
              (p ? thumbHtml(p) : "") +
              '<div style="flex:1;min-width:0"><b>' +
              (p ? esc(pname(p)) : "Post not in the latest list") +
              "</b><small>" +
              (p ? esc(String(p.cap || "").slice(0, 70)) + " · " : "") +
              rs.length +
              " report(s)</small></div>" +
              '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn sm danger" data-sact="delpost" data-pid="' +
              esc(pid) +
              '">Delete post</button><button class="btn sm" data-sact="dismiss" data-pid="' +
              esc(pid) +
              '">Dismiss</button></div></div>'
            );
          })
          .join("")
      : '<p class="sub">No reports. Nice and quiet.</p>') +
    "</section>";
  h +=
    '<section class="panel" style="margin-top:16px"><h2>Latest posts</h2>' +
    (P.length
      ? P.map(
          (p) =>
            '<div class="row" style="gap:12px">' +
            thumbHtml(p) +
            '<div style="flex:1;min-width:0"><b>' +
            esc(pname(p)) +
            (p.kind === "win" ? " 🏆" : "") +
            "</b><small>" +
            esc(String(p.cap || "").slice(0, 70)) +
            " · " +
            when(p.t) +
            " · ♥ " +
            likeCnt(p.id) +
            "</small>" +
            (p.music && p.music.title
              ? "<small>🎵 " +
                esc(String(p.music.title).slice(0, 60)) +
                (p.music.artist ? " · " + esc(String(p.music.artist).slice(0, 40)) : "") +
                "</small>"
              : "") +
            "</div>" +
            '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn sm" data-sact="cmts" data-pid="' +
            esc(p.id) +
            '">Comments (' +
            cmtCnt(p.id) +
            ')</button><button class="btn sm danger" data-sact="delpost" data-pid="' +
            esc(p.id) +
            '">Delete</button></div></div>',
        ).join("")
      : '<p class="sub">No posts yet.</p>') +
    "</section>";
  h +=
    '<section class="panel" style="margin-top:16px"><h2>Clans</h2>' +
    (clans.length
      ? clans
          .map((c) => {
            const n = Object.keys(D.cmem[c.id] || {}).length;
            return (
              '<div class="row"><div><b>[' +
              esc(c.tag) +
              "] " +
              esc(c.name) +
              "</b><small>" +
              n +
              " / 20 members · code " +
              esc(c.code) +
              " · owner " +
              esc(uname(c.owner)) +
              '</small></div><button class="btn sm danger" data-sact="delclan" data-cid="' +
              esc(c.id) +
              '">Delete</button></div>'
            );
          })
          .join("")
      : '<p class="sub">No clans yet.</p>') +
    "</section>";
  return h;
}
async function ensureOfficial() {
  if (D.profiles[OFFICIAL]) return;
  await DB.set("profiles/" + OFFICIAL, {
    name: "GAMERZONE",
    bio:
      ($("#offbio") && $("#offbio").value.trim()) ||
      "Official updates, fan matches and Clip of the Week.",
    avi: 0,
    v: 0,
    fid: "",
    b: 0,
    joinedAt: Date.now(),
  });
}
function sceneAt(items, bgi) {
  return { bgi: bgi || 0, fi: 0, adj: { b: 100, c: 100, s: 100 }, items };
}
async function postMatchStory(m, auto) {
  const pool = sum(m.prizes),
    tm = new Date(m.startAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  const sc = sceneAt(
    [
      { k: "e", v: "⚔️", c: "#fff", s: 22, x: 50, y: 22 },
      { k: "t", v: String(m.name).slice(0, 20), c: "#fff", s: 11, x: 50, y: 42 },
      { k: "t", v: "Starts " + tm, c: "#ffd60a", s: 8, x: 50, y: 56 },
      {
        k: "t",
        v: "Entry " + (m.fee ? inr(m.fee) : "FREE") + " · Prize " + inr(pool),
        c: "#00ff88",
        s: 6,
        x: 50,
        y: 68,
      },
      { k: "t", v: "Join now in Battles", c: "#fff", s: 6, x: 50, y: 84 },
    ],
    1,
  );
  await DB.set("stories/" + OFFICIAL, { name: "GAMERZONE", avi: 0, s: sc, t: Date.now() });
  await DB.set("storyViews/" + OFFICIAL, null);
  await DB.set("storyLikes/" + OFFICIAL, null);
  if (auto) await DB.set("matches/" + m.id + "/storyPosted", true);
}
let storyBusy = false;
async function autoStories() {
  if (storyBusy || !$("#app") || $("#app").hidden) return;
  storyBusy = true;
  try {
    for (const m of matchList()) {
      if (m.status !== "upcoming" || m.storyPosted) continue;
      const dt = m.startAt - Date.now();
      if (dt > 20 * 6e4 || dt < -2 * 6e4) continue;
      await postMatchStory(m, true);
    }
  } catch (x) {
    console.error("auto story", x);
  }
  storyBusy = false;
}
async function showComments(pid) {
  const C = (await DB.get("postComments/" + pid)) || {},
    L = list(C).sort((a, b) => (a.t || 0) - (b.t || 0));
  openDlg(
    '<div class="dlgf"><h3>Comments</h3><div style="max-height:50vh;overflow:auto">' +
      (L.length
        ? L.map(
            (c) =>
              '<div class="row"><div><b>' +
              esc(c.name || "Player") +
              "</b><small>" +
              esc(c.text) +
              '</small></div><button class="btn sm danger" data-sact="delcm" data-pid="' +
              esc(pid) +
              '" data-cid="' +
              esc(c.id) +
              '">Delete</button></div>',
          ).join("")
        : '<p class="sub">No comments.</p>') +
      '</div><div class="drow"><button type="button" class="btn" data-x>Close</button></div></div>',
  );
}
async function deletePost(pid) {
  await DB.set("postLikes/" + pid, null);
  await DB.set("postComments/" + pid, null);
  for (const r of list(D.reports).filter((r) => r.post === pid))
    await DB.set("reports/" + r.id, null);
  await DB.set("posts/" + pid, null);
}
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-sact]");
  if (!b) return;
  const a = b.dataset.sact,
    pid = b.dataset.pid;
  try {
    if (a === "offsave") {
      const bio = $("#offbio").value.trim().slice(0, 120);
      await DB.update("profiles/" + OFFICIAL, {
        name: "GAMERZONE",
        bio,
        avi: 0,
        v: 0,
        fid: "",
        b: 0,
        joinedAt: (D.profiles[OFFICIAL] || {}).joinedAt || Date.now(),
      });
      return toast("Official account saved.");
    }
    if (a === "annpost") {
      const t = $("#annt").value.trim();
      if (t.length < 3) return toast("Write the announcement first.", true);
      await ensureOfficial();
      await DB.set("posts/" + DB.newId(), {
        uid: OFFICIAL,
        name: "GAMERZONE",
        avi: 0,
        cap: t,
        s: sceneAt(
          [{ k: "t", v: t.slice(0, 60), c: "#ffffff", s: 8, x: 50, y: 50 }],
          +$("#annbg").value || 0,
        ),
        t: Date.now(),
      });
      $("#annt").value = "";
      return toast("Posted to the feed.");
    }
    if (a === "stpost") {
      const id = $("#stm").value,
        m = D.matches[id];
      if (!m) return toast("Pick a match first.", true);
      await ensureOfficial();
      await postMatchStory(Object.assign({ id }, m), false);
      return toast("Story card posted. It stays for 24 hours.");
    }
    if (a === "stdel") {
      await DB.set("stories/" + OFFICIAL, null);
      return toast("Official story removed.");
    }
    if (a === "clip") {
      const p = D.posts[pid];
      if (!p) return toast("Post not found.", true);
      const bonus = Math.max(0, Math.min(500, Math.floor(+$("#cwb").value || 0))),
        wk = weekId(),
        already = D.clip && D.clip.wk === wk;
      const ok = await ask({
        title: "Make this the Clip of the Week?",
        ok: "Confirm",
        body:
          esc(pname(Object.assign({}, p))) +
          "<br>" +
          esc(String(p.cap || "").slice(0, 80)) +
          "<br><br>" +
          (already
            ? "A clip was already chosen this week and its bonus was paid. This replaces it <b>without paying another bonus</b>."
            : bonus && p.uid !== OFFICIAL
              ? "The player gets <b>" + inr(bonus) + "</b> bonus."
              : "No bonus will be paid."),
      });
      if (!ok) return;
      await DB.set("clipWeek/current", {
        postId: pid,
        uid: p.uid,
        name: pname(Object.assign({}, p)),
        cap: String(p.cap || "").slice(0, 100),
        bonus: already ? D.clip.bonus || 0 : bonus,
        wk,
        t: Date.now(),
      });
      if (!already && bonus && p.uid !== OFFICIAL)
        await DB.inc("users/" + p.uid + "/bonus", bonus, { min: 0 });
      return toast("Clip of the Week set.");
    }
    if (a === "cwclear") {
      await DB.set("clipWeek/current", null);
      return toast("Clip of the Week removed.");
    }
    if (a === "delpost") {
      if (
        await ask({
          title: "Delete this post?",
          body: "Its likes and comments are removed too. This cannot be undone.",
          ok: "Delete post",
          danger: true,
        })
      ) {
        await deletePost(pid);
        toast("Post deleted.");
      }
      return;
    }
    if (a === "dismiss") {
      for (const r of list(D.reports).filter((r) => r.post === pid))
        await DB.set("reports/" + r.id, null);
      return toast("Reports dismissed.");
    }
    if (a === "cmts") return showComments(pid);
    if (a === "delcm") {
      await DB.set("postComments/" + pid + "/" + b.dataset.cid, null);
      const d = $("#dlg");
      if (d.open) d.close("cancel");
      return showComments(pid);
    }
    if (a === "delclan") {
      const c = D.clans[b.dataset.cid];
      if (!c) return;
      if (
        !(await ask({
          title: "Delete clan " + c.name + "?",
          body: "Members leave the clan the next time they open the app.",
          ok: "Delete clan",
          danger: true,
        }))
      )
        return;
      await DB.set("clanMembers/" + b.dataset.cid, null);
      await DB.set("clanCodes/" + c.code, null);
      await DB.set("clans/" + b.dataset.cid, null);
      return toast("Clan deleted.");
    }
  } catch (x) {
    console.error(x);
    toast("Something went wrong: " + (x.message || x), true);
  }
});
