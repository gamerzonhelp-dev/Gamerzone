/* GAMERZONE · Terms, Privacy, Refund, Fair Play, 18+, restricted states (edit legal text here)
   File 10 of 11 in this group. Keep the load order shown in index.html. */
const RST = ["Telangana", "Andhra Pradesh", "Assam", "Odisha", "Nagaland", "Sikkim"];
const STS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
const LEGAL_DRAFT = true,
  UPD = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
let PD = {};
$("ste").innerHTML =
  '<option value="">Select your state</option>' +
  STS.map((x) => "<option>" + x + "</option>").join("");
$("dob").max = new Date().toISOString().slice(0, 10);
$("sgf").textContent = "18+ only · Not available in " + RST.join(", ") + ".";
function ageOf(d) {
  const b = new Date(d);
  if (!d || isNaN(b)) return -1;
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  const m = n.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a--;
  return a;
}
const LEG = {
  terms: {
    t: "Terms &amp; Conditions",
    s: [
      [
        "1. About GAMERZONE",
        [
          `GAMERZONE (“we”, “us”, “the app”) is run by GAMERZONE, Jaipur, Rajasthan, India. By creating an account or using the app you agree to these Terms &amp; Conditions, our Privacy Policy, our Refund &amp; Cancellation Policy and our Fair Play &amp; Anti-Fraud Policy.`,
          `GAMERZONE is not affiliated with, endorsed by or sponsored by Garena (Free Fire), Krafton (BGMI) or any game publisher. Game names belong to their owners.`,
          `GAMERZONE is a place for community esports contests and a social space for players (posts, stories, comments, clans). Contest results depend on player performance in the game. We do not promise any winnings.`,
          `Laws about online games can change. We may change, pause or stop any feature, or close the app in any area, if a law, rule or authority requires it, and we will tell you in the app where we can.`,
        ],
      ],
      [
        "2. Who can use the app",
        [
          `You must be 18 years or older. We ask for your date of birth when you sign up and may ask for ID proof (KYC) before withdrawals or if we doubt your age.`,
          `The app is not available in {STATES}. You must give your real state of residence and must not use a VPN or false details to get around this.`,
          `One person, one account. We may close accounts that use false information.`,
        ],
      ],
      [
        "3. Your account",
        [
          `You sign up with your email and password or with Google. To protect against fake accounts, you must verify your email before you join a contest, add money, buy VIP or withdraw. Keep your password private. You are responsible for everything done through your account. Use only your own game ID, and tell us at once if you think someone else has used your account.`,
        ],
      ],
      [
        "4. Contests",
        [
          `Each contest shows its game, format, entry fee, prize pool, number of slots, minimum players and start time. Read the details before you join.`,
          `A contest runs only if the minimum number of players join. If not, it is cancelled and cash entry fees are refunded as set out in the Refund &amp; Cancellation Policy.`,
          `Room ID and password are shown in the app 10 minutes before the match. You must join the room on time and must not share them with anyone.`,
          `VIP members may use the reserved slots shown in the app.`,
          `Duo and Squad contests: one player (the captain) joins and pays the entry fee for the whole team and enters the team members’ game details. Prize money for a team is paid to the captain’s wallet, and sharing it with team members is the captain’s job. We are not responsible for disputes inside a team.`,
          `Some contests may be marked as fan matches or special events. They follow the rules shown on the contest page.`,
        ],
      ],
      [
        "5. Results and prizes",
        [
          `After a match, players upload a screenshot of their result within 60 minutes. We check each result and may ask for a screen recording or other proof, especially from winners.`,
          `Prizes are paid to the winner’s wallet after verification. If two players claim the same place, or a result looks edited or reused, we may hold the prize while we check. Our decision after review is final, subject to the dispute window in the Refund &amp; Cancellation Policy.`,
        ],
      ],
      [
        "6. Wallet, payments and bonus",
        [
          `You can add money using UPI, Google Pay, PhonePe, Paytm or other methods we offer. Payments are processed by our payment partners. We do not see or store your UPI PIN or card details.`,
          `Wallet balance can be used for entry fees and VIP. Bonus balance (for example from Refer &amp; Earn) can only be used for entry fees, up to 15% of an entry fee, and cannot be withdrawn.`,
          `Your wallet has three parts, shown in the app: Deposit (money you added), Winnings (prizes you won) and Bonus. When you pay, your Deposit is used first, then Winnings. Bonus is used only on entry fees, never on VIP, and only up to 15% of that entry fee. Bonus has no cash value and is not refunded.`,
          `Withdrawals, when available, need completed KYC and may have minimum amounts and processing times shown in the app.`,
        ],
      ],
      [
        "7. Taxes",
        [
          `Winnings may be subject to tax under Indian law. We may deduct tax at source where the law requires it. You are responsible for your own tax filings.`,
        ],
      ],
      [
        "8. Refer &amp; Earn",
        [
          `You and your friend each get ₹20 bonus after your friend’s first paid entry using your code. Milestone rewards (for example for inviting friends, playing contests, or adding money) are shown in the app under Milestones and are given as Bonus. We may add, change or stop any reward at any time; a reward you have already earned stays with you. Self-referrals, fake accounts and repeat accounts on the same phone number get no reward. We can change or stop the programme at any time.`,
        ],
      ],
      [
        "9. VIP membership",
        [
          `VIP costs ₹49 for 30 days and gives reserved priority slots and a VIP badge. Benefits may change. VIP is not refundable once activated, except where the law requires.`,
        ],
      ],
      [
        "10. Fair play",
        [
          `Not allowed: hacks, cheats or tools banned by the game, teaming up with other players, sharing or selling accounts, more than one account, fake or edited screenshots, abusing the referral programme, and abusive or threatening behaviour.`,
          `If you break these rules we may disqualify you, cancel prizes, close your account and keep your wallet balance where the law allows. No refund is given in such cases.`,
        ],
      ],
      [
        "11. Your content",
        [
          `You own the photos, posts, stories and comments you upload. You allow us to show them in the app to other players, and to feature them (for example in Clip of the Week).`,
          `When you add a song to a post, it comes from Audius, a third-party music service, and belongs to its artist. We do not own it and do not store it. We may remove a song or post at the artist’s or Audius’ request.`,
          `Other players can report posts. We may remove reported content and warn or close accounts. Do not upload anything illegal, adult, hateful, harassing or that belongs to someone else. We may remove content or accounts that break this rule.`,
        ],
      ],
      [
        "12. Suspension and closing your account",
        [
          `We may suspend or close an account to protect the app and other players or to follow the law. You can ask us to close your account at any time from Settings, Contact support.`,
        ],
      ],
      [
        "13. Limits of liability",
        [
          `The app is provided “as is”. We are not responsible for game server problems, internet or device problems on your side, or the actions of other players. To the extent the law allows, our liability for any contest is limited to the entry fee you paid for it.`,
        ],
      ],
      [
        "14. Changes",
        [
          `We may update these Terms. If a change is important we will tell you in the app. Using the app after a change means you accept it.`,
        ],
      ],
      [
        "15. Law and disputes",
        [
          `These Terms are governed by the laws of India. Courts of Jaipur, Rajasthan, India have jurisdiction, subject to any rights you have under law. Nothing in these Terms limits any right you have under law.`,
        ],
      ],
      [
        "16. Grievance and contact",
        [
          `Grievance Officer: Samarsingh, GAMERZONE, Jaipur, Rajasthan, India. Email: <a href="mailto:samarsingh0839@gmail.com" style="color:var(--green)">samarsingh0839@gmail.com</a>. For general support, write to <a href="mailto:GAMERZONE.HELP@gmail.com" style="color:var(--green)">GAMERZONE.HELP@gmail.com</a>. We aim to acknowledge complaints within 24 hours and resolve them within 15 days.`,
        ],
      ],
    ],
  },
  privacy: {
    t: "Privacy Policy",
    s: [
      [
        "1. What we collect",
        [
          `Account details: name, email address, phone number, date of birth, state, gamer name, game IDs and bio.`,
          `Content you add: profile and cover photos, posts, stories, comments, clan details and result screenshots.`,
          `Activity: contests joined, results, referrals, wallet and payment history (transaction references only).`,
          `Device and location: IP address, device type and approximate location, used to check state eligibility and prevent fraud.`,
        ],
      ],
      [
        "2. Why we use it",
        [
          `To create your account, check your age and state, run contests and verify results, process payments and refunds, send room details and alerts, prevent cheating and fraud, give support, and follow the law.`,
        ],
      ],
      [
        "3. Who we share it with",
        [
          `Service providers that help us run the app: payment partners, Google Firebase (sign-in, email verification, database and hosting), and Audius (music search and playback). They may use your data only to provide their service to us.`,
          `Other players see your gamer name, photo, bio, posts, stories, comments, likes and clan. Posts and stories are visible to other players in the app.`,
          `When you search for or play a song, your device contacts Audius directly, so Audius can see your IP address and what you search for. See Audius’ own privacy policy. The host sees your game ID and result screenshot to run the contest.`,
          `We share data with authorities when the law requires it. We do not sell your personal data.`,
        ],
      ],
      [
        "4. Result screenshots",
        [
          `Screenshots are kept to verify results and settle disputes, normally for up to 180 days.`,
        ],
      ],
      [
        "5. Keeping your data",
        [
          `We keep your data while your account is active, and afterwards for as long as the law or a dispute requires.`,
        ],
      ],
      [
        "6. Security",
        [
          `We use secure connections and access controls. No system is completely safe, so please keep your password private.`,
        ],
      ],
      [
        "7. Your choices and rights",
        [
          `You can see and correct your details in Edit profile. You can ask us to delete your data, close your account or withdraw your consent by writing to us. We may need to keep some records for legal reasons or open disputes.`,
        ],
      ],
      [
        "8. Children",
        [
          `GAMERZONE is only for people aged 18 and above. If we learn that an account belongs to someone under 18, we will close it.`,
        ],
      ],
      [
        "9. Notifications and local storage",
        [
          `With your permission we send alerts such as room details and results. The app also stores small pieces of data on your device to keep you signed in.`,
        ],
      ],
      [
        "10. Changes and contact",
        [
          `We may update this policy and will tell you about important changes. Contact: GAMERZONE, Jaipur, Rajasthan, India, <a href="mailto:GAMERZONE.HELP@gmail.com" style="color:var(--green)">GAMERZONE.HELP@gmail.com</a>. Grievance Officer: Samarsingh, <a href="mailto:samarsingh0839@gmail.com" style="color:var(--green)">samarsingh0839@gmail.com</a>.`,
        ],
      ],
    ],
  },
  refund: {
    t: "Refund &amp; Cancellation Policy",
    s: [
      [
        "1. If a contest is cancelled",
        [
          `If a contest does not reach its minimum players, or we cancel it, your cash entry fee is refunded to your GAMERZONE wallet by our team, usually within a few hours and at most within 24 hours of the cancellation. You will see it in your wallet and payment history. For a Duo or Squad contest the refund goes to the captain who paid.`,
          `Bonus balance used on an entry is not refunded. The Deposit and Winnings part you paid is refunded.`,
        ],
      ],
      [
        "2. When you do not get a refund",
        [
          `Once the room ID and password are shared, the entry fee is not refundable if you do not join, join late, leave early, lose connection, or lose because of your own device or internet. Entry fees are also not refunded if you are disqualified for breaking the rules.`,
          `A player cannot cancel an entry after joining a contest at the moment.`,
        ],
      ],
      [
        "3. Problems on our side",
        [
          `If the room details are wrong, the host does not start the match, or another problem on our side stops a fair match, we will refund your entry fee to your wallet.`,
        ],
      ],
      [
        "4. Failed or double payments",
        [
          `If money was taken from your bank but your wallet, entry or VIP was not updated, the amount is usually reversed by your bank or payment partner in 5 to 7 working days. If not, contact support with the transaction ID and we will help.`,
        ],
      ],
      [
        "5. Wallet top-ups",
        [
          `Money added to the wallet stays in the wallet for contests and VIP. It is not sent back to your bank or UPI account, except for failed or duplicate payments. Withdrawals, when available, follow the rules shown in the app.`,
        ],
      ],
      [
        "6. VIP membership",
        [
          `VIP is not refundable once activated. You can turn off renewal at any time and keep VIP until the 30 days end.`,
        ],
      ],
      [
        "7. Prize and result disputes",
        [
          `If you disagree with a result, contact support within 24 hours of the result being announced. Share the contest name and your result screenshot or recording.`,
        ],
      ],
      [
        "8. How to ask for a refund",
        [
          `Go to Settings, Contact support, or email <a href="mailto:GAMERZONE.HELP@gmail.com" style="color:var(--green)">GAMERZONE.HELP@gmail.com</a>. Send the contest name, date and transaction ID. We reply within 3 working days.`,
        ],
      ],
      [
        "9. How long refunds take",
        [
          `Refunds to the wallet are made by our team, usually within a few hours and at most within 24 hours. Refunds to a bank or UPI account, where allowed, take 5 to 7 working days.`,
        ],
      ],
    ],
  },
  fair: {
    t: "Fair Play &amp; Anti-Fraud Policy",
    s: [
      [
        "1. Why this policy",
        [
          `GAMERZONE is for honest players. This policy explains what is not allowed, how we check, and what happens if the rules are broken. It is part of our Terms &amp; Conditions.`,
        ],
      ],
      [
        "2. Fair play rules",
        [
          `Play only with your own game account and your own skill. Do not use hacks, cheats, scripts, modified apps, emulators where the contest does not allow them, or any tool banned by the game publisher.`,
          `Do not team up or share information with other players in solo contests, and do not throw a match on purpose or fix results with others.`,
          `Do not share, sell, rent or buy accounts. Do not play on behalf of someone else.`,
          `Be respectful. Abuse, threats, hate and harassment, in contests or on posts, stories and comments, are not allowed.`,
        ],
      ],
      [
        "3. One person, one account",
        [
          `Each person may have only one GAMERZONE account, with one email and one phone number. Creating more accounts to collect bonuses, to get around a ban, or to take more slots in a contest is fraud.`,
          `We ask you to verify your email before you join contests, add money, buy VIP or withdraw. We may ask for ID proof (KYC) at any time, and always before a withdrawal.`,
        ],
      ],
      [
        "4. Referral, bonus and milestone fraud",
        [
          `Referring yourself, using fake or repeat accounts, or any trick to earn Refer &amp; Earn or Milestone rewards is not allowed.`,
          `We may cancel such rewards, take back bonus balance and winnings that came from them, and close the accounts.`,
        ],
      ],
      [
        "5. Result and screenshot fraud",
        [
          `Result screenshots must be real, complete and from your own match. Edited, reused, cropped or fake screenshots, or a wrong rank or kill count, are fraud.`,
          `We may ask winners for a screen recording or the match history before paying a prize. If proof is not given, the prize may be cancelled.`,
        ],
      ],
      [
        "6. Payment fraud",
        [
          `Do not submit a fake UTR, a fake or edited payment screenshot, a payment made by someone else without their knowledge, or a payment you later reverse or dispute with your bank in bad faith.`,
          `Money is added or withdrawn only after we check it. We may hold or reverse a payment or withdrawal that looks suspicious, and withdraw only to a bank or UPI account in your own name.`,
        ],
      ],
      [
        "7. Location and age",
        [
          `Do not use a VPN, a false state or a false date of birth. Paid features are not available in the restricted states or to people under 18.`,
        ],
      ],
      [
        "8. How we check",
        [
          `We may review account details, device and IP information, contest and wallet activity, reports from other players, and the proof you give us. Our team looks at each case; a flag alone does not decide the outcome.`,
          `You can report a player or a post from the app, or write to <a href="mailto:GAMERZONE.HELP@gmail.com" style="color:var(--green)">GAMERZONE.HELP@gmail.com</a> with the player name, contest and proof.`,
        ],
      ],
      [
        "9. What can happen",
        [
          `Depending on how serious it is, we may give a warning, remove content, cancel a result or prize, hold a payment or withdrawal, remove bonus balance, disqualify you from a contest, block your account, or close it.`,
          `In serious cases, such as payment fraud, hacks or many fake accounts, entry fees and wallet balance may be kept where the law allows, and we may report the matter to the police or the payment provider.`,
        ],
      ],
      [
        "10. Your right to explain",
        [
          `If we act on your account, you can write to us within 7 days with your side and proof. We will review it and reply within 3 working days. Our decision after review is final, subject to your rights under law.`,
        ],
      ],
      [
        "11. Changes",
        [
          `We may update this policy to stop new kinds of cheating or fraud, and will tell you about important changes in the app.`,
        ],
      ],
    ],
  },
  age: {
    t: "18+ &amp; Responsible play",
    s: [
      [
        "18+ only",
        [
          `GAMERZONE is only for people aged 18 and above. Minors are not allowed to create an account, add money or join contests.`,
        ],
      ],
      [
        "How we check",
        [
          `At sign-up you give your date of birth and confirm that you are 18 or older. Before any withdrawal we will ask for ID proof (KYC). If we find a false age, we will close the account.`,
        ],
      ],
      [
        "Parents and guardians",
        [
          `If you think a minor is using the app, please write to <a href="mailto:GAMERZONE.HELP@gmail.com" style="color:var(--green)">GAMERZONE.HELP@gmail.com</a>. We will close the account and refund any unused wallet balance.`,
        ],
      ],
      [
        "Play responsibly",
        [
          `Play for fun. Only spend what you can afford to lose and set a budget before you play.`,
          `Never chase your losses and take regular breaks.`,
          `If gaming is affecting your studies, work, money or relationships, talk to someone you trust or a mental-health professional.`,
          `You can ask us to close your account at any time.`,
        ],
      ],
    ],
  },
  geo: {
    t: "Restricted states",
    s: [
      [
        "Where GAMERZONE is not available",
        [
          `GAMERZONE is not available in {STATES}. People living in these states cannot sign up, add money, buy VIP or join contests.`,
          "{CHIPS}",
        ],
      ],
      [
        "How we check",
        [
          `We ask for your state at sign-up and may also check your IP address and device location when you join a contest or make a payment. Using a VPN or giving a false state breaks our Terms and can lead to account closure.`,
        ],
      ],
      [
        "If the list changes",
        [
          `State laws can change. We may add or remove states at any time and will update this page.`,
        ],
      ],
      [
        "Moved or travelling?",
        [
          `If you live in a state where we are available but are travelling in a restricted state, paid features stay off until you are back. Contact support if you think a block is wrong.`,
        ],
      ],
    ],
  },
};
function openLegal(k) {
  const L = LEG[k],
    ch = '<div class="gchips">' + RST.map((x) => "<span>" + x + "</span>").join("") + "</div>";
  $("nwrap").innerHTML =
    '<div class="nh"><button data-a="nback" aria-label="Back">' +
    svg("back") +
    "</button><b>" +
    L.t +
    '</b></div><div class="rf lg"><p class="mut" style="font-size:12px;margin:0">Last updated: ' +
    UPD +
    "</p>" +
    (LEGAL_DRAFT
      ? '<div class="rs" style="margin:10px 0 0;font-size:12px">Draft. Have a lawyer review this before launch.</div>'
      : "") +
    L.s
      .map(
        (s) =>
          "<h4>" +
          s[0] +
          "</h4>" +
          s[1]
            .map((p) =>
              p === "{CHIPS}" ? ch : "<p>" + p.replace(/\{STATES\}/g, RST.join(", ")) + "</p>",
            )
            .join(""),
      )
      .join("") +
    "</div>";
  $("nv").classList.add("on");
  $("nv").scrollTop = 0;
}
function openBlock(t, st) {
  const g = t === "geo";
  $("nwrap").innerHTML =
    '<div class="nh"><button data-a="nback" aria-label="Back">' +
    svg("back") +
    "</button><b>" +
    (g ? "Not available" : "18+ only") +
    '</b></div><div class="blk"><div class="bi">' +
    (g ? "🚫" : "🔞") +
    "</div><h2>" +
    (g ? "GAMERZONE is not available in " + esc(st) : "You must be 18 or older") +
    "</h2><p>" +
    (g
      ? "Contests with entry fees are not allowed in your state, so we cannot let you sign up, add money, buy VIP or join contests."
      : "GAMERZONE is only for people aged 18 and above. Please come back when you turn 18.") +
    "</p>" +
    (g
      ? '<div class="gchips">' + RST.map((x) => "<span>" + x + "</span>").join("") + "</div>"
      : "") +
    '<button class="btn" data-a="lgl" data-k="' +
    (g ? "geo" : "age") +
    '">Read the full notice</button><button class="cta" data-a="nback">Back</button></div>';
  $("nv").classList.add("on");
  $("nv").scrollTop = 0;
}
function ext10(a, b) {
  if (a === "lgl") {
    openLegal(b.dataset.k);
    return 1;
  }
  return 0;
}
