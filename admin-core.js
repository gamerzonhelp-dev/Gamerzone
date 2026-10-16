/* GAMERZONE · Admin: settings, helpers, data, refunds, match state, dialogs
   File 1 of 9 in this group. Keep the load order shown in admin.html. */
"use strict";
"use strict";
/* =====================================================================
   GAMERZONE ADMIN PANEL
   Reads and writes the same database as the GAMERZONE app (see the DATA
   LAYER block above). Backend choice and Firebase keys live in GZ_CONFIG.

   PASSWORD: the default is  admin123  (stored as a SHA-256 hash).
   CHANGE IT before going live. To make a new hash, run this in the
   browser console and paste the result into ADMIN_PASS_SHA256:
     crypto.subtle.digest('SHA-256',new TextEncoder().encode('NEW_PASSWORD'))
       .then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))

   IMPORTANT: a password check inside a web page only hides the screen,
   because anyone can read this file. For real security, use the Firebase
   backend with USE_FIREBASE_AUTH = true (Firebase checks email + password)
   and lock the database with rules (see the notes in the DATA LAYER block).
   ===================================================================== */
const CONFIG = {
  ADMIN_PASS_SHA256:
    "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9" /* = admin123 */,
  USE_FIREBASE_AUTH: true /* true = sign in with Firebase email + password (needs BACKEND 'firebase') */,
  WITHDRAW_DEDUCT_ON_APPROVE: false /* false = the app already held the money when the player asked, so
                                          rejecting returns it. Keep false to match the GAMERZONE app. */,
  IDLE_MINUTES: 30,
};
const REASONS = [
  "Screenshot is blurry or cropped",
  "In-game ID does not match",
  "Wrong match or time",
  "Looks edited or reused",
];

/* ---------- helpers ---------- */
const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s == null ? "" : s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const when = (t) =>
  t
    ? new Date(t).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "-";
const day = (t) =>
  t
    ? new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "-";
const list = (o) => Object.keys(o || {}).map((id) => Object.assign({ id }, o[id]));
const sum = (a) => (a || []).reduce((x, y) => x + (+y || 0), 0);
let toastT;
function toast(msg, bad) {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "on" + (bad ? " bad" : "");
  clearTimeout(toastT);
  toastT = setTimeout(() => (t.className = ""), 3400);
}
async function sha256(txt) {
  if (!(window.crypto && crypto.subtle)) throw new Error("nocrypto");
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
const tryLs = (f) => {
  try {
    return f();
  } catch (e) {
    return null;
  }
};
const hsh = (u) => {
  let h = 5381;
  for (let i = 0; i < u.length; i++) h = ((h << 5) + h + u.charCodeAt(i)) | 0;
  return u.length + ":" + h;
};

/* ---------- data (kept up to date by the database) ---------- */
const D = {
  users: {},
  matches: {},
  payments: {},
  submissions: {},
  conf: {},
  rooms: {},
  posts: {},
  likes: {},
  cmts: {},
  reports: {},
  clans: {},
  cmem: {},
  clip: null,
  profiles: {},
  offf: {},
};
let OFF = [],
  view = "dash",
  dirty = false;
const F = { mf: "all", uq: "", uf: "all", ptype: "withdrawal", pst: "pending", rm: "" };
const IMGC = {},
  IMH = {};

function startWatch() {
  ["users", "matches", "payments", "submissions", "rooms"].forEach((k) =>
    OFF.push(
      DB.watch(k, (v) => {
        D[k] = v || {};
        loadImgs();
        refresh();
      }),
    ),
  );
  OFF.push(
    DB.watch("config/payment", (v) => {
      D.conf = v || {};
    }),
  );
  [
    ["postLikes", "likes"],
    ["postComments", "cmts"],
    ["reports", "reports"],
    ["clans", "clans"],
    ["clanMembers", "cmem"],
    ["profiles", "profiles"],
    ["followers/official", "offf"],
  ].forEach((x) =>
    OFF.push(
      DB.watch(x[0], (v) => {
        D[x[1]] = v || {};
        if (view === "social") refresh();
        renderNav();
      }),
    ),
  );
  OFF.push(
    DB.watch("clipWeek/current", (v) => {
      D.clip = v || null;
      if (view === "social") refresh();
    }),
  );
  OFF.push(
    DB.watchLast("posts", 30, (v) => {
      D.posts = v || {};
      if (view === "social") refresh();
    }),
  );
  storyT = setInterval(autoStories, 60000);
  setTimeout(autoStories, 3000);
  OFF.push(DB.watch("matches", () => setTimeout(sweepRefunds, 500)));
  sweepT = setInterval(sweepRefunds, 60000);
}
/* Refunds: when a match is cancelled (by you, or automatically because too few players joined),
   the entry fee goes back to each player's wallet from here. Players cannot add to their own
   wallet (the database rules block it), so this panel must be open for refunds to be paid. */
let sweepT = null,
  sweeping = false,
  storyT = null;
async function sweepRefunds() {
  if (sweeping || !document.body || $("#app").hidden) return;
  sweeping = true;
  try {
    for (const m of list(D.matches)) {
      if (mstate(m) !== "cancelled") continue;
      const E = await DB.get("entries/" + m.id);
      if (!E) continue;
      for (const uid of Object.keys(E)) {
        /* the amount comes from the player's own entry record, which the database rules only accept
           if the wallet really went down by that amount in the same step */
        const me = await DB.get("myEntries/" + uid + "/" + m.id);
        if (!me || me.refunded === true) continue;
        if (
          !(await DB.claim(
            "myEntries/" + uid + "/" + m.id + "/refunded",
            me.refunded === undefined ? null : false,
            true,
          ))
        )
          continue;
        let ok = true;
        if ((+me.paid || 0) > 0)
          ok = await DB.inc("users/" + uid + "/wallet", +me.paid, { min: 0 });
        if (!ok) {
          await DB.set("myEntries/" + uid + "/" + m.id + "/refunded", false);
          continue;
        }
        await DB.set("entries/" + m.id + "/" + uid + "/refunded", true);
      }
    }
  } catch (x) {
    console.error("refund sweep", x);
  }
  sweeping = false;
}
function stopWatch() {
  clearInterval(sweepT);
  clearInterval(storyT);
  OFF.forEach((f) => {
    try {
      f();
    } catch (e) {}
  });
  OFF = [];
  D.users = {};
  D.matches = {};
  D.payments = {};
  D.submissions = {};
}

let imgBusy = false;
async function loadImgs() {
  if (imgBusy) return;
  imgBusy = true;
  let got = false;
  try {
    for (const p of list(D.payments)) {
      if (p.qrId && !IMGC[p.qrId]) {
        const u = await DB.getImage(p.qrId);
        if (u) {
          IMGC[p.qrId] = u;
          got = true;
        }
      }
      if (p.imgId && !IMGC[p.imgId]) {
        const u = await DB.getImage(p.imgId);
        if (u) {
          IMGC[p.imgId] = u;
          got = true;
        }
      }
    }
    for (const s of list(D.submissions)) {
      if (s.imgId && !IMGC[s.imgId]) {
        const u = await DB.getImage(s.imgId);
        if (u) {
          IMGC[s.imgId] = u;
          IMH[s.id] = hsh(u);
          got = true;
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  imgBusy = false;
  if (got) refresh();
}

/* ---------- match state ---------- */
function mstate(m) {
  if (m.status === "cancelled") return "cancelled";
  if (m.status === "completed") return "completed";
  const n = Date.now(),
    end = m.startAt + (m.durationMin || 30) * 6e4;
  if (n < m.startAt) return "upcoming";
  if ((m.joined || 0) < m.minPlayers) return "cancelled";
  return n < end ? "live" : "ended";
}
const LAB = {
  upcoming: "Upcoming",
  live: "Live",
  ended: "Awaiting results",
  completed: "Completed",
  cancelled: "Cancelled",
};
const matchList = () => list(D.matches);
const modeLabel = (md) => ({ SOLO: "Solo", DUO: "Duo", SQUAD: "Squad", "1V1": "1 vs 1" })[md] || md;
const subsFor = (id) => list(D.submissions).filter((s) => s.matchId === id);
const uname = (id) => (D.users[id] || {}).name || "Unknown user";

/* ---------- dialogs ---------- */
function openDlg(html) {
  const d = $("#dlg");
  d.onclose = null;
  d.returnValue = "";
  d.innerHTML = html;
  d.querySelectorAll("[data-x]").forEach((b) => (b.onclick = () => d.close("cancel")));
  d.showModal();
  return d;
}
function ask({ title, body, ok, danger, field }) {
  return new Promise((res) => {
    const d = openDlg(
      '<form method="dialog" class="dlgf"><h3>' +
        esc(title) +
        "</h3>" +
        (body ? '<div class="sub" style="font-size:14px">' + body + "</div>" : "") +
        (field
          ? '<label class="f">' +
            esc(field.label) +
            '<input name="v" maxlength="' +
            (field.max || 120) +
            '"' +
            (field.req ? " required" : "") +
            ' placeholder="' +
            esc(field.ph || "") +
            '"></label>'
          : "") +
        '<div class="drow"><button type="button" class="btn" data-x>Cancel</button><button class="btn ' +
        (danger ? "danger" : "primary") +
        '" value="ok">' +
        esc(ok || "Confirm") +
        "</button></div></form>",
    );
    d.onclose = () =>
      res(
        d.returnValue === "ok" ? (field ? d.querySelector("[name=v]").value.trim() : true) : false,
      );
  });
}
function pickReason() {
  return new Promise((res) => {
    const d = openDlg(
      '<form method="dialog" class="dlgf"><h3>Reject this result</h3><p class="sub">Pick a reason. The player will see it and can send a new screenshot.</p>' +
        REASONS.map(
          (r, i) => '<button class="btn opt" value="r' + i + '">' + esc(r) + "</button>",
        ).join("") +
        '<div class="drow"><button type="button" class="btn" data-x>Cancel</button></div></form>',
    );
    d.onclose = () => res(/^r\d$/.test(d.returnValue) ? REASONS[+d.returnValue.slice(1)] : false);
  });
}
