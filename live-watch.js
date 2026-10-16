/* GAMERZONE · Live layer: database watchers (wallet, VIP, matches, entries)
   File 2 of 9 in this group. Keep the load order shown in index.html. */
"use strict";
/* ---------- watchers ---------- */
/* VIP lives in the database (users/{id}/vipUntil), not in the phone, so it cannot be faked */
function syncVip() {
  const u = +((U && U.vipUntil) || 0);
  VIP = { on: u > Date.now() ? 1 : 0, until: u };
}
function stopWatch() {
  OFF.forEach((f) => {
    try {
      f();
    } catch (e) {}
  });
  OFF = [];
}
function startWatch() {
  OFF.push(
    DB.watch("config/payment", (v) => {
      CONF = v || {};
    }),
  );
  OFF.push(
    DB.watch("users/" + ACC, (v) => {
      if (!v) {
        if (ready) {
          forceLogout("Your account was removed.");
        }
        return;
      }
      U = v;
      _b = +v.wallet || 0;
      _bn = +v.bonus || 0;
      syncVip();
      checkMiles();
      blockUI(v.status === "blocked");
      ui();
    }),
  );
  OFF.push(
    DB.watch("matches", (v) => {
      MATCHES = v || {};
      rebuildCS();
      checkWins();
      ui();
    }),
  );
  OFF.push(
    DB.watch("myEntries/" + ACC, (v) => {
      ENTR = v || {};
      JN.clear();
      Object.keys(JI).forEach((k) => delete JI[k]);
      SEEN.rf = SEEN.rf || {};
      const first = !SEEN.rfi;
      SEEN.rfi = 1;
      Object.keys(ENTR).forEach((id) => {
        const e = ENTR[id];
        JN.add(id);
        JI[id] = { uid: e.gameUid, ign: e.ign, paid: e.paid, refunded: !!e.refunded };
        if (!ROOMW[id])
          ROOMW[id] = DB.watch("rooms/" + id, (v) => {
            ROOMS[id] = v || null;
            rebuildCS();
            ui();
          });
        if (e.refunded && !SEEN.rf[id]) {
          SEEN.rf[id] = 1;
          if (!first) {
            const nm = (MATCHES[id] && MATCHES[id].name) || "Contest";
            if (e.paid)
              TX.unshift({
                t: Date.now(),
                k: "Refund",
                d: nm + " cancelled",
                a: e.paid,
                m: "Wallet",
                id: "GZR" + String(id).slice(-4),
              });
            note(nm, "was cancelled. Your entry fee is back in your wallet.", "₹");
          }
        }
      });
      rebuildCS();
      ui();
    }),
  );
  OFF.push(
    DB.watchWhere("payments", "uid", ACC, (v) => {
      PAYS = v || {};
      Object.keys(PAYS).forEach((id) => {
        const p = PAYS[id],
          prev = SEEN.pay[id];
        if (prev === p.status) return;
        SEEN.pay[id] = p.status;
        if (prev !== "pending" || p.status === "pending") return;
        if (p.type === "deposit" && p.status === "approved") {
          TX.unshift({
            t: Date.now(),
            k: "Wallet top-up",
            d: "Deposit approved",
            a: p.amount,
            m: "UPI",
            id: "GZD" + String(id).slice(-5),
          });
          note(inr(p.amount) + " added", "to your wallet. Your deposit was approved.", "💰");
          toast(inr(p.amount) + " added to your wallet");
        } else if (p.type === "deposit") {
          note(
            "Deposit of " + inr(p.amount),
            "was rejected" + (p.note ? ": " + p.note : "") + ".",
            "!",
          );
        } else if (p.status === "approved") {
          note(
            "Withdrawal of " + inr(p.amount),
            "was approved. The money is on its way to your UPI ID.",
            "✓",
          );
          toast("Withdrawal approved");
        } else {
          TX.unshift({
            t: Date.now(),
            k: "Refund",
            d: "Withdrawal rejected",
            a: p.amount,
            m: "Wallet",
            id: "GZW" + String(id).slice(-5),
          });
          note(
            "Withdrawal of " + inr(p.amount),
            "was rejected" + (p.note ? ": " + p.note : "") + ". The money is back in your wallet.",
            "!",
          );
        }
      });
      ui();
    }),
  );
  OFF.push(
    DB.watchWhere("submissions", "uid", ACC, (v) => {
      MSUB = v || {};
      SUB.length = 0;
      Object.keys(MSUB).forEach((id) => {
        const s = MSUB[id];
        SUB.push({
          id,
          cid: s.matchId,
          n: s.name,
          uid: s.gameUid,
          rank: s.rank,
          kills: s.kills,
          img: IMG[s.imgId] || "",
          t: s.createdAt,
          st: s.status,
          why: s.why || "",
          me: 1,
          imgId: s.imgId,
        });
        if (s.imgId && !IMG[s.imgId])
          DB.getImage(s.imgId).then((u) => {
            if (u) {
              IMG[s.imgId] = u;
              const x = SUB.find((y) => y.id === id);
              if (x) x.img = u;
              ui();
            }
          });
        const prev = SEEN.sub[id];
        SEEN.sub[id] = s.status;
        if (prev === s.status || s.status === "pending" || prev === undefined) return;
        if (s.status === "approved")
          note("Your result", "was approved. Winners will be announced soon.", "✓");
        else if (s.status === "rejected")
          note(
            "Your result",
            "was rejected: " + (s.why || "see details") + ". You can resubmit.",
            "!",
          );
      });
      ui();
    }),
  );
  OFF.push(
    DB.watch("leaderboard", (v) => {
      LBD = v || {};
      rebuildPL();
    }),
  );
  OFF.push(
    DB.watch("profiles", (v) => {
      PUBL = v || {};
      rebuildPL();
    }),
  );
  OFF.push(
    DB.watch("followers", (v) => {
      FOLLOWERS_ALL = v || {};
      FLW.clear();
      Object.keys(FOLLOWERS_ALL[ACC] || {}).forEach((k) => FLW.add(k));
      rebuildPL();
    }),
  );
  OFF.push(
    DB.watch("follows/" + ACC, (v) => {
      FLG.clear();
      Object.keys(v || {}).forEach((k) => FLG.add(k));
      rebuildPL();
    }),
  );
  OFF.push(
    DB.watch("referrals/" + ACC, (v) => {
      const list = Object.keys(v || {})
        .map((k) => Object.assign({ id: k }, v[k]))
        .filter((f) => f.paid);
      REF.friends = list.map((f) => ({ n: f.name }));
      list.forEach((f) => {
        if (SEEN.ref[f.id] || GPEND["ref_" + f.id]) return;
        GPEND["ref_" + f.id] = 1;
        grant("ref_" + f.id, CFG.REFERRAL_BONUS, true).then((ok) => {
          delete GPEND["ref_" + f.id];
          if (ok === "done") {
            SEEN.ref[f.id] = 1;
            return;
          }
          if (ok !== true) return;
          SEEN.ref[f.id] = 1;
          REF.earn += CFG.REFERRAL_BONUS;
          TX.unshift({
            t: Date.now(),
            k: "Referral bonus",
            d: f.name + " played their first contest",
            a: CFG.REFERRAL_BONUS,
            m: "Bonus",
            id: "GZF" + String(f.id).slice(-5),
          });
          note(
            f.name,
            "played their first contest. You earned " + inr(CFG.REFERRAL_BONUS) + " bonus.",
            "🎁",
          );
          refReward();
          ui();
          saveState(true);
        });
      });
      ui();
    }),
  );
}
