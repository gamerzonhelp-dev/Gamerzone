/* GAMERZONE · Game mix: win card, Clip of the Week, fan matches, clans
   File 7 of 9 in this group. Keep the load order shown in index.html. */
"use strict";
/* =====================================================================
   GAME + SOCIAL LAYER
   wins/{match}/{uid}     place, prize                (written by admin when winners are paid)
   clipWeek/current       postId, uid, name, cap, bonus, wk, t   (written by admin)
   clans/{id}             name, tag, owner, code, t
   clanMembers/{id}/{uid} name          clanCodes/{code}  id          userClan/{uid}  id
   profiles/official      the GAMERZONE Official account (made in the admin Social tab)
   stories/official       pre-match story cards (made in the admin panel)
   ===================================================================== */
function myClanTag() {
  const c = CLANS[UCL];
  return c
    ? String(c.tag || "")
        .replace(/[^A-Za-z0-9]/g, "")
        .slice(0, 5)
    : "";
}
window.myClanTag = myClanTag;
window.gzBattles = () => +((U && U.battles) || 0);
window.__gzg = () => ({ CLANS, CMEM, UCL, CW });

function gameStart() {
  CW = null;
  CLANS = {};
  CMEM = {};
  UCL = "";
  clLoad = {};
  lastCt = null;
  OFF.push(
    DB.watch("clipWeek/current", (v) => {
      CW = v || null;
      cwCheck();
      schedule();
    }),
  );
  OFF.push(
    DB.watch("clans", (v) => {
      CLANS = v || {};
      clLoad.c = 1;
      clanSync();
    }),
  );
  OFF.push(
    DB.watch("clanMembers", (v) => {
      CMEM = v || {};
      clanSync();
    }),
  );
  OFF.push(
    DB.watch("userClan/" + ACC, (v) => {
      UCL = v || "";
      clLoad.u = 1;
      clanSync();
    }),
  );
}
function clanSync() {
  if (!ACC || !ready) return;
  if (clLoad.c && clLoad.u && UCL && !CLANS[UCL]) {
    UCL = "";
    DB.set("userClan/" + ACC, null).catch(() => {});
  }
  const tag = myClanTag();
  if (clLoad.c && clLoad.u && tag !== lastCt) {
    lastCt = tag;
    DB.update("profiles/" + ACC, { ct: tag || null }).catch(() => {
      lastCt = null;
    });
  }
  try {
    ui();
  } catch (e) {}
  schedule();
}

/* ---- Win card: a victory post made from your real win ---- */
async function winPost(mid, m, r, again) {
  try {
    const sc = {
      bgi: 2,
      fi: 0,
      adj: { b: 100, c: 100, s: 100 },
      items: [
        { k: "e", v: "🏆", c: "#fff", s: 24, x: 50, y: 24 },
        { k: "t", v: "VICTORY", c: "#ffd60a", s: 14, x: 50, y: 46 },
        { k: "t", v: String(m.name).slice(0, 24), c: "#fff", s: 7, x: 50, y: 62 },
        { k: "t", v: "#" + r.place + " · " + inr(r.prize), c: "#00ff88", s: 10, x: 50, y: 76 },
      ],
    };
    await DB.set("posts/win_" + mid + "_" + ACC, {
      uid: ACC,
      name: String(PF.name || "Player").slice(0, 40),
      avi: PF.avi || 0,
      cap: "🏆 Won #" + r.place + " in " + m.name + " · " + inr(r.prize),
      s: sc,
      t: Date.now(),
      kind: "win",
      mid,
    });
  } catch (e) {
    if (!again) setTimeout(() => winPost(mid, m, r, 1), 4000);
    else console.error("win post", e);
  }
}

/* ---- Clip of the Week ---- */
function cwCheck() {
  if (!ACC || !ready || !CW || CW.uid !== ACC || !CW.wk) return;
  SEEN.cw = SEEN.cw || {};
  if (SEEN.cw[CW.wk]) return;
  SEEN.cw[CW.wk] = 1;
  const b = +CW.bonus || 0;
  if (b)
    TX.unshift({
      t: Date.now(),
      k: "Milestone bonus",
      d: "Clip of the Week",
      a: b,
      m: "Bonus",
      id: "GZC" + String(CW.wk).slice(-5),
    });
  note("Clip of the Week", "Your post won" + (b ? "! " + inr(b) + " bonus added." : "!"), "🎬");
  toast("🎬 Your post is Clip of the Week!");
  saveState(true);
}
window.cwBanner = () => {
  if (!CW || !CW.postId) return "";
  return (
    '<div class="cwb"><small>🎬 CLIP OF THE WEEK</small><b>' +
    esc(CW.name || "Player") +
    "</b>" +
    (CW.cap ? "<p>" + esc(String(CW.cap).slice(0, 100)) + "</p>" : "") +
    '<button class="btn" data-a="cwgo" data-id="' +
    esc(CW.postId) +
    '">View clip</button></div>'
  );
};
H.cwgo = (b, d) => {
  const el = document.querySelector('.post[data-id="' + String(d.id).replace(/["\\]/g, "") + '"]');
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  else toast("This clip is older than the posts shown here.");
};

/* ---- Fan match: follow GAMERZONE Official to unlock ---- */
H.folof = async (b, d) => {
  const i = PL.findIndex((x) => x.u === "official");
  if (i < 0) {
    toast("The official account is not ready yet. Try again later.");
    return;
  }
  await window.gzFollow(i);
  const c = CS.find((x) => x.id == d.id);
  if (c) joinSheet(c);
};

/* ---- Clans ---- */
const clanStat = (id) => {
  let e = 0,
    w = 0;
  const ms = Object.keys(CMEM[id] || {});
  ms.forEach((u) => {
    const l = LBD[u] || {};
    e += +l.earned || 0;
    w += +l.wins || 0;
  });
  return { n: ms.length, e, w };
};
window.clanHtml = function () {
  const rows = Object.keys(CLANS)
    .filter((id) => CLANS[id] && CLANS[id].name)
    .map((id) => Object.assign({ id }, CLANS[id], clanStat(id)))
    .sort((a, b) => b.e - a.e || b.n - a.n);
  let top;
  const c = UCL && CLANS[UCL];
  if (c) {
    const ms = Object.keys(CMEM[UCL] || {})
      .map((u) => ({
        u,
        n: (CMEM[UCL][u] || {}).name || "Player",
        e: +(LBD[u] || {}).earned || 0,
      }))
      .sort((a, b) => b.e - a.e);
    top =
      '<div class="clb"><div class="eye" style="margin:0 0 6px"><i></i>YOUR CLAN</div><h3>[' +
      esc(c.tag) +
      "] " +
      esc(c.name) +
      '</h3><div class="mut" style="font-size:13px">' +
      ms.length +
      ' / 20 members · invite code <b style="color:var(--text)">' +
      esc(c.code) +
      "</b></div>" +
      '<div class="two" style="margin:12px 0"><button class="btn" data-a="clcopy">Copy code</button><button class="cta" data-a="clwa" style="margin:0;padding:10px;font-size:14px">Invite on WhatsApp</button></div>' +
      ms
        .map(
          (m, i) =>
            '<div class="lb" style="cursor:default"><span class="rk">' +
            (i + 1) +
            '</span><div class="nm">' +
            esc(m.n) +
            (m.u === c.owner ? " 👑" : "") +
            "<small>Won " +
            inr(m.e) +
            "</small></div></div>",
        )
        .join("") +
      '<button class="btn dng" data-a="clleave" style="margin-top:12px;width:100%">' +
      (c.owner === ACC ? "Delete clan" : "Leave clan") +
      "</button></div>";
  } else {
    top =
      '<div class="clb"><h3>Play with your gang</h3><p class="mut" style="margin:6px 0 12px">Create a clan or join one with a code. Your clan climbs the leaderboard when its members win.</p><div class="two"><button class="cta" data-a="clnew" style="margin:0">Create clan</button><button class="btn" data-a="cljoinopen">Join with code</button></div></div>';
  }
  return (
    top +
    '<div class="sech" style="margin-top:6px"><div><div class="eye"><i></i>CLAN LEADERBOARD</div><h2>Top clans</h2></div></div>' +
    (rows.length
      ? rows
          .slice(0, 20)
          .map(
            (r, i) =>
              '<div class="lb" style="cursor:default"><span class="rk">' +
              (MD[i] || i + 1) +
              '</span><div class="nm">[' +
              esc(r.tag) +
              "] " +
              esc(r.name) +
              "<small>" +
              r.n +
              " members · " +
              r.w +
              ' wins</small></div><span class="am">' +
              inr(r.e) +
              "</span></div>",
          )
          .join("")
      : '<p class="mut">No clans yet. Be the first to create one!</p>')
  );
};
H.clnew = () => {
  if (UCL) {
    toast("Leave your current clan first.");
    return;
  }
  sheet(
    "Create clan",
    '<label for="clname">Clan name</label><input id="clname" maxlength="20" placeholder="e.g. Night Wolves"><label for="cltag" style="margin-top:12px">Clan tag (2 to 5 letters)</label><input id="cltag" maxlength="5" placeholder="e.g. NWF" style="text-transform:uppercase"><div class="err" id="clerr" role="alert"></div><button class="cta" data-a="clmk">Create clan</button>',
  );
};
H.clmk = async (b) => {
  const nm = $("clname").value.trim(),
    tg = $("cltag").value.trim().toUpperCase(),
    er = $("clerr");
  if (nm.length < 3) {
    er.textContent = "Clan name needs at least 3 characters.";
    return;
  }
  if (!/^[A-Z0-9]{2,5}$/.test(tg)) {
    er.textContent = "Tag must be 2 to 5 letters or numbers.";
    return;
  }
  b.disabled = true;
  try {
    let code = "";
    const al = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let k = 0; k < 6; k++) {
      code =
        "CL" + Array.from({ length: 5 }, () => al[Math.floor(Math.random() * al.length)]).join("");
      if (!(await DB.get("clanCodes/" + code))) break;
    }
    const id = DB.newId();
    await DB.set("clans/" + id, { name: nm, tag: tg, owner: ACC, code, t: Date.now() });
    await DB.set("clanCodes/" + code, id);
    await DB.set("clanMembers/" + id + "/" + ACC, {
      name: String(PF.name || "Player").slice(0, 40),
    });
    await DB.set("userClan/" + ACC, id);
    closeSheet();
    toast("Clan created. Share your invite code!");
  } catch (e) {
    er.textContent = "Could not create the clan: " + e.message;
    b.disabled = false;
  }
};
H.cljoinopen = () => {
  if (UCL) {
    toast("Leave your current clan first.");
    return;
  }
  sheet(
    "Join a clan",
    '<label for="clcode">Invite code</label><input id="clcode" maxlength="8" placeholder="e.g. CLK7M2Q" style="text-transform:uppercase"><div class="err" id="clerr" role="alert"></div><button class="cta" data-a="cljoin">Join clan</button>',
  );
};
H.cljoin = async (b) => {
  const code = $("clcode").value.trim().toUpperCase(),
    er = $("clerr");
  if (!/^CL[A-Z0-9]{5}$/.test(code)) {
    er.textContent = "That code does not look right.";
    return;
  }
  b.disabled = true;
  try {
    const cid = await DB.get("clanCodes/" + code);
    if (!cid) {
      er.textContent = "No clan found for this code.";
      b.disabled = false;
      return;
    }
    const mem = (await DB.get("clanMembers/" + cid)) || {};
    if (Object.keys(mem).length >= 20) {
      er.textContent = "This clan is full (20 members).";
      b.disabled = false;
      return;
    }
    await DB.set("clanMembers/" + cid + "/" + ACC, {
      name: String(PF.name || "Player").slice(0, 40),
    });
    await DB.set("userClan/" + ACC, cid);
    closeSheet();
    toast("You joined the clan!");
  } catch (e) {
    er.textContent = "Could not join: " + e.message;
    b.disabled = false;
  }
};
H.clleave = async (b) => {
  if (b.dataset.c !== "1") {
    b.dataset.c = "1";
    b.textContent = "Tap again to confirm";
    return;
  }
  const c = CLANS[UCL],
    id = UCL;
  if (!c) return;
  try {
    if (c.owner === ACC) {
      for (const u of Object.keys(CMEM[id] || {}))
        await DB.set("clanMembers/" + id + "/" + u, null);
      await DB.set("clanCodes/" + c.code, null);
      await DB.set("clans/" + id, null);
    } else await DB.set("clanMembers/" + id + "/" + ACC, null);
    await DB.set("userClan/" + ACC, null);
    toast(c.owner === ACC ? "Clan deleted" : "You left the clan");
  } catch (e) {
    toast("Could not do that. Please try again.");
  }
};
H.clcopy = () => {
  const c = CLANS[UCL];
  if (c) copyTxt(c.code, "Invite code copied");
};
H.clwa = () => {
  const c = CLANS[UCL];
  if (!c) return;
  window.open(
    "https://wa.me/?text=" +
      encodeURIComponent(
        "Join my clan " +
          c.name +
          " on GAMERZONE! Open Battles > Clans > Join with code and use " +
          c.code +
          ". " +
          location.href,
      ),
    "_blank",
  );
};
