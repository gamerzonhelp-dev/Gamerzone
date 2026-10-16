/* GAMERZONE · Live layer: settings, helpers, saved data, contests, bonus, milestones
   File 1 of 9 in this group. Keep the load order shown in index.html. */
"use strict";
/* =====================================================================
   GAMERZONE LIVE LAYER
   Connects the app screens above to the shared database (see DB block).
   Everything the admin panel does (matches, room details, payments,
   blocking, results) reaches the app through this layer.

   CFG below holds the fallbacks. The admin panel (Settings tab) saves the
   real UPI ID and limits in the database, and those win over CFG.
   ===================================================================== */
"use strict";
const CFG = {
  SUPPORT_EMAIL: "GAMERZONE.HELP@gmail.com",
  UPI_ID: "" /* set in admin > Settings (or here) */,
  UPI_NAME: "GAMERZONE",
  MIN_DEPOSIT: 10,
  MAX_DEPOSIT: 10000,
  MIN_WITHDRAW: 100,
  MAX_WITHDRAW: 10000,
  REFERRAL_BONUS: 20,
};
const SKEY = "gz_session";
let ACC = "",
  U = null,
  OFF = [],
  ROOMS = {},
  ROOMW = {},
  MATCHES = {},
  ENTR = {},
  PAYS = {},
  MSUB = {},
  LBD = {},
  CONF = {},
  IMG = {};
let SEEN = { pay: {}, sub: {}, win: {}, ref: {} },
  _b = 0,
  _bn = 0,
  lastSnap = "",
  ready = false;
const POSTS0 = JSON.parse(JSON.stringify(POSTS));
const tryLs = (f) => {
  try {
    return f();
  } catch (e) {
    return null;
  }
};
const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const support = () => CONF.supportEmail || CFG.SUPPORT_EMAIL;
const blocked = () => !!(U && U.status === "blocked");

/* ---------- SHA-256 (works on every address, http or https) ---------- */
function sha256(ascii) {
  const rr = (v, a) => (v >>> a) | (v << (32 - a)),
    mp = Math.pow,
    mw = mp(2, 32);
  let result = "",
    i,
    j;
  const words = [],
    bl = ascii.length * 8;
  let hash = (sha256.h = sha256.h || []),
    k = (sha256.k = sha256.k || []),
    pc = k.length;
  const comp = {};
  for (let cand = 2; pc < 64; cand++) {
    if (!comp[cand]) {
      for (i = 0; i < 313; i += cand) comp[i] = cand;
      hash[pc] = (mp(cand, 0.5) * mw) | 0;
      k[pc++] = (mp(cand, 1 / 3) * mw) | 0;
    }
  }
  ascii += "\x80";
  while ((ascii.length % 64) - 56) ascii += "\x00";
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (bl / mw) | 0;
  words[words.length] = bl;
  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16)),
      old = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2],
        a = hash[0],
        e = hash[4];
      const t1 =
        hash[7] +
        (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) |
              0);
      const t2 =
        (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(t1 + t2) | 0].concat(hash);
      hash[4] = (hash[4] + t1) | 0;
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
  }
  for (i = 0; i < 8; i++)
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? 0 : "") + b.toString(16);
    }
  return result;
}
const pwHash = (id, pw) => sha256(unescape(encodeURIComponent("gz|" + id + "|" + pw)));
window.__gzSha = sha256;

/* ---------- wallet: reads and writes go to the database ---------- */
Object.defineProperty(WAL, "b", {
  get: () => _b,
  set: (v) => {
    const d = v - _b;
    _b = v;
    if (ACC && d) DB.inc("users/" + ACC + "/wallet", d, { min: 0 });
  },
});
Object.defineProperty(WAL, "bn", {
  get: () => _bn,
  set: (v) => {
    const d = v - _bn;
    _bn = v;
    if (ACC && d) DB.inc("users/" + ACC + "/bonus", d, { min: 0 });
  },
});

/* ---------- small helpers ---------- */
function note(b, r, ic) {
  NT.unshift({
    g: "#00c46a,#00ff88",
    i: ic || "🔔",
    b,
    r,
    a: "now",
    d: "Today",
    ty: "like",
    n: 1,
  });
  badge();
}
function ui() {
  try {
    renderB();
    renderD();
    renderP();
  } catch (e) {
    console.error(e);
  }
}
const dateShort = (t) =>
  new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/* ---------- save / restore this player's own app data ---------- */
function snap() {
  return {
    PF,
    SAVED: [...SAVEDP],
    PMIG,
    NT,
    TX,
    REF,
    SET,
    VIP: VIP || null,
    MY: MY || null,
    UID,
    UIDB,
    UPIID,
    SEEN,
  };
}
async function saveState(force) {
  if (!ACC || !ready) return;
  pubProfile();
  let s;
  try {
    s = JSON.stringify(snap());
  } catch (e) {
    return;
  }
  if (!force && s === lastSnap) return;
  lastSnap = s;
  try {
    await DB.set("userState/" + ACC, JSON.parse(s));
  } catch (e) {
    if (!saveState.warned) {
      saveState.warned = 1;
      toast("Storage is full. Remove some photos from your posts.");
    }
  }
}
function resetState() {
  PF = { name: "", bio: "Free Fire & BGMI player", uid: "", phone: "", avi: 0, bid: "" };
  POSTS = JSON.parse(JSON.stringify(POSTS0));
  NT = [];
  TX.length = 0;
  Object.assign(REF, { code: "", by: "", got: 0, earn: 0, friends: [], rew: {} });
  Object.assign(SET, { push: 1, remind: 1, sound: 1 });
  VIP = null;
  MY = null;
  UID = "";
  UIDB = "";
  UPIID = "";
  SEEN = { pay: {}, sub: {}, win: {}, ref: {} };
  PL.length = 0;
  FLG.clear();
  FLW.clear();
  SAVEDP = new Set();
  OLDP = [];
  PMIG = false;
  SPF = {};
  SPM = {};
  SL = {};
  SC = {};
  STO = {};
  SV = {};
  SLK = {};
  ST.length = 0;
  JN.clear();
  Object.keys(JI).forEach((k) => delete JI[k]);
  SUB.length = 0;
  CS.length = 0;
  WIN.cnt = 0;
  WIN.amt = 0;
  _b = 0;
  _bn = 0;
  Object.keys(ROOMW).forEach((k) => {
    try {
      ROOMW[k]();
    } catch (e) {}
  });
  ROOMW = {};
  ROOMS = {};
  ENTR = {};
  PAYS = {};
  MSUB = {};
  lastSnap = "";
}
function applyState(st) {
  if (st.PF)
    PF = Object.assign(
      { name: "", bio: "Free Fire & BGMI player", uid: "", phone: "", avi: 0, bid: "" },
      st.PF,
    );
  OLDP = st.POSTS || [];
  SAVEDP = new Set(st.SAVED || []);
  PMIG = !!st.PMIG;
  if (st.NT) NT = st.NT;
  if (st.TX) {
    TX.length = 0;
    st.TX.forEach((t) => TX.push(t));
  }
  if (st.REF) Object.assign(REF, st.REF);
  if (st.SET) Object.assign(SET, st.SET);
  VIP = st.VIP || null;
  MY = st.MY || null;
  UID = st.UID || "";
  UIDB = st.UIDB || "";
  UPIID = st.UPIID || "";
  if (st.SEEN) SEEN = Object.assign({ pay: {}, sub: {}, win: {}, ref: {} }, st.SEEN);
}

/* ---------- contests: built from what the admin saves ---------- */
const subText = (m) => {
  const t = m.mode === "DUO" ? 2 : m.mode === "SQUAD" ? 4 : 1,
    u = t > 1 ? "teams" : "players";
  return (
    (m.mode === "1V1"
      ? "1v1 knockout bracket"
      : m.mode === "DUO"
        ? "Duo · teams of 2"
        : m.mode === "SQUAD"
          ? "Squad · teams of 4"
          : "Solo custom room") +
    " · " +
    (+m.minPlayers >= +m.slots
      ? "starts when all " + m.slots + " slots fill"
      : "starts at " + m.minPlayers + "+ " + u) +
    (m.fanOnly ? " · fan match" : "")
  );
};
function rebuildCS() {
  const old = {};
  CS.forEach((c) => (old[c.id] = c));
  const arr = [];
  Object.keys(MATCHES).forEach((id) => {
    const m = MATCHES[id];
    if (!m) return;
    const c = {
      id,
      name: m.name,
      g: String(m.game).toUpperCase() === "BGMI" ? "BGMI" : "FREE FIRE",
      mode: m.mode,
      tsz: m.mode === "DUO" ? 2 : m.mode === "SQUAD" ? 4 : 1,
      fan: !!m.fanOnly,
      sub: subText(m),
      fee: +m.fee,
      pz: (m.prizes || []).filter((x) => x > 0),
      slots: +m.slots,
      j: +m.joined || 0,
      minp: +m.minPlayers,
      st: +m.startAt,
      dur: +m.durationMin || 30,
      vip: +m.vipSlots || 0,
      vj: +m.vipJoined || 0,
      room:
        ROOMS[id] && ROOMS[id].roomId
          ? { id: String(ROOMS[id].roomId), pw: String(ROOMS[id].roomPass || "") }
          : null,
      status: m.status,
      done: m.status === "completed",
    };
    if (m.results && m.results.length)
      c.res = m.results
        .filter(Boolean)
        .map((r) => ({ n: r.name, place: r.place, prize: r.prize, me: r.uid === ACC }));
    const o = old[id];
    if (o) {
      c.rn = o.rn;
      c.rvl = o.rvl;
      c.rf = o.rf;
    }
    if (JI[id] && JI[id].refunded) c.rf = 1;
    const mine = JN.has(id);
    if (!mine && (m.status === "cancelled" || phase(c) !== "up")) return;
    arr.push(c);
  });
  arr.sort((a, b) => a.st - b.st);
  CS.length = 0;
  arr.forEach((c) => CS.push(c));
  let amt = 0,
    cnt = 0;
  Object.values(MATCHES).forEach((m) =>
    ((m && m.results) || []).forEach((r) => {
      if (r && r.uid === ACC) {
        amt += r.prize;
        if (r.place === 1) cnt++;
      }
    }),
  );
  WIN.amt = amt;
  WIN.cnt = cnt;
}
function checkWins() {
  Object.keys(MATCHES).forEach((mid) => {
    const m = MATCHES[mid];
    if (!m || !m.results || SEEN.win[mid]) return;
    const r = m.results.filter(Boolean).find((x) => x.uid === ACC);
    if (!r) return;
    SEEN.win[mid] = 1;
    TX.unshift({
      t: Date.now(),
      k: "Prize",
      d: m.name + " · place " + r.place,
      a: r.prize,
      m: "Prize",
      id: "GZP" + mid.slice(-4) + r.place,
    });
    note(
      "You won " + inr(r.prize),
      "in " + m.name + " (place " + r.place + "). Added to your wallet.",
      "🏆",
    );
    toast("🏆 You won " + inr(r.prize) + "!");
    winPost(mid, m, r);
  });
}

/* refund for a contest that was cancelled or did not reach its minimum players */
window.settle = function (c) {
  return false;
}; /* refunds are now paid by the admin panel (it is the only one allowed to add to a wallet) */

/* ---------- leaderboard (real winners) ---------- */
window.LBL = function () {
  return Object.keys(LBD)
    .map((k) => ({
      n: LBD[k].n || "Player",
      i: String(LBD[k].n || "?")[0].toUpperCase(),
      g: "#5b6cf0,#c026d3",
      w: LBD[k].wins || 0,
      e: LBD[k].earned || 0,
    }))
    .filter((x) => x.e > 0)
    .sort((a, b) => b.e - a.e)
    .slice(0, 20);
};

/* ---------- account suspended screen ---------- */
function blockUI(on) {
  let el = $("gzblk");
  if (!on) {
    if (el) el.remove();
    return;
  }
  if (el) return;
  el = document.createElement("div");
  el.id = "gzblk";
  el.style.cssText =
    "position:fixed;inset:0;z-index:9999;background:#050d0b;display:grid;place-items:center;padding:24px;text-align:center";
  el.innerHTML =
    '<div style="max-width:340px"><div style="font-size:46px">🚫</div><h2 style="font-weight:500;margin:12px 0 8px">Account suspended</h2>' +
    '<p class="mut" style="margin:0 0 18px">Your account is blocked, so you cannot join contests, add money or withdraw. If you think this is a mistake, write to <b>' +
    esc(support()) +
    "</b>.</p>" +
    '<button class="cta" id="gzblkout">Log out</button></div>';
  document.body.appendChild(el);
  $("gzblkout").onclick = () => logout();
}

/* ---------- bonus grants ----------
   Every bonus credit is one 'grant' with a unique id, saved in ONE step together with the new bonus balance
   and a counter. The database rules check the reason (real first entry, friend really played, enough
   friends) and refuse a second grant with the same id, so a bonus cannot be made up or claimed twice. */
let CW = null,
  CLANS = {},
  CMEM = {},
  UCL = "",
  clLoad = {},
  lastCt = null;
const GPEND = {};
let gq = Promise.resolve();
function grant(gid, amt, cnt) {
  gq = gq
    .then(async () => {
      if (!ACC || !U) return false;
      const seq = +U.grantSeq || 0,
        nb = _bn + amt,
        rc = (+U.refCount || 0) + 1,
        upd = {};
      upd["grantLog/" + ACC + "/" + gid] = true;
      upd["users/" + ACC + "/grantSeq"] = seq + 1;
      upd["users/" + ACC + "/lastGrant"] = { id: gid, amt };
      upd["users/" + ACC + "/bonus"] = nb;
      if (cnt) upd["users/" + ACC + "/refCount"] = rc;
      try {
        await DB.multi(upd);
      } catch (e) {
        try {
          if (await DB.get("grantLog/" + ACC + "/" + gid)) return "done";
        } catch (x) {}
        console.error("grant failed", gid, e);
        return false;
      }
      _bn = nb;
      U.grantSeq = seq + 1;
      if (cnt) U.refCount = rc;
      return true;
    })
    .catch(() => false);
  return gq;
}
window.gzGrant = (gid, amt) => grant(gid, amt);
window.gzUi = () => {
  ui();
  saveState(true);
};
window.gzRefCountPlaceholder = 0;
window.gzRefCount = () => +((U && U.refCount) || 0);

/* ---------- milestones: Tournament Runner and Power Player (Base Increaser = friend milestones above) ---------- */
const btCount = () => +((U && U.battles) || 0),
  dp = () => +((U && U.depositTotal) || 0),
  pl = () => +((U && U.played) || 0);
const MIL2 = [
  {
    id: "run_5",
    name: "Tournament Runner",
    amt: 20,
    req: () => btCount() >= 5,
    why: "Joined 5 contests",
  },
  {
    id: "run_15",
    name: "Tournament Runner",
    amt: 40,
    req: () => btCount() >= 15,
    why: "Joined 15 contests",
  },
  {
    id: "new_1",
    name: "New Player Power",
    amt: 30,
    req: () => dp() >= 200 && pl() >= 5,
    why: "Added \u20B9200 and finished 5 contests",
  },
  {
    id: "pow_1",
    name: "Power Player",
    amt: 50,
    req: () => dp() >= 1000 && btCount() >= 10,
    why: "Added " + "\u20B9" + "1,000 and played 10 contests",
  },
];
function checkMiles() {
  if (!ACC || !U || !ready) return;
  MIL2.forEach((m) => {
    if (REF.rew[m.id] || GPEND[m.id] || !m.req()) return;
    GPEND[m.id] = 1;
    grant(m.id, m.amt).then((ok) => {
      delete GPEND[m.id];
      if (ok === "done") {
        REF.rew[m.id] = 1;
        return;
      }
      if (ok !== true) return;
      REF.rew[m.id] = 1;
      REF.earn += m.amt;
      TX.unshift({
        t: Date.now(),
        k: "Milestone bonus",
        d: m.name + " · " + m.why,
        a: m.amt,
        m: "Bonus",
        id: "GZM" + m.id,
      });
      note(m.name, "milestone unlocked: " + inr(m.amt) + " bonus. " + m.why + ".", "🏆");
      toast("🏆 " + m.name + ": " + inr(m.amt) + " bonus");
      ui();
      saveState(true);
    });
  });
}
window.mileSec = function () {
  const fc = window.gzRefCount ? window.gzRefCount() : 0,
    b = btCount(),
    d = dp(),
    done = (id) => !!REF.rew[id];
  const bar = (p) =>
    '<div class="rpb"><i style="width:' + Math.max(0, Math.min(100, p)) + '%"></i></div>';
  const step = (ok, t, amt) =>
    '<div class="ms' +
    (ok ? " on" : "") +
    '"><span class="ck">' +
    (ok ? "\u2713" : "") +
    "</span><div>" +
    t +
    " \u00B7 <b>" +
    inr(amt) +
    " bonus</b></div></div>";
  const card = (ic, nm, sub, prog, steps) =>
    '<div style="border:1px solid var(--line);border-radius:16px;padding:16px;margin-top:12px"><div style="display:flex;gap:10px;align-items:center"><span style="font-size:24px">' +
    ic +
    '</span><div><b style="font-weight:500">' +
    nm +
    '</b><div class="mut" style="font-size:12px">' +
    sub +
    "</div></div></div>" +
    prog +
    steps +
    "</div>";
  return (
    '<div class="sech" style="margin-top:24px"><div><div class="eye"><i></i>MILESTONES</div><h2>Earn bonus rewards</h2></div></div>' +
    card(
      "\uD83E\uDD1D",
      "User Base Increaser",
      "Invite friends. They must play a paid contest.",
      bar((fc / 5) * 100) +
        '<div class="mut" style="font-size:12px;margin:0 0 4px">' +
        fc +
        " friends joined</div>",
      step(done("mile_3"), "3 friends", 30) + step(done("mile_5"), "5 friends", 50),
    ) +
    card(
      "\uD83C\uDFC3",
      "Tournament Runner",
      "Keep playing. Every contest counts.",
      bar((b / 15) * 100) +
        '<div class="mut" style="font-size:12px;margin:0 0 4px">' +
        b +
        " contests joined</div>",
      step(done("run_5"), "Join 5 contests", 20) + step(done("run_15"), "Join 15 contests", 40),
    ) +
    card(
      "\uD83D\uDE80",
      "New Player Power",
      "Start strong: add money and finish contests.",
      bar(Math.min(d / 200, pl() / 5) * 100) +
        '<div class="mut" style="font-size:12px;margin:0 0 4px">' +
        inr(Math.min(d, 200)) +
        " of " +
        inr(200) +
        " added \u00B7 " +
        Math.min(pl(), 5) +
        " of 5 contests finished</div>",
      step(done("new_1"), "Add " + inr(200) + " and finish 5 contests", 30),
    ) +
    card(
      "\u26A1",
      "Power Player",
      "Add money and stay loyal.",
      bar(Math.min(d / 1000, b / 10) * 100) +
        '<div class="mut" style="font-size:12px;margin:0 0 4px">' +
        inr(d) +
        " of " +
        inr(1000) +
        " added \u00B7 " +
        b +
        " of 10 contests</div>",
      step(done("pow_1"), "Add " + inr(1000) + " and play 10 contests", 50),
    ) +
    '<p class="mut" style="font-size:12px;margin:12px 0 0">Bonus can only be used on contest entry fees (up to 15% of each entry). It cannot be withdrawn.</p>'
  );
};
