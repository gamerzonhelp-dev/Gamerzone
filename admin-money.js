/* GAMERZONE · Admin: payments, withdrawals, settings
   File 6 of 9 in this group. Keep the load order shown in admin.html. */
"use strict";
/* ---------- payments ---------- */
function renderPseg() {
  const P = list(D.payments),
    c = (t, s) => P.filter((p) => p.type === t && p.status === s).length;
  $("#ptseg").innerHTML = segHtml(
    [
      ["withdrawal", "Withdrawals (" + c("withdrawal", "pending") + " pending)"],
      ["deposit", "Deposits (" + c("deposit", "pending") + " pending)"],
    ],
    F.ptype,
  );
  $("#psseg").innerHTML = segHtml(
    [
      ["pending", "Pending"],
      ["approved", "Approved"],
      ["rejected", "Rejected"],
      ["all", "All"],
    ],
    F.pst,
  );
}
function payHtml() {
  const P = list(D.payments)
    .filter((p) => p.type === F.ptype && (F.pst === "all" || p.status === F.pst))
    .sort((a, b) => (F.pst === "pending" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt));
  if (!P.length)
    return (
      '<p class="empty">No ' +
      (F.pst === "all" ? "" : F.pst + " ") +
      (F.ptype === "deposit" ? "deposit" : "withdrawal") +
      " requests.</p>"
    );
  return (
    '<div class="tw"><table class="tbl"><thead><tr><th>Player</th><th class="r">Amount</th><th>' +
    (F.ptype === "deposit" ? "UTR number" : "Pay out to") +
    "</th><th>Requested</th><th>Status</th><th></th></tr></thead><tbody>" +
    P.map((p) => {
      const u = D.users[p.uid] || { name: "Unknown user", wallet: 0 };
      return (
        '<tr data-pid="' +
        esc(p.id) +
        '"><td data-l="Player"><span><b>' +
        esc(u.name) +
        (u.status === "blocked" ? " (blocked)" : "") +
        "</b><small>Wallet " +
        inr(u.wallet) +
        '</small></span></td><td data-l="Amount" class="r"><b>' +
        inr(p.amount) +
        '</b></td><td data-l="' +
        (F.ptype === "deposit" ? "UTR" : "Pay out to") +
        '">' +
        esc(p.ref || "-") +
        '</td><td data-l="Requested">' +
        when(p.createdAt) +
        "</td>" +
        '<td data-l="Status"><span><span class="badge b-' +
        p.status +
        '">' +
        ({ pending: "Pending", approved: "Approved", rejected: "Rejected" }[p.status] ||
          esc(p.status)) +
        "</span>" +
        (p.note ? "<small>" + esc(p.note) + "</small>" : "") +
        "</span></td>" +
        '<td class="act">' +
        (p.imgId || p.qrId
          ? '<button class="btn sm" data-act="pshot">' +
            (p.qrId ? "View QR" : "Screenshot") +
            "</button>"
          : "") +
        (p.status === "pending"
          ? '<button class="btn ok sm" data-act="approve">Approve</button><button class="btn danger sm" data-act="reject">Reject</button>'
          : "") +
        "</td></tr>"
      );
    }).join("") +
    "</tbody></table></div>"
  );
}
async function approvePay(id) {
  const p = D.payments[id];
  if (!p || p.status !== "pending") return;
  const u = D.users[p.uid];
  if (!u) return toast("This user no longer exists.", true);
  if (u.status === "blocked") return toast("This user is blocked. Unblock them first.", true);
  const wd = p.type === "withdrawal",
    deduct = wd && CONFIG.WITHDRAW_DEDUCT_ON_APPROVE;
  if (deduct && (u.wallet || 0) < p.amount)
    return toast("Wallet has only " + inr(u.wallet) + ". Cannot pay " + inr(p.amount) + ".", true);
  const ok = await ask({
    title: (wd ? "Approve withdrawal of " : "Approve deposit of ") + inr(p.amount) + "?",
    ok: "Approve",
    body: wd
      ? "Send <b>" +
        inr(p.amount) +
        "</b> to UPI ID <b>" +
        esc(p.ref) +
        "</b> (" +
        esc(u.name) +
        ") from your bank or UPI app first, then approve. The amount was already held from their wallet."
      : "Check that UTR <b>" +
        esc(p.ref) +
        "</b> for " +
        inr(p.amount) +
        " really reached your account. The money is added to " +
        esc(u.name) +
        "\u2019s wallet.",
  });
  if (!ok) return;
  if (!(await DB.claim("payments/" + id + "/status", "pending", "approved")))
    return toast("Someone already handled this request.", true);
  let applied = true;
  if (!wd) {
    applied = await DB.inc("users/" + p.uid + "/wallet", p.amount, { min: 0 });
    if (applied) await DB.inc("users/" + p.uid + "/depositTotal", p.amount);
  } else if (deduct) applied = await DB.inc("users/" + p.uid + "/wallet", -p.amount, { min: 0 });
  if (!applied) {
    await DB.set("payments/" + id + "/status", "pending");
    return toast("Wallet could not be updated, so the request is back in pending.", true);
  }
  await DB.update("payments/" + id, { handledAt: Date.now() });
  toast(wd ? "Withdrawal approved" : "Deposit approved, wallet credited");
}
async function rejectPay(id) {
  const p = D.payments[id];
  if (!p || p.status !== "pending") return;
  const reason = await ask({
    title: "Reject " + p.type + " of " + inr(p.amount) + "?",
    body:
      "The player will see the reason you enter." +
      (p.type === "withdrawal" && !CONFIG.WITHDRAW_DEDUCT_ON_APPROVE
        ? " The held money goes back to their wallet."
        : ""),
    ok: "Reject request",
    danger: true,
    field: { label: "Reason", ph: "e.g. Payment not found", max: 80, req: true },
  });
  if (reason === false) return;
  if (!(await DB.claim("payments/" + id + "/status", "pending", "rejected")))
    return toast("Someone already handled this request.", true);
  if (p.type === "withdrawal" && !CONFIG.WITHDRAW_DEDUCT_ON_APPROVE)
    await DB.inc("users/" + p.uid + "/wallet", p.amount, { min: 0 });
  await DB.update("payments/" + id, { handledAt: Date.now(), note: reason });
  toast("Request rejected");
}

/* ---------- settings ---------- */
function settingsHtml() {
  const c = D.conf || {},
    fb = DB.mode === "firebase";
  return (
    '<div class="ph"><h1>Settings</h1><p>Payment details shown to players, and data tools.</p></div>' +
    '<section class="panel" style="margin-bottom:14px"><h2>Payments</h2><form id="cf" class="grid" novalidate>' +
    '<label class="f span2">Your UPI ID (players pay here)<input name="upiId" maxlength="60" placeholder="yourname@bank" value="' +
    esc(c.upiId) +
    '"></label>' +
    '<label class="f span2">Name shown with it<input name="upiName" maxlength="40" placeholder="GAMERZONE" value="' +
    esc(c.upiName || "GAMERZONE") +
    '"></label>' +
    '<label class="f">Minimum deposit (₹)<input name="minDeposit" type="number" min="1" step="1" value="' +
    esc(c.minDeposit || 10) +
    '"></label>' +
    '<label class="f">Maximum deposit (₹)<input name="maxDeposit" type="number" min="1" step="1" value="' +
    esc(c.maxDeposit || 10000) +
    '"></label>' +
    '<label class="f">Minimum withdrawal (₹)<input name="minWithdraw" type="number" min="1" step="1" value="' +
    esc(c.minWithdraw || 100) +
    '"></label>' +
    '<label class="f">Maximum withdrawal (₹)<input name="maxWithdraw" type="number" min="1" step="1" value="' +
    esc(c.maxWithdraw || 10000) +
    '"></label>' +
    '<label class="f span2">Support email shown to blocked players<input name="supportEmail" type="email" maxlength="80" value="' +
    esc(c.supportEmail || "GAMERZONE.HELP@gmail.com") +
    '"></label>' +
    '<p class="err full" id="cferr" role="alert"></p><div class="full"><button class="btn primary">Save settings</button></div></form></section>' +
    '<section class="panel"><h2>Data</h2><p class="sub" style="margin-bottom:12px">' +
    (fb
      ? "Connected to your Firebase database. Every phone and this panel share the same live data."
      : "Data is kept in this browser only (test mode). The app and this panel share it when opened from the same place. To go live, switch BACKEND to \u2018firebase\u2019 in both files.") +
    "</p>" +
    (fb
      ? ""
      : '<p class="sub" style="margin-bottom:12px">Demo players (password <b>demo123</b>): 9876500001 Rahul, 9876500002 Priya, 9876500003 Aman (blocked), 9876500004 Vikram, 9876500005 Neha. Demo data exists only in this browser and is never sent to Firebase.</p>') +
    '<div class="macts" style="margin-top:0">' +
    (fb ? "" : '<button class="btn" data-act="demo">Restore demo data</button>') +
    '<button class="btn danger" data-act="fresh">Start fresh (delete everything)</button></div></section>'
  );
}
function bindSettings() {
  $("#cf").onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target,
      v = (k) => f.elements[k].value.trim(),
      er = $("#cferr");
    const o = {
      upiId: v("upiId"),
      upiName: v("upiName"),
      minDeposit: +v("minDeposit"),
      maxDeposit: +v("maxDeposit"),
      minWithdraw: +v("minWithdraw"),
      maxWithdraw: +v("maxWithdraw"),
      supportEmail: v("supportEmail"),
    };
    if (o.upiId && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(o.upiId))
      return (er.textContent = "Enter a valid UPI ID, like name@bank.");
    if (!(o.minDeposit >= 1 && o.maxDeposit >= o.minDeposit))
      return (er.textContent = "Check the deposit limits.");
    if (!(o.minWithdraw >= 1 && o.maxWithdraw >= o.minWithdraw))
      return (er.textContent = "Check the withdrawal limits.");
    er.textContent = "";
    try {
      await DB.set("config/payment", o);
      toast("Settings saved");
    } catch (x) {
      er.textContent = "Could not save: " + x.message;
    }
  };
}
