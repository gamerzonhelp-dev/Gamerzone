/* GAMERZONE · Main screen: intro, icons, tabs, feed, pop-up sheets
   File 1 of 11 in this group. Keep the load order shown in index.html. */
const $ = (id) => document.getElementById(id);
function tab(up) {
  $("t-up").classList.toggle("on", up);
  $("t-in").classList.toggle("on", !up);
  $("signup").hidden = !up;
  $("login").hidden = up;
  $("otp").hidden = true;
}
const intro = $("intro");
let done = false;
function endIntro() {
  if (done) return;
  done = true;
  intro.classList.add("out");
  setTimeout(() => intro.remove(), 700);
}
intro.onclick = endIntro;
setTimeout(endIntro, 4800);
const lines = ["> BOOTING ARENA...", "> LOADING PLAYERS...", "> CONNECTING...", "> READY."];
let li = 0;
const bt = setInterval(() => {
  if (done || li >= lines.length) return clearInterval(bt);
  $("boot").textContent = lines[li++];
}, 420);
const IC = {
  home: "M3 11l9-8 9 8v10H3zM9 21v-6h6v6",
  reels: "M8 5v14l11-7z",
  dashboard: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  upload: "M12 5v14M5 12h14",
  battles: "M5 4l14 14M19 4L5 18M4 7l3-3M20 7l-3-3",
  profile: "M12 4a4 4 0 100 8 4 4 0 000-8zM4 21c0-4 4-6 8-6s8 2 8 6",
  settings:
    "M12 9a3 3 0 100 6 3 3 0 000-6zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2",
  search: "M11 5a6 6 0 100 12 6 6 0 000-12zM16 16l5 5",
  heart: "M12 21s-8-5-8-11a4.5 4.5 0 018-3 4.5 4.5 0 018 3c0 6-8 11-8 11z",
  comment: "M4 5h16v11H9l-5 4z",
  share: "M5 19L19 5M9 5h10v10",
  save: "M6 3h12v18l-6-4-6 4z",
};
const svg = (k) => '<svg class="i" viewBox="0 0 24 24"><path d="' + IC[k] + '"/></svg>';
document.querySelectorAll("[data-ic]").forEach((e) => (e.innerHTML = svg(e.dataset.ic)));
const ST = [];
const TABS = [
  ["home", "Home"],
  ["battles", "Battles", ""],
  ["dashboard", "Dashboard", "Your stats, rank and match history will show here."],
  ["upload", "Upload", "Post clips, screenshots and stories from here."],
  ["profile", "Profile", "Your player profile and posts will show here."],
  ["settings", "Settings", "Account, privacy and notifications."],
];
TABS.slice(1).forEach((t) => {
  const v = document.createElement("section");
  v.className = "view";
  v.id = "v-" + t[0];
  v.innerHTML =
    '<div class="empty"><div class="ic">' +
    svg(t[0]) +
    "</div><h2>" +
    t[1] +
    "</h2><p>" +
    t[2] +
    "</p></div>";
  $("app").appendChild(v);
});
$("nav").innerHTML = TABS.map(
  (t) => '<button data-t="' + t[0] + '">' + svg(t[0]) + t[1] + "</button>",
).join("");
function show(k) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("on", v.id === "v-" + k));
  document
    .querySelectorAll("#nav button")
    .forEach((b) => b.classList.toggle("on", b.dataset.t === k));
  if (k === "profile") renderP();
  if (k === "upload") renderU();
  if (k === "dashboard") renderD();
  if (k === "settings") renderS();
  window.scrollTo(0, 0);
}
document.querySelectorAll("#nav button").forEach((b) => (b.onclick = () => show(b.dataset.t)));
function enterApp(n) {
  ME = n;
  document.body.classList.add("in");
  document.querySelector(".card").classList.add("gone");
  PF.name = n;
  PF.phone = ($("phone").value || $("lphone").value).trim();
  PF.since = new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  genRef(n);
  renderStories();
  show("home");
}
$("lgo").onclick = () => {
  const p = $("lphone").value.replace(/\D/g, ""),
    w = $("lpass").value;
  if (p.length < 10) {
    $("lphone").focus();
    return;
  }
  if (w.length < 4) {
    $("lpass").focus();
    return;
  }
  if (!PF.ver) {
    toast("No account found. Please sign up first.");
    return;
  }
  enterApp(PF.name || "player");
};
let ME = "you";
Object.assign(IC, {
  edit: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  trash: "M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13",
});
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
let POSTS = [];
let NT = [
  {
    g: "#5b6cf0,#c026d3",
    i: "K",
    b: "KiraOP",
    r: "liked your post.",
    a: "2m",
    d: "Today",
    ty: "like",
    th: ["#15563f,#1a7f55", "🏆"],
    n: 1,
  },
  {
    g: "#14b8a6,#2563eb",
    i: "M",
    b: "MambaX",
    r: 'commented: "Nice clutch!"',
    a: "15m",
    d: "Today",
    ty: "comment",
    th: ["#15563f,#1a7f55", "🏆"],
    n: 1,
  },
  {
    g: "#fbbf24,#f97316",
    i: "R",
    b: "RogueFox",
    r: "started following you.",
    a: "1h",
    d: "Today",
    ty: "follow",
    msg: 1,
    n: 1,
  },
  {
    g: "#f97316,#c026d3",
    i: "V",
    b: "ViperLive, MambaX",
    r: "and 2 others just shared posts.",
    a: "44m",
    d: "Today",
    ty: "ppl",
    th: ["#3b3f9c,#8a2a78", "🎮"],
    n: 0,
  },
  {
    g: "#818cf8,#c026d3",
    i: "N",
    b: "NovaX",
    r: "added to their story.",
    a: "51m",
    d: "Today",
    ty: "ppl",
    th: ["#f97316,#c026d3", "🔥"],
    n: 0,
  },
  {
    g: "#f97316,#c026d3",
    i: "V",
    b: "ViperLive",
    r: "saved your post.",
    a: "1d",
    d: "Yesterday",
    ty: "like",
    th: ["#15563f,#1a7f55", "🏆"],
    n: 0,
  },
  {
    g: "#5b6cf0,#c026d3",
    i: "K",
    b: "KiraOP",
    r: 'replied to your comment: "GG!"',
    a: "1d",
    d: "Yesterday",
    ty: "comment",
    n: 0,
  },
  {
    g: "#fbbf24,#f97316",
    i: "R",
    b: "RogueFox",
    r: "liked your comment.",
    a: "3d",
    d: "Last 7 days",
    ty: "like",
    n: 0,
  },
  {
    g: "#818cf8,#c026d3",
    i: "N",
    b: "NovaX",
    r: "started following you.",
    a: "5d",
    d: "Last 7 days",
    ty: "follow",
    msg: 1,
    n: 0,
  },
];
const fp = (id) => POSTS.find((p) => p.id == id);
function titleOf(b, w, u) {
  if (u === "official") return "✔ Official";
  b = +b || 0;
  w = +w || 0;
  return w >= 10
    ? "👑 Legend"
    : w >= 3
      ? "🏆 Champion"
      : w >= 1
        ? "⚡ Pro"
        : b >= 5
          ? "🔥 Fighter"
          : "🌱 Rookie";
}
function myTitle() {
  return titleOf(window.gzBattles ? gzBattles() : 0, WIN.cnt);
}
function feed() {
  $("feed").innerHTML =
    (window.cwBanner ? cwBanner() : "") +
    (POSTS.length
      ? POSTS.map(
          (p) =>
            '<article class="post" data-id="' +
            p.id +
            '"' +
            (p.music ? ' data-mid="' + esc(p.music.id) + '"' : "") +
            '><div class="ph">' +
            pav(p) +
            '<div class="who"><b>' +
            esc(p.u) +
            (p.v ? '<span class="vf"></span>' : "") +
            (p.mine ? vipB() : "") +
            (p.ttl ? '<span class="ttl">' + esc(p.ttl) + "</span>" : "") +
            (p.ct ? '<span class="ttl">[' + esc(p.ct) + "]</span>" : "") +
            (p.win ? '<span class="ttl win">🏆 WIN</span>' : "") +
            (p.cotw ? '<span class="ttl win">🎬 CLIP OF THE WEEK</span>' : "") +
            "</b><small>" +
            esc(p.sub) +
            " · " +
            p.t +
            "</small></div>" +
            (p.mine
              ? ""
              : '<button class="fol' +
                (p.fol ? " on" : "") +
                '" data-a="fol">' +
                (p.fol ? "Following" : "Follow") +
                "</button>") +
            '<button class="more" data-a="more" aria-label="Post options">•••</button></div>' +
            (p.music
              ? '<div class="mus" data-a="mtog" data-mid="' +
                esc(p.music.id) +
                '" role="button" aria-label="Turn post music on or off"><span class="eq"><i></i><i></i><i></i></span><div style="min-width:0;flex:1"><b>' +
                esc(p.music.title) +
                "</b> <small>" +
                esc(p.music.artist) +
                '</small></div><span class="spk">' +
                (window.bgmMuted && bgmMuted() ? "🔇" : "🔊") +
                "</span></div>"
              : "") +
            (p.k == "u"
              ? '<div class="cv pv" data-pc="' + p.id + '"></div>'
              : p.k == "win"
                ? '<div class="media"><div><small>VICTORY</small><strong>8</strong><small>FINAL ROUND</small></div></div>'
                : '<div class="media vm"><div><small>▶</small><strong style="font-size:44px">TOP 5</strong><small>PLAYS</small><button class="watch" data-a="watch" style="margin-top:14px">Watch video</button></div></div>') +
            '<div class="acts"><button class="' +
            (p.liked ? "liked" : "") +
            '" data-a="like" aria-label="Like">' +
            svg("heart") +
            '</button><button data-a="cm" aria-label="Comments">' +
            svg("comment") +
            '</button><button data-a="share" aria-label="Share">' +
            svg("share") +
            '</button><span class="sp"></span><button class="' +
            (p.saved ? "saved" : "") +
            '" data-a="save" aria-label="Save">' +
            svg("save") +
            '</button></div><div class="lc">' +
            p.likes.toLocaleString() +
            ' likes</div><div class="cap"><b>' +
            esc(p.u) +
            "</b> " +
            esc(p.cap) +
            '</div><div class="vc" data-a="cm" style="cursor:pointer">' +
            (p.total ? "View all " + p.total + " comments" : "Add a comment") +
            "</div></article>",
        ).join("")
      : '<div class="empty"><p>No posts in your feed.</p></div>');
  paintAll();
  window.bgmAttach && bgmAttach();
}
function sheet(t, h) {
  $("sb").innerHTML =
    '<div class="sh-h"><b>' +
    t +
    '</b><button class="x" data-a="x" aria-label="Close">✕</button></div>' +
    h;
  $("sbg").classList.add("on");
}
function closeSheet() {
  $("sbg").classList.remove("on");
}
let tt;
function toast(m) {
  const e = $("toast");
  e.textContent = m;
  e.classList.add("on");
  clearTimeout(tt);
  tt = setTimeout(() => e.classList.remove("on"), 1900);
}
function badge() {
  const c = NT.filter((n) => n.n).length;
  $("bn").innerHTML = svg("heart") + (c ? '<span class="bdg">' + c + "</span>" : "");
}
function openCm(p) {
  sheet(
    "Comments (" + p.total + ")",
    (p.cm
      .map(
        (c) =>
          '<div class="cm"><div class="av sm">' +
          esc(c.u[0].toUpperCase()) +
          "</div><div><b>" +
          esc(c.u) +
          "</b><p>" +
          esc(c.t) +
          "</p></div></div>",
      )
      .join("") || '<p class="mut">No comments yet. Start the conversation.</p>') +
      '<div class="cin"><input id="ci" maxlength="200" placeholder="Add a comment"><button class="btn" data-a="addcm" data-id="' +
      p.id +
      '">Post</button></div>',
  );
  $("ci").focus();
}
function doShare(p) {
  const url = location.href,
    text = p.u + ": " + p.cap;
  if (navigator.share) {
    navigator.share({ title: "GAMERZONE", text: text, url: url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text + " " + url).then(
      () => toast("Link copied"),
      () => toast("Could not copy the link"),
    );
  } else toast("Sharing is not supported here");
}
