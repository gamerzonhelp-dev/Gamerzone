/* GAMERZONE · Taps and clicks (one click handler for the whole app)
   File 2 of 11 in this group. Keep the load order shown in index.html. */
document.addEventListener("click", (e) => {
  if (e.target.id === "sbg") return closeSheet();
  const b = e.target.closest("[data-a]");
  if (!b) return;
  if (ext(b.dataset.a, b)) return;
  const a = b.dataset.a,
    pe = b.closest(".post"),
    p = fp(b.dataset.id || (pe && pe.dataset.id));
  if (a === "x") closeSheet();
  else if (a === "like" && p) {
    p.liked = p.liked ? 0 : 1;
    p.likes += p.liked ? 1 : -1;
    feed();
    window.gzLike && gzLike(p);
  } else if (a === "save" && p) {
    p.saved = p.saved ? 0 : 1;
    window.gzPostSave && gzPostSave(p);
    feed();
    toast(p.saved ? "Saved to your collection" : "Removed from saved");
  } else if (a === "fol" && p) {
    if (p.mine) return;
    const q = PL.find((x) => x.u === p.uid);
    if (q && window.gzFollow) {
      window.gzFollow(PL.indexOf(q));
      p.fol = q.fol;
      feed();
    } else toast("Could not find this player");
  } else if (a === "cm" && p) openCm(p);
  else if (a === "addcm" && p) {
    const i = $("ci"),
      t = i.value.trim();
    if (!t) {
      i.focus();
      return;
    }
    p.cm.push({ u: ME, t: t });
    p.total++;
    window.gzComment && gzComment(p, t);
    feed();
    openCm(p);
    toast("Comment posted");
  } else if (a === "share" && p) doShare(p);
  else if (a === "watch") toast("Video player is coming soon");
  else if (a === "more" && p)
    sheet(
      "Post options",
      (p.mine
        ? '<button class="opt" data-a="edit" data-id="' +
          p.id +
          '">' +
          svg("edit") +
          "Edit post</button>"
        : "") +
        '<button class="opt" data-a="shr" data-id="' +
        p.id +
        '">' +
        svg("share") +
        "Share post</button>" +
        (p.mine && p.music
          ? '<button class="opt" data-a="mrm" data-id="' + p.id + '">🎵 Remove music</button>'
          : "") +
        (p.mine
          ? '<button class="opt dng" data-a="delq" data-id="' +
            p.id +
            '">' +
            svg("trash") +
            "Delete post</button>"
          : '<button class="opt dng" data-a="rep" data-id="' + p.id + '">Report post</button>'),
    );
  else if (a === "rep" && p) {
    closeSheet();
    window.gzReport && gzReport(p, "inappropriate");
  } else if (a === "shr" && p) {
    closeSheet();
    doShare(p);
  } else if (a === "edit" && p) {
    sheet(
      "Edit post",
      '<textarea id="ed" maxlength="200">' +
        esc(p.cap) +
        '</textarea><button class="cta" data-a="saveedit" data-id="' +
        p.id +
        '">Save changes</button>' +
        (p.mine
          ? '<button class="opt" data-a="pedtimg" data-id="' +
            p.id +
            '" style="margin-top:10px">Edit photo, filter &amp; stickers</button>'
          : ""),
    );
    $("ed").focus();
  } else if (a === "saveedit" && p) {
    const t = $("ed").value.trim();
    if (!t) {
      toast("Caption cannot be empty");
      return;
    }
    p.cap = t;
    window.gzPostEdit && gzPostEdit(p, { cap: t });
    closeSheet();
    feed();
    renderP();
    renderU();
    toast("Post updated");
  } else if (a === "delq" && p)
    sheet(
      "Delete this post?",
      '<p class="mut">This post will be removed from your feed.</p><div class="two"><button class="btn" data-a="x">Cancel</button><button class="btn dng" data-a="del" data-id="' +
        p.id +
        '">Delete</button></div>',
    );
  else if (a === "del" && p) {
    window.gzPostDel && gzPostDel(p);
    POSTS = POSTS.filter((x) => x.id !== p.id);
    closeSheet();
    feed();
    renderP();
    renderU();
    toast("Post deleted");
  }
});
$("sb").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.id === "ci") {
    const b = $("sb").querySelector("[data-a=addcm]");
    if (b) b.click();
  }
});
IC.back = "M19 12H5M11 6l-6 6 6 6";
