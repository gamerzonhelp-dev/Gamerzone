/* GAMERZONE · Pay sheet and wallet screen
   File 7 of 11 in this group. Keep the load order shown in index.html. */
let PX = null,
  TX = [],
  UPIID = "",
  UIDB = "";
const PM = [
  ["gpay", "Google Pay", "#4285f4", "G", "#fff"],
  ["phonepe", "PhonePe", "#5f259f", "P", "#fff"],
  ["paytm", "Paytm", "#00baf2", "P", "#fff"],
  ["upi", "Any UPI ID", "#00ff88", "@", "#04150d"],
];
const BONUS_PCT = 15;
const bnU = (o) =>
  o.kind === "Entry fee" ? Math.min(WAL.bn, Math.floor((o.amt * BONUS_PCT) / 100)) : 0;
const payAmt = (o) => o.amt - (o.useB ? bnU(o) : 0);
function payFlow(o) {
  if (RST.includes(PF.state)) {
    openBlock("geo", PF.state);
    return;
  }
  PX = o;
  o.useB = bnU(o) > 0;
  o.m = o.wallet !== false && WAL.b >= payAmt(o) ? "wallet" : "gpay";
  payView();
}
function payView() {
  const o = PX,
    wl = o.wallet !== false,
    pa = payAmt(o),
    low = WAL.b < pa,
    ub = bnU(o);
  sheet(
    "Pay ₹" + pa,
    '<div class="pay-h"><small>' +
      esc(o.title) +
      "</small><strong>₹" +
      pa +
      "</strong>" +
      (o.useB ? "<small>₹" + o.amt + " − ₹" + ub + " bonus</small>" : "") +
      "</div>" +
      (ub > 0
        ? '<button class="pmr' +
          (o.useB ? " on" : "") +
          '" data-a="bnuse"><span class="pmi" style="background:#8a6a1a">🎁</span><div>Use bonus balance<small>Save ₹' +
          ub +
          " · bonus ₹" +
          WAL.bn +
          "</small></div>" +
          (o.useB
            ? '<i style="margin-left:auto;color:var(--green);font-style:normal;font-size:18px">✓</i>'
            : "") +
          "</button>"
        : "") +
      (wl
        ? '<button class="pmr' +
          (o.m === "wallet" ? " on" : "") +
          '" data-a="pmsel" data-m="wallet"' +
          (low ? " disabled" : "") +
          '><span class="pmi" style="background:#1d5a42">₹</span><div>Wallet<small>Balance ₹' +
          WAL.b +
          (low ? " · not enough" : "") +
          "</small></div></button>"
        : "") +
      PM.map(
        (x) =>
          '<button class="pmr' +
          (o.m === x[0] ? " on" : "") +
          '" data-a="pmsel" data-m="' +
          x[0] +
          '"><span class="pmi" style="background:' +
          x[2] +
          ";color:" +
          x[4] +
          '">' +
          x[3] +
          "</span><div>" +
          x[1] +
          "<small>" +
          (x[0] === "upi" ? "Enter your UPI ID" : "Pay with the app") +
          "</small></div></button>",
      ).join("") +
      (o.m === "upi"
        ? '<input id="upiid" placeholder="yourname@upi" autocomplete="off" value="' +
          esc(UPIID) +
          '">'
        : "") +
      '<div class="err" id="payerr" role="alert"></div><button class="cta" data-a="paygo">Pay ₹' +
      pa +
      '</button><p class="mut" style="margin:12px 0 0;text-align:center;font-size:12px">18+ only. Pay with UPI.</p>',
  );
}
function walSheet() {
  sheet(
    "Wallet",
    '<div class="kv"><span>Balance</span><b>₹' +
      WAL.b +
      "</b></div>" +
      (WAL.bn ? '<div class="kv"><span>Bonus balance</span><b>₹' + WAL.bn + "</b></div>" : "") +
      '<label for="wamt" style="margin-top:14px">Add money</label><div class="fl" style="margin-bottom:12px">' +
      [50, 100, 200, 500]
        .map((n) => '<button class="chip" data-a="wamt" data-n="' + n + '">₹' + n + "</button>")
        .join("") +
      '</div><input id="wamt" inputmode="numeric" maxlength="5" placeholder="Enter amount" value="100"><div class="err" id="werr" role="alert"></div><button class="cta" data-a="wadd">Add money</button><p class="mut" style="margin:12px 0 0;text-align:center;font-size:12px">Pay with Google Pay, PhonePe, Paytm or any UPI ID.</p>',
  );
}
function walletSec() {
  return (
    '<div class="sech" style="margin-top:24px"><div><div class="eye"><i></i>WALLET &amp; PAYMENTS</div><h2>₹' +
    WAL.b +
    (WAL.bn
      ? ' <small style="font-size:13px;color:#ffd66b;font-weight:400">+ ₹' +
        WAL.bn +
        " bonus</small>"
      : "") +
    '</h2></div><button class="btn" data-a="wal">Add money</button></div><div class="pyl"><span>UPI</span><span>Google Pay</span><span>PhonePe</span><span>Paytm</span></div>' +
    (TX.length
      ? TX.slice(0, 5)
          .map(
            (t) =>
              '<div class="lb" style="cursor:default"><div class="nm">' +
              esc(t.k) +
              "<small>" +
              esc(t.d) +
              " · " +
              t.m +
              " · " +
              ago(t.t) +
              '</small></div><span class="am" style="color:' +
              (t.a > 0 ? "var(--green)" : "#ff6b6b") +
              '">' +
              (t.a > 0 ? "+" : "−") +
              "₹" +
              Math.abs(t.a) +
              "</span></div>",
          )
          .join("")
      : '<p class="mut">No payments yet. Entry fees, top-ups and VIP purchases will show here.</p>')
  );
}
