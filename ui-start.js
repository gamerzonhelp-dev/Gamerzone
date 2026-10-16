/* GAMERZONE · Start-up wiring
   File 11 of 11 in this group. Keep the load order shown in index.html. */
$("bs").onclick = openSearch;
$("t-up").onclick = () => tab(true);
$("t-in").onclick = () => tab(false);
$("go").onclick = () => {
  const n = $("name").value.trim(),
    p = $("phone").value.replace(/[^\d+]/g, ""),
    w = $("pass").value;
  $("ok").hidden = true;
  if (!n) return ($("err").textContent = "Enter your gamer name.");
  if (p.replace(/\D/g, "").length < 10)
    return ($("err").textContent = "Enter a valid phone number.");
  if (w.length < 4) return ($("err").textContent = "Password needs at least 4 characters.");
  $("err").textContent = "";
  startOtp(n);
};

/* ---------- run once everything above is loaded ---------- */
$("bn").onclick = openNt;
feed();
badge();
setInterval(tick, 1000);
renderStories();
renderB();
