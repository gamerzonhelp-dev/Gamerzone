/* GAMERZONE · Profile, stories, posts
   File 5 of 11 in this group. Keep the load order shown in index.html. */
let PF = { name: "", bio: "Free Fire & BGMI player", uid: "", phone: "", avi: 0, bid: "" },
  PT = "p",
  PAV = 0;

function logout() {
  document.body.classList.remove("in");
  document.querySelector(".card").classList.remove("gone");
  closeSheet();
  $("pass").value = "";
  tab(true);
  window.scrollTo(0, 0);
}
function ext3(a, b) {
  const d = b.dataset;
  if (a === "ptab") {
    PT = d.s;
    renderP();
    return 1;
  }
  if (a === "pedit") {
    editPf();
    return 1;
  }
  if (a === "pav") {
    PAV = +d.i;
    b.parentNode.querySelectorAll("i").forEach((i) => i.classList.toggle("on", i === b));
    return 1;
  }
  if (a === "psave") {
    const n = $("pn").value.trim(),
      u = $("pu").value.trim(),
      er = $("perr");
    if (!n) {
      er.textContent = "Enter a gamer name.";
      return 1;
    }
    if (u && !/^\d{8,12}$/.test(u)) {
      er.textContent = "Free Fire UID must be 8-12 digits.";
      return 1;
    }
    const bg = $("pbg").value.trim();
    if (bg && !/^\d{8,12}$/.test(bg)) {
      er.textContent = "BGMI ID must be 8-12 digits.";
      return 1;
    }
    PF.bid = bg;
    if (bg) UIDB = bg;
    PF.name = n;
    PF.bio = $("pb").value.trim();
    PF.uid = u;
    PF.avi = PAV;
    ME = n;
    if (u) UID = u;
    closeSheet();
    renderP();
    toast("Profile updated");
    return 1;
  }
  if (a === "plo") {
    logout();
    return 1;
  }
  return ext4(a, b);
}
const FL = [
  ["Normal", ""],
  ["Vivid", "saturate(1.5) contrast(1.1)"],
  ["Mono", "grayscale(1) contrast(1.1)"],
  ["Noir", "grayscale(1) contrast(1.45) brightness(.9)"],
  ["Warm", "sepia(.35) saturate(1.3) brightness(1.05)"],
  ["Cool", "hue-rotate(-25deg) saturate(1.2) brightness(1.05)"],
  ["Fade", "contrast(.85) brightness(1.1) saturate(.8)"],
  ["Neon", "saturate(2) contrast(1.2) hue-rotate(15deg)"],
];
let svMe = 0,
  LS = new Set(),
  SID = 0,
  EM = "story",
  EPID = 0;
function fltOf(s) {
  const a = s.adj || { b: 100, c: 100, s: 100 };
  return (
    (FL[s.fi || 0] || FL[0])[1] +
    " brightness(" +
    a.b +
    "%) contrast(" +
    a.c +
    "%) saturate(" +
    a.s +
    "%)"
  ).trim();
}
function paint(el, s) {
  el.style.background = "#000";
  el.innerHTML =
    '<div style="position:absolute;inset:0;background:' +
    (s.img ? "url('" + s.img + "') center/cover" : bgOf(s.bgi)) +
    ";filter:" +
    fltOf(s) +
    '"></div>' +
    s.items
      .map(
        (it, i) =>
          '<div class="si" data-i="' +
          i +
          '" style="left:' +
          it.x +
          "%;top:" +
          it.y +
          "%;font-size:" +
          it.s +
          "cqw;color:" +
          it.c +
          '">' +
          esc(it.v) +
          "</div>",
      )
      .join("");
}
function paintAll() {
  document.querySelectorAll("[data-pc]").forEach((e) => {
    const p = POSTS.find((x) => x.id == e.dataset.pc);
    if (p && p.s) paint(e, p.s);
  });
}
function readImg(f, max, cb) {
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height)),
        c = document.createElement("canvas");
      c.width = Math.round(im.width * k);
      c.height = Math.round(im.height * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      cb(c.toDataURL("image/jpeg", 0.85));
    };
    im.onerror = () => toast("Could not read that image");
    im.src = r.result;
  };
  r.readAsDataURL(f);
}
function pav(p) {
  const pic = p.mine ? PF.pic : p.pic;
  return (
    '<div class="av" style="background:' +
    (pic ? "#000 url('" + pic + "') center/cover" : "linear-gradient(135deg," + p.g + ")") +
    '">' +
    (pic ? "" : p.i) +
    "</div>"
  );
}
function avH(sm) {
  const bg = PF.pic ? "#000 url('" + PF.pic + "') center/cover" : bgOf(PF.avi);
  return (
    '<div class="av' +
    (sm ? " sm" : "") +
    '" style="background:' +
    bg +
    '">' +
    (PF.pic ? "" : esc((PF.name || "G")[0].toUpperCase())) +
    "</div>"
  );
}
function renderStories() {
  $("stories").innerHTML =
    '<button class="st" data-a="sme"><div class="ring' +
    (MY ? "" : " me") +
    (isVip() ? " gold" : "") +
    '">' +
    avH(0) +
    '<span class="plus" data-a="sadd">+</span></div>Your story</button>' +
    ST.map(
      (s, i) =>
        '<button class="st" data-a="sv" data-k="' +
        i +
        '"><div class="ring' +
        (s.seen ? " me" : "") +
        '"><div class="av" style="background:linear-gradient(135deg,' +
        s[2] +
        ')">' +
        s[0] +
        "</div></div>" +
        s[1] +
        "</button>",
    ).join("");
}
function ago(t) {
  const m = Math.floor((Date.now() - t) / 60000);
  return m < 1 ? "Just now" : m < 60 ? m + "m ago" : Math.floor(m / 60) + "h ago";
}
function panel(m) {
  document
    .querySelectorAll("#se .tb[data-m]")
    .forEach((b) => b.classList.toggle("on", b.dataset.m === m));
  const sp = $("sp");
  if (m === "bg")
    sp.innerHTML =
      '<div class="sw">' +
      BG.map(
        (c, i) =>
          '<i data-a="bg" data-i="' +
          i +
          '" class="' +
          (!ED.img && ED.bgi === i ? "on" : "") +
          '" style="background:' +
          bgOf(i) +
          '"></i>',
      ).join("") +
      "</div>";
  else if (m === "fl")
    sp.innerHTML =
      '<div class="fl">' +
      FL.map(
        (f, i) =>
          '<button class="chip' +
          (ED.fi === i ? " on" : "") +
          '" data-a="fi" data-i="' +
          i +
          '">' +
          f[0] +
          "</button>",
      ).join("") +
      "</div>";
  else if (m === "ad")
    sp.innerHTML =
      [
        ["b", "Brightness"],
        ["c", "Contrast"],
        ["s", "Saturation"],
      ]
        .map(
          (x) =>
            '<label class="rg">' +
            x[1] +
            '<input type="range" min="50" max="150" value="' +
            ED.adj[x[0]] +
            '" data-adj="' +
            x[0] +
            '"></label>',
        )
        .join("") +
      '<button class="btn" data-a="adr" style="padding:6px 12px;font-size:12px">Reset</button>';
  else if (m === "tx")
    sp.innerHTML =
      '<div class="trow"><input id="sti" maxlength="60" placeholder="Type your text"><button class="btn" data-a="tadd">Add</button></div><div class="sw">' +
      ["#ffffff", "#00ff88", "#ffd60a", "#ff4d9d", "#38bdf8", "#111111"]
        .map(
          (c) =>
            '<i data-a="tc" data-c="' +
            c +
            '" class="' +
            (tcol === c ? "on" : "") +
            '" style="background:' +
            c +
            '"></i>',
        )
        .join("") +
      '<button class="btn" data-a="tz" data-d="-1">A−</button><button class="btn" data-a="tz" data-d="1">A+</button></div>';
  else
    sp.innerHTML =
      '<div class="emo">' +
      ["🎮", "🔥", "🏆", "💀", "😂", "⚡", "👑", "🎯", "❤️", "🚀"]
        .map((e) => '<button data-a="em" data-e="' + e + '">' + e + "</button>")
        .join("") +
      "</div>";
}
function openEd(edit, mode, img, pid) {
  editing = edit;
  EM = mode || "story";
  EPID = pid || 0;
  ED =
    EM === "pedit"
      ? JSON.parse(JSON.stringify(fp(pid).s))
      : edit && EM === "story"
        ? JSON.parse(JSON.stringify(MY))
        : { bgi: 0, img: img || null, items: [] };
  ED.fi = ED.fi || 0;
  ED.adj = ED.adj || { b: 100, c: 100, s: 100 };
  $("se").dataset.m = EM;
  $("set").textContent =
    EM === "post" ? "New post" : EM === "pedit" ? "Edit post" : edit ? "Edit story" : "New story";
  $("sshare").textContent = EM === "pedit" ? "Save" : "Share";
  $("sshare").hidden = EM === "post";
  $("pbar").hidden = EM !== "post";
  $("sm").hidden = EM !== "story";
  if (EM === "post") $("pcap").value = "";
  paint($("cv"), ED);
  panel(img ? "fl" : "bg");
  $("se").classList.add("on");
}
function empty() {
  return !ED.img && !ED.items.length;
}
function doTop() {
  if (EM === "pedit") {
    const p = fp(EPID);
    p.s = ED;
    window.gzPostEdit && gzPostEdit(p, { s: ED });
    closeEd();
    feed();
    renderP();
    renderU();
    toast("Post updated");
    return;
  }
  if (empty()) {
    toast("Add a photo, text or sticker first");
    return;
  }
  const s0 = ED,
    e0 = editing;
  withLoading("story", () => pubStory(s0, e0));
}
/* a short "posting" screen (about 5 seconds) before a post or story goes live */
let POSTING = false;
function withLoading(kind, fn) {
  if (POSTING) return;
  POSTING = true;
  const o = document.createElement("div");
  o.id = "plo";
  o.setAttribute("role", "status");
  o.innerHTML =
    '<div class="plc"><div class="pls"></div><b>' +
    (kind === "post" ? "Sharing your post…" : "Adding your story…") +
    "</b><small>Please wait a moment</small><div class=\"plb\"><i></i></div></div>";
  const ms = typeof window.GZ_POST_DELAY === "number" ? window.GZ_POST_DELAY : 5000;
  o.querySelector(".plb i").style.animationDuration = ms + "ms";
  document.body.appendChild(o);
  setTimeout(() => {
    let r;
    try {
      r = fn();
    } catch (e) {
      console.error(e);
    }
    /* keep the loading screen until the post or story is really saved (at most 15 more seconds) */
    const t = o.querySelector("small");
    if (t) t.textContent = "Saving…";
    const end = () => {
      o.remove();
      POSTING = false;
    };
    Promise.race([Promise.resolve(r), new Promise((ok) => setTimeout(ok, 15000))])
      .catch(() => {})
      .then(end);
  }, ms);
}
function pubStory(s, up) {
  const o = MY;
  MY = s;
  s.music = (window.gzMusic && cleanMusic(gzMusic())) || null;
  if (up && o) {
    s.views = o.views || [];
    s.likes = o.likes || [];
    s.t = o.t;
  } else {
    s.views = [];
    s.likes = [];
    s.t = Date.now();
    simStory();
  }
  renderStories();
  const saved = window.gzStoryPub && gzStoryPub(s);
  closeEd();
  toast(up ? "Story updated" : "Added to your story");
  return saved;
}
function simStory() {}
function pubPost() {
  if (empty()) {
    toast("Add a photo, text or sticker first");
    return;
  }
  const p = {
    id: Date.now(),
    u: PF.name || ME,
    i: (PF.name || ME || "G")[0].toUpperCase(),
    g: BG[PF.avi],
    v: 0,
    t: "now",
    sub: "You",
    k: "u",
    mine: 1,
    cap: $("pcap").value.trim(),
    s: ED,
    likes: 0,
    liked: 0,
    saved: 0,
    fol: 0,
    total: 0,
    cm: [],
    music: window.gzMusic ? gzMusic() : null,
  };
  POSTS.unshift(p);
  const saved = window.gzPostPub && gzPostPub(p);
  closeEd();
  feed();
  renderP();
  renderU();
  show("home");
  toast("Post shared");
  simPost(p);
  return saved;
}
function simPost(p) {}
function openSv(k) {
  const me = k === "me";
  svMe = me;
  let s, nm, tm, av, foot, mus;
  if (me) {
    s = MY;
    mus = MY.music;
    nm = "Your story";
    tm = ago(MY.t);
    av = avH(1);
    foot =
      '<div class="sf"><button class="vs" data-a="vlist" id="vstat"></button><div id="vl" hidden></div><div class="tl" style="padding:6px 0 0"><button class="btn" data-a="sedit">Edit story</button><button class="btn dng" data-a="sdel">Delete</button></div></div>';
  } else {
    const q = ST[k];
    s = Object.assign({ fi: 0, adj: { b: 100, c: 100, s: 100 }, items: [] }, q.s);
    mus = q.music;
    nm = q[1];
    tm = q.t ? ago(q.t) : "now";
    if (window.gzStoryView) gzStoryView(q, k);
    av =
      '<div class="av sm" style="background:linear-gradient(135deg,' +
      q[2] +
      ')">' +
      q[0] +
      "</div>";
    q.seen = 1;
    renderStories();
    foot =
      '<div class="sf"><button class="lkb' +
      (LS.has(k) ? " on" : "") +
      '" data-a="slike" data-k="' +
      k +
      '" aria-label="Like story">' +
      svg("heart") +
      "</button></div>";
  }
  $("sv").innerHTML =
    '<div class="sbar" style="padding-bottom:0"><div class="pg">' +
    (me ? "" : "<i></i>") +
    '</div></div><div class="sbar"><div class="who2">' +
    av +
    "<div><b>" +
    esc(nm) +
    "</b>" +
    (me ? vipB() : "") +
    "<small>" +
    tm +
    '</small></div></div><button class="x" data-a="svclose" aria-label="Close">✕</button></div><div class="cw"><div class="cv" id="svc"></div></div>' +
    foot;
  paint($("svc"), s);
  $("sv").classList.add("on");
  const mc = window.storyMusic ? storyMusic(mus) : "";
  if (mc) $("sv").querySelector(".cw").insertAdjacentHTML("beforebegin", mc);
  clearTimeout(svt);
  if (!me) svt = setTimeout(closeSv, 8000);
  updSv();
}
function updSv() {
  if (!svMe || !MY || !$("vstat")) return;
  $("vstat").textContent = "👁 " + MY.views.length + " views · ♥ " + MY.likes.length + " likes";
  const l = $("vl");
  if (!l.hidden)
    l.innerHTML =
      (MY.views
        .map((v) => {
          const p = PL[v.n];
          return (
            '<div class="vr"><div class="av sm" style="background:linear-gradient(135deg,' +
            p.g +
            ')">' +
            p.i +
            "</div><span>" +
            esc(p.n) +
            "</span><i>" +
            (MY.likes.includes(v.n) ? "♥" : "") +
            "</i></div>"
          );
        })
        .join("") ||
        '<p class="mut" style="margin:6px 0">No views yet. Players will show up here.</p>') + "";
}
function postSheet(p) {
  sheet(
    "Your post",
    '<div class="cv pv" data-pc="' +
      p.id +
      '"></div><div class="cap" style="padding:12px 0 4px">' +
      esc(p.cap || "No caption") +
      '</div><div class="mut" style="margin:0 0 12px">' +
      p.likes +
      " likes · " +
      p.total +
      ' comments</div><button class="opt" data-a="edit" data-id="' +
      p.id +
      '">' +
      svg("edit") +
      'Edit post</button><button class="opt" data-a="shr" data-id="' +
      p.id +
      '">' +
      svg("share") +
      'Share post</button><button class="opt dng" data-a="delq" data-id="' +
      p.id +
      '">' +
      svg("trash") +
      "Delete post</button>",
  );
  paintAll();
}
function renderU() {
  const my = POSTS.filter((p) => p.mine);
  $("v-upload").innerHTML =
    '<div class="sech"><div><div class="eye"><i></i>CREATE</div><h2>Upload</h2></div></div><div class="up"><div class="upc" data-a="upnew"><div class="ic">' +
    svg("upload") +
    '</div><div><b>New post</b><small>Photo with filters, text, stickers and a caption</small></div></div><div class="upc" data-a="upstory"><div class="ic">' +
    svg("reels") +
    '</div><div><b>New story</b><small>Players can view and like it from the home screen</small></div></div><div class="upc" data-a="uptxt"><div class="ic">' +
    svg("edit") +
    '</div><div><b>Text or colour post</b><small>No photo needed</small></div></div></div><div class="hd" style="margin-top:22px">Your posts</div>' +
    (my.length
      ? my
          .map(
            (p) =>
              '<div class="mr"><div class="cv mt" data-pc="' +
              p.id +
              '"></div><div class="nm">' +
              esc(p.cap || "No caption") +
              "<small>" +
              p.likes +
              " likes · " +
              p.total +
              ' comments</small></div><button class="btn" data-a="edit" data-id="' +
              p.id +
              '">Edit</button><button class="btn dng" data-a="delq" data-id="' +
              p.id +
              '">Delete</button></div>',
          )
          .join("")
      : '<p class="mut">Your posts will appear here, with edit and delete options.</p>');
  paintAll();
}
function renderP() {
  const ini = (PF.name || "G")[0].toUpperCase(),
    fl = FLG.size,
    mine = CS.filter((c) => JN.has(c.id)),
    sv = POSTS.filter((p) => p.saved),
    my = POSTS.filter((p) => p.mine);
  const em = (h, t, btn) =>
    '<div class="empty" style="padding:40px 20px"><h2>' +
    h +
    "</h2><p>" +
    t +
    "</p>" +
    (btn || "") +
    "</div>";
  let body;
  if (PT === "p")
    body = my.length
      ? '<div class="grid3">' +
        my
          .map(
            (p) =>
              '<div class="cv gt" data-pc="' +
              p.id +
              '" data-a="pview" data-id="' +
              p.id +
              '"></div>',
          )
          .join("") +
        "</div>"
      : em(
          "No posts yet",
          "Share your first photo from the Upload tab.",
          '<button class="cta" data-a="gou" style="max-width:220px;margin:18px auto 0">Create a post</button>',
        );
  else if (PT === "b")
    body = mine.length
      ? mine
          .map(
            (c) =>
              '<div class="lb" style="cursor:default"><div class="nm">' +
              esc(c.name) +
              "<small>Entry ₹" +
              c.fee +
              ' · <span data-cd="' +
              c.st +
              '"></span></small></div><span class="am">Joined</span></div>',
          )
          .join("")
      : em("No battles yet", "Join a contest from the Battles tab.");
  else
    body = sv.length
      ? sv
          .map(
            (p) =>
              '<div class="lb" style="cursor:default"><div class="av" style="background:linear-gradient(135deg,' +
              p.g +
              ')">' +
              p.i +
              '</div><div class="nm">' +
              esc(p.u) +
              "<small>" +
              esc(p.cap) +
              "</small></div></div>",
          )
          .join("")
      : em("Nothing saved", "Tap the bookmark on a post to save it.");
  const cv = PF.cover ? "#000 url('" + PF.cover + "') center/cover" : bgOf((PF.avi + 1) % 6),
    av = PF.pic ? "#000 url('" + PF.pic + "') center/cover" : bgOf(PF.avi);
  $("v-profile").innerHTML =
    '<div class="pc"><div class="cover" style="background:' +
    cv +
    '"><button class="cb" data-a="pfcov">📷 Cover</button></div><div class="pbody"><div class="prow"><div class="pavw" data-a="pfpic"><div class="pav' +
    (isVip() ? " vip" : "") +
    '" style="background:' +
    av +
    '">' +
    (PF.pic ? "" : esc(ini)) +
    '</div><span class="cam">📷</span></div><div class="two" style="grid-template-columns:auto auto"><button class="btn" data-a="pedit">Edit profile</button><button class="btn" data-a="pshr">Share</button></div></div><div class="pn">' +
    esc(PF.name || "Player") +
    '<span class="ttl">' +
    esc(myTitle()) +
    "</span>" +
    (window.myClanTag && myClanTag() ? '<span class="ttl">[' + esc(myClanTag()) + "]</span>" : "") +
    (isVip() ? vipB() : '<button class="vget" data-a="vipopen">⭐ Get VIP</button>') +
    '</div><div class="pu">Free Fire ID: ' +
    (PF.uid ? esc(PF.uid) : "not added yet") +
    '</div><div class="pu">BGMI ID: ' +
    (PF.bid ? esc(PF.bid) : "not added yet") +
    "</div>" +
    (PF.state ? '<div class="pu">State: ' + esc(PF.state) + "</div>" : "") +
    '<div class="pu">' +
    (PF.phone ? "WhatsApp " + esc(PF.phone) + (PF.since ? " · " : "") : "") +
    (PF.since ? "Joined " + esc(PF.since) : "") +
    '</div><div class="pbio">' +
    esc(PF.bio) +
    '</div><div class="pst"><div><b>' +
    my.length +
    "</b>Posts</div><div><b>" +
    mine.length +
    "</b>Battles</div><div><b>" +
    FLW.size +
    "</b>Followers</div><div><b>" +
    fl +
    '</b>Following</div></div></div></div><div class="wc"><div><small>Wallet balance</small><strong>₹' +
    WAL.b +
    '</strong></div><button class="btn" data-a="wal">Add money</button></div><div class="seg">' +
    [
      ["p", "Posts (" + my.length + ")"],
      ["b", "Battles (" + mine.length + ")"],
      ["s", "Saved (" + sv.length + ")"],
    ]
      .map(
        (s) =>
          '<button class="' +
          (PT === s[0] ? "on" : "") +
          '" data-a="ptab" data-s="' +
          s[0] +
          '">' +
          s[1] +
          "</button>",
      )
      .join("") +
    "</div>" +
    body +
    '<button class="lo" data-a="plo">Log out</button>';
  paintAll();
  tick();
}
function editPf() {
  PAV = PF.avi;
  sheet(
    "Edit profile",
    '<div class="two" style="margin-bottom:14px"><button class="btn" data-a="pfpic">Change photo</button><button class="btn" data-a="pfcov">Change cover</button></div>' +
      (PF.pic
        ? '<button class="opt dng" data-a="pfrm" style="border-top:0;padding:0 0 14px">Remove photo</button>'
        : "") +
      '<label for="pn">Gamer name</label><input id="pn" maxlength="20" value="' +
      esc(PF.name) +
      '"><label for="pb">Bio</label><input id="pb" maxlength="80" placeholder="Tell players about you" value="' +
      esc(PF.bio) +
      '"><label for="pu">Free Fire UID</label><input id="pu" inputmode="numeric" maxlength="12" placeholder="e.g. 5827361904" value="' +
      esc(PF.uid) +
      '"><label for="pbg">BGMI Character ID</label><input id="pbg" inputmode="numeric" maxlength="12" placeholder="e.g. 5123456789" value="' +
      esc(PF.bid) +
      '"><label>Avatar colour</label><div class="sw" style="margin-bottom:18px">' +
      BG.map(
        (c, i) =>
          '<i data-a="pav" data-i="' +
          i +
          '" class="' +
          (PF.avi === i ? "on" : "") +
          '" style="background:' +
          bgOf(i) +
          '"></i>',
      ).join("") +
      '</div><div class="err" id="perr" role="alert"></div><button class="cta" data-a="psave">Save changes</button>',
  );
}
function shareProfile() {
  const text = (PF.name || "Player") + " on GAMERZONE",
    url = location.href;
  if (navigator.share) {
    navigator.share({ title: "GAMERZONE", text: text, url: url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text + " " + url).then(
      () => toast("Profile link copied"),
      () => toast("Could not copy the link"),
    );
  } else toast("Sharing is not supported here");
}
function ext4(a, b) {
  const d = b.dataset;
  if (a === "upnew") {
    $("upi").click();
    return 1;
  }
  if (a === "upstory") {
    openEd(0, "story");
    return 1;
  }
  if (a === "uptxt") {
    openEd(0, "post");
    return 1;
  }
  if (a === "pshare") {
    if (empty()) {
      toast("Add a photo, text or sticker first");
      return 1;
    }
    withLoading("post", pubPost);
    return 1;
  }
  if (a === "pstory") {
    if (empty()) {
      toast("Add a photo, text or sticker first");
      return 1;
    }
    withLoading("story", () => pubStory(JSON.parse(JSON.stringify(ED)), false));
    return 1;
  }
  if (a === "fi") {
    ED.fi = +d.i;
    paint($("cv"), ED);
    b.parentNode.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c === b));
    return 1;
  }
  if (a === "adr") {
    ED.adj = { b: 100, c: 100, s: 100 };
    paint($("cv"), ED);
    panel("ad");
    return 1;
  }
  if (a === "pview") {
    const p = fp(d.id);
    if (p) postSheet(p);
    return 1;
  }
  if (a === "pedtimg") {
    closeSheet();
    openEd(1, "pedit", null, d.id);
    return 1;
  }
  if (a === "gou") {
    show("upload");
    return 1;
  }
  if (a === "pfpic") {
    $("pfi").click();
    return 1;
  }
  if (a === "pfcov") {
    $("pci").click();
    return 1;
  }
  if (a === "pfrm") {
    PF.pic = null;
    closeSheet();
    renderP();
    renderStories();
    feed();
    toast("Photo removed");
    return 1;
  }
  if (a === "pshr") {
    shareProfile();
    return 1;
  }
  if (a === "vlist") {
    const l = $("vl");
    l.hidden = !l.hidden;
    updSv();
    return 1;
  }
  if (a === "slike") {
    const k = +d.k;
    if (LS.has(k)) LS.delete(k);
    else LS.add(k);
    window.gzStoryLike && gzStoryLike(k, LS.has(k));
    b.classList.toggle("on", LS.has(k));
    return 1;
  }
  return ext5(a, b);
}
$("sf").onchange = (e) => {
  const f = e.target.files[0];
  e.target.value = "";
  if (f)
    readImg(f, 1080, (u) => {
      ED.img = u;
      paint($("cv"), ED);
      panel("fl");
    });
};
$("pfi").onchange = (e) => {
  const f = e.target.files[0];
  e.target.value = "";
  if (f)
    readImg(f, 720, (u) => {
      PF.pic = u;
      renderP();
      renderStories();
      feed();
      toast("Profile photo updated");
    });
};
$("pci").onchange = (e) => {
  const f = e.target.files[0];
  e.target.value = "";
  if (f)
    readImg(f, 1280, (u) => {
      PF.cover = u;
      renderP();
      toast("Cover photo updated");
    });
};
$("upi").onchange = (e) => {
  const f = e.target.files[0];
  e.target.value = "";
  if (f) readImg(f, 1080, (u) => openEd(0, "post", u));
};
document.addEventListener("input", (e) => {
  const k = e.target.dataset && e.target.dataset.adj;
  if (!k) return;
  ED.adj[k] = +e.target.value;
  paint($("cv"), ED);
});
