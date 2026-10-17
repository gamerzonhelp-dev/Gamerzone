/* GAMERZONE · Refer and earn, settings, sign-up code
   File 8 of 11 in this group. Keep the load order shown in index.html. */
function ext6(a, b) {
  const d = b.dataset;
  if (a === "pmsel") {
    if (b.disabled) return 1;
    const u = $("upiid");
    if (u) UPIID = u.value;
    PX.m = d.m;
    payView();
    return 1;
  }
  if (a === "wamt") {
    $("wamt").value = d.n;
    return 1;
  }
  if (a === "wadd") {
    const n = Math.floor(+$("wamt").value);
    if (!(n >= 10 && n <= 10000)) {
      $("werr").textContent = "Enter an amount between ₹10 and ₹10,000.";
      return 1;
    }
    payFlow({
      title: "Add money to wallet",
      kind: "Wallet top-up",
      amt: n,
      wallet: false,
      credit: 1,
      done: () => {
        WAL.b += n;
      },
    });
    return 1;
  }
  if (a === "paygo") {
    const o = PX;
    if (o.m === "upi") {
      const v = $("upiid").value.trim();
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v)) {
        $("payerr").textContent = "Enter a valid UPI ID, like name@upi.";
        return 1;
      }
      UPIID = v;
    }
    b.disabled = true;
    b.textContent = "Processing…";
    setTimeout(() => {
      const pa = payAmt(o),
        ub = o.useB ? bnU(o) : 0;
      if (o.m === "wallet") {
        if (WAL.b < pa) {
          payView();
          $("payerr").textContent = "Not enough balance.";
          return;
        }
        WAL.b -= pa;
      }
      WAL.bn -= ub;
      const id = "GZ" + Math.floor(1e9 + Math.random() * 9e9),
        mn = o.m === "wallet" ? "Wallet" : PM.find((x) => x[0] === o.m)[1];
      TX.unshift({
        t: Date.now(),
        k: o.kind,
        d: o.title + (ub ? " (₹" + ub + " bonus used)" : ""),
        a: o.credit ? pa : -pa,
        m: mn,
        id: id,
      });
      if (o.done) o.done(pa);
      let gr = 0;
      if (o.kind === "Entry fee" && REF.by && !REF.got) {
        REF.got = 1;
        gr = 20;
        WAL.bn += 20;
        TX.unshift({
          t: Date.now(),
          k: "Referral bonus",
          d: "Welcome bonus for using a code",
          a: 20,
          m: "Bonus",
          id: id + "B",
        });
      }
      sheet(
        "Payment successful",
        '<div class="pay-ok"><div class="tick">✓</div><strong>₹' +
          pa +
          "</strong><small>" +
          esc(o.title) +
          '</small></div><div class="kv"><span>Paid with</span><b>' +
          mn +
          "</b></div>" +
          (ub ? '<div class="kv"><span>Bonus used</span><b>₹' + ub + "</b></div>" : "") +
          (gr ? '<div class="kv"><span>Referral bonus</span><b>+₹20</b></div>' : "") +
          '<div class="kv"><span>Transaction ID</span><b>' +
          id +
          '</b></div><button class="cta" data-a="x" style="margin-top:14px">Done</button>',
      );
      renderB();
      renderD();
      renderP();
      feed();
      renderStories();
    }, 1400);
    return 1;
  }
  if (a === "bnuse") {
    PX.useB = !PX.useB;
    if (PX.m === "wallet" && WAL.b < payAmt(PX)) PX.m = "gpay";
    payView();
    return 1;
  }
  return ext7(a, b);
}
const REF = { code: "", by: "", got: 0, earn: 0, friends: [], rew: {} },
  SET = { push: 1, remind: 1, sound: 1 },
  MS = [
    [3, "₹30 bonus"],
    [5, "₹50 bonus"],
  ];
const DF = [
  "ShadowKing",
  "AceRaj",
  "PixelQueen",
  "TurboVik",
  "HeadshotHari",
  "NightOwl",
  "ZeroLag",
  "BlazeKid",
  "IronFist",
  "LoneWolf",
];
function genRef(n) {
  if (REF.code) return;
  REF.code =
    "GZ" +
    (n
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase()
      .slice(0, 4) || "GAME") +
    (100 + Math.floor(Math.random() * 900));
}
function refMsg() {
  return (
    "Join me on GAMERZONE! Use my code " +
    REF.code +
    " and get ₹20 bonus on your first contest. " +
    location.href
  );
}
var MPEND = {};
function refReward() {
  const n = window.gzRefCount ? window.gzRefCount() : 0;
  MS.forEach((m) => {
    if (n >= m[0] && !REF.rew[m[0]] && !MPEND["mile_" + m[0]]) {
      MPEND["mile_" + m[0]] = 1;
      const v = m[0] === 3 ? 30 : m[0] === 5 ? 50 : 100;
      const g = window.gzGrant ? window.gzGrant("mile_" + m[0], v) : Promise.resolve(false);
      g.then((ok) => {
        delete MPEND["mile_" + m[0]];
        if (ok === "done") {
          REF.rew[m[0]] = 1;
          return;
        }
        if (ok !== true) return;
        REF.rew[m[0]] = 1;
        REF.earn += v;
        TX.unshift({
          t: Date.now(),
          k: "Referral bonus",
          d: m[0] + "-friend milestone",
          a: v,
          m: "Bonus",
          id: "GZM" + m[0],
        });
        toast("Milestone unlocked: " + m[1]);
        window.gzUi && window.gzUi();
      });
    }
  });
}
function refCard() {
  return '<div class="refc"><span class="em">🎁</span><div><b>Refer &amp; Earn</b><small>Invite friends, earn ₹20 each</small></div><button class="btn" data-a="refopen">Invite</button></div>';
}
function openRef(keep) {
  const n = REF.friends.length,
    nx = MS.find((m) => n < m[0]),
    pv = [...MS].reverse().find((m) => n >= m[0]),
    p0 = pv ? pv[0] : 0,
    pct = nx ? Math.round(((n - p0) / (nx[0] - p0)) * 100) : 100;
  $("nwrap").innerHTML =
    '<div class="nh"><button data-a="nback" aria-label="Back">' +
    svg("back") +
    '</button><b>Refer &amp; Earn</b></div><div class="rf"><div class="rh"><small>INVITE FRIENDS</small><h3>Earn ₹20 for every friend who plays</h3><p>Your friend gets ₹20 bonus too.</p></div><div class="rcode"><div><small>Your referral code</small><b>' +
    REF.code +
    '</b></div><button class="btn" data-a="rcopy">Copy</button></div><div class="two" style="margin-top:10px"><button class="cta" data-a="rwa" style="margin:0;padding:13px;font-size:15px">Share on WhatsApp</button><button class="btn" data-a="rsh">More options</button></div><div class="rst"><div><b>' +
    n +
    "</b>Friends joined</div><div><b>₹" +
    REF.earn +
    "</b>Bonus earned</div><div><b>₹" +
    WAL.bn +
    '</b>Bonus balance</div></div><div class="rsec">Milestone rewards</div><div class="rpb"><i style="width:' +
    pct +
    '%"></i></div><div class="mut" style="font-size:12px;margin:0 0 6px">' +
    (nx
      ? nx[0] - n + " more friend" + (nx[0] - n > 1 ? "s" : "") + " to unlock " + nx[1]
      : "All rewards unlocked") +
    "</div>" +
    MS.map(
      (m) =>
        '<div class="ms' +
        (n >= m[0] ? " on" : "") +
        '"><span class="ck">' +
        (n >= m[0] ? "✓" : "") +
        "</span><div><b>" +
        m[0] +
        " friends</b> · " +
        m[1] +
        "</div></div>",
    ).join("") +
    '<div class="rsec">How it works</div><div class="rstep"><span>1</span><div>Share your code with friends.</div></div><div class="rstep"><span>2</span><div>They sign up with your code.</div></div><div class="rstep"><span>3</span><div>When they play their first paid contest, you both get ₹20 bonus.</div></div><div class="rsec">Your referrals</div>' +
    (n
      ? REF.friends
          .map(
            (f) =>
              '<div class="lb" style="cursor:default"><div class="av" style="background:#2b3140">' +
              f.n[0] +
              '</div><div class="nm">' +
              esc(f.n) +
              '<small>Played first contest</small></div><span class="am">+₹20</span></div>',
          )
          .join("")
      : '<p class="mut">No referrals yet. Share your code to start earning.</p>') +
    '<div class="rsec">Terms</div><ul class="rtc"><li>Bonus balance works only on contest entry fees, up to 15% of each entry fee. It cannot be withdrawn.</li><li>Rewards are given after your friend’s first paid entry.</li><li>One reward per phone number. Self-referrals and fake accounts are not rewarded.</li><li>GAMERZONE may change or stop this offer at any time.</li></ul></div>';
  $("nv").classList.add("on");
  if (!keep) $("nv").scrollTop = 0;
}
const LG = {
  terms: [
    "Terms of use",
    "By using GAMERZONE you agree to follow the contest rules, play fairly, use only your own game account and verify your email before paid actions. GAMERZONE may remove accounts or disqualify players who break the rules.",
  ],
  privacy: [
    "Privacy policy",
    "We store your gamer name, email, phone number, photos, posts and in-app activity to run the app. Songs come from Audius. We do not sell your personal data.",
  ],
  refund: [
    "Refund &amp; cancellation",
    "Entry fees are refunded in full to your wallet (by our team, within 24 hours) if a contest is cancelled or does not reach its minimum players. Once the room ID is shared, the entry fee is not refundable. Bonus balance cannot be withdrawn or refunded.",
  ],
  fair: [
    "Fair play rules",
    "One account per player. No hacks, emulator abuse, teaming or account sharing. Breaking these rules means disqualification without refund.",
  ],
};
const FAQ = [
  [
    "How do I join a contest?",
    "Open Battles, pick a contest, enter your game ID and pay the entry fee.",
  ],
  ["When do I get the room ID and password?", "Ten minutes before the match, in My battles."],
  [
    "What if a contest is cancelled?",
    "If the minimum players do not join, our team refunds your entry fee to your wallet within 24 hours.",
  ],
  [
    "Why must I verify my email?",
    "To stop fake accounts. Verify it once to join contests, add money, buy VIP or withdraw.",
  ],
  [
    "What are Deposit, Winnings and Bonus?",
    "Deposit is money you added, Winnings are prizes you won, Bonus can pay up to 15% of an entry fee. Deposit is used first.",
  ],
  [
    "How are prizes paid?",
    "Winners are verified and prizes are credited to the wallet. Withdrawals will open when payments go live.",
  ],
  [
    "What does VIP give me?",
    "₹49/month gives reserved priority slots in every contest and an exclusive VIP badge.",
  ],
  [
    "How does Refer &amp; Earn work?",
    "Share your code. When a friend plays their first paid contest, you both get ₹20 bonus.",
  ],
];
function sbox(r) {
  return '<div class="sbox">' + r.join("") + "</div>";
}
function sra(ic, t, sub, a, x) {
  return (
    '<button class="sr2" data-a="' +
    a +
    '" ' +
    (x || "") +
    '><span class="si2">' +
    ic +
    "</span><div>" +
    t +
    (sub ? "<small>" + sub + "</small>" : "") +
    "</div><i>›</i></button>"
  );
}
function srt(ic, t, sub, k) {
  return (
    '<button class="sr2" data-a="stog" data-k="' +
    k +
    '"><span class="si2">' +
    ic +
    "</span><div>" +
    t +
    "<small>" +
    sub +
    '</small></div><span class="tgl' +
    (SET[k] ? " on" : "") +
    '"></span></button>'
  );
}
function renderS() {
  const ini = (PF.name || "G")[0].toUpperCase();
  $("v-settings").innerHTML =
    '<div class="sech"><div><div class="eye"><i></i>YOUR ACCOUNT</div><h2>Settings</h2></div></div><button class="sprof" data-a="pedit"><div class="av" style="background:' +
    (PF.pic ? "url('" + PF.pic + "') center/cover" : bgOf(PF.avi)) +
    '">' +
    (PF.pic ? "" : esc(ini)) +
    "</div><div><b>" +
    esc(PF.name || "Player") +
    "</b><small>" +
    (PF.phone ? "+91 " + esc(PF.phone) : "Phone not added") +
    '</small></div><i>›</i></button><div class="sg">ACCOUNT</div>' +
    sbox(
      [
        sra("👤", "Edit profile", "Name, bio, game IDs, photos", "pedit"),
        sra(
          "💰",
          "Wallet &amp; payments",
          "Add money, payment history",
          "dgo",
          'data-g="dashboard"',
        ),
        sra("🎁", "Refer &amp; Earn", "Invite friends, earn ₹20 each", "refopen"),
        sra("⭐", "VIP membership", "₹49/month · priority slot and badge", "vipopen"),
      ].concat(
        typeof GPW === "function" && GPW()
          ? [sra("🔑", "Set a password", "Log in with email in the app", "setpw")]
          : [],
      ),
    ) +
    '<div class="sg">PREFERENCES</div>' +
    sbox([
      srt("🔔", "Push notifications", "Likes, comments and followers", "push"),
      srt("⏰", "Match reminders", "Alert before your contest starts", "remind"),
      srt("🔊", "Sound effects", "App sounds and haptics", "sound"),
    ]) +
    (window.gzIsApp && gzIsApp()
      ? ""
      : '<div class="sg">APP</div>' +
        sbox([
          sra("📲", "Install GAMERZONE app", "Add it to your home screen", "instapp"),
          sra("🤖", "Download Android app (APK)", "Get the app file from our site", "getapk"),
        ])) +
    '<div class="sg">SUPPORT</div>' +
    sbox([
      sra("❓", "Help center", "Answers to common questions", "shelp"),
      sra("💬", "Contact support", "Chat or email us", "scon"),
    ]) +
    '<div class="sg">LEGAL</div>' +
    sbox([
      sra("📄", "Terms &amp; Conditions", "", "lgl", 'data-k="terms"'),
      sra("🔒", "Privacy Policy", "", "lgl", 'data-k="privacy"'),
      sra("↩️", "Refund &amp; Cancellation Policy", "", "lgl", 'data-k="refund"'),
      sra("🔞", "18+ &amp; Responsible play", "", "lgl", 'data-k="age"'),
      sra(
        "📍",
        "Restricted states",
        "Not available in " + RST.length + " states",
        "lgl",
        'data-k="geo"',
      ),
      sra("🛡️", "Fair Play &amp; Anti-Fraud Policy", "", "lgl", 'data-k="fair"'),
    ]) +
    '<p class="mut" style="text-align:center;font-size:12px;margin:16px 0 0">18+ only · Play responsibly · Not available in ' +
    RST.join(", ") +
    '</p><p class="mut" style="text-align:center;font-size:12px;margin:20px 0 0">GAMERZONE v1.1 · build 16 Oct b</p><button class="lo" data-a="plo">Log out</button>';
}
function ext7(a, b) {
  const d = b.dataset;
  if (a === "refopen") {
    openRef();
    return 1;
  }
  if (a === "rcopy") {
    if (navigator.clipboard)
      navigator.clipboard.writeText(REF.code).then(
        () => toast("Code copied"),
        () => toast("Could not copy"),
      );
    else toast("Copy is not supported here");
    return 1;
  }
  if (a === "rwa") {
    window.open("https://wa.me/?text=" + encodeURIComponent(refMsg()), "_blank");
    return 1;
  }
  if (a === "rsh") {
    const m = refMsg();
    if (navigator.share) navigator.share({ title: "GAMERZONE", text: m }).catch(() => {});
    else if (navigator.clipboard)
      navigator.clipboard.writeText(m).then(
        () => toast("Invite message copied"),
        () => toast("Could not copy"),
      );
    return 1;
  }
  if (a === "stog") {
    SET[d.k] = !SET[d.k];
    renderS();
    return 1;
  }
  if (a === "shelp") {
    sheet(
      "Help center",
      '<div class="faq">' +
        FAQ.map((f) => "<b>" + f[0] + "</b><p>" + f[1] + "</p>").join("") +
        "</div>",
    );
    return 1;
  }
  if (a === "scon") {
    sheet(
      "Contact support",
      '<p class="mut">Write to us at <a href="mailto:GAMERZONE.HELP@gmail.com" style="color:var(--green)">GAMERZONE.HELP@gmail.com</a> with your contest name, date and transaction ID. We reply within 3 working days.</p><p class="mut" style="font-size:12px">Grievance Officer: Samarsingh, <a href="mailto:samarsingh0839@gmail.com" style="color:var(--green)">samarsingh0839@gmail.com</a></p><a class="cta" href="mailto:GAMERZONE.HELP@gmail.com" style="display:block;text-align:center;text-decoration:none">Email support</a>',
    );
    return 1;
  }
  if (a === "instapp") {
    window.gzInstall && gzInstall();
    return 1;
  }
  if (a === "getapk") {
    location.href = "download.html";
    return 1;
  }
  if (a === "sleg") {
    const l = LG[d.k];
    sheet(
      l[0],
      '<p style="color:#c3c8d2;font-size:14px;line-height:1.6;margin:0 0 14px">' +
        l[1] +
        '</p><p class="mut" style="font-size:12px;margin:0">Draft summary. Get your final Terms, Privacy and Refund policy written or reviewed by a lawyer before launch.</p>',
    );
    return 1;
  }
  return ext8(a, b);
}
function startOtp(n) {
  const dob = $("dob").value,
    ste = $("ste").value,
    er = $("err"),
    ag = ageOf(dob);
  if (!dob) {
    er.textContent = "Enter your date of birth.";
    return;
  }
  if (ag < 0 || ag > 110) {
    er.textContent = "Enter a valid date of birth.";
    return;
  }
  if (ag < 18) {
    er.textContent = "You must be 18 or older to use GAMERZONE.";
    openBlock("age");
    return;
  }
  if (!ste) {
    er.textContent = "Select your state.";
    return;
  }
  if (RST.includes(ste)) {
    er.textContent = "GAMERZONE is not available in " + ste + ".";
    openBlock("geo", ste);
    return;
  }
  if (!$("agr").checked) {
    er.textContent =
      "Please confirm you are 18 or older and accept the Terms, Privacy Policy and Refund Policy.";
    return;
  }
  PD = { dob: dob, state: ste };
  const rc = $("rc").value.trim();
  if (rc && !/^GZ[A-Z0-9]{4,10}$/i.test(rc)) {
    $("err").textContent = "That referral code looks wrong. Check it or leave it blank.";
    return;
  }
  OTPN = n;
  $("signup").hidden = true;
  $("otp").hidden = false;
  $("otpsub").textContent =
    "Enter the 4-digit code we sent on WhatsApp to +91 •••••" +
    $("phone").value.replace(/\D/g, "").slice(-4) +
    "" +
    (DB.mode !== "firebase" ? ". Test code: 1234" : "");
  OB.forEach((i) => (i.value = ""));
  $("oerr").textContent = "";
  OB[0].focus();
  otpTimer();
}
function otpTimer() {
  let s = 30;
  clearInterval(otpT);
  const e = $("otpn");
  e.textContent = "Resend code in " + s + "s";
  otpT = setInterval(() => {
    s--;
    if (s > 0) e.textContent = "Resend code in " + s + "s";
    else {
      clearInterval(otpT);
      e.innerHTML = '<button type="button" class="lnk" id="rsd">Resend code</button>';
      $("rsd").onclick = () => {
        toast("New code sent (demo: 1234)");
        otpTimer();
      };
    }
  }, 1000);
}
let OTPN = "",
  otpT = null;
const OB = [...document.querySelectorAll(".ob")];
OB.forEach((i, k) => {
  i.oninput = () => {
    i.value = i.value.replace(/\D/g, "").slice(0, 1);
    if (i.value && OB[k + 1]) OB[k + 1].focus();
  };
  i.onkeydown = (e) => {
    if (e.key === "Backspace" && !i.value && OB[k - 1]) {
      OB[k - 1].focus();
    }
    if (e.key === "Enter") $("otpgo").click();
  };
});
$("otpgo").onclick = () => {
  if (OB.map((i) => i.value).join("") !== "1234") {
    $("oerr").textContent = "Wrong code. Try again.";
    return;
  }
  clearInterval(otpT);
  const rc = $("rc").value.trim().toUpperCase();
  $("otp").hidden = true;
  PF.dob = PD.dob;
  PF.state = PD.state;
  PF.ver = 1;
  enterApp(OTPN);
  if (rc) {
    REF.by = rc;
    toast("Code " + rc + " applied. ₹20 bonus after your first paid entry.");
  }
};
$("otpback").onclick = () => {
  clearInterval(otpT);
  $("otp").hidden = true;
  $("signup").hidden = false;
};
$("rcb").onclick = () => {
  $("rc").hidden = !$("rc").hidden;
  if (!$("rc").hidden) $("rc").focus();
};
