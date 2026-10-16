/* GAMERZONE · Result upload, room ID and password, countdown timers
   File 9 of 11 in this group. Keep the load order shown in index.html. */
const SUB = [],
  WIN = { cnt: 0, amt: 0 },
  SS = {
    pending: ["Under review", "#ffd66b"],
    approved: ["Approved", "#00ff88"],
    rejected: ["Rejected", "#ff6b6b"],
  },
  RSN = [
    "Screenshot is blurry or cropped",
    "In-game ID does not match",
    "Wrong match or time",
    "Looks edited or reused",
  ];
let SUBIMG = "",
  HC = 1;
const phase = (c) => {
  const n = Date.now();
  return n < c.st ? "up" : n < c.st + c.dur * 6e4 ? "live" : "end";
};
const canc = (c) =>
  c.status === "cancelled" || (c.status !== "completed" && phase(c) !== "up" && c.j < c.minp);
const subOf = (c) => SUB.find((x) => x.cid === c.id && x.me);
const winOf = (c) => c.res && c.res.find((r) => r.me);
const hsh = (u) => {
  let h = 5381;
  for (let i = 0; i < u.length; i++) h = ((h << 5) + h + u.charCodeAt(i)) | 0;
  return u.length + ":" + h;
};
function settle(c) {
  return false;
}
function subH(sb, c) {
  const S = SS[sb.st];
  return (
    '<div class="sbm"><img class="sth" src="' +
    sb.img +
    '" data-a="shot" data-sid="' +
    sb.id +
    '" alt="Your screenshot"><div><b style="color:' +
    S[1] +
    '">' +
    S[0] +
    "</b><small>Rank #" +
    sb.rank +
    " · " +
    sb.kills +
    " kills</small>" +
    (sb.st === "rejected" && sb.why ? "<small>Reason: " + esc(sb.why) + "</small>" : "") +
    (sb.st === "pending" ? "<small>The host is checking your screenshot.</small>" : "") +
    (sb.st === "approved" ? "<small>Winners will be announced soon.</small>" : "") +
    "</div></div>" +
    (sb.st !== "approved"
      ? '<button class="btn" data-a="subopen" data-id="' +
        c.id +
        '" style="width:100%;margin-top:12px">' +
        (sb.st === "rejected" ? "Resubmit screenshot" : "Replace screenshot") +
        "</button>"
      : "")
  );
}
function subSheet(c) {
  const o = subOf(c);
  SUBIMG = o ? o.img : "";
  sheet(
    "Submit result",
    '<p class="mut" style="margin:0 0 12px">Upload a screenshot of your result screen. It must clearly show your in-game name, rank and kills.</p><div id="subp" class="subp">' +
      (SUBIMG
        ? '<img src="' + SUBIMG + '" alt="Screenshot preview">'
        : "<span>No screenshot yet</span>") +
      '</div><button class="btn" data-a="subpick" style="width:100%;margin:10px 0 14px">' +
      (SUBIMG ? "Change screenshot" : "Choose screenshot") +
      '</button><div class="two"><div><label for="srk">Your rank</label><input id="srk" inputmode="numeric" maxlength="2" placeholder="e.g. 3" value="' +
      (o ? o.rank : "") +
      '"></div><div><label for="skl">Kills</label><input id="skl" inputmode="numeric" maxlength="2" placeholder="e.g. 5" value="' +
      (o ? o.kills : "") +
      '"></div></div><div class="err" id="suberr" role="alert"></div><button class="cta" data-a="subgo" data-id="' +
      c.id +
      '">Submit for review</button><p class="mut" style="margin:12px 0 0;font-size:12px;text-align:center">Fake or edited screenshots mean disqualification with no refund.</p>',
  );
}
$("sfile").onchange = (e) => {
  const f = e.target.files[0];
  e.target.value = "";
  if (!f) return;
  readImg(f, 1280, (u) => {
    SUBIMG = u;
    const sp = $("subp");
    if (sp) sp.innerHTML = '<img src="' + u + '" alt="Screenshot preview">';
  });
};
function ext8(a, b) {
  const d = b.dataset,
    c = CS.find((x) => x.id == d.id),
    x = SUB.find((y) => y.id == d.sid);
  if (a === "subopen" && c) {
    if (c.res) {
      toast("Results are already out");
      return 1;
    }
    if (Date.now() > c.st + c.dur * 6e4 + 36e5) {
      toast("Submission window closed");
      return 1;
    }
    subSheet(c);
    return 1;
  }
  if (a === "subpick") {
    $("sfile").click();
    return 1;
  }
  if (a === "shot" && x) {
    sheet(
      "Result screenshot",
      '<img class="shotbig" src="' +
        x.img +
        '" alt="Result screenshot"><div class="kv"><span>Player</span><b>' +
        esc(x.n) +
        '</b></div><div class="kv"><span>ID</span><b>' +
        esc(x.uid) +
        '</b></div><div class="kv"><span>Claimed rank</span><b>#' +
        x.rank +
        '</b></div><div class="kv"><span>Kills</span><b>' +
        x.kills +
        '</b></div><div class="kv"><span>Submitted</span><b>' +
        ago(x.t) +
        "</b></div>",
    );
    return 1;
  }
  return ext9(a, b);
}
const ROOMM = 10;
let RK = "";
const hm = (t) => new Date(t).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
function copyTxt(t, msg) {
  const ok = () => toast(msg || "Copied"),
    bad = () => toast("Could not copy. Please copy it by hand."),
    fb = () => {
      try {
        const a = document.createElement("textarea");
        a.value = t;
        a.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(a);
        a.select();
        const r = document.execCommand("copy");
        a.remove();
        r ? ok() : bad();
      } catch (e) {
        bad();
      }
    };
  if (navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(t).then(ok, fb);
  else fb();
}
const rBoth = (c) => "Room ID: " + c.room.id + "\nPassword: " + c.room.pw;
function roomBox(c) {
  const now = Date.now(),
    ra = c.st - ROOMM * 6e4,
    r = c.room;
  if (now < ra)
    return (
      '<div class="rm"><div class="rmh"><span class="rmi">🔒</span><div><b>Room ID &amp; password</b><small>Unlocks 10 min before the match, at ' +
      hm(ra) +
      '</small></div><span class="rmt" data-rv="' +
      ra +
      '"></span></div><p class="stp">You will get a notification the moment it unlocks.</p></div>'
    );
  const rows =
    '<div class="rmr"><div><small>ROOM ID</small><b>' +
    (r ? r.id : "") +
    '</b></div><button class="btn" data-a="rcp" data-id="' +
    c.id +
    '" data-k="id">Copy</button></div><div class="rmr"><div><small>PASSWORD</small><b>' +
    (r ? esc(r.pw) : "") +
    '</b></div><button class="btn" data-a="rcp" data-id="' +
    c.id +
    '" data-k="pw">Copy</button></div>';
  return (
    '<div class="rm live"><div class="rmh"><span class="live-b">ROOM IS LIVE</span><span class="rmt" style="color:#fff" data-cd="' +
    c.st +
    '"></span></div>' +
    (!r
      ? '<p class="stp">The host will share the room details shortly.</p>'
      : c.rvl
        ? rows +
          '<button class="cta" data-a="rcpb" data-id="' +
          c.id +
          '" style="margin:12px 0 0;padding:12px;font-size:15px">Copy both</button>'
        : '<div class="rmr"><div><small>ROOM ID</small><b>••••••••</b></div></div><div class="rmr"><div><small>PASSWORD</small><b>••••••</b></div></div><button class="cta" data-a="rvl" data-id="' +
          c.id +
          '" style="margin:12px 0 0">🔑 Reveal &amp; copy</button>') +
    '<p class="stp">Open ' +
    (c.g === "BGMI" ? "BGMI" : "Free Fire") +
    " → Custom room → enter the Room ID and password.</p></div>"
  );
}
function roomSheet(c) {
  const r = c.room;
  sheet(
    "Room details",
    '<div class="rm live" style="margin-top:0"><div class="rmh"><span class="live-b">LIVE</span><div><b>' +
      esc(c.name) +
      "</b><small>Starts at " +
      hm(c.st) +
      "</small></div></div>" +
      (r
        ? '<div class="rmr"><div><small>ROOM ID</small><b>' +
          r.id +
          '</b></div><button class="btn" data-a="rcp" data-id="' +
          c.id +
          '" data-k="id">Copy</button></div><div class="rmr"><div><small>PASSWORD</small><b>' +
          esc(r.pw) +
          '</b></div><button class="btn" data-a="rcp" data-id="' +
          c.id +
          '" data-k="pw">Copy</button></div>'
        : '<p class="stp">The host will share the room details shortly.</p>') +
      "</div>" +
      (r
        ? '<button class="cta" data-a="rcpb" data-id="' +
          c.id +
          '" style="margin-top:14px">Copy both</button>'
        : "") +
      '<p class="mut" style="margin:12px 0 0;font-size:13px;line-height:1.5">Open ' +
      (c.g === "BGMI" ? "BGMI" : "Free Fire") +
      " → Custom room → enter the Room ID and password. Join before the match starts. Do not share these details.</p>",
  );
}
function roomTick() {
  const now = Date.now(),
    mine = CS.filter((c) => JN.has(c.id) && !c.rf);
  let ch = false;
  mine.forEach((c) => {
    if (now >= c.st - ROOMM * 6e4 && now < c.st + c.dur * 6e4 && !c.rn) {
      c.rn = 1;
      ch = true;
      if (SET.remind) {
        NT.unshift({
          g: "#00c46a,#00ff88",
          i: "🔑",
          b: c.name,
          r: "Room ID and password are live. Tap to copy.",
          a: "now",
          d: "Today",
          ty: "like",
          n: 1,
        });
        badge();
        toast("🔑 Room is live: " + c.name);
        if (navigator.vibrate && SET.sound)
          try {
            navigator.vibrate([200, 100, 200]);
          } catch (e) {}
      }
    }
  });
  if (ch) {
    renderB();
    renderD();
  }
  const live = mine.filter((c) => now >= c.st - ROOMM * 6e4 && now < c.st + c.dur * 6e4),
    pend = mine.filter((c) => phase(c) === "end" && !c.res && !subOf(c)),
    key = live
      .map((c) => "r" + c.id)
      .concat(pend.map((c) => "s" + c.id))
      .join(),
    el = $("rbn");
  if (key !== RK) {
    RK = key;
    el.innerHTML =
      live
        .map(
          (c) =>
            '<button class="rbb" data-a="rmopen" data-id="' +
            c.id +
            '"><span class="rdot"></span><div><b>🔑 Room is live · ' +
            esc(c.name) +
            '</b><small>Tap to reveal &amp; copy · <span data-rc="' +
            c.st +
            '"></span></small></div><i>›</i></button>',
        )
        .join("") +
      pend
        .map(
          (c) =>
            '<button class="rbb sub" data-a="subopen" data-id="' +
            c.id +
            '"><div><b>📸 Submit your result · ' +
            esc(c.name) +
            "</b><small>Upload your result screenshot</small></div><i>›</i></button>",
        )
        .join("");
  }
  el.querySelectorAll("[data-rc]").forEach((e) => {
    const d = +e.dataset.rc - now;
    e.textContent = d > 0 ? "starts in " + fmt(d) : "match is live";
  });
  document.querySelectorAll("[data-rv]").forEach((e) => {
    const d = +e.dataset.rv - now;
    e.textContent = d > 0 ? fmt(d) : "";
  });
}
function tick() {
  if (CS.map(settle).some(Boolean)) {
    renderB();
    renderD();
  }
  document.querySelectorAll("[data-cd]").forEach((e) => {
    const d = +e.dataset.cd - Date.now(),
      c = CS.find((x) => String(x.st) === e.dataset.cd);
    e.textContent =
      d > 0
        ? "Starts in " + fmt(d)
        : c && Date.now() > c.st + c.dur * 6e4
          ? "Match ended"
          : "● LIVE";
  });
  roomTick();
}
function myH(c) {
  const j = JI[c.id],
    ph = phase(c),
    sb = subOf(c),
    w = winOf(c);
  let st;
  if (c.rf)
    st = '<div class="rs bad">Contest cancelled. Your entry fee is refunded to your wallet.</div>';
  else if (ph !== "end")
    st =
      roomBox(c) +
      '<div class="rsb"><div><b>📸 Result screenshot</b><small>Opens when the match ends</small></div><button class="btn" disabled>Locked</button></div>';
  else if (c.res)
    st = w
      ? '<div class="rs win">' +
        MD[w.place - 1] +
        " You placed #" +
        w.place +
        " · ₹" +
        w.prize +
        " added to your wallet</div>"
      : '<div class="rs">Results are out. Thanks for playing!</div>' +
        (sb ? subH(sb, c).replace(/<button.*<\/button>/, "") : "");
  else if (sb) st = subH(sb, c);
  else
    st =
      '<div class="rs hl">Match ended. Upload your result screenshot within 60 minutes.</div><button class="cta" data-a="subopen" data-id="' +
      c.id +
      '">📸 Submit result screenshot</button>';
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
    '</h3><div class="kv" style="margin-top:12px"><span>Your ' +
    (c.g === "BGMI" ? "Character ID" : "UID") +
    "</span><b>" +
    esc(j.uid) +
    '</b></div><div class="kv"><span>Entry paid</span><b>₹' +
    c.fee +
    "</b></div>" +
    st +
    "</div>"
  );
}
function ext9(a, b) {
  const d = b.dataset,
    c = CS.find((x) => x.id == d.id);
  if (a === "rvl" && c && c.room) {
    c.rvl = 1;
    copyTxt(rBoth(c), "Room ID & password copied");
    renderB();
    renderD();
    return 1;
  }
  if (a === "rcp" && c && c.room) {
    copyTxt(
      d.k === "id" ? c.room.id : c.room.pw,
      (d.k === "id" ? "Room ID" : "Password") + " copied",
    );
    return 1;
  }
  if (a === "rcpb" && c && c.room) {
    copyTxt(rBoth(c), "Room ID & password copied");
    return 1;
  }
  if (a === "rmopen" && c) {
    c.rvl = 1;
    if (c.room) copyTxt(rBoth(c), "Room ID & password copied");
    roomSheet(c);
    renderB();
    renderD();
    return 1;
  }
  return ext10(a, b);
}
