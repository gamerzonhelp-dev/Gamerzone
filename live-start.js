/* GAMERZONE · Live layer: start-up
   File 9 of 9 in this group. Keep the load order shown in index.html. */
"use strict";
/* ---------- start ---------- */
(async () => {
  try {
    await DB.ensureSeed();
  } catch (e) {
    console.error(e);
  }
  if (FBA()) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user && !SIGNING) afterAuth(user).catch((e) => console.error(e));
    });
  } else {
    const sid = tryLs(() => localStorage.getItem(SKEY));
    if (sid) {
      try {
        await bootUser(sid);
      } catch (e) {
        console.error(e);
      }
    }
  }
  window.__gz = { ready: true, user: () => U, mode: DB.mode };
})();
