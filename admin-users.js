/* GAMERZONE · Admin: users list and wallet split
   File 5 of 9 in this group. Keep the load order shown in admin.html. */
"use strict";
/* ---------- users ---------- */
function renderUseg() {
  const el = $("#useg");
  if (!el) return;
  const U = list(D.users);
  el.innerHTML = segHtml(
    [
      ["all", "All (" + U.length + ")"],
      ["active", "Active"],
      ["blocked", "Blocked (" + U.filter((u) => u.status === "blocked").length + ")"],
    ],
    F.uf,
  );
}
/* wallet in 3 parts: Deposit + Winnings = cash wallet, and Bonus is separate */
const winPart = (u) => Math.min(Math.max(+u.winBal || 0, 0), +u.wallet || 0);
const depPart = (u) => (+u.wallet || 0) - winPart(u);
function usersFiltered() {
  const q = F.uq.trim().toLowerCase();
  return list(D.users)
    .filter(
      (u) =>
        (F.uf === "all" || u.status === F.uf) &&
        (!q ||
          [u.name, u.phone, u.email, u.state].some((x) =>
            String(x || "")
              .toLowerCase()
              .includes(q),
          )),
    )
    .sort((a, b) => (b.joinedAt || 0) - (a.joinedAt || 0));
}
function exportUsers() {
  const U = usersFiltered(),
    q = (s) => '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"';
  const head = [
    "Name",
    "Phone",
    "Email",
    "State",
    "Joined",
    "Status",
    "Cash wallet (deposit + winnings)",
    "Deposit part",
    "Winnings part",
    "Bonus",
    "Total ever added",
    "Contests joined",
    "Contests finished",
    "Friends",
    "Won amount",
    "Wins",
    "VIP until",
    "Referral code",
  ];
  const rows = U.map((u) =>
    [
      u.name,
      u.phone,
      u.email,
      u.state,
      u.joinedAt ? new Date(u.joinedAt).toISOString().slice(0, 10) : "",
      u.status,
      u.wallet || 0,
      depPart(u),
      winPart(u),
      u.bonus || 0,
      u.depositTotal || 0,
      u.battles || 0,
      u.played || 0,
      u.refCount || 0,
      u.earned || 0,
      u.wins || 0,
      u.vipUntil ? new Date(u.vipUntil).toISOString().slice(0, 10) : "",
      u.refCode,
    ]
      .map(q)
      .join(","),
  );
  const blob = new Blob(["\ufeff" + head.map(q).join(",") + "\n" + rows.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const l = document.createElement("a");
  l.href = URL.createObjectURL(blob);
  l.download = "gamerzone-users-" + new Date().toISOString().slice(0, 10) + ".csv";
  document.body.appendChild(l);
  l.click();
  l.remove();
}
function usersHtml() {
  const all = list(D.users),
    s = $("#usum");
  if (s)
    s.textContent =
      all.length +
      " players · wallets " +
      inr(all.reduce((t, u) => t + (+u.wallet || 0), 0)) +
      " (deposit " +
      inr(all.reduce((t, u) => t + depPart(u), 0)) +
      ", winnings " +
      inr(all.reduce((t, u) => t + winPart(u), 0)) +
      ") · bonus " +
      inr(all.reduce((t, u) => t + (+u.bonus || 0), 0)) +
      " · ever added " +
      inr(all.reduce((t, u) => t + (+u.depositTotal || 0), 0)) +
      ". Block accounts you suspect of cheating or fraud.";
  const q = F.uq.trim().toLowerCase();
  const U = list(D.users)
    .filter(
      (u) =>
        (F.uf === "all" || u.status === F.uf) &&
        (!q ||
          [u.name, u.phone, u.email, u.state].some((x) =>
            String(x || "")
              .toLowerCase()
              .includes(q),
          )),
    )
    .sort((a, b) => (b.joinedAt || 0) - (a.joinedAt || 0));
  if (!U.length)
    return (
      '<p class="empty">' +
      (list(D.users).length ? "No users match this search." : "No players have signed up yet.") +
      "</p>"
    );
  return (
    '<div class="tw"><table class="tbl"><thead><tr><th>Player</th><th>State</th><th>Joined</th><th class="r">Wallet</th><th class="r">Deposit</th><th class="r">Winnings</th><th class="r">Bonus</th><th class="r">Ever added</th><th class="r">Contests</th><th class="r">Finished</th><th class="r">Friends</th><th class="r">Won</th><th>VIP</th><th>Status</th><th></th></tr></thead><tbody>' +
    U.map(
      (u) =>
        '<tr data-uid="' +
        esc(u.id) +
        '"><td data-l="Player"><span><b>' +
        esc(u.name) +
        "</b><small>" +
        esc(u.phone || "") +
        (u.email ? " · " + esc(u.email) : "") +
        '</small></span></td><td data-l="State">' +
        esc(u.state || "-") +
        '</td><td data-l="Joined">' +
        day(u.joinedAt) +
        '</td><td data-l="Wallet" class="r"><b>' +
        inr(u.wallet) +
        '</b></td><td data-l="Deposit" class="r">' +
        inr(depPart(u)) +
        '</td><td data-l="Winnings" class="r">' +
        inr(winPart(u)) +
        '</td><td data-l="Bonus" class="r">' +
        inr(u.bonus) +
        '</td><td data-l="Ever added" class="r">' +
        inr(u.depositTotal) +
        '</td><td data-l="Contests" class="r">' +
        (u.battles || 0) +
        '</td><td data-l="Finished" class="r">' +
        (u.played || 0) +
        '</td><td data-l="Friends" class="r">' +
        (u.refCount || 0) +
        '</td><td data-l="Won" class="r">' +
        inr(u.earned) +
        '</td><td data-l="VIP">' +
        (u.vipUntil > Date.now() ? '<span class="badge b-active">VIP</span>' : "-") +
        '</td><td data-l="Status"><span class="badge b-' +
        (u.status === "blocked" ? "blocked" : "active") +
        '">' +
        (u.status === "blocked" ? "Blocked" : "Active") +
        '</span></td><td class="act">' +
        (u.status === "blocked"
          ? '<button class="btn ok sm" data-act="unblock">Unblock</button>'
          : '<button class="btn danger sm" data-act="block">Block</button>') +
        "</td></tr>",
    ).join("") +
    "</tbody></table></div>"
  );
}
async function setBlocked(uid, block) {
  const u = D.users[uid];
  if (!u) return;
  if (
    !(await ask({
      title: (block ? "Block " : "Unblock ") + u.name + "?",
      body: block
        ? 'They will see an "Account suspended" screen in the app and cannot join, add money or withdraw. Pending requests cannot be approved while blocked.'
        : "They can play and use their wallet again.",
      ok: block ? "Block user" : "Unblock user",
      danger: block,
    }))
  )
    return;
  await DB.update(
    "users/" + uid,
    block ? { status: "blocked", blockedAt: Date.now() } : { status: "active", blockedAt: null },
  );
  DB.update("profiles/" + uid, { hidden: block ? true : null }).catch(() => {});
  toast(u.name + (block ? " is blocked" : " is unblocked"));
}
