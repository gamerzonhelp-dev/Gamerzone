/* GAMERZONE · Admin: login, session, idle timeout, start-up
   File 9 of 9 in this group. Keep the load order shown in admin.html. */
"use strict";
/* ---------- login, session, idle timeout ---------- */
let fails = 0,
  lastAct = Date.now(),
  idleT = null;
const SESSION = "gz_admin_until";
const lockUntil = () => Number(tryLs(() => localStorage.getItem("gz_admin_lock")) || 0);
function enter() {
  $("#login").hidden = true;
  $("#app").hidden = false;
  tryLs(() => sessionStorage.setItem(SESSION, String(Date.now() + CONFIG.IDLE_MINUTES * 6e4)));
  lastAct = Date.now();
  clearInterval(idleT);
  idleT = setInterval(() => {
    if (Date.now() - lastAct > CONFIG.IDLE_MINUTES * 6e4)
      leave("You were logged out after " + CONFIG.IDLE_MINUTES + " minutes of inactivity.");
  }, 15000);
  startWatch();
  setView(view);
}
async function leave(msg) {
  clearInterval(idleT);
  tryLs(() => sessionStorage.removeItem(SESSION));
  stopWatch();
  if (DB.mode === "firebase" && CONFIG.USE_FIREBASE_AUTH) {
    try {
      await firebase.auth().signOut();
    } catch (x) {}
  }
  $("#app").hidden = true;
  $("#login").hidden = false;
  $("#lpw").value = "";
  $("#lerr").textContent = msg || "";
  const d = $("#dlg");
  if (d.open) d.close("cancel");
}
["click", "keydown", "touchstart", "pointermove"].forEach((ev) =>
  document.addEventListener(
    ev,
    () => {
      lastAct = Date.now();
    },
    { passive: true },
  ),
);
$("#lform").onsubmit = async (e) => {
  e.preventDefault();
  const er = $("#lerr"),
    btn = $("#lbtn"),
    pw = $("#lpw").value;
  er.textContent = "";
  const wait = lockUntil() - Date.now();
  if (wait > 0) {
    er.textContent = "Too many attempts. Try again in " + Math.ceil(wait / 1000) + " seconds.";
    return;
  }
  if (!pw) {
    er.textContent = "Enter the password.";
    return;
  }
  btn.disabled = true;
  try {
    if (CONFIG.USE_FIREBASE_AUTH && DB.mode === "firebase")
      await firebase.auth().signInWithEmailAndPassword($("#lemail").value.trim(), pw);
    else {
      if ((await sha256(pw)) !== CONFIG.ADMIN_PASS_SHA256) throw new Error("bad");
      enter();
    }
    fails = 0;
  } catch (x) {
    const code = (x && x.code) || "";
    const bad =
      !code ||
      /invalid-credential|wrong-password|user-not-found|invalid-email|invalid-login/.test(code) ||
      x.message === "bad";
    if (x.message === "nocrypto")
      er.textContent =
        "This browser blocks secure login on this address. Open the page over https or localhost.";
    else if (!bad) {
      const why = {
        "auth/operation-not-allowed":
          "Email/Password sign-in is switched off in Firebase (Authentication, Sign-in method).",
        "auth/unauthorized-domain":
          "This website address is not allowed in Firebase (Authentication, Settings, Authorized domains).",
        "auth/operation-not-supported-in-this-environment":
          "Login does not work when the file is opened from the phone. Open the https website link instead.",
        "auth/network-request-failed": "No internet, or the connection to Firebase is blocked.",
        "auth/too-many-requests":
          "Firebase has paused logins for a while after too many tries. Wait some minutes and try again.",
        "auth/user-disabled": "This admin account is disabled in Firebase.",
        "auth/invalid-api-key": "The Firebase API key in this file is wrong.",
        "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
          "The Firebase API key in this file is wrong.",
      }[code];
      er.textContent = (why || "Login problem.") + " (" + code + ")";
    } else {
      fails++;
      if (fails >= 5) {
        tryLs(() => localStorage.setItem("gz_admin_lock", String(Date.now() + 30000)));
        fails = 0;
        er.textContent = "Too many attempts. Locked for 30 seconds.";
      } else
        er.textContent =
          (CONFIG.USE_FIREBASE_AUTH ? "Wrong email or password." : "Wrong password.") +
          " " +
          (5 - fails) +
          " tries left.";
    }
    $("#lpw").select();
  }
  btn.disabled = false;
};
$("#logout").onclick = $("#logout2").onclick = () => leave("");
(async () => {
  try {
    await DB.ready;
    if (DB.mode === "firebase" && CONFIG.USE_FIREBASE_AUTH) {
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = GZ_CONFIG.FIREBASE_SDK + "firebase-auth-compat.js";
        s.onload = res;
        s.onerror = () => rej(new Error("Could not load sign-in"));
        document.head.appendChild(s);
      });
    }
    await DB.ensureSeed();
  } catch (x) {
    $("#lerr").textContent = "Could not start: " + x.message;
    return;
  }
  const live = DB.mode === "firebase";
  $("#modeChip").className = "chip" + (live ? " live" : "");
  $("#modeChip span").textContent = live ? "Firebase connected" : "Test mode, data in this browser";
  $("#modeTxt").textContent = live ? "Firebase connected" : "Test mode";
  if (live && CONFIG.USE_FIREBASE_AUTH) {
    $("#lemailw").hidden = false;
    firebase.auth().onAuthStateChanged((u) => {
      if (u && $("#app").hidden) enter();
      else if (!u && !$("#app").hidden) leave("");
    });
  } else if (Number(tryLs(() => sessionStorage.getItem(SESSION))) > Date.now()) enter();
})();
window.__gzAdmin = { D, F };
