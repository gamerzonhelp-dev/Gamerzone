/* GAMERZONE · Music on posts (Audius)
   File 8 of 9 in this group. Keep the load order shown in index.html. */
"use strict";
/* =====================================================================
   MUSIC ON POSTS  (Audius, free music API: https://docs.audius.co)
   A player picks a song when making a post. The post keeps only
   music/{id, title, artist}. The song itself is streamed from Audius when
   the post is on screen, so nothing is stored or copied here.
   ===================================================================== */
const AUD = "https://api.audius.co/v1",
  AUD_APP = "GAMERZONE";
const okMid = (id) => /^[A-Za-z0-9]{3,12}$/.test(String(id || ""));
const audStream = (id) => AUD + "/tracks/" + id + "/stream?app_name=" + AUD_APP;
function cleanMusic(m) {
  if (!m || !okMid(m.id) || !m.title) return null;
  return {
    id: String(m.id),
    title: String(m.title).slice(0, 80),
    artist: String(m.artist || "").slice(0, 60),
  };
}
window.gzMusic = () => PMUSIC;
let PMUSIC = null,
  MRES = [],
  mSeq = 0,
  mTmr = null,
  pvAud = null,
  pvIdx = -1;
const mdur = (s) => {
  s = Math.max(0, s | 0);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
};
async function audGet(path, params) {
  const q = new URLSearchParams(Object.assign({ app_name: AUD_APP }, params));
  const r = await fetch(AUD + path + "?" + q.toString());
  if (!r.ok) throw new Error("HTTP " + r.status);
  const j = await r.json();
  return (j && j.data) || [];
}
const okTrack = (t) =>
  !!t &&
  okMid(t.id) &&
  !t.is_delete &&
  t.is_available !== false &&
  !t.is_unlisted &&
  !t.is_stream_gated &&
  !(t.user && t.user.is_deactivated) &&
  !!(t.is_streamable || (t.access && t.access.stream));
const artOf = (t) => {
  const a = t && t.artwork && t.artwork["150x150"];
  return /^https:\/\/[^\s'"()<>]+$/.test(a || "") ? a : "";
};
function mRow(t, i) {
  const a = artOf(t);
  return (
    '<div class="mrow">' +
    (a
      ? '<img src="' + esc(a) + '" alt="" loading="lazy" referrerpolicy="no-referrer">'
      : '<span class="mnoart">🎵</span>') +
    '<div class="mi"><b>' +
    esc(t.title) +
    "</b><small>" +
    esc((t.user && t.user.name) || "Unknown") +
    " · " +
    mdur(t.duration) +
    "</small></div>" +
    '<button class="btn" data-a="mpv" data-i="' +
    i +
    '" aria-label="Preview">' +
    (pvIdx === i ? "■" : "▶") +
    "</button>" +
    '<button class="btn" data-a="muse" data-i="' +
    i +
    '">Use</button></div>'
  );
}
function mPvStop() {
  try {
    if (pvAud) pvAud.pause();
  } catch (e) {}
  pvIdx = -1;
  document.querySelectorAll("[data-a=mpv]").forEach((b) => (b.textContent = "▶"));
}
async function mSearch(q) {
  const my = ++mSeq,
    box = $("mres");
  if (!box) return;
  mPvStop();
  box.innerHTML =
    '<p class="mut" style="padding:14px 0">' +
    (q ? "Searching…" : "Loading popular songs…") +
    "</p>";
  try {
    const d = q
      ? await audGet("/tracks/search", { query: q, limit: 25 })
      : await audGet("/tracks/trending", { limit: 25 });
    if (my !== mSeq || !$("mres")) return;
    MRES = d.filter(okTrack).slice(0, 20);
    $("mres").innerHTML = MRES.length
      ? MRES.map(mRow).join("")
      : '<p class="mut" style="padding:14px 0">No songs found. Try another name or artist.</p>';
  } catch (e) {
    if (my === mSeq && $("mres"))
      $("mres").innerHTML =
        '<p class="mut" style="padding:14px 0">Music search is not working right now. Check your internet and try again.</p><button class="btn" data-a="mretry">Try again</button>';
  }
}
function mbarRender() {
  const h = mbarHtml();
  ["mbar", "mbar2"].forEach((id) => {
    const b = $(id);
    if (b) b.innerHTML = h;
  });
}
function mbarHtml() {
  return PMUSIC
    ? '<div class="mus on"><span class="eq"><i></i><i></i><i></i></span><div style="flex:1;min-width:0"><b>' +
      esc(PMUSIC.title) +
      "</b> <small>" +
      esc(PMUSIC.artist) +
      '</small></div><button class="btn" data-a="msel" type="button">Change</button><button class="btn" data-a="mclr" type="button" aria-label="Remove music">✕</button></div>'
    : '<button class="btn" data-a="msel" type="button" style="width:100%">🎵 Add music</button>';
}
const _openEd = window.openEd;
window.openEd = function (edit, mode) {
  const r = _openEd.apply(this, arguments);
  const m = mode || "story";
  if (m === "post" || m === "story") {
    PMUSIC = m === "story" && edit && MY && MY.music ? cleanMusic(MY.music) : null;
    mbarRender();
  }
  return r;
};
const _closeSheet = window.closeSheet;
window.closeSheet = function () {
  mPvStop();
  mSeq++;
  return _closeSheet.apply(this, arguments);
};
H.msel = () => {
  sheet(
    "Add music",
    '<input id="mqi" type="search" inputmode="search" maxlength="60" placeholder="Search songs or artists" autocomplete="off"><div id="mres"></div><p class="mut" style="font-size:11px;margin:12px 0 0;text-align:center">Music from Audius. Respect the artists.</p>',
  );
  mSearch("");
  const i = $("mqi");
  if (i) i.focus();
};
H.mretry = () => {
  const i = $("mqi");
  mSearch(i ? i.value.trim() : "");
};
H.mpv = (b, d) => {
  const i = +d.i,
    t = MRES[i];
  if (!t) return;
  if (pvIdx === i) {
    mPvStop();
    return;
  }
  mPvStop();
  if (!pvAud) {
    pvAud = new Audio();
    pvAud.volume = 0.7;
    pvAud.addEventListener("ended", mPvStop);
    pvAud.addEventListener("error", () => {
      if (pvIdx >= 0) {
        mPvStop();
        toast("This song cannot be played. Try another one.");
      }
    });
  }
  pvAud.src = audStream(t.id);
  pvIdx = i;
  b.textContent = "■";
  const p = pvAud.play();
  if (p && p.catch)
    p.catch(() => {
      mPvStop();
      toast("Tap ▶ again to play the preview.");
    });
};
H.muse = (b, d) => {
  const t = MRES[+d.i];
  if (!t) return;
  PMUSIC = cleanMusic({ id: t.id, title: t.title, artist: (t.user && t.user.name) || "" });
  closeSheet();
  mbarRender();
  toast("Music added: " + t.title);
};
H.mclr = () => {
  PMUSIC = null;
  mbarRender();
};
document.addEventListener("input", (e) => {
  if (e.target && e.target.id === "mqi") {
    clearTimeout(mTmr);
    const v = e.target.value.trim();
    mTmr = setTimeout(() => mSearch(v), 450);
  }
});

/* ---- background music while a post with a song is on screen ---- */
const bgm = new Audio();
bgm.loop = true;
bgm.preload = "none";
bgm.volume = 0.6;
let bgmId = "",
  bgmIO = null,
  bgmVis = {},
  bgmWant = "",
  bgmBlocked = false,
  bgmMute = !!tryLs(() => localStorage.getItem("gz_mute") === "1"),
  bgmWarned = false;
window.bgmMuted = () => bgmMute;
window.__gzbgm = () => ({
  id: bgmId,
  paused: bgm.paused,
  src: bgm.src,
  mute: bgmMute,
  want: bgmWant,
});
function paintMus() {
  const playing = !bgmMute && !bgm.paused && !!bgmId;
  document.querySelectorAll("#feed .mus").forEach((el) => {
    el.classList.toggle("on", playing && el.dataset.mid === bgmId);
    const s = el.querySelector(".spk");
    if (s) s.textContent = bgmMute ? "🔇" : "🔊";
  });
}
["play", "pause", "ended"].forEach((n) => bgm.addEventListener(n, paintMus));
bgm.addEventListener("error", () => {
  if (bgmId && !bgmWarned) {
    bgmWarned = true;
    toast("This song cannot be played right now.");
  }
  bgmId = "";
  paintMus();
});
function bgmStop(force) {
  /* while a story with a song is open, feed refreshes must not cut its music */
  if (stOpen && !force) return;
  try {
    bgm.pause();
  } catch (e) {}
  bgmId = "";
  paintMus();
}
function bgmPlay(mid) {
  if (bgmMute || !okMid(mid)) {
    paintMus();
    return;
  }
  if (bgmId !== mid) {
    bgm.src = audStream(mid);
    bgmId = mid;
    bgmWarned = false;
  }
  const p = bgm.play();
  if (p && p.catch)
    p.catch(() => {
      bgmBlocked = true;
    });
}
/* a story with a song: play it while the story is open, then give the feed its music back */
let stOpen = false;
window.storyMusic = function (m) {
  stOpen = true;
  const c = cleanMusic(m);
  if (bgmId) bgmStop(true);
  if (!c) return "";
  bgmPlay(c.id);
  return (
    '<div class="mus on svm"><span class="eq"><i></i><i></i><i></i></span><div style="flex:1;min-width:0"><b>' +
    esc(c.title) +
    "</b> <small>" +
    esc(c.artist) +
    "</small></div></div>"
  );
};
window.storyMusicStop = function () {
  if (!stOpen) return;
  stOpen = false;
  if (bgmId) bgmStop();
  bgmPick();
};
function bgmPick() {
  if (stOpen) return;
  let best = null;
  Object.keys(bgmVis).forEach((id) => {
    const v = bgmVis[id];
    if (v.r >= 0.5 && (!best || v.r > best.r)) best = v;
  });
  if (!best || document.hidden) {
    bgmWant = "";
    if (bgmId) bgmStop();
    return;
  }
  bgmWant = best.mid;
  if (bgmId !== best.mid || bgm.paused) bgmPlay(best.mid);
}
window.bgmAttach = function () {
  if (bgmIO) {
    try {
      bgmIO.disconnect();
    } catch (e) {}
    bgmIO = null;
  }
  bgmVis = {};
  const posts = document.querySelectorAll("#feed .post[data-mid]");
  if (!posts.length || typeof IntersectionObserver === "undefined") {
    bgmWant = "";
    if (bgmId) bgmStop();
    return;
  }
  bgmIO = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        const id = e.target.dataset.id;
        if (e.isIntersecting && e.intersectionRatio > 0)
          bgmVis[id] = { r: e.intersectionRatio, mid: e.target.dataset.mid };
        else delete bgmVis[id];
      });
      bgmPick();
    },
    { threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] },
  );
  posts.forEach((p) => bgmIO.observe(p));
  paintMus();
};
H.mtog = () => {
  bgmMute = !bgmMute;
  tryLs(() => localStorage.setItem("gz_mute", bgmMute ? "1" : "0"));
  if (bgmMute) {
    try {
      bgm.pause();
    } catch (e) {}
    paintMus();
  } else {
    bgmPick();
    paintMus();
  }
  toast(bgmMute ? "Post music is off" : "Post music is on");
};
H.mrm = (b, d) => {
  const p = fp(d.id);
  if (!p || !p.mine) return;
  closeSheet();
  DB.update("posts/" + p.id, { music: null })
    .then(() => toast("Music removed"))
    .catch(() => toast("Could not remove the music"));
};
document.addEventListener(
  "click",
  () => {
    if (bgmBlocked) {
      bgmBlocked = false;
      if (bgmWant) bgmPlay(bgmWant);
    }
  },
  true,
);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    try {
      bgm.pause();
    } catch (e) {}
    paintMus();
  } else bgmPick();
});
