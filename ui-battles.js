/* GAMERZONE · Contest list, contest details, joining, player search
   File 4 of 11 in this group. Keep the load order shown in index.html. */
const PL = [],
  FLG = new Set(),
  FLW = new Set();
const MD = ["🥇", "🥈", "🥉"],
  WAL = { b: 0, bn: 0 },
  JN = new Set(),
  JI = {};
let UID = "",
  BS = "c",
  BF = "all";
var LBL = function () {
    return [];
  },
  OPENA = function () {
    return CS.filter((c) => c.status === "upcoming" && phase(c) === "up");
  },
  OPENC = function () {
    return OPENA().filter((c) => BF === "all" || c.mode === BF);
  };
const NOW = Date.now();
const CS = [];
const pad = (n) => String(n).padStart(2, "0");
function fmt(ms) {
  const s = Math.floor(ms / 1000),
    h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60);
  return h ? h + "h " + pad(m) + "m" : pad(m) + ":" + pad(s % 60);
}
const pool = (c) => c.pz.reduce((a, b) => a + b, 0);
function renderB() {
  const tot = OPENA().reduce((a, c) => a + pool(c), 0),
    mine = CS.filter((c) => JN.has(c.id));
  let body;
  if (BS === "c") {
    body =
      '<div class="fl">' +
      [
        ["all", "All"],
        ["SOLO", "Solo"],
        ["DUO", "Duo"],
        ["SQUAD", "Squad"],
        ["1V1", "1v1"],
      ]
        .map(
          (f) =>
            '<button class="chip' +
            (BF === f[0] ? " on" : "") +
            '" data-a="bf" data-f="' +
            f[0] +
            '">' +
            f[1] +
            "</button>",
        )
        .join("") +
      "</div>" +
      (OPENC().length
        ? OPENC().map(cardH).join("")
        : '<p class="mut" style="padding:30px 0;text-align:center">No open contests right now. Check back soon.</p>') +
      '<p class="mut" style="margin:16px 0 0;text-align:center;font-size:12px">18+ only · Play responsibly</p>';
  } else if (BS === "m") {
    body = mine.length
      ? mine.map(myH).join("")
      : '<div class="empty" style="padding:50px 20px"><h2>No battles yet</h2><p>Join a contest to see your room details here.</p><button class="cta" data-a="bseg" data-s="c" style="margin-top:18px;max-width:220px;margin-left:auto;margin-right:auto">Browse contests</button></div>';
  } else if (BS === "k") {
    body = window.clanHtml ? clanHtml() : "";
  } else {
    body =
      '<p class="mut" style="margin:0 0 6px;font-size:13px">Top players by winnings</p>' +
      (LBL().length
        ? LBL()
            .map((p, i) => [p, i])
            .map(
              (x, r) =>
                '<div class="lb"><span class="rk">' +
                (MD[r] || r + 1) +
                '</span><div class="av" style="background:linear-gradient(135deg,' +
                x[0].g +
                ')">' +
                x[0].i +
                '</div><div class="nm">' +
                esc(x[0].n) +
                "<small>" +
                x[0].w +
                ' wins</small></div><span class="am">₹' +
                x[0].e +
                "</span></div>",
            )
            .join("")
        : '<p class="mut" style="padding:20px 0">No winners yet. Be the first!</p>');
  }
  $("v-battles").innerHTML =
    '<div class="sech"><div><div class="eye"><i></i>BATTLE ARENA</div><h2>Battles</h2></div><button class="wal" data-a="wal">Wallet <b>₹' +
    WAL.b +
    '</b></button></div><div class="hero"><small>LIVE CONTESTS</small><h3>Join a contest. Win the prize pool.</h3><p>Pick a room, pay the entry fee and play.</p><div class="hs"><div><b>' +
    OPENA().length +
    "</b>Contests</div><div><b>₹" +
    tot +
    "</b>Total prizes</div><div><b>" +
    mine.length +
    '</b>Joined</div></div></div><div class="seg">' +
    [
      ["c", "Contests"],
      ["m", "My battles"],
      ["l", "Leaderboard"],
      ["k", "Clans"],
    ]
      .map(
        (s) =>
          '<button class="' +
          (BS === s[0] ? "on" : "") +
          '" data-a="bseg" data-s="' +
          s[0] +
          '">' +
          s[1] +
          "</button>",
      )
      .join("") +
    "</div>" +
    body;
  tick();
}
function detSheet(c) {
  sheet(
    esc(c.name),
    '<div class="kv"><span>Game</span><b>' +
      (c.g === "BGMI" ? "BGMI" : "Free Fire") +
      '</b></div><div class="kv"><span>Format</span><b>' +
      c.mode +
      (c.tsz > 1 ? " · " + c.tsz + " per team" : "") +
      '</b></div><div class="kv"><span>Entry fee' +
      (c.tsz > 1 ? " (per team)" : "") +
      "</span><b>" +
      (c.fee ? "₹" + c.fee : "FREE") +
      '</b></div><div class="kv"><span>Slots</span><b>' +
      c.j +
      "/" +
      c.slots +
      '</b></div><div class="kv"><span>Prize pool</span><b>₹' +
      pool(c) +
      "</b></div>" +
      c.pz
        .map(
          (p, i) =>
            '<div class="kv"><span>' +
            MD[i] +
            " " +
            ["1st", "2nd", "3rd"][i] +
            " place</span><b>₹" +
            p +
            "</b></div>",
        )
        .join("") +
      '<div class="hd">How it works</div><ol class="ol"><li>Join with your Free Fire UID and pay the entry fee.</li><li>Room ID and password appear in My battles 10 minutes before start.</li><li>Enter the room on time and play fair.</li><li>Winners are verified and prizes are credited to the wallet.</li></ol><div class="hd">Rules</div><ol class="ol"><li>Use your own UID. One account per player.</li><li>Hacks, teaming or emulator abuse means disqualification, no refund.</li>' +
      (c.tsz > 1
        ? "<li>The entry fee is per team. The captain pays, joins and enters the teammates. Prizes go to the captain’s wallet.</li>"
        : "") +
      (c.fan ? "<li>Fan match: only players who follow GAMERZONE Official can join.</li>" : "") +
      (c.minp
        ? "<li>This contest starts only if " +
          c.minp +
          "+ players join, otherwise entry fees are refunded.</li>"
        : "") +
      "</ol>",
  );
}
function joinSheet(c) {
  const team = c.tsz > 1,
    fol = !c.fan || FLG.has("official");
  let t =
    '<div class="kv"><span>Entry fee' +
    (team ? " (per team)" : "") +
    "</span><b>" +
    (c.fee ? "₹" + c.fee : "FREE") +
    '</b></div><div class="kv"><span>Wallet balance</span><b>₹' +
    WAL.b +
    "</b></div>";
  if (!fol) {
    sheet(
      "Join " + esc(c.name),
      t +
        '<p class="mut" style="margin:14px 0">This is a fan match. Follow GAMERZONE Official to unlock it.</p><button class="cta" data-a="folof" data-id="' +
        c.id +
        '">Follow GAMERZONE Official</button>',
    );
    return;
  }
  if (team)
    t +=
      '<label for="tname" style="margin-top:14px">Team name</label><input id="tname" maxlength="16" placeholder="Your team name">';
  t +=
    '<label for="uid" style="margin-top:14px">' +
    (team ? "Captain " : "") +
    (c.g === "BGMI" ? "BGMI Character ID" : "Free Fire UID") +
    '</label><input id="uid" inputmode="numeric" maxlength="12" placeholder="e.g. 5827361904" value="' +
    esc(c.g === "BGMI" ? UIDB : UID) +
    '"><label for="ign">In-game name</label><input id="ign" maxlength="20" placeholder="Your in-game name" value="' +
    esc(ME === "you" ? "" : ME) +
    '">';
  for (let k = 1; k < c.tsz; k++)
    t +=
      '<div class="hd" style="margin:14px 0 4px">Teammate ' +
      k +
      '</div><input id="tmi' +
      k +
      '" maxlength="20" placeholder="In-game name"><input id="tmu' +
      k +
      '" inputmode="numeric" maxlength="12" placeholder="Game ID (8-12 digits)" style="margin-top:8px">';
  t +=
    '<div class="err" id="jerr" role="alert"></div><button class="cta" data-a="bpay" data-id="' +
    c.id +
    '">' +
    (c.fee ? "Pay ₹" + c.fee + " &amp; Join" : "Join free") +
    '</button><p class="mut" style="margin:12px 0 0;text-align:center;font-size:12px">' +
    (team ? "The captain pays for the whole team and receives the prize. " : "") +
    "18+ only. Play responsibly.</p>";
  sheet("Join " + esc(c.name), t);
}
function avh(p) {
  return (
    '<div class="av" style="background:' +
    (p.pic ? "url('" + p.pic + "') center/cover" : "linear-gradient(135deg," + p.g + ")") +
    '">' +
    (p.pic ? "" : esc(p.i)) +
    "</div>"
  );
}
function profSheet(i) {
  const p = PL[i];
  if (!p) return;
  sheet(
    "Player profile",
    '<div class="pfh">' +
      avh(p) +
      '<b style="font-size:18px;font-weight:500">' +
      esc(p.n) +
      "</b>" +
      (p.v ? '<span class="vf"></span>' : "") +
      '<span class="ttl">' +
      esc(titleOf(p.b, p.w, p.u)) +
      "</span>" +
      (p.ct ? '<span class="ttl">[' + esc(p.ct) + "]</span>" : "") +
      (p.bio ? '<div class="mut" style="margin:6px 0 0">' + esc(p.bio) + "</div>" : "") +
      (p.id
        ? '<div class="mut" style="margin:4px 0 0">Free Fire ID: ' + esc(p.id) + "</div>"
        : "") +
      '</div><div class="pfs"><div><b>' +
      p.fl +
      "</b>Followers</div><div><b>" +
      p.b +
      "</b>Battles</div><div><b>" +
      p.w +
      '</b>Wins</div></div><div class="two"><button class="btn" data-a="pfol" data-n="' +
      i +
      '" style="grid-column:1/-1;' +
      (p.fol ? "color:#00ff88;border-color:#00ff88" : "") +
      '">' +
      (p.fol ? "Following" : "Follow") +
      "</button></div>",
  );
}
function srow(p, i) {
  return (
    '<div class="sr" data-a="pf" data-n="' +
    i +
    '">' +
    avh(p) +
    '<div class="nt"><b>' +
    esc(p.n) +
    "</b>" +
    (p.v ? '<span class="vf"></span>' : "") +
    "<br><small>" +
    (p.id ? "ID: " + esc(p.id) + " · " : "") +
    p.fl +
    ' followers</small></div><button class="fol' +
    (p.fol ? " on" : "") +
    '" data-a="pfol" data-n="' +
    i +
    '">' +
    (p.fol ? "Following" : "Follow") +
    "</button></div>"
  );
}
function sres(q) {
  q = q.trim().toLowerCase();
  const L = PL.map((p, i) => [p, i]).filter(
    (x) => !q || x[0].n.toLowerCase().includes(q) || x[0].id.includes(q),
  );
  $("sl2").innerHTML =
    (q ? "" : '<div class="ng">Suggested players</div>') +
    (L.map((x) => srow(x[0], x[1])).join("") ||
      '<p class="mut" style="padding:30px 16px">' +
        (q
          ? 'No player found for "' + esc(q) + '".'
          : "No players to show yet. Players you can follow will appear here.") +
        "</p>");
}
function openSearch() {
  $("nwrap").innerHTML =
    '<div class="nh"><button data-a="nback" aria-label="Back">' +
    svg("back") +
    '</button><input id="sq" placeholder="Search players by name or ID" autocomplete="off"></div><div id="sl2"></div>';
  $("nv").classList.add("on");
  $("nv").scrollTop = 0;
  const i = $("sq");
  i.oninput = () => sres(i.value);
  sres("");
  i.focus();
}
function ext2(a, b) {
  const d = b.dataset,
    c = CS.find((x) => x.id == d.id);
  if (a === "bseg") {
    BS = d.s;
    renderB();
    return 1;
  }
  if (a === "bf") {
    BF = d.f;
    renderB();
    return 1;
  }
  if (a === "bdet" && c) {
    detSheet(c);
    return 1;
  }
  if (a === "bjoin" && c) {
    if (JN.has(c.id)) return 1;
    if (c.st <= Date.now()) {
      toast("Registration closed, match has started");
      return 1;
    }
    if (!canJoin(c)) {
      if (c.j < c.slots) vipSheet();
      else toast("This contest is full");
      return 1;
    }
    joinSheet(c);
    return 1;
  }
  if (a === "bpay" && c) {
    const u = $("uid").value.trim(),
      n = $("ign").value.trim(),
      er = $("jerr");
    if (!/^\d{8,12}$/.test(u)) {
      er.textContent =
        "Enter a valid " +
        (c.g === "BGMI" ? "BGMI Character ID" : "Free Fire UID") +
        " (8-12 digits).";
      return 1;
    }
    if (!n) {
      er.textContent = "Enter your in-game name.";
      return 1;
    }
    if (!canJoin(c)) {
      er.textContent = "This contest just filled up.";
      return 1;
    }
    payFlow({
      title: "Entry fee · " + c.name,
      kind: "Entry fee",
      amt: c.fee,
      wallet: true,
      done: (pa) => {
        c.j++;
        if (isVip() && c.vj < c.vip) c.vj++;
        JN.add(c.id);
        JI[c.id] = { uid: u, ign: n, paid: pa };
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
    return 1;
  }
  if (a === "wal") {
    walSheet();
    return 1;
  }
  if (a === "pf") {
    profSheet(+d.n);
    return 1;
  }
  if (a === "pfol") {
    if (window.gzFollow) window.gzFollow(+d.n, b);
    return 1;
  }
  return ext3(a, b);
}
