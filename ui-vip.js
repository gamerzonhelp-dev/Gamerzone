/* GAMERZONE · VIP and the dashboard
   File 6 of 11 in this group. Keep the load order shown in index.html. */
var VIP;
function vs() {
  return VIP || (VIP = { on: 0, until: 0 });
}
function isVip() {
  const v = vs();
  return !!v.on && v.until > Date.now();
}
function vipB() {
  return isVip() ? '<span class="vbd">⭐ VIP</span>' : "";
}
function vdate() {
  return new Date(vs().until).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
const regLeft = (c) => Math.max(0, c.slots - c.vip - (c.j - c.vj));
const canJoin = (c) => c.j < c.slots && (isVip() || regLeft(c) > 0);
function cardH(c) {
  const full = c.j >= c.slots,
    jn = JN.has(c.id),
    free = c.slots - c.j,
    rl = regLeft(c),
    vo = Math.max(0, free - rl),
    left = isVip() ? free : rl,
    gate = !full && !isVip() && rl === 0;
  return (
    '<div class="bc"><div class="bt"><div><span class="tag g">' +
    c.g +
    '</span> <span class="tag">' +
    c.mode +
    "</span>" +
    (c.fan ? ' <span class="tag">⭐ FAN MATCH</span>' : "") +
    '</div><span class="cd" data-cd="' +
    c.st +
    '"></span></div><h3>' +
    c.name +
    '</h3><div class="sub">' +
    c.sub +
    '</div><div class="pz"><div><small>Prize pool</small><strong>₹' +
    pool(c) +
    '</strong></div><div class="medals">' +
    c.pz.map((p, i) => "<span>" + MD[i] + " ₹" + p + "</span>").join("") +
    '</div></div><div class="sl"><span>' +
    c.j +
    "/" +
    c.slots +
    (c.tsz > 1 ? " teams" : "") +
    " joined</span><span>" +
    left +
    " left" +
    (!isVip() && vo ? " · ⭐ " + vo + " VIP only" : "") +
    '</span></div><div class="pb"><i style="width:' +
    (c.j / c.slots) * 100 +
    '%"></i></div><div class="bf"><div class="fee">Entry<b>' +
    (c.fee ? "₹" + c.fee : "FREE") +
    '</b></div><button class="dl" data-a="bdet" data-id="' +
    c.id +
    '">Details</button><button class="cta' +
    (gate ? " gd" : "") +
    '" data-a="' +
    (gate ? "vipopen" : "bjoin") +
    '" data-id="' +
    c.id +
    '"' +
    (full || jn ? " disabled" : "") +
    ">" +
    (jn
      ? "Joined ✓"
      : full
        ? "Full"
        : gate
          ? "Full · Get VIP"
          : (c.fee ? "Join · ₹" + c.fee : "Join · FREE") +
            (isVip() && rl === 0 ? " · VIP slot" : "")) +
    "</button></div></div>"
  );
}
function vipSheet() {
  const on = isVip();
  sheet(
    "Top VIP Player",
    '<div class="vipc"><div class="vstar">⭐</div><div><b>Top VIP Player</b><small>₹49 / month</small></div></div><ul class="vl2"><li><b>Priority slot</b><span>Reserved VIP spots in every contest, even when regular slots are full.</span></li><li><b>Exclusive VIP badge</b><span>Gold badge on your profile, posts and story.</span></li></ul>' +
      (on
        ? '<div class="kv"><span>Status</span><b style="color:#ffd60a">Active</b></div><div class="kv"><span>Valid until</span><b>' +
          vdate() +
          "</b></div>"
        : '<div class="kv"><span>Wallet balance</span><b>₹' + WAL.b + "</b></div>") +
      '<div class="err" id="verr" role="alert"></div><button class="cta vipb" data-a="vipbuy">' +
      (on ? "Extend 30 days · ₹49" : "Get VIP · ₹49 / month") +
      '</button><p class="mut" style="margin:12px 0 0;text-align:center;font-size:12px">Paid from your wallet. 18+ only.</p>',
  );
}
function renderD() {
  const my = POSTS.filter((p) => p.mine),
    mine = CS.filter((c) => JN.has(c.id)),
    fl = FLG.size,
    vp = isVip();
  const xp = mine.length * 100 + my.length * 30 + (MY ? 20 : 0) + fl * 5 + (vp ? 100 : 0),
    lv = Math.floor(xp / 100) + 1,
    pr = xp % 100,
    nxt = mine
      .filter((c) => !c.rf && c.st + c.dur * 6e4 > Date.now())
      .sort((a, b) => a.st - b.st)[0];
  const bd = [
      ["🎮", "Battle Ready", mine.length > 0],
      ["📸", "First Post", my.length > 0],
      ["✨", "Storyteller", !!MY],
      ["🤝", "Social", fl >= 3],
      ["⭐", "VIP", vp],
      ["🏆", "Champion", false],
    ],
    un = bd.filter((x) => x[2]).length;
  $("v-dashboard").innerHTML =
    '<div class="sech"><div><div class="eye"><i></i>YOUR ARENA</div><h2>Dashboard</h2></div></div>' +
    '<div class="dc">' +
    avH(0) +
    '<div class="dn"><b>' +
    esc(PF.name || "Player") +
    "</b>" +
    vipB() +
    '<div class="lvl"><span>Level ' +
    lv +
    "</span><span>" +
    pr +
    '/100 XP</span></div><div class="pb"><i style="width:' +
    pr +
    '%"></i></div></div></div>' +
    '<div class="dg"><div class="ds g"><span>💰</span><b>₹' +
    WAL.b +
    '</b><small>Wallet</small></div><div class="ds"><span>🎮</span><b>' +
    mine.length +
    '</b><small>Battles joined</small></div><div class="ds"><span>🏆</span><b>' +
    WIN.cnt +
    '</b><small>Wins</small></div><div class="ds g"><span>💸</span><b>₹' +
    WIN.amt +
    "</b><small>Winnings</small></div></div>" +
    (nxt
      ? '<div class="nx"><div class="t"><span class="tag g">NEXT MATCH</span><span class="cd" data-cd="' +
        nxt.st +
        '"></span></div><h3>' +
        esc(nxt.name) +
        '</h3><div class="sub" style="color:var(--muted);font-size:13px">' +
        (nxt.g === "BGMI" ? "BGMI" : "Free Fire") +
        " · " +
        nxt.mode +
        " · Entry paid ₹" +
        nxt.fee +
        "</div>" +
        roomBox(nxt) +
        '<button class="btn" data-a="dgo" data-g="mine" style="margin-top:12px">Open my battles</button></div>'
      : '<div class="nx"><div class="t"><span class="tag">NEXT MATCH</span></div><h3>No match scheduled</h3><div class="sub" style="color:var(--muted);font-size:13px">Join a contest to see your countdown here.</div><button class="btn" data-a="dgo" data-g="battles">Browse battles</button></div>') +
    (vp
      ? '<div class="vipcard"><div class="vstar">⭐</div><div><b>VIP active</b><small>Valid until ' +
        vdate() +
        '</small></div><button class="btn" data-a="vipopen">Manage</button></div>'
      : '<div class="vipcard"><div class="vstar">⭐</div><div><b>Top VIP Player · ₹49/month</b><small>Priority slot + exclusive badge</small></div><button class="btn" data-a="vipopen">Get VIP</button></div>') +
    '<div class="qa"><button data-a="dgo" data-g="battles"><span>⚔️</span>Battles</button><button data-a="dgo" data-g="upload"><span>📸</span>New post</button><button data-a="wal"><span>💰</span>Add money</button><button data-a="refopen"><span>🎁</span>Refer &amp; earn</button></div>' +
    refCard() +
    walletSec() +
    (window.mileSec ? window.mileSec() : "") +
    '<div class="sech" style="margin-top:24px"><div><div class="eye"><i></i>ACHIEVEMENTS</div><h2>' +
    un +
    "/" +
    bd.length +
    ' unlocked</h2></div></div><div class="bgs">' +
    bd
      .map(
        (x) =>
          '<div class="bgi' +
          (x[2] ? "" : " off") +
          '"><span>' +
          (x[2] ? x[0] : "🔒") +
          "</span>" +
          x[1] +
          "</div>",
      )
      .join("") +
    "</div>" +
    '<div class="sech" style="margin-top:24px"><div><div class="eye"><i></i>TOP PLAYERS</div><h2>This week</h2></div></div>' +
    (LBL().length
      ? LBL()
          .slice(0, 3)
          .map((p, i) => [p, i])
          .map(
            (x, r) =>
              '<div class="lb"><span class="rk">' +
              MD[r] +
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
      : '<p class="mut">No winners yet. Be the first!</p>');
  tick();
}
function ext5(a, b) {
  const d = b.dataset;
  if (a === "vipopen") {
    vipSheet();
    return 1;
  }
  if (a === "vipbuy") {
    payFlow({
      title: "VIP badge · 30 days",
      kind: "VIP badge",
      amt: 49,
      wallet: true,
      done: () => {
        vs().on = 1;
        vs().until = Math.max(Date.now(), vs().until) + 30 * 864e5;
        toast("VIP active until " + vdate());
      },
    });
    return 1;
  }
  if (a === "dgo") {
    if (d.g === "mine") {
      BS = "m";
      renderB();
      show("battles");
    } else {
      if (d.g === "battles") {
        BS = "c";
        renderB();
      }
      show(d.g);
    }
    return 1;
  }
  if (a === "dsearch") {
    openSearch();
    return 1;
  }
  return ext6(a, b);
}
