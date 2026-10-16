/* GAMERZONE · Admin: button handlers
   File 7 of 9 in this group. Keep the load order shown in admin.html. */
"use strict";
/* ---------- one click handler ---------- */
document.addEventListener("click", async (e) => {
  const t = e.target.closest("button, [data-act]");
  if (!t) return;
  try {
    if (t.dataset.view) return setView(t.dataset.view);
    if (t.dataset.go) return setView(t.dataset.go);
    if (t.closest("#mseg") && t.dataset.v) {
      F.mf = t.dataset.v;
      renderMseg();
      return renderBody();
    }
    if (t.closest("#useg") && t.dataset.v) {
      F.uf = t.dataset.v;
      renderUseg();
      return renderBody();
    }
    if (t.closest("#ptseg") && t.dataset.v) {
      F.ptype = t.dataset.v;
      renderPseg();
      return renderBody();
    }
    if (t.closest("#psseg") && t.dataset.v) {
      F.pst = t.dataset.v;
      renderPseg();
      return renderBody();
    }
    const a = t.dataset.act;
    if (!a) return;
    const card = t.closest("[data-mid]"),
      m =
        card &&
        D.matches[card.dataset.mid] &&
        Object.assign({ id: card.dataset.mid }, D.matches[card.dataset.mid]);
    if (a === "room" && m) return saveRoom(card, m);
    if (a === "cancel" && m) return cancelMatch(m);
    if (a === "players" && m) return showPlayers(m);
    if (a === "review" && m) {
      F.rm = m.id;
      return setView("results");
    }
    const row = t.closest("tr"),
      sc = t.closest("[data-sid]"),
      s =
        sc &&
        D.submissions[sc.dataset.sid] &&
        Object.assign({ id: sc.dataset.sid }, D.submissions[sc.dataset.sid]);
    if (a === "zoom" && s) {
      const u = IMGC[s.imgId];
      if (!u) return toast("Screenshot is still loading");
      openDlg(
        '<div class="dlgf"><h3>' +
          esc(s.name) +
          " · rank #" +
          s.rank +
          ", " +
          s.kills +
          ' kills</h3><img class="bigimg" src="' +
          u +
          '" alt="Result screenshot"><div class="drow"><button type="button" class="btn" data-x>Close</button></div></div>',
      );
      return;
    }
    if (a === "pshot" && row) {
      const p = D.payments[row.dataset.pid];
      if (!p || !(p.imgId || p.qrId)) return;
      const iid = p.imgId || p.qrId;
      let u = IMGC[iid];
      if (!u) {
        toast("Loading image...");
        u = await DB.getImage(iid);
        if (u) IMGC[iid] = u;
      }
      if (!u) return toast("Screenshot not found", true);
      const who = D.users[p.uid] ? D.users[p.uid].name : "Unknown user";
      openDlg(
        '<div class="dlgf"><h3>' +
          esc(who) +
          " · " +
          inr(p.amount) +
          '</h3><p style="margin:0 0 10px">' +
          (p.qrId
            ? "Pay to this QR" + (p.ref && p.ref !== "QR image" ? " or UPI ID: " : "")
            : "UTR: ") +
          "<b>" +
          esc(p.qrId && p.ref === "QR image" ? "" : p.ref || "-") +
          '</b></p><img class="bigimg" src="' +
          u +
          '" alt="Payment screenshot"><div class="drow"><button type="button" class="btn" data-x>Close</button></div></div>',
      );
      return;
    }
    if (a === "sapp" && s) return setSub(s, "approved");
    if (a === "sund" && s) return setSub(s, "pending");
    if (a === "srej" && s) {
      const why = await pickReason();
      if (why) setSub(s, "rejected", why);
      return;
    }
    if (a === "declare") return declare(Object.assign({ id: F.rm }, D.matches[F.rm]));
    if (a === "block" || a === "unblock") return setBlocked(row.dataset.uid, a === "block");
    if (a === "approve") return approvePay(row.dataset.pid);
    if (a === "reject") return rejectPay(row.dataset.pid);
    if (a === "demo") {
      if (
        await ask({
          title: "Restore demo data?",
          body: "This deletes everything and puts back the demo players, matches, payments and screenshots.",
          ok: "Restore",
          danger: true,
        })
      ) {
        await DB.reset("demo");
        toast("Demo data restored");
      }
      return;
    }
    if (a === "fresh") {
      const v = await ask({
        title: "Delete everything?",
        body: "This removes all matches, players, wallets, payments and screenshots. Use it once, before you launch. Type <b>DELETE</b> to confirm.",
        ok: "Delete everything",
        danger: true,
        field: { label: "Type DELETE", req: true, max: 10 },
      });
      if (v === "DELETE") {
        await DB.reset("fresh");
        toast("Everything deleted. You are starting fresh.");
      } else if (v !== false) toast("Nothing was deleted. You must type DELETE.", true);
      return;
    }
  } catch (x) {
    console.error(x);
    toast("Something went wrong: " + (x.message || x), true);
  }
});
