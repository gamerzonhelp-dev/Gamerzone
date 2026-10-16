/* GAMERZONE · Social: posts, stories, comments, likes, reports
   File 6 of 9 in this group. Keep the load order shown in index.html. */
"use strict";
/* =====================================================================
   SOCIAL LAYER  (shared feed: posts, likes, comments, stories)
   posts/{id}              uid, name, avi, cap, s (scene), t
   postLikes/{post}/{uid}  true
   postComments/{post}/{id} uid, name, text, t
   stories/{uid}           name, avi, s (scene), t        (live for 24 hours)
   storyViews/{owner}/{viewer}  time        storyLikes/{owner}/{viewer}  true
   reports/{id}            post, by, t, why
   ===================================================================== */
let SPF = {},
  SPM = {},
  SL = {},
  SC = {},
  STO = {},
  SV = {},
  SLK = {},
  SAVEDP = new Set(),
  OLDP = [],
  PMIG = false,
  rpT = null;
const rel = (t) => {
  const s = Math.max(0, (Date.now() - t) / 1000);
  return s < 60
    ? "now"
    : s < 3600
      ? Math.floor(s / 60) + "m"
      : s < 86400
        ? Math.floor(s / 3600) + "h"
        : Math.floor(s / 86400) + "d";
};
function shrink(src, max, q) {
  return new Promise((res) => {
    if (!src || !/^data:image\//.test(src)) return res(src);
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height)),
        c = document.createElement("canvas");
      c.width = Math.round(im.width * k);
      c.height = Math.round(im.height * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", q));
    };
    im.onerror = () => res(src);
    im.src = src;
  });
}
async function cleanScene(s) {
  const o = {
    bgi: +s.bgi || 0,
    fi: +s.fi || 0,
    adj: s.adj || { b: 100, c: 100, s: 100 },
    items: (s.items || []).slice(0, 40).map((it) => ({
      k: it.k === "e" ? "e" : "t",
      v: String(it.v).slice(0, 60),
      c: String(it.c || "#fff").slice(0, 9),
      s: +it.s || 9,
      x: +it.x || 50,
      y: +it.y || 50,
    })),
  };
  if (s.img) {
    o.img = await shrink(s.img, 900, 0.72);
    if (o.img.length > 450000) o.img = await shrink(s.img, 640, 0.6);
    if (o.img.length > 450000) throw new Error("That photo is too large");
  }
  return o;
}
function rebuildPosts() {
  const all = Object.assign({}, SPF, SPM),
    ids = Object.keys(all).filter((id) => all[id] && all[id].uid && all[id].s);
  ids.sort((a, b) => (all[b].t || 0) - (all[a].t || 0));
  SEEN.pl = SEEN.pl || {};
  SEEN.pc = SEEN.pc || {};
  POSTS = ids.map((id) => {
    const p = all[id],
      mine = p.uid === ACC,
      pr = (mine ? {} : PUBL[p.uid]) || {},
      nm = String(mine ? PF.name || p.name : pr.name || p.name || "Player").slice(0, 40);
    const lk = SL[id] || {},
      cm = Object.keys(SC[id] || {})
        .map((k) => SC[id][k])
        .filter((c) => c && c.text)
        .sort((a, b) => (a.t || 0) - (b.t || 0));
    if (mine && ready) {
      const ln = Object.keys(lk).length,
        pl = SEEN.pl[id];
      if (pl !== undefined && ln > pl) note("Someone", "liked your post.", "❤️");
      SEEN.pl[id] = ln;
      const cn = cm.length,
        pc = SEEN.pc[id];
      if (pc !== undefined && cn > pc) {
        const l = cm.filter((c) => c.uid !== ACC).pop();
        if (l)
          NT.unshift({
            g: "#14b8a6,#2563eb",
            i: String(l.name || "?")[0].toUpperCase(),
            b: l.name,
            r: 'commented: "' + String(l.text).slice(0, 60) + '"',
            a: "now",
            d: "Today",
            ty: "comment",
            n: 1,
          });
        badge();
      }
      SEEN.pc[id] = cn;
    }
    const ttl =
        p.uid === "official"
          ? titleOf(0, 0, "official")
          : mine
            ? myTitle()
            : titleOf(+pr.b || 0, +(LBD[p.uid] || {}).wins || 0, p.uid),
      ct = mine
        ? myClanTag()
        : String(pr.ct || "")
            .replace(/[^A-Za-z0-9]/g, "")
            .slice(0, 5);
    return {
      id,
      ttl,
      ct,
      win: p.kind === "win",
      cotw: !!(CW && CW.postId === id),
      uid: p.uid,
      u: nm,
      i: nm[0].toUpperCase(),
      g: BG[mine ? PF.avi : pr.avi != null ? pr.avi : p.avi] || BG[0],
      v: mine ? (isVip() ? 1 : 0) : pr.v ? 1 : 0,
      t: rel(p.t || Date.now()),
      sub: mine ? "You" : String(pr.bio || "GAMERZONE player").slice(0, 40),
      k: "u",
      mine,
      music: cleanMusic(p.music),
      cap: String(p.cap || ""),
      s: Object.assign({ fi: 0, adj: { b: 100, c: 100, s: 100 }, items: [] }, p.s),
      likes: Object.keys(lk).length,
      liked: !!lk[ACC],
      saved: SAVEDP.has(id),
      fol: FLG.has(p.uid) ? 1 : 0,
      total: cm.length,
      cm: cm.map((c) => ({ u: String(c.name || "Player"), t: String(c.text) })),
      pic: SAFE_PIC.test(pr.pic || "") ? pr.pic : "",
    };
  });
  try {
    feed();
    renderP();
    renderU();
    renderD();
  } catch (e) {
    console.error(e);
  }
}
function rebuildStories() {
  const now = Date.now();
  let seen = tryLs(() => JSON.parse(localStorage.getItem("gz_seen_st") || "{}")) || {};
  ST.length = 0;
  /* your own story lives in the database: bring it back after a refresh */
  const mo = STO[ACC];
  if (mo && mo.s && now - (mo.t || 0) <= 864e5 && (!MY || (MY.t || 0) < mo.t)) {
    MY = Object.assign({ fi: 0, adj: { b: 100, c: 100, s: 100 }, items: [] }, mo.s, {
      t: mo.t,
      music: cleanMusic(mo.music),
      views: [],
      likes: [],
    });
  }
  Object.keys(STO).forEach((u) => {
    const o = STO[u],
      pr = PUBL[u] || {};
    if (u === ACC || !o || !o.s || now - o.t > 864e5 || pr.hidden) return;
    const nm = String(pr.name || o.name || "Player"),
      a = [nm[0].toUpperCase(), nm.slice(0, 12), BG[pr.avi != null ? pr.avi : o.avi] || BG[0]];
    a.uid = u;
    a.s = o.s;
    a.t = o.t;
    a.music = o.music || null;
    a.seen = (seen[u] || 0) >= o.t ? 1 : 0;
    ST.push(a);
  });
  ST.sort(
    (a, b) =>
      (b.uid === "official") - (a.uid === "official") ||
      (FLG.has(b.uid) ? 1 : 0) - (FLG.has(a.uid) ? 1 : 0) ||
      a.seen - b.seen ||
      b.t - a.t,
  );
  try {
    renderStories();
  } catch (e) {
    console.error(e);
  }
}
function myStoryStats() {
  if (!MY) return;
  const ix = (u) => PL.findIndex((x) => x.u === u);
  MY.views = Object.keys(SV)
    .map((u) => ({ n: ix(u) }))
    .filter((x) => x.n >= 0);
  MY.likes = Object.keys(SLK)
    .map(ix)
    .filter((i) => i >= 0);
  try {
    updSv();
  } catch (e) {}
}
function schedule() {
  clearTimeout(rpT);
  rpT = setTimeout(() => {
    if (!ACC) return;
    rebuildPosts();
    rebuildStories();
    myStoryStats();
  }, 80);
}
window.gzRP = schedule;

function socialStart() {
  gameStart();
  SPF = {};
  SPM = {};
  SL = {};
  SC = {};
  STO = {};
  SV = {};
  SLK = {};
  OFF.push(
    DB.watchLast("posts", 40, (v) => {
      SPF = v || {};
      schedule();
    }),
  );
  OFF.push(
    DB.watchWhere("posts", "uid", ACC, (v) => {
      SPM = v || {};
      schedule();
    }),
  );
  OFF.push(
    DB.watch("postLikes", (v) => {
      SL = v || {};
      schedule();
    }),
  );
  OFF.push(
    DB.watch("postComments", (v) => {
      SC = v || {};
      schedule();
    }),
  );
  OFF.push(
    DB.watch("stories", (v) => {
      STO = v || {};
      schedule();
    }),
  );
  OFF.push(
    DB.watch("storyViews/" + ACC, (v) => {
      SV = v || {};
      schedule();
    }),
  );
  OFF.push(
    DB.watch("storyLikes/" + ACC, (v) => {
      SLK = v || {};
      schedule();
    }),
  );
  migrateOld();
}
/* posts and story made before the shared feed existed: publish them once */
async function migrateOld() {
  try {
    if (!PMIG && OLDP.length) {
      for (const p of OLDP.filter((x) => x && x.mine && x.s).reverse()) {
        const id = DB.newId();
        await DB.set("posts/" + id, {
          uid: ACC,
          name: PF.name || "Player",
          avi: PF.avi || 0,
          cap: String(p.cap || "").slice(0, 200),
          s: await cleanScene(p.s),
          t: +p.id || Date.now(),
        });
      }
    }
    PMIG = true;
    OLDP = [];
    if (MY && MY.t && Date.now() - MY.t < 864e5 && !(await DB.get("stories/" + ACC)))
      await window.gzStoryPub(MY);
    saveState(true);
  } catch (e) {
    console.error(e);
  }
}

window.gzLike = (p) => {
  if (!ACC || !p) return;
  DB.set("postLikes/" + p.id + "/" + ACC, p.liked ? true : null).catch(() =>
    toast("Could not save your like"),
  );
};
window.gzComment = (p, text) => {
  if (!ACC || !p) return;
  DB.set("postComments/" + p.id + "/" + DB.newId(), {
    uid: ACC,
    name: String(PF.name || "Player").slice(0, 40),
    text: String(text).slice(0, 200),
    t: Date.now(),
  }).catch(() => toast("Could not post your comment"));
};
window.gzPostPub = async (p) => {
  if (!ACC || !p) return;
  try {
    const s = await cleanScene(p.s);
    await DB.set("posts/" + DB.newId(), {
      uid: ACC,
      name: String(PF.name || "Player").slice(0, 40),
      avi: PF.avi || 0,
      cap: String(p.cap || "").slice(0, 200),
      s,
      t: Date.now(),
      ...(cleanMusic(p.music) ? { music: cleanMusic(p.music) } : {}),
    });
  } catch (e) {
    toast("Could not share the post: " + e.message);
    POSTS = POSTS.filter((x) => x !== p);
    feed();
    renderP();
    renderU();
  }
};
window.gzPostEdit = async (p, ch) => {
  if (!ACC || !p || !p.mine) return;
  try {
    const u = {};
    if (ch.cap !== undefined) u.cap = String(ch.cap).slice(0, 200);
    if (ch.s) u.s = await cleanScene(ch.s);
    await DB.update("posts/" + p.id, u);
  } catch (e) {
    toast("Could not save the change: " + e.message);
  }
};
window.gzPostDel = async (p) => {
  if (!ACC || !p || !p.mine) return;
  try {
    await DB.set("postLikes/" + p.id, null);
    await DB.set("postComments/" + p.id, null);
    await DB.set("posts/" + p.id, null);
  } catch (e) {
    toast("Could not delete the post");
  }
};
window.gzPostSave = (p) => {
  if (!p) return;
  if (p.saved) SAVEDP.add(p.id);
  else SAVEDP.delete(p.id);
  saveState(true);
};
window.gzReport = async (p, why) => {
  try {
    await DB.set("reports/" + DB.newId(), {
      post: p.id,
      owner: p.uid,
      by: ACC,
      why: String(why).slice(0, 60),
      t: Date.now(),
    });
    toast("Thanks. Our team will review this post.");
  } catch (e) {
    toast("Could not send the report");
  }
};
window.gzStoryPub = async (s) => {
  if (!ACC || !s) return;
  try {
    await DB.set("stories/" + ACC, {
      name: String(PF.name || "Player").slice(0, 40),
      avi: PF.avi || 0,
      s: await cleanScene(s),
      t: s.t || Date.now(),
      ...(cleanMusic(s.music) ? { music: cleanMusic(s.music) } : {}),
    });
    saveState(true);
  } catch (e) {
    toast("Could not share your story: " + e.message);
  }
};
window.gzStoryDel = async () => {
  if (!ACC) return;
  try {
    await DB.set("stories/" + ACC, null);
    await DB.set("storyViews/" + ACC, null);
    await DB.set("storyLikes/" + ACC, null);
  } catch (e) {}
};
window.gzStoryView = (q, k) => {
  if (!ACC || !q || !q.uid) return;
  const m = tryLs(() => JSON.parse(localStorage.getItem("gz_seen_st") || "{}")) || {};
  m[q.uid] = q.t;
  tryLs(() => localStorage.setItem("gz_seen_st", JSON.stringify(m)));
  DB.set("storyViews/" + q.uid + "/" + ACC, Date.now()).catch(() => {});
  LS.delete(k);
  DB.get("storyLikes/" + q.uid + "/" + ACC)
    .then((v) => {
      if (v) {
        LS.add(k);
        const b = document.querySelector(".lkb");
        if (b) b.classList.add("on");
      }
    })
    .catch(() => {});
};
window.gzStoryLike = (k, on) => {
  const q = ST[k];
  if (q && q.uid && ACC)
    DB.set("storyLikes/" + q.uid + "/" + ACC, on ? true : null).catch(() => {});
};
