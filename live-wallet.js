/* GAMERZONE · Live layer: paying entry fee and VIP, add money, withdraw
   File 4 of 9 in this group. Keep the load order shown in index.html. */
"use strict";
/* ---------- paying from the wallet (entry fee, VIP) ---------- */
window.payFlow = function (o) {
  if (blocked()) {
    blockUI(true);
    return;
  }
  if (RST.includes(PF.state)) {
    openBlock("geo", PF.state);
    return;
  }
  if (needVerify()) {
    verifySheet();
    return;
  }
  PX = o;
  o.useB = bnU(o) > 0;
  payView();
};
window.payView = function () {
  const o = PX,
    pa = payAmt(o),
    low = WAL.b < pa,
    ub = bnU(o);
  sheet(
    o.amt === 0 ? "Join free" : "Pay " + inr(pa),
    '<div class="pay-h"><small>' +
      esc(o.title) +
      "</small><strong>" +
      inr(pa) +
      "</strong>" +
      (o.useB ? "<small>" + inr(o.amt) + " − " + inr(ub) + " bonus</small>" : "") +
      "</div>" +
      (ub > 0
        ? '<button class="pmr' +
          (o.useB ? " on" : "") +
          '" data-a="bnuse"><span class="pmi" style="background:#8a6a1a">🎁</span><div>Use bonus balance<small>Save ' +
          inr(ub) +
          " · bonus " +
          inr(WAL.bn) +
          "</small></div>" +
          (o.useB
            ? '<i style="margin-left:auto;color:var(--green);font-style:normal;font-size:18px">✓</i>'
            : "") +
          "</button>"
        : "") +
      '<div class="kv"><span>Wallet balance</span><b>' +
      inr(WAL.b) +
      "</b></div>" +
      '<div class="err" id="payerr" role="alert">' +
      (low ? "You need " + inr(pa - WAL.b) + " more in your wallet." : "") +
      "</div>" +
      (low
        ? '<button class="cta" data-a="wal">Add money</button>'
        : '<button class="cta" data-a="paygo">' +
          (o.amt === 0 ? "Join free" : "Pay " + inr(pa) + " from wallet") +
          "</button>") +
      '<p class="mut" style="margin:12px 0 0;text-align:center;font-size:12px">18+ only. Play responsibly.</p>',
  );
};
async function payGo(b) {
  const o = PX;
  if (!o) return;
  if (blocked()) {
    blockUI(true);
    return;
  }
  const pa = payAmt(o),
    ub = o.useB ? bnU(o) : 0;
  b.disabled = true;
  b.textContent = "Processing…";
  if (WAL.b < pa) {
    payView();
    return;
  }
  if (o.commit) {
    const r = await o.commit();
    if (r !== true) {
      payView();
      $("payerr").textContent = r || "Could not complete this. Please try again.";
      return;
    }
  }
  /* the wallet has two cash parts: Deposit and Winnings. Spending takes the deposit part first, so only the winnings part can go down here */
  const winLeft = (window.winLeft = (pa) => {
    const w = Math.min(+((U && U.winBal) || 0), _b),
      dep = _b - w,
      take = Math.max(0, pa - dep);
    return take > 0 ? w - take : null;
  });
  if (o.kind === "VIP badge")
    o.atomic = async (pa) => {
      const base = Math.max(Date.now(), +((U && U.vipUntil) || 0));
      const upd = {
          ["users/" + ACC + "/wallet"]: _b - pa,
          ["users/" + ACC + "/vipUntil"]: base + 30 * 864e5,
        },
        wl = winLeft(pa);
      if (wl !== null) upd["users/" + ACC + "/winBal"] = wl;
      await DB.multi(upd);
    };
  if (o.atomic) {
    const nb = _b - pa,
      nbn = _bn - ub;
    /* entry fee: the wallet debit and the entry are saved in ONE step, and the database rules only accept the entry if the wallet went down by exactly the fee */
    try {
      await o.atomic(pa, ub);
    } catch (e) {
      if (o.undo) {
        try {
          await o.undo();
        } catch (x) {}
      }
      payView();
      $("payerr").textContent =
        "Could not complete this (" +
        (e.code === "PERMISSION_DENIED" || /permission/i.test(e.message || "")
          ? "your balance changed, please try again"
          : e.message) +
        ").";
      return;
    }
    _b = nb;
    _bn = nbn;
  } else {
    WAL.b -= pa;
    WAL.bn -= ub;
  }
  const id = "GZ" + Math.floor(1e9 + Math.random() * 9e9);
  TX.unshift({
    t: Date.now(),
    k: o.kind,
    d: o.title + (ub ? " (" + inr(ub) + " bonus used)" : ""),
    a: -pa,
    m: "Wallet",
    id,
  });
  if (o.done) await o.done(pa);
  let gr = 0;
  if (o.kind === "Entry fee" && o.amt > 0 && REF.by && !REF.got) {
    REF.got = 1;
    if ((await grant("welcome", CFG.REFERRAL_BONUS)) === true) {
      gr = CFG.REFERRAL_BONUS;
      TX.unshift({
        t: Date.now(),
        k: "Referral bonus",
        d: "Welcome bonus for using a code",
        a: gr,
        m: "Bonus",
        id: id + "B",
      });
    }
    if (U && U.referredBy)
      DB.update("referrals/" + U.referredBy + "/" + ACC, { paid: true }).catch(() => {});
  }
  sheet(
    o.amt === 0 ? "You are in" : "Payment successful",
    '<div class="pay-ok"><div class="tick">✓</div><strong>' +
      inr(pa) +
      "</strong><small>" +
      esc(o.title) +
      '</small></div><div class="kv"><span>Paid with</span><b>Wallet</b></div>' +
      (ub ? '<div class="kv"><span>Bonus used</span><b>' + inr(ub) + "</b></div>" : "") +
      (gr ? '<div class="kv"><span>Referral bonus</span><b>+' + inr(gr) + "</b></div>" : "") +
      '<div class="kv"><span>Transaction ID</span><b>' +
      id +
      '</b></div><button class="cta" data-a="x" style="margin-top:14px">Done</button>',
  );
  ui();
  feed();
  renderStories();
  saveState(true);
}

/* ---------- wallet: add money (UPI + UTR), withdraw ---------- */
const lim = (k, f) => +CONF[k] || f;
function reqRows() {
  const L = Object.keys(PAYS)
    .map((k) => Object.assign({ id: k }, PAYS[k]))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);
  if (!L.length) return "";
  const col = { pending: "#ffd66b", approved: "#00ff88", rejected: "#ff6b6b" },
    lab = { pending: "Waiting", approved: "Approved", rejected: "Rejected" };
  return (
    '<div class="rsec" style="margin-top:18px">Your requests</div>' +
    L.map(
      (p) =>
        '<div class="kv"><span>' +
        (p.type === "deposit" ? "Add money" : "Withdraw") +
        " " +
        inr(p.amount) +
        " · " +
        dateShort(p.createdAt) +
        '</span><b style="color:' +
        (col[p.status] || "#fff") +
        '">' +
        (lab[p.status] || esc(p.status)) +
        "</b></div>",
    ).join("")
  );
}
window.walSheet = function () {
  sheet(
    "Wallet",
    '<div class="kv"><span>Balance</span><b>' +
      inr(WAL.b) +
      "</b></div>" +
      (WAL.bn ? '<div class="kv"><span>Bonus balance</span><b>' + inr(WAL.bn) + "</b></div>" : "") +
      '<label for="wamt" style="margin-top:14px">Add money</label><div class="fl" style="margin-bottom:12px">' +
      [50, 100, 200, 500]
        .map((n) => '<button class="chip" data-a="wamt" data-n="' + n + '">₹' + n + "</button>")
        .join("") +
      "</div>" +
      '<input id="wamt" inputmode="numeric" maxlength="5" placeholder="Enter amount" value="100"><div class="err" id="werr" role="alert"></div>' +
      '<button class="cta" data-a="wadd">Add money</button><button class="btn" data-a="wdopen" style="width:100%;margin-top:10px">Withdraw money</button>' +
      '<p class="mut" style="margin:12px 0 0;text-align:center;font-size:12px">Money you add is checked by our team before it reaches your wallet.</p>' +
      reqRows(),
  );
};
function upiLinkFor(upi, name, n) {
  return (
    "upi://pay?pa=" +
    encodeURIComponent(upi) +
    "&pn=" +
    encodeURIComponent(name || "GAMERZONE") +
    "&am=" +
    Number(n).toFixed(2) +
    "&cu=INR&tn=" +
    encodeURIComponent("GAMERZONE wallet")
  );
}
function drawDepQR(upi, name, n) {
  const box = $("dqr");
  if (!box) return;
  if (typeof QRCode === "undefined") {
    box.innerHTML =
      '<span style="color:#000;font-size:12px;padding:8px;display:block">QR could not load. Please pay to the UPI ID below.</span>';
    return;
  }
  box.innerHTML = "";
  try {
    new QRCode(box, {
      text: upiLinkFor(upi, name, n),
      width: 200,
      height: 200,
      correctLevel: QRCode.CorrectLevel.M,
    });
  } catch (e) {
    box.textContent = "";
  }
}
function depSheet(n) {
  const upi = CONF.upiId || CFG.UPI_ID,
    nm = CONF.upiName || CFG.UPI_NAME;
  if (!upi) {
    sheet(
      "Add money",
      '<p class="mut" style="margin:0 0 14px">Adding money is not switched on yet. Please try again later or write to <b>' +
        esc(support()) +
        '</b>.</p><button class="cta" data-a="x">OK</button>',
    );
    return;
  }
  sheet(
    "Add " + inr(n),
    '<p class="mut" style="margin:0 0 8px">1. Scan this QR with Google Pay, PhonePe, Paytm or any UPI app and pay <b style="color:var(--text)">' +
      inr(n) +
      "</b>.</p>" +
      '<div style="display:flex;justify-content:center;margin:10px 0"><div id="dqr" style="background:#fff;padding:10px;border-radius:12px;min-width:220px;min-height:220px;display:flex;align-items:center;justify-content:center"></div></div>' +
      '<div class="rmr"><div><small>' +
      esc(nm) +
      "</small><b>" +
      esc(upi) +
      '</b></div><button class="btn" data-a="cpy" data-v="' +
      esc(upi) +
      '">Copy</button></div>' +
      '<p class="mut" style="margin:16px 0 8px">2. Enter the 12-digit UTR (transaction ID) from your payment app.</p>' +
      '<input id="utr" inputmode="numeric" maxlength="12" placeholder="12-digit UTR number" autocomplete="off">' +
      '<p class="mut" style="margin:14px 0 8px">3. Upload a screenshot of the payment.</p>' +
      '<input id="dshot" type="file" accept="image/*"><img id="dprev" alt="" style="display:none;max-height:150px;border-radius:10px;margin-top:8px"><div class="err" id="derr" role="alert"></div>' +
      '<button class="cta" data-a="depgo" data-n="' +
      n +
      '">Submit request</button>' +
      '<p class="mut" style="margin:12px 0 0;text-align:center;font-size:12px">We add the money after we check your payment. Wrong or fake UTR numbers and screenshots get the account blocked.</p>',
  );
  drawDepQR(upi, nm, n);
}
/* shrink a payment screenshot to a small JPEG (data URL) so it stays light in the database */
function shrinkShot(f) {
  return new Promise((res, rej) => {
    const im = new Image(),
      u = URL.createObjectURL(f);
    im.onload = () => {
      let mx = 1000,
        q = 0.7,
        out = "";
      for (let i = 0; i < 6; i++) {
        const k = Math.min(1, mx / Math.max(im.width, im.height)),
          c = document.createElement("canvas");
        c.width = Math.round(im.width * k);
        c.height = Math.round(im.height * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        out = c.toDataURL("image/jpeg", q);
        if (out.length < 400000) break;
        mx = Math.round(mx * 0.8);
        q = Math.max(0.4, q - 0.08);
      }
      URL.revokeObjectURL(u);
      res(out);
    };
    im.onerror = () => {
      URL.revokeObjectURL(u);
      rej(new Error("bad image"));
    };
    im.src = u;
  });
}
document.addEventListener("change", (e) => {
  if (!e.target || (e.target.id !== "dshot" && e.target.id !== "wdqr")) return;
  const f = e.target.files && e.target.files[0],
    p = $(e.target.id === "dshot" ? "dprev" : "wdprev");
  if (f && /^image\//.test(f.type)) {
    p.src = URL.createObjectURL(f);
    p.style.display = "block";
  } else if (p) p.style.display = "none";
});

function wdSheet() {
  const min = lim("minWithdraw", CFG.MIN_WITHDRAW);
  sheet(
    "Withdraw money",
    '<div class="kv"><span>Wallet balance</span><b>' +
      inr(WAL.b) +
      "</b></div>" +
      '<label for="wdamt" style="margin-top:14px">Amount (minimum ' +
      inr(min) +
      ')</label><input id="wdamt" inputmode="numeric" maxlength="5" placeholder="Enter amount">' +
      '<label for="wdupi">Your UPI ID</label><input id="wdupi" placeholder="yourname@upi" autocomplete="off" value="' +
      esc(UPIID) +
      '">' +
      '<p class="mut" style="margin:12px 0 4px;text-align:center">or</p>' +
      '<label for="wdqr">Upload your UPI QR image</label><input id="wdqr" type="file" accept="image/*"><img id="wdprev" alt="" style="display:none;max-height:150px;border-radius:10px;margin-top:8px">' +
      '<div class="err" id="wderr" role="alert"></div><button class="cta" data-a="wdgo">Request withdrawal</button>' +
      '<p class="mut" style="margin:12px 0 0;text-align:center;font-size:12px">The amount is held from your wallet now and sent to your UPI ID after we check. Bonus balance cannot be withdrawn. We may ask for ID proof (KYC).</p>',
  );
}
