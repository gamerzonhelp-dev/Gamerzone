/* GAMERZONE · Live layer: sign in, sign up, Google, profiles, email check
   File 3 of 9 in this group. Keep the load order shown in index.html. */
"use strict";
/* ---------- sign in / sign up ---------- */
function mkCode(n) {
  return (
    "GZ" +
    (n
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase()
      .slice(0, 4) || "GAME") +
    (100 + Math.floor(Math.random() * 900))
  );
}
async function bootUser(id, o) {
  o = o || {};
  const u = await DB.get("users/" + id);
  if (!u) {
    tryLs(() => localStorage.removeItem(SKEY));
    return false;
  }
  stopWatch();
  resetState();
  ready = false;
  ACC = id;
  U = u;
  tryLs(() => localStorage.setItem(SKEY, id));
  const st = await DB.get("userState/" + id);
  if (st) applyState(st);
  syncVip();
  REF.code = u.refCode || REF.code;
  if (o.by && !REF.by) REF.by = o.by;
  _b = +u.wallet || 0;
  _bn = +u.bonus || 0;
  enterApp(u.name);
  PF.name = u.name;
  PF.phone = u.phone;
  PF.state = u.state;
  PF.dob = u.dob;
  PF.ver = 1;
  PF.since = new Date(u.joinedAt || Date.now()).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
  ready = true;
  startWatch();
  socialStart();
  blockUI(u.status === "blocked");
  saveState(true);
  return true;
}
function forceLogout(msg) {
  logout();
  toast(msg);
}

const _startOtp = window.startOtp;
window.startOtp = async function (n) {
  const er = $("err"),
    p = $("phone").value.replace(/\D/g, "").slice(-10);
  try {
    if (await DB.get("users/u" + p)) {
      er.textContent = "This number is already registered. Please log in.";
      return;
    }
    const rc = $("rc").value.trim().toUpperCase();
    if (rc && /^GZ[A-Z0-9]{4,10}$/.test(rc) && !(await DB.get("refCodes/" + rc))) {
      er.textContent = "That referral code was not found. Check it or leave it blank.";
      return;
    }
  } catch (e) {
    er.textContent = "Could not check right now. Please try again.";
    return;
  }
  _startOtp(n);
};
$("otpgo").onclick = async () => {
  if (OB.map((i) => i.value).join("") !== "1234") {
    $("oerr").textContent = "Wrong code. Try again.";
    return;
  }
  clearInterval(otpT);
  const n = OTPN,
    p = $("phone").value.replace(/\D/g, "").slice(-10),
    w = $("pass").value,
    id = "u" + p;
  try {
    if (await DB.get("users/" + id)) {
      $("oerr").textContent = "This number is already registered.";
      return;
    }
    let code = mkCode(n);
    for (let k = 0; k < 5 && (await DB.get("refCodes/" + code)); k++) code = mkCode(n);
    await DB.set("users/" + id, {
      name: n,
      phone: p,
      state: PD.state,
      dob: PD.dob,
      wallet: 0,
      bonus: 0,
      status: "active",
      joinedAt: Date.now(),
      earned: 0,
      wins: 0,
      battles: 0,
      refCode: code,
    });
    await DB.set("refCodes/" + code, id);
    await DB.set("auth/" + id, { hash: pwHash(id, w) });
    const rc = $("rc").value.trim().toUpperCase();
    let by = "";
    if (rc) {
      const rid = await DB.get("refCodes/" + rc);
      if (rid && rid !== id) {
        by = rc;
        await DB.update("users/" + id, { referredBy: rid });
        await DB.set("referrals/" + rid + "/" + id, { name: n, paid: false });
      }
    }
    $("otp").hidden = true;
    await bootUser(id, { by });
    if (by)
      toast(
        "Code " +
          by +
          " applied. " +
          inr(CFG.REFERRAL_BONUS) +
          " bonus after your first paid entry.",
      );
  } catch (e) {
    $("oerr").textContent = "Could not create your account: " + e.message;
  }
};
$("lgo").onclick = async () => {
  const p = $("lphone").value.replace(/\D/g, "").slice(-10),
    w = $("lpass").value;
  if (p.length < 10) {
    $("lphone").focus();
    return;
  }
  if (w.length < 4) {
    $("lpass").focus();
    return;
  }
  const id = "u" + p;
  try {
    const a = await DB.get("auth/" + id);
    if (!a) {
      toast("No account found. Please sign up first.");
      return;
    }
    if (a.hash !== pwHash(id, w)) {
      toast("Wrong password. Try again.");
      return;
    }
    if (!(await bootUser(id))) toast("Could not open your account.");
  } catch (e) {
    toast("Could not log in: " + e.message);
  }
};
/* ---------- public profiles, player search and follow ---------- */
let PUBL = {},
  FOLLOWERS_ALL = {},
  lastPub = "";
const SAFE_PIC = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+\/=]+$/;
function rebuildPL() {
  PL.length = 0;
  Object.keys(PUBL).forEach((id) => {
    const p = PUBL[id];
    if (id === ACC || !p || !p.name || p.hidden) return;
    const lb = LBD[id] || {};
    PL.push({
      u: id,
      n: String(p.name).slice(0, 40),
      i: String(p.name)[0].toUpperCase(),
      g: BG[p.avi] || BG[0],
      v: p.v ? 1 : 0,
      id: String(p.fid || "").slice(0, 12),
      bio: String(p.bio || "").slice(0, 200),
      pic: SAFE_PIC.test(p.pic || "") ? p.pic : "",
      fl: Object.keys(FOLLOWERS_ALL[id] || {}).length,
      b: +p.b || 0,
      w: +lb.wins || 0,
      ct: String(p.ct || "")
        .replace(/[^A-Za-z0-9]/g, "")
        .slice(0, 5),
      fol: FLG.has(id) ? 1 : 0,
    });
  });
  PL.sort(
    (a, b) => (b.u === "official") - (a.u === "official") || b.fl - a.fl || a.n.localeCompare(b.n),
  );
  ui();
  if (window.gzRP) gzRP();
  if ($("sq") && $("nv").classList.contains("on")) sres($("sq").value);
}
function pubProfile() {
  if (!ACC || !ready || !PF.name) return;
  const o = {
    name: PF.name,
    bio: String(PF.bio || "").slice(0, 150),
    avi: PF.avi || 0,
    fid: String(PF.uid || UID || "").slice(0, 12),
    v: isVip() ? 1 : 0,
    b: JN.size,
    joinedAt: (U && U.joinedAt) || Date.now(),
    pic: PF.pic && SAFE_PIC.test(PF.pic) && PF.pic.length < 90000 ? PF.pic : null,
  };
  const j = JSON.stringify(o);
  if (j === lastPub) return;
  lastPub = j;
  DB.update("profiles/" + ACC, o).catch(() => {
    lastPub = "";
  });
}
window.gzFollow = async function (i, btn) {
  const p = PL[i];
  if (!p || !ACC) return;
  const on = !p.fol;
  p.fol = on ? 1 : 0;
  on ? FLG.add(p.u) : FLG.delete(p.u);
  if (btn && btn.closest("#sb")) profSheet(i);
  if ($("sq") && $("nv").classList.contains("on")) sres($("sq").value);
  ui();
  try {
    await DB.set("follows/" + ACC + "/" + p.u, on ? true : null);
    await DB.set("followers/" + p.u + "/" + ACC, on ? true : null);
    toast(on ? "Following " + p.n : "Unfollowed " + p.n);
  } catch (e) {
    p.fol = on ? 0 : 1;
    on ? FLG.delete(p.u) : FLG.add(p.u);
    if ($("sq") && $("nv").classList.contains("on")) sres($("sq").value);
    ui();
    toast("Could not update. Please try again.");
  }
};
/* ---------- Google + email sign in (Firebase Authentication) ---------- */
const _go = $("go").onclick,
  _lgo = $("lgo").onclick;
const FBA = () => DB.mode === "firebase" && window.firebase && firebase.auth;
const IN_WV = /; wv\)|Version\/\d[\d.]* Chrome\//.test(navigator.userAgent);
let GUSER = null,
  SIGNING = false;
function authMsg(e) {
  const c = (e && e.code) || "";
  return (
    {
      "auth/email-already-in-use": "This email is already registered. Please log in.",
      "auth/invalid-email": "That email address does not look right.",
      "auth/weak-password": "Password needs at least 6 characters.",
      "auth/invalid-credential": "Wrong email or password.",
      "auth/wrong-password": "Wrong email or password.",
      "auth/user-not-found": "Wrong email or password.",
      "auth/too-many-requests": "Too many tries. Please wait a few minutes and try again.",
      "auth/network-request-failed": "No internet connection. Please try again.",
      "auth/operation-not-allowed": "This login method is not switched on in Firebase yet.",
      "auth/unauthorized-domain":
        "This website address is not allowed in Firebase (Authorized domains).",
      "auth/popup-blocked": "The Google window was blocked. Allow pop-ups or use email.",
      "auth/user-disabled": "This account has been disabled.",
    }[c] || ((e && e.message) || "Something went wrong") + (c ? " (" + c + ")" : "")
  );
}
document.querySelectorAll(".gwrap").forEach((w) => {
  w.hidden = IN_WV || DB.mode !== "firebase";
});
function profileProblem() {
  const dob = $("dob").value,
    ste = $("ste").value,
    ag = ageOf(dob);
  if (!dob) return "Enter your date of birth.";
  if (ag < 0 || ag > 110) return "Enter a valid date of birth.";
  if (ag < 18) {
    openBlock("age");
    return "You must be 18 or older to use GAMERZONE.";
  }
  if (!ste) return "Select your state.";
  if (RST.includes(ste)) {
    openBlock("geo", ste);
    return "GAMERZONE is not available in " + ste + ".";
  }
  if (!$("agr").checked)
    return "Please confirm you are 18 or older and accept the Terms, Privacy Policy and Refund Policy.";
  const rc = $("rc").value.trim();
  if (rc && !/^GZ[A-Z0-9]{4,10}$/i.test(rc))
    return "That referral code looks wrong. Check it or leave it blank.";
  return "";
}
function signupMode(user) {
  GUSER = user || null;
  $("rowEmail").hidden = !!user;
  $("rowPass").hidden = !!user;
  $("go").innerHTML =
    (user ? "Finish sign up" : "Create account") + ' <span aria-hidden="true">→</span>';
  $("sgf").textContent = user
    ? "Signed in as " + (user.email || "your account") + ". Finish your profile to continue."
    : "";
}
function showComplete(user) {
  tab(true);
  signupMode(user);
  if (!$("name").value) $("name").value = (user.displayName || "").slice(0, 24);
  window.scrollTo(0, 0);
}
async function afterAuth(user) {
  if (!(await bootUser(user.uid))) showComplete(user);
}
async function makeProfile(user, n, p) {
  const id = user.uid,
    email = (user.email || "").toLowerCase();
  let code = mkCode(n);
  for (let k = 0; k < 5 && (await DB.get("refCodes/" + code)); k++) code = mkCode(n);
  await DB.set("users/" + id, {
    name: n,
    email,
    phone: p,
    state: $("ste").value,
    dob: $("dob").value,
    wallet: 0,
    bonus: 0,
    status: "active",
    joinedAt: Date.now(),
    earned: 0,
    wins: 0,
    battles: 0,
    refCode: code,
  });
  await DB.set("refCodes/" + code, id);
  const rc = $("rc").value.trim().toUpperCase();
  let by = "";
  if (rc) {
    const rid = await DB.get("refCodes/" + rc);
    if (rid && rid !== id) {
      by = rc;
      await DB.update("users/" + id, { referredBy: rid });
      await DB.set("referrals/" + rid + "/" + id, { name: n, paid: false });
    }
  }
  return by;
}
$("go").onclick = async () => {
  if (!FBA()) return _go();
  const er = $("err"),
    btn = $("go");
  er.textContent = "";
  const n = $("name").value.trim(),
    p = $("phone").value.replace(/\D/g, "").slice(-10),
    email = $("semail").value.trim(),
    w = $("pass").value;
  if (!n) return (er.textContent = "Enter your gamer name.");
  if (!GUSER) {
    if (!/^\S+@\S+\.\S+$/.test(email)) return (er.textContent = "Enter a valid email address.");
    if (w.length < 6) return (er.textContent = "Password needs at least 6 characters.");
  }
  if (p.length < 10) return (er.textContent = "Enter a valid 10-digit phone number.");
  const bad = profileProblem();
  if (bad) return (er.textContent = bad);
  btn.disabled = true;
  SIGNING = true;
  let created = null;
  try {
    let user = GUSER;
    if (!user) {
      const cred = await firebase.auth().createUserWithEmailAndPassword(email, w);
      user = created = cred.user;
      user.sendEmailVerification().catch(() => {});
    }
    const rc = $("rc").value.trim().toUpperCase();
    if (rc && !(await DB.get("refCodes/" + rc))) {
      if (created) await created.delete().catch(() => {});
      er.textContent = "That referral code was not found. Check it or leave it blank.";
      return;
    }
    if (!(await DB.claim("phones/" + p, null, user.uid))) {
      if (created) await created.delete().catch(() => {});
      er.textContent = "This phone number is already registered. Please log in.";
      return;
    }
    const by = await makeProfile(user, n, p);
    signupMode(null);
    await bootUser(user.uid, { by });
    if (by)
      toast(
        "Code " +
          by +
          " applied. " +
          inr(CFG.REFERRAL_BONUS) +
          " bonus after your first paid entry.",
      );
  } catch (e) {
    er.textContent = authMsg(e);
  } finally {
    btn.disabled = false;
    SIGNING = false;
  }
};
$("lgo").onclick = async () => {
  if (!FBA()) return _lgo();
  const email = $("lemail").value.trim(),
    w = $("lpass").value;
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    $("lemail").focus();
    return toast("Enter your email address.");
  }
  if (!w) {
    $("lpass").focus();
    return;
  }
  const b = $("lgo");
  b.disabled = true;
  try {
    await firebase.auth().signInWithEmailAndPassword(email, w);
  } catch (e) {
    toast(authMsg(e));
  }
  b.disabled = false;
};
$("fgp").onclick = async () => {
  const email = $("lemail").value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    $("lemail").focus();
    return toast("Type your email above first.");
  }
  if (!FBA()) return toast("Password reset needs the live site.");
  try {
    await firebase.auth().sendPasswordResetEmail(email);
  } catch (e) {
    if (e.code && e.code !== "auth/user-not-found") return toast(authMsg(e));
  }
  toast("If this email has an account, a reset link is on its way. Check spam too.");
};
document.querySelectorAll("[data-g]").forEach(
  (b) =>
    (b.onclick = async () => {
      if (!FBA()) return;
      SIGNING = true;
      try {
        const r = await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
        await afterAuth(r.user);
      } catch (e) {
        if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request")
          toast(authMsg(e));
      } finally {
        SIGNING = false;
      }
    }),
);
const _logout = window.logout;
window.logout = function () {
  saveState(true);
  ready = false;
  stopWatch();
  ACC = "";
  U = null;
  try {
    if (window.firebase && firebase.apps && firebase.apps.length && firebase.auth)
      firebase.auth().signOut();
  } catch (e) {}
  tryLs(() => localStorage.removeItem(SKEY));
  blockUI(false);
  resetState();
  _logout();
  ["name", "semail", "phone", "pass", "dob", "rc", "lemail", "lpass"].forEach((i) => {
    const e = $(i);
    if (e) e.value = "";
  });
  if ($("agr")) $("agr").checked = false;
  if (typeof signupMode === "function") signupMode(null);
};
setInterval(() => saveState(), 3000);
addEventListener("pagehide", () => saveState(true));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) saveState(true);
});

/* ---------- email check (live mode): money actions need a verified email ---------- */
window.needVerify = function () {
  try {
    const u = FBA() && firebase.auth().currentUser;
    return !!(u && !u.emailVerified);
  } catch (e) {
    return false;
  }
};
window.verifySheet = function () {
  const u = firebase.auth().currentUser;
  sheet(
    "Verify your email",
    '<p class="mut" style="margin:0 0 12px">To keep GAMERZONE safe from fake accounts, please verify your email before you join a contest, add money, buy VIP or withdraw.</p><p style="margin:0 0 12px">We sent a link to <b>' +
      esc((u && u.email) || "") +
      '</b>. Open it (check Spam too), then come back and tap the button below.</p><div class="err" id="vferr" role="alert"></div><button class="cta" data-a="vfgo">I have verified</button><button class="btn" data-a="vfre" style="width:100%;margin-top:10px">Send the email again</button>',
  );
};
