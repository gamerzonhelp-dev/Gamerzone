/* GAMERZONE · Live layer: button handlers
   File 5 of 9 in this group. Keep the load order shown in index.html. */
"use strict";
/* ---------- every button the live layer owns ---------- */
const H = {};

H.vfgo = async () => {
  const er = $("vferr");
  try {
    const u = firebase.auth().currentUser;
    await u.reload();
    if (!u.emailVerified) {
      er.textContent = "Not verified yet. Open the link in the email first.";
      return;
    }
    await u.getIdToken(true);
    $("sbg").classList.remove("on");
    toast("Email verified ✓");
  } catch (e) {
    er.textContent = "Could not check. Try again in a moment.";
  }
};
H.vfre = async () => {
  const er = $("vferr");
  try {
    await firebase.auth().currentUser.sendEmailVerification();
    er.style.color = "var(--green)";
    er.textContent = "Email sent. Check your inbox and Spam.";
  } catch (e) {
    er.style.color = "";
    er.textContent = "Please wait a minute before asking again.";
  }
};

H.wadd = () => {
  if (blocked()) return blockUI(true);
  if (needVerify()) return verifySheet();
  if (RST.includes(PF.state)) return openBlock("geo", PF.state);
  const n = Math.floor(+$("wamt").value),
    mn = lim("minDeposit", CFG.MIN_DEPOSIT),
    mx = lim("maxDeposit", CFG.MAX_DEPOSIT);
  if (!(n >= mn && n <= mx)) {
    $("werr").textContent = "Enter an amount between " + inr(mn) + " and " + inr(mx) + ".";
    return;
  }
  depSheet(n);
};
H.cpy = (b, d) => copyTxt(d.v, "UPI ID copied");
H.depgo = async (b, d) => {
  const n = +d.n,
    utr = $("utr").value.replace(/\s/g, ""),
    er = $("derr"),
    file = $("dshot") && $("dshot").files[0];
  if (!/^\d{12}$/.test(utr)) {
    er.textContent = "Enter the 12-digit UTR from your payment app.";
    return;
  }
  if (!file || !/^image\//.test(file.type)) {
    er.textContent = "Please upload a screenshot of your payment.";
    return;
  }
  b.disabled = true;
  er.textContent = "";
  const pid = DB.newId();
  let shot;
  try {
    shot = await shrinkShot(file);
    await DB.putImage("pay_" + pid, shot);
  } catch (x) {
    er.textContent = "Could not upload the screenshot. Please try again.";
    b.disabled = false;
    return;
  }
  if (!(await DB.claim("utr/" + utr, null, pid))) {
    er.textContent = "This transaction ID was already submitted.";
    b.disabled = false;
    return;
  }
  await DB.set("payments/" + pid, {
    uid: ACC,
    type: "deposit",
    amount: n,
    method: "UPI",
    ref: utr,
    imgId: "pay_" + pid,
    status: "pending",
    createdAt: Date.now(),
  });
  SEEN.pay[pid] = "pending";
  sheet(
    "Request sent",
    '<div class="pay-ok"><div class="tick">✓</div><strong>' +
      inr(n) +
      '</strong><small>Waiting for our team to check your payment</small></div><div class="kv"><span>UTR</span><b>' +
      esc(utr) +
      '</b></div><p class="mut" style="margin:12px 0 0">You will get a notification when the money is added to your wallet.</p><button class="cta" data-a="x" style="margin-top:14px">Done</button>',
  );
  saveState(true);
};
/* Google-created accounts can add a password, so they can log in inside the app (Google sign-in does not work in app WebViews) */
window.GPW = function () {
  try {
    const u = firebase.auth().currentUser;
    if (!u) return false;
    const ids = (u.providerData || []).map((p) => p.providerId);
    return ids.includes("google.com") && !ids.includes("password");
  } catch (e) {
    return false;
  }
};
H.setpw = () =>
  sheet(
    "Set a password",
    '<p class="mut" style="margin:0 0 12px">With a password you can log in with your email in the app, where the Google button does not work.</p>' +
      '<label for="spw">New password (at least 6 characters)</label><input id="spw" type="password" autocomplete="new-password">' +
      '<div class="err" id="spwe" role="alert"></div><button class="cta" data-a="setpwgo">Save password</button>',
  );
H.setpwgo = async (b) => {
  const pw = $("spw").value,
    er = $("spwe");
  er.textContent = "";
  if (pw.length < 6) {
    er.textContent = "Password needs at least 6 characters.";
    return;
  }
  const u = firebase.auth().currentUser;
  if (!u) {
    er.textContent = "Please log in again.";
    return;
  }
  b.disabled = true;
  try {
    await u.linkWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, pw));
    sheet(
      "Password saved",
      '<p class="mut" style="margin:0 0 14px">Done. In the app, log in with <b>' +
        esc(u.email) +
        '</b> and this password.</p><button class="cta" data-a="x">Done</button>',
    );
  } catch (e) {
    const c = e && e.code;
    er.textContent =
      c === "auth/requires-recent-login"
        ? "For safety, log out, log in with Google again, then try once more."
        : c === "auth/provider-already-linked"
          ? "This account already has a password."
          : authMsg(e);
    b.disabled = false;
  }
};
H.wdopen = () => {
  if (blocked()) return blockUI(true);
  if (needVerify()) return verifySheet();
  wdSheet();
};
H.wdgo = async (b) => {
  const er = $("wderr"),
    amt = Math.floor(+$("wdamt").value),
    upi = $("wdupi").value.trim(),
    mn = lim("minWithdraw", CFG.MIN_WITHDRAW),
    mx = lim("maxWithdraw", CFG.MAX_WITHDRAW);
  if (!(amt >= mn && amt <= mx)) {
    er.textContent = "Enter an amount between " + inr(mn) + " and " + inr(mx) + ".";
    return;
  }
  if (amt > WAL.b) {
    er.textContent = "You only have " + inr(WAL.b) + " in your wallet.";
    return;
  }
  const qrf = $("wdqr") && $("wdqr").files[0];
  if (!upi && !qrf) {
    er.textContent = "Enter your UPI ID or upload your UPI QR image.";
    return;
  }
  if (qrf && !/^image\//.test(qrf.type)) {
    er.textContent = "The QR must be an image file.";
    return;
  }
  if (upi && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upi)) {
    er.textContent = "Enter a valid UPI ID, like name@upi.";
    return;
  }
  if (Object.values(PAYS).some((p) => p.type === "withdrawal" && p.status === "pending")) {
    er.textContent = "You already have a withdrawal waiting. Wait for it to finish.";
    return;
  }
  b.disabled = true;
  if (upi) UPIID = upi;
  const pid = DB.newId();
  let qrId = "";
  if (qrf) {
    try {
      const dq = await shrinkShot(qrf);
      qrId = "wqr_" + pid;
      await DB.putImage(qrId, dq);
    } catch (x) {
      er.textContent = "Could not upload the QR image. Please try again.";
      b.disabled = false;
      return;
    }
  }
  WAL.b -= amt;
  TX.unshift({
    t: Date.now(),
    k: "Withdrawal",
    d: "Request to " + (upi || "QR"),
    a: -amt,
    m: "UPI",
    id: "GZW" + pid.slice(-5),
  });
  await DB.set("payments/" + pid, {
    uid: ACC,
    type: "withdrawal",
    amount: amt,
    method: "UPI",
    ref: upi || "QR image",
    ...(qrId ? { qrId } : {}),
    status: "pending",
    createdAt: Date.now(),
  });
  SEEN.pay[pid] = "pending";
  sheet(
    "Request sent",
    '<div class="pay-ok"><div class="tick">✓</div><strong>' +
      inr(amt) +
      '</strong><small>Withdrawal requested</small></div><div class="kv"><span>Paying to</span><b>' +
      esc(upi || "your QR image") +
      '</b></div><p class="mut" style="margin:12px 0 0">We check and send the money to your UPI ID or QR. You will get a notification.</p><button class="cta" data-a="x" style="margin-top:14px">Done</button>',
  );
  ui();
  saveState(true);
};
H.paygo = (b) => payGo(b);
H.bnuse = () => {
  PX.useB = !PX.useB;
  payView();
};
H.bpay = (b, d) => {
  let tookVip = false;
  const c = CS.find((x) => x.id == d.id);
  if (!c) return;
  const u = $("uid").value.trim(),
    n = $("ign").value.trim(),
    er = $("jerr");
  if (!/^\d{8,12}$/.test(u)) {
    er.textContent =
      "Enter a valid " +
      (c.g === "BGMI" ? "BGMI Character ID" : "Free Fire UID") +
      " (8-12 digits).";
    return;
  }
  if (!n) {
    er.textContent = "Enter your in-game name.";
    return;
  }
  if (JN.has(c.id)) {
    er.textContent = "You already joined this contest.";
    return;
  }
  if (!canJoin(c)) {
    er.textContent = "This contest just filled up.";
    return;
  }
  if (c.fan && !FLG.has("official")) {
    er.textContent = "Follow GAMERZONE Official to join this fan match.";
    return;
  }
  let team = null;
  if (c.tsz > 1) {
    const tn = $("tname").value.trim();
    if (!tn) {
      er.textContent = "Enter your team name.";
      return;
    }
    const mates = [],
      seenId = new Set([u]);
    for (let k = 1; k < c.tsz; k++) {
      const mi = $("tmi" + k).value.trim(),
        mu = $("tmu" + k).value.trim();
      if (!mi) {
        er.textContent = "Enter the in-game name of teammate " + k + ".";
        return;
      }
      if (!/^\d{8,12}$/.test(mu)) {
        er.textContent = "Teammate " + k + " game ID must be 8-12 digits.";
        return;
      }
      if (seenId.has(mu)) {
        er.textContent = "Every player in the team needs a different game ID.";
        return;
      }
      seenId.add(mu);
      mates.push({ ign: mi.slice(0, 20), uid: mu });
    }
    team = { name: tn.slice(0, 16), mates };
  }
  payFlow({
    title: "Entry fee · " + c.name,
    kind: "Entry fee",
    amt: c.fee,
    commit: async () => {
      const m = MATCHES[c.id];
      if (!m || m.status !== "upcoming" || Date.now() >= m.startAt)
        return "Registration is closed.";
      const vipSpot = isVip() && (+m.vipJoined || 0) < (+m.vipSlots || 0);
      tookVip = false;
      if (!(await DB.inc("matches/" + c.id + "/joined", 1, { max: +m.slots })))
        return "This contest just filled up.";
      if (!isVip()) {
        const mm = await DB.get("matches/" + c.id);
        if (mm.joined - (mm.vipJoined || 0) > mm.slots - (mm.vipSlots || 0)) {
          await DB.inc("matches/" + c.id + "/joined", -1);
          return "Only VIP slots are left.";
        }
      }
      if (vipSpot) {
        await DB.inc("matches/" + c.id + "/vipJoined", 1);
        tookVip = true;
      }
      return true;
    },
    undo: async () => {
      await DB.inc("matches/" + c.id + "/joined", -1);
      if (tookVip) await DB.inc("matches/" + c.id + "/vipJoined", -1);
      tookVip = false;
    },
    atomic: async (pa, ub) => {
      const e = {
          ign: n,
          gameUid: u,
          paid: pa,
          ub,
          joinedAt: Date.now(),
          refunded: false,
          vip: isVip(),
        },
        upd = {};
      if (team) e.team = team;
      if (c.fee > 0) upd["users/" + ACC + "/paidCount"] = (+U.paidCount || 0) + 1;
      upd["entries/" + c.id + "/" + ACC] = Object.assign({ name: PF.name }, e);
      upd["myEntries/" + ACC + "/" + c.id] = e;
      upd["users/" + ACC + "/wallet"] = _b - pa;
      {
        const wl = winLeft(pa);
        if (wl !== null) upd["users/" + ACC + "/winBal"] = wl;
      }
      upd["users/" + ACC + "/bonus"] = _bn - ub;
      upd["users/" + ACC + "/battles"] = (+U.battles || 0) + 1;
      upd["users/" + ACC + "/entrySeq"] = (+U.entrySeq || 0) + 1;
      upd["users/" + ACC + "/lastEntry"] = c.id;
      await DB.multi(upd);
    },
    done: async (pa) => {
      JN.add(c.id);
      JI[c.id] = { uid: u, ign: n, paid: pa, refunded: false, team };
      if (c.g === "BGMI") {
        UIDB = u;
        if (!PF.bid) PF.bid = u;
      } else {
        UID = u;
        if (!PF.uid) PF.uid = u;
      }
      toast("You joined " + c.name);
    },
  });
};
H.subgo = async (b, d) => {
  const c = CS.find((x) => x.id == d.id);
  if (!c) return;
  const rk = Math.floor(+$("srk").value),
    kl = Math.floor(+$("skl").value),
    er = $("suberr");
  if (!SUBIMG) {
    er.textContent = "Add your result screenshot.";
    return;
  }
  if (!(rk >= 1 && rk <= c.slots)) {
    er.textContent = "Enter your rank (1 to " + c.slots + ").";
    return;
  }
  if (!(kl >= 0 && kl <= 99)) {
    er.textContent = "Enter your kills (0 to 99).";
    return;
  }
  if (c.res) {
    er.textContent = "Results are already out for this contest.";
    return;
  }
  b.disabled = true;
  const sid = c.id + "_" + ACC,
    imgId = sid + "_" + Date.now().toString(36);
  try {
    await DB.putImage(imgId, SUBIMG);
    IMG[imgId] = SUBIMG;
    await DB.set("submissions/" + sid, {
      matchId: c.id,
      matchName: c.name,
      uid: ACC,
      name: PF.name || "You",
      gameUid: (JI[c.id] || {}).uid || "",
      ign: (JI[c.id] || {}).ign || "",
      team: ((JI[c.id] || {}).team || {}).name || "",
      rank: rk,
      kills: kl,
      imgId,
      status: "pending",
      why: "",
      createdAt: Date.now(),
    });
    SEEN.sub[sid] = "pending";
    closeSheet();
    toast("Submitted. The host will review it soon.");
  } catch (e) {
    er.textContent = "Could not send: " + e.message;
    b.disabled = false;
  }
};

/* hook into the app's one click dispatcher */
const _ext = window.ext;
window.ext = function (a, b) {
  const h = H[a];
  if (!h) return _ext(a, b);
  try {
    const r = h(b, b.dataset);
    if (r && r.catch)
      r.catch((e) => {
        console.error(e);
        toast("Something went wrong. Please try again.");
      });
  } catch (e) {
    console.error(e);
    toast("Something went wrong. Please try again.");
  }
  return 1;
};
