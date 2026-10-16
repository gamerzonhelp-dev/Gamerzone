/* =====================================================================
   GAMERZONE DATA LAYER  (this exact block is inside BOTH GAMERZONE.html
   and admin.html, so the app and the admin panel talk to the same data)

   BACKEND 'local'    : data is kept in this browser (localStorage). The app and the
                        admin panel share it when both pages are opened from the same
                        place (same folder / same website) in the same browser.
                        Use this to test everything before you add services.
   BACKEND 'firebase' : data is kept in your Firebase Realtime Database, so every
                        phone and the admin panel see the same live data.
                        To switch: set BACKEND to 'firebase' and fill in FIREBASE below.
                        Do this in BOTH files.

   DATA SHAPE
     users/{id}            name, phone, state, dob, wallet, bonus, status('active'|'blocked'),
                           joinedAt, earned, wins, battles, refCode, referredBy
     auth/{id}             hash            (password check; replace with Firebase Auth later)
     matches/{id}          name, game('FREE FIRE'|'BGMI'), mode, fee, prizes[], slots, minPlayers,
                           startAt, durationMin, vipSlots, joined, vipJoined, roomId, roomPass,
                           status('upcoming'|'completed'|'cancelled'), results[], createdAt
     entries/{match}/{id}  name, ign, gameUid, paid, joinedAt, refunded, vip     (admin view)
     myEntries/{id}/{match}  same record, for the player's own app
     payments/{id}         uid, type('deposit'|'withdrawal'), amount, method, ref, status, createdAt,
                           handledAt, note
     utr/{utr}             payment id   (stops one UTR being used twice)
     submissions/{match}_{id}  matchId, uid, name, gameUid, rank, kills, imgId, status, why, createdAt
     img/{imgId}           screenshot as a data URL
     leaderboard/{id}      n, earned, wins
     referrals/{id}/{friend}   name, paid
     refCodes/{code}       user id
     config/payment        upiId, upiName, minDeposit, minWithdraw, supportEmail
     userState/{id}        the player's own app data (profile, posts, history)
   ===================================================================== */
const GZ_CONFIG = {
  BACKEND: "firebase",
  FIREBASE: {
    apiKey: "AIzaSyAr2IKLImYwVgwKe0vV1_9uJNWVwkPsiU4",
    authDomain: "gamerzone-30d34.firebaseapp.com",
    databaseURL: "https://gamerzone-30d34-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "gamerzone-30d34",
    storageBucket: "gamerzone-30d34.firebasestorage.app",
    messagingSenderId: "345682890290",
    appId: "1:345682890290:web:30c0bc67ccff3315e0362b",
  },
  FIREBASE_SDK: "https://www.gstatic.com/firebasejs/10.12.2/",
};

const DB = (() => {
  const useFb =
    GZ_CONFIG.BACKEND === "firebase" && !/YOUR_/.test(Object.values(GZ_CONFIG.FIREBASE).join(" "));
  const parts = (p) => String(p).split("/").filter(Boolean);
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const filt = (v, f, x) => {
    if (!v || typeof v !== "object") return null;
    const o = {};
    Object.keys(v).forEach((k) => {
      if (v[k] && v[k][f] === x) o[k] = v[k];
    });
    return o;
  };

  /* ---------------- local (browser) backend ---------------- */
  const LOCAL = (() => {
    const P = "gzdb:",
      SPLIT = { userState: 1, img: 1 };
    const watchers = [];
    const keyOf = (top, id) => P + top + (SPLIT[top] && id != null ? ":" + id : "");
    const rd = (k) => {
      try {
        const r = localStorage.getItem(k);
        return r == null ? undefined : JSON.parse(r);
      } catch (e) {
        return undefined;
      }
    };
    const wr = (k, v) => {
      try {
        if (v === undefined) localStorage.removeItem(k);
        else localStorage.setItem(k, JSON.stringify(v));
        return true;
      } catch (e) {
        return false;
      }
    };
    function get(path) {
      const a = parts(path);
      if (!a.length) return undefined;
      let node, rest;
      if (SPLIT[a[0]]) {
        if (a.length < 2) return undefined;
        node = rd(keyOf(a[0], a[1]));
        rest = a.slice(2);
      } else {
        node = rd(keyOf(a[0]));
        rest = a.slice(1);
      }
      for (const k of rest) {
        if (node == null || typeof node !== "object") return undefined;
        node = node[k];
      }
      return node;
    }
    function set(path, val) {
      const a = parts(path);
      let key, rest;
      if (SPLIT[a[0]]) {
        key = keyOf(a[0], a[1]);
        rest = a.slice(2);
      } else {
        key = keyOf(a[0]);
        rest = a.slice(1);
      }
      if (val === null) val = undefined;
      if (!rest.length) {
        if (!wr(key, val))
          throw new Error("Browser storage is full. Clear some data and try again.");
        return;
      }
      let root = rd(key);
      if (root == null || typeof root !== "object") root = {};
      let o = root;
      for (let i = 0; i < rest.length - 1; i++) {
        if (o[rest[i]] == null || typeof o[rest[i]] !== "object") o[rest[i]] = {};
        o = o[rest[i]];
      }
      const last = rest[rest.length - 1];
      if (val === undefined) delete o[last];
      else o[last] = val;
      if (!wr(key, root))
        throw new Error("Browser storage is full. Clear some data and try again.");
    }
    function notify() {
      watchers.slice().forEach((w) => {
        let v = get(w.path);
        if (w.field !== undefined) v = filt(v, w.field, w.val);
        const s = JSON.stringify(v === undefined ? null : v);
        if (s !== w.last) {
          w.last = s;
          try {
            w.cb(v === undefined ? null : JSON.parse(s));
          } catch (e) {
            console.error(e);
          }
        }
      });
    }
    const later = () => Promise.resolve().then(notify);
    addEventListener("storage", (e) => {
      if (e.key && e.key.indexOf(P) === 0) notify();
    });
    return {
      async init() {},
      async get(p) {
        const v = get(p);
        return v === undefined ? null : JSON.parse(JSON.stringify(v));
      },
      async set(p, v) {
        set(p, v);
        later();
      },
      async multi(o) {
        Object.keys(o).forEach((k) => set(k, o[k]));
        later();
      },
      async update(p, o) {
        Object.keys(o).forEach((k) => set(p + "/" + k, o[k]));
        later();
      },
      async inc(p, d, o) {
        o = o || {};
        const min = o.min == null ? -Infinity : o.min,
          max = o.max == null ? Infinity : o.max;
        const n = (Number(get(p)) || 0) + d;
        if (n < min || n > max) return false;
        set(p, n);
        later();
        return true;
      },
      async claim(p, from, to) {
        const c = get(p);
        if (from === null ? c != null : c !== from) return false;
        set(p, to);
        later();
        return true;
      },
      watch(p, cb, field, val) {
        const w = { path: p, cb, field, val, last: undefined };
        watchers.push(w);
        Promise.resolve().then(() => {
          let v = get(p);
          if (field !== undefined) v = filt(v, field, val);
          w.last = JSON.stringify(v === undefined ? null : v);
          cb(v === undefined ? null : JSON.parse(w.last));
        });
        return () => {
          const i = watchers.indexOf(w);
          if (i >= 0) watchers.splice(i, 1);
        };
      },
      watchLast(p, n, cb) {
        return LOCAL.watch(p, (v) => {
          if (!v) return cb(v);
          const o = {};
          Object.keys(v)
            .sort((a, b) => ((v[b] || {}).t || 0) - ((v[a] || {}).t || 0))
            .slice(0, n)
            .forEach((k) => (o[k] = v[k]));
          cb(o);
        });
      },
      async wipe() {
        const rm = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.indexOf(P) === 0) rm.push(k);
        }
        rm.forEach((k) => localStorage.removeItem(k));
        later();
      },
    };
  })();

  /* ---------------- Firebase backend (needs the config above) ---------------- */
  const FB = (() => {
    let db = null;
    const load = (src) =>
      new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = res;
        s.onerror = () => rej(new Error("Could not load " + src));
        document.head.appendChild(s);
      });
    return {
      async init() {
        await load(GZ_CONFIG.FIREBASE_SDK + "firebase-app-compat.js");
        await load(GZ_CONFIG.FIREBASE_SDK + "firebase-database-compat.js");
        await load(GZ_CONFIG.FIREBASE_SDK + "firebase-auth-compat.js");
        if (!firebase.apps.length) firebase.initializeApp(GZ_CONFIG.FIREBASE);
        db = firebase.database();
      },
      async get(p) {
        return (await db.ref(p).get()).val();
      },
      async set(p, v) {
        await db.ref(p).set(v === undefined ? null : v);
      },
      async multi(o) {
        await db.ref().update(o);
      },
      async update(p, o) {
        await db.ref(p).update(o);
      },
      async inc(p, d, o) {
        o = o || {};
        const min = o.min == null ? -Infinity : o.min,
          max = o.max == null ? Infinity : o.max;
        const r = await db.ref(p).transaction((c) => {
          const n = (Number(c) || 0) + d;
          return n < min || n > max ? undefined : n;
        });
        return r.committed;
      },
      async claim(p, from, to) {
        const r = await db.ref(p).transaction((c) => {
          if (c === null)
            return to; /* first pass can be empty: Firebase re-checks with the real value */
          return (from === null ? false : c === from) ? to : undefined;
        });
        return r.committed && (from !== null || r.snapshot.val() === to);
      },
      watch(p, cb, field, val) {
        const ref = field !== undefined ? db.ref(p).orderByChild(field).equalTo(val) : db.ref(p);
        const fn = (s) => cb(s.val());
        ref.on("value", fn);
        return () => ref.off("value", fn);
      },
      watchLast(p, n, cb) {
        const ref = db.ref(p).orderByChild("t").limitToLast(n);
        const fn = (s) => cb(s.val());
        ref.on("value", fn);
        return () => ref.off("value", fn);
      },
      async wipe() {
        await db.ref().set(null);
      },
    };
  })();

  const B = useFb ? FB : LOCAL;
  const ready = (async () => {
    await B.init();
  })();

  /* ---------------- sample matches (first run only) ---------------- */
  function sampleMatches() {
    const N = Date.now(),
      M = 6e4;
    return {
      m1: {
        name: "Solo Clash",
        game: "FREE FIRE",
        mode: "SOLO",
        fee: 20,
        prizes: [100, 40],
        slots: 48,
        minPlayers: 25,
        startAt: N + 25 * M,
        durationMin: 30,
        vipSlots: 4,
        joined: 31,
        vipJoined: 0,
        roomId: "",
        roomPass: "",
        status: "upcoming",
        createdAt: N,
      },
      m2: {
        name: "1v1 Stadium",
        game: "FREE FIRE",
        mode: "1V1",
        fee: 50,
        prizes: [200, 100],
        slots: 16,
        minPlayers: 12,
        startAt: N + 90 * M,
        durationMin: 60,
        vipSlots: 2,
        joined: 9,
        vipJoined: 0,
        roomId: "",
        roomPass: "",
        status: "upcoming",
        createdAt: N,
      },
      m3: {
        name: "Mega Solo",
        game: "BGMI",
        mode: "SOLO",
        fee: 200,
        prizes: [3000, 1500, 600],
        slots: 48,
        minPlayers: 48,
        startAt: N + 180 * M,
        durationMin: 40,
        vipSlots: 4,
        joined: 44,
        vipJoined: 0,
        roomId: "",
        roomPass: "",
        status: "upcoming",
        createdAt: N,
      },
    };
  }

  /* ---------- DEMO DATA (local test mode only) ----------
     Fake players, entries, payments and screenshots so you can watch the admin panel
     and the app work together. It is written ONLY when BACKEND is 'local'. With
     BACKEND 'firebase' none of this is ever written, so going live starts clean.
     Demo logins: phone 9876500001 to 9876500005, password demo123 (signup OTP is 1234). */
  function demoData() {
    const N = Date.now(),
      M = 6e4,
      HR = 36e5,
      DAY = 864e5;
    const shot = (rank, kills, who) =>
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640"><rect width="360" height="640" fill="#0b1210"/>' +
          '<text x="180" y="120" fill="#00ff88" font-family="Arial" font-size="26" font-weight="700" text-anchor="middle">MATCH RESULT</text>' +
          '<text x="180" y="260" fill="#fff" font-family="Arial" font-size="84" font-weight="700" text-anchor="middle">#' +
          rank +
          "</text>" +
          '<text x="180" y="330" fill="#9fb3aa" font-family="Arial" font-size="22" text-anchor="middle">RANK</text>' +
          '<text x="180" y="420" fill="#fff" font-family="Arial" font-size="56" font-weight="700" text-anchor="middle">' +
          kills +
          "</text>" +
          '<text x="180" y="456" fill="#9fb3aa" font-family="Arial" font-size="22" text-anchor="middle">KILLS</text>' +
          '<text x="180" y="560" fill="#00c46a" font-family="Arial" font-size="20" text-anchor="middle">' +
          who +
          " (demo screenshot)</text></svg>",
      );
    const mk = (n, g, mode, fee, prizes, slots, minP, off, dur, vip, joined, extra) =>
      Object.assign(
        {
          name: n,
          game: g,
          mode,
          fee,
          prizes,
          slots,
          minPlayers: minP,
          startAt: N + off,
          durationMin: dur,
          vipSlots: vip,
          joined,
          vipJoined: 0,
          roomId: "",
          roomPass: "",
          status: "upcoming",
          createdAt: N - DAY,
        },
        extra || {},
      );
    const ent = (name, ign, uid, paid, ago, vip) => ({
      name,
      ign,
      gameUid: uid,
      paid,
      joinedAt: N - ago,
      refunded: false,
      vip: !!vip,
    });
    const mine = (e) => {
      const o = Object.assign({}, e);
      delete o.name;
      return o;
    };
    const E = {
      m1: {
        u9876500001: ent("Rahul Sharma", "RahulYT", "512345678", 20, 3 * HR),
        u9876500002: ent("Priya Verma", "PriyaGG", "523456789", 20, 2 * HR),
        u9876500004: ent("Vikram Singh", "VikramOP", "534567890", 20, HR),
      },
      m2: { u9876500004: ent("Vikram Singh", "VikramOP", "534567890", 50, 40 * M) },
      m3: { u9876500002: ent("Priya Verma", "PriyaGG", "5112233445", 200, HR) },
      m4: {
        u9876500001: ent("Rahul Sharma", "RahulYT", "512345678", 20, 2 * HR + 50 * M),
        u9876500002: ent("Priya Verma", "PriyaGG", "523456789", 20, 2 * HR + 40 * M),
        u9876500004: ent("Vikram Singh", "VikramOP", "534567890", 20, 2 * HR + 30 * M),
        u9876500005: ent("Neha Gupta", "NehaQueen", "545678901", 20, 2 * HR + 20 * M),
      },
      m5: {
        u9876500001: ent("Rahul Sharma", "RahulYT", "512345678", 20, DAY + 5 * HR),
        u9876500004: ent("Vikram Singh", "VikramOP", "534567890", 20, DAY + 4 * HR),
      },
    };
    const ME = {};
    Object.keys(E).forEach((m) =>
      Object.keys(E[m]).forEach((u) => {
        (ME[u] = ME[u] || {})[m] = mine(E[m][u]);
      }),
    );
    const sub = (matchId, matchName, uid, name, gameUid, ign, rank, kills, status, why, ago) => ({
      matchId,
      matchName,
      uid,
      name,
      gameUid,
      ign,
      rank,
      kills,
      imgId: "demo_" + matchId + "_" + uid,
      status,
      why: why || "",
      createdAt: N - ago,
    });
    const S = {
      ["m4_u9876500001"]: sub(
        "m4",
        "Evening Solo",
        "u9876500001",
        "Rahul Sharma",
        "512345678",
        "RahulYT",
        2,
        6,
        "pending",
        "",
        12 * M,
      ),
      ["m4_u9876500002"]: sub(
        "m4",
        "Evening Solo",
        "u9876500002",
        "Priya Verma",
        "523456789",
        "PriyaGG",
        1,
        12,
        "pending",
        "",
        10 * M,
      ),
      ["m4_u9876500004"]: sub(
        "m4",
        "Evening Solo",
        "u9876500004",
        "Vikram Singh",
        "534567890",
        "VikramOP",
        9,
        1,
        "pending",
        "",
        8 * M,
      ),
      ["m4_u9876500005"]: sub(
        "m4",
        "Evening Solo",
        "u9876500005",
        "Neha Gupta",
        "545678901",
        "NehaQueen",
        4,
        3,
        "rejected",
        "Screenshot is blurry or cropped",
        6 * M,
      ),
      ["m5_u9876500004"]: sub(
        "m5",
        "Morning Clash",
        "u9876500004",
        "Vikram Singh",
        "534567890",
        "VikramOP",
        1,
        9,
        "approved",
        "",
        DAY + 2 * HR,
      ),
      ["m5_u9876500001"]: sub(
        "m5",
        "Morning Clash",
        "u9876500001",
        "Rahul Sharma",
        "512345678",
        "RahulYT",
        2,
        5,
        "approved",
        "",
        DAY + 2 * HR,
      ),
    };
    const IMGS = {};
    Object.keys(S).forEach((k) => {
      const s = S[k];
      IMGS[s.imgId] = shot(s.rank, s.kills, s.name);
    });
    const usr = (
      name,
      phone,
      state,
      dob,
      wallet,
      bonus,
      status,
      joinedDays,
      earned,
      wins,
      battles,
      refCode,
      extra,
    ) =>
      Object.assign(
        {
          name,
          phone,
          state,
          dob,
          wallet,
          bonus,
          status,
          joinedAt: N - joinedDays * DAY,
          earned,
          wins,
          battles,
          refCode,
        },
        extra || {},
      );
    return {
      users: {
        u9876500001: usr(
          "Rahul Sharma",
          "9876500001",
          "Rajasthan",
          "2002-04-12",
          340,
          0,
          "active",
          30,
          40,
          0,
          3,
          "GZRAHU101",
        ),
        u9876500002: usr(
          "Priya Verma",
          "9876500002",
          "Maharashtra",
          "2001-09-03",
          120,
          0,
          "active",
          21,
          0,
          0,
          3,
          "GZPRIY202",
          { referredBy: "u9876500001" },
        ),
        u9876500003: usr(
          "Aman Khan",
          "9876500003",
          "Delhi",
          "2000-01-25",
          0,
          0,
          "blocked",
          15,
          0,
          0,
          0,
          "GZAMAN303",
        ),
        u9876500004: usr(
          "Vikram Singh",
          "9876500004",
          "Punjab",
          "1999-11-18",
          560,
          0,
          "active",
          10,
          100,
          1,
          4,
          "GZVIKR404",
        ),
        u9876500005: usr(
          "Neha Gupta",
          "9876500005",
          "Uttar Pradesh",
          "2003-06-30",
          75,
          0,
          "active",
          4,
          0,
          0,
          1,
          "GZNEHA505",
          { referredBy: "u9876500001" },
        ),
      },
      auth: {
        u9876500001: { hash: "0a705584e9b97e052773a6856e17d9d085c98e611627274faa2054e6670d0e3d" },
        u9876500002: { hash: "0face9b6d9075e43cc0c5908e8a3ab2d30ffb01031b7fcedefa9e0fccfa258ba" },
        u9876500003: { hash: "9d34a6fe6e0322376c02bbb855dcd074f2f0c6badc9faec1b20d55199a7259e2" },
        u9876500004: { hash: "37322df5c1d598ab7ff5db7bed1d900cf07d2c4aa318d93a6a09d00589995182" },
        u9876500005: { hash: "b0f0c5e41e6c409a7e7b806a79aa9189bfe9f0bfa8cc59d866f51ebbc1452595" },
      },
      refCodes: {
        GZRAHU101: "u9876500001",
        GZPRIY202: "u9876500002",
        GZAMAN303: "u9876500003",
        GZVIKR404: "u9876500004",
        GZNEHA505: "u9876500005",
      },
      referrals: {
        u9876500001: {
          u9876500002: { name: "Priya Verma", paid: true },
          u9876500005: { name: "Neha Gupta", paid: false },
        },
      },
      matches: {
        m1: mk("Solo Clash", "FREE FIRE", "SOLO", 20, [100, 40], 48, 25, 25 * M, 30, 4, 31),
        m2: mk("1v1 Stadium", "FREE FIRE", "1V1", 50, [200, 100], 16, 12, 90 * M, 60, 2, 9),
        m3: mk("Mega Solo", "BGMI", "SOLO", 200, [3000, 1500, 600], 48, 48, 180 * M, 40, 4, 44),
        m4: mk("Evening Solo", "FREE FIRE", "SOLO", 20, [100, 40], 48, 25, -50 * M, 30, 4, 30, {
          roomId: "78451236",
          roomPass: "gz2026",
        }),
        m5: mk(
          "Morning Clash",
          "FREE FIRE",
          "SOLO",
          20,
          [100, 40],
          48,
          25,
          -DAY - 3 * HR,
          30,
          4,
          28,
          {
            roomId: "66120098",
            roomPass: "clash9",
            status: "completed",
            completedAt: N - DAY - 2 * HR,
            results: [
              { place: 1, uid: "u9876500004", name: "Vikram Singh", prize: 100 },
              { place: 2, uid: "u9876500001", name: "Rahul Sharma", prize: 40 },
            ],
          },
        ),
        m6: mk("BGMI Quick Solo", "BGMI", "SOLO", 50, [400, 150], 48, 30, -10 * M, 40, 4, 41, {
          roomId: "90017733",
          roomPass: "bgmi77",
        }),
      },
      entries: E,
      myEntries: ME,
      submissions: S,
      img: IMGS,
      payments: {
        p1: {
          uid: "u9876500005",
          type: "deposit",
          amount: 200,
          method: "UPI",
          ref: "412398765432",
          status: "pending",
          createdAt: N - 15 * M,
        },
        p2: {
          uid: "u9876500001",
          type: "withdrawal",
          amount: 300,
          method: "UPI",
          ref: "rahul@okaxis",
          status: "pending",
          createdAt: N - 40 * M,
        },
        p3: {
          uid: "u9876500002",
          type: "deposit",
          amount: 500,
          method: "UPI",
          ref: "398712345678",
          status: "approved",
          createdAt: N - 2 * DAY,
          handledAt: N - 2 * DAY + 20 * M,
        },
        p4: {
          uid: "u9876500004",
          type: "withdrawal",
          amount: 150,
          method: "UPI",
          ref: "vikram@oksbi",
          status: "rejected",
          note: "UPI ID is not valid",
          createdAt: N - DAY,
          handledAt: N - DAY + HR,
        },
        p5: {
          uid: "u9876500001",
          type: "deposit",
          amount: 100,
          method: "UPI",
          ref: "455512349876",
          status: "pending",
          createdAt: N - 5 * M,
        },
      },
      utr: { 412398765432: "p1", 398712345678: "p3", 455512349876: "p5" },
      leaderboard: {
        u9876500004: { n: "Vikram Singh", earned: 100, wins: 1 },
        u9876500001: { n: "Rahul Sharma", earned: 40, wins: 0 },
      },
      config: {
        payment: {
          upiId: "gamerzone@okicici",
          upiName: "GAMERZONE",
          minDeposit: 10,
          maxDeposit: 10000,
          minWithdraw: 100,
          maxWithdraw: 10000,
          supportEmail: "GAMERZONE.HELP@gmail.com",
        },
      },
    };
  }
  async function putDemo() {
    const d = demoData();
    for (const top of Object.keys(d)) {
      if (top === "img") {
        for (const id of Object.keys(d.img)) await B.set("img/" + id, d.img[id]);
      } else await B.set(top, d[top]);
    }
    await B.set("meta/demo", true);
  }

  return {
    mode: useFb ? "firebase" : "local",
    ready,
    newId,
    get: async (p) => {
      await ready;
      return B.get(p);
    },
    set: async (p, v) => {
      await ready;
      return B.set(p, v);
    },
    update: async (p, o) => {
      await ready;
      return B.update(p, o);
    },
    multi: async (o) => {
      await ready;
      return B.multi(o);
    },
    inc: async (p, d, o) => {
      await ready;
      return B.inc(p, d, o);
    },
    claim: async (p, a, b) => {
      await ready;
      return B.claim(p, a, b);
    },
    watch(p, cb) {
      let off = null,
        dead = false;
      ready.then(() => {
        if (!dead) off = B.watch(p, cb);
      });
      return () => {
        dead = true;
        if (off) off();
      };
    },
    watchLast(p, n, cb) {
      let off = null,
        dead = false;
      ready.then(() => {
        if (!dead) off = B.watchLast(p, n, cb);
      });
      return () => {
        dead = true;
        if (off) off();
      };
    },
    watchWhere(p, f, v, cb) {
      let off = null,
        dead = false;
      ready.then(() => {
        if (!dead) off = B.watch(p, cb, f, v);
      });
      return () => {
        dead = true;
        if (off) off();
      };
    },
    putImage: (id, data) => DB.set("img/" + id, data),
    getImage: (id) => DB.get("img/" + id),
    /* make sample matches the first time anything opens */
    async ensureSeed() {
      await ready;
      if (useFb) return; /* live database: nothing to seed, and nothing may be read before login */
      if (await B.get("meta/seeded")) return;
      await B.set("meta/seeded", true);
      if (useFb) return; /* live database starts clean: no demo data */
      await putDemo();
    },
    /* kind 'demo': wipe and restore sample matches. kind 'fresh': wipe everything (use before launch). */
    async reset(kind) {
      await ready;
      await B.wipe();
      await B.set("meta/seeded", true);
      if (kind === "demo" && !useFb) await putDemo();
    },
  };
})();
