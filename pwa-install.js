/* GAMERZONE · Install the app (add to home screen)
   Android Chrome shows a real install prompt. On iPhone the steps are shown in a sheet. */
let gzDefer = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  gzDefer = e;
});
window.addEventListener("appinstalled", () => {
  gzDefer = null;
  try {
    toast("GAMERZONE installed");
  } catch (e) {}
});
window.gzIsApp = () =>
  (window.matchMedia && matchMedia("(display-mode: standalone)").matches) ||
  navigator.standalone === true;
window.gzInstall = async function () {
  if (gzDefer) {
    gzDefer.prompt();
    try {
      await gzDefer.userChoice;
    } catch (e) {}
    gzDefer = null;
    return;
  }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  sheet(
    "Install GAMERZONE",
    ios
      ? '<ol style="margin:0 0 14px 18px;line-height:1.7"><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button (square with an arrow).</li><li>Choose <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li></ol><button class="cta" data-a="x">Done</button>'
      : '<ol style="margin:0 0 14px 18px;line-height:1.7"><li>Open this page in <b>Chrome</b>.</li><li>Tap the <b>⋮</b> menu (top right).</li><li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li><li>Tap <b>Install</b>.</li></ol><p class="mut" style="margin:0 0 14px;font-size:12px">If you do not see it, refresh the page once and try again.</p><button class="cta" data-a="x">Done</button>',
  );
};
