GAMERZONE - file map (kaunsi file me kya hai)

UPLOAD TO GITHUB (saari files, koi folder nahi - sab ek hi jagah):
  index.html        player app ka dhancha
  admin.html        admin panel ka dhancha
  style.css     app ka design (colors, size)
  admin.css   admin ka design

  ui-core.js       main screen, tabs, feed, popup sheets
  ui-events.js     taps / clicks
  ui-editor.js     notes, story editor
  ui-battles.js    contest list, details, join, search
  ui-profile.js    profile, stories, posts
  ui-vip.js        VIP, dashboard
  ui-pay.js        pay sheet, wallet screen
  ui-settings.js   refer and earn, settings
  ui-results.js    result upload, room ID, timers
  legal.js         T&C, Privacy, Refund, Fair Play, 18+ (LEGAL TEXT YAHAN BADLO)
  ui-start.js      start-up
  data.js          database layer + Firebase keys (BACKEND yahin hai)
  live-core.js     settings, saved data, contests, bonus, milestones
  live-watch.js    database watchers
  live-auth.js     sign in / sign up / Google / email verify
  live-wallet.js   entry fee, VIP, add money, withdraw
  live-buttons.js  button handlers
  social.js        posts, stories, comments, reports
  game.js          win card, clip of the week, fan match, clans
  music.js         Audius music

  admin-db.js       admin database layer + Firebase keys
  admin-core.js     admin settings, helpers, refunds
  admin-nav.js      menu, dashboard
  admin-matches.js  match banana (Solo/Duo/Squad)
  admin-results.js  result check, winners pay
  admin-users.js    users list
  admin-money.js    payments, withdrawals, settings
  admin-buttons.js  button handlers
  admin-social.js   Social tab
  admin-login.js    login, start-up

UPLOAD NAHI KARNI (sirf Firebase Console me paste hoti hai):
  database.rules.json   -> Firebase > Realtime Database > Rules

UPDATE KARNE KE BAAD: agar browser purani file dikhaye to index.html me us file ke
naam ke aage ?v=1 ko ?v=2 kar do (ya Ctrl+Shift+R dabao).

APP INSTALL / LOGO FILES (sab upload karni hain):
  download.html          "Get the app" page (Android APK + browser install). Link: aapka-link/download.html
  gamerzone.apk          (jab APK ban jaye tab isi naam se upload karo)
  manifest.webmanifest, sw.js, pwa-install.js   app install ke liye
  logo.svg, icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png,
  favicon-32.png, og-image.png, logo-wordmark.png   logo ki files
