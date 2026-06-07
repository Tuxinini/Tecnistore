'use strict';
/* ══════════════════════════════════════════════════
   QUICKVIEW MODAL — Technistore (shared)
   Expone: window.qvOpenProduct(p)
           window.qvClose()
           window.qvCartAction  — asignar por página para el botón carrito
           window.qvWspAction   — asignar por página para WhatsApp
══════════════════════════════════════════════════ */
(function () {

  /* ── Sanitizador básico ── */
  var _SAFE = /^(p|ul|ol|li|strong|em|b|i|br|h2|h3|h4|span|div)$/i;
  var _BAD  = /<(script|style|iframe|form|input|button|object|embed|link|meta)[^>]*>[\s\S]*?<\/\1>|<(script|style|iframe|form|input|button|object|embed|link|meta)[^>]*\/?>/gi;
  function sanitize(html) {
    if (!html) return '';
    return html.replace(_BAD, '').replace(/<[^>]+>/g, function (tag) {
      var m = tag.match(/^<\/?([a-z][a-z0-9]*)/i);
      return (m && _SAFE.test(m[1])) ? tag : '';
    }).trim();
  }

  /* ── Estado ── */
  var s = { idx: 0, images: [], timer: null };

  /* ── DOM helper ── */
  function $(id) { return document.getElementById(id); }

  /* ── Imagen ── */
  function setImg(idx) {
    s.idx = idx;
    var img = $('qv-main-img');
    if (img) { img.src = s.images[idx] || ''; }
    $('qv-thumbs').querySelectorAll('.qv-thumb').forEach(function (t, i) {
      t.classList.toggle('active', i === idx);
    });
    $('qv-dots').querySelectorAll('.qv-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });
    var prev = $('qv-prev'), next = $('qv-next');
    if (prev) prev.disabled = idx === 0;
    if (next) next.disabled = idx === s.images.length - 1;
  }
  function prevImg() { if (s.idx > 0) setImg(s.idx - 1); }
  function nextImg() { if (s.idx < s.images.length - 1) setImg(s.idx + 1); }

  /* Exponer para onclicks inline de thumbs/dots */
  window.qvSetImg  = setImg;
  window.qvPrevImg = prevImg;
  window.qvNextImg = nextImg;

  /* ── Autoplay ── */
  function startAuto() {
    stopAuto();
    if (s.images.length < 2) return;
    s.timer = setInterval(function () {
      setImg((s.idx + 1) % s.images.length);
    }, 4000);
  }
  function stopAuto() {
    if (s.timer) { clearInterval(s.timer); s.timer = null; }
  }

  /* ── Acordeón ── */
  window.qvToggleAcc = function () {
    var acc = $('qv-accordion');
    if (!acc) return;
    var open = acc.classList.toggle('open');
    var trig = $('qv-acc-trigger');
    if (trig) trig.setAttribute('aria-expanded', String(open));
  };

  /* ── Abrir ── */
  window.qvOpenProduct = function (p) {
    /* Textos */
    var brand = $('qv-brand');
    var title = $('qv-title-el');
    var price = $('qv-price');
    var old   = $('qv-old-price');
    var disc  = $('qv-discount');
    var desc  = $('qv-desc');
    var tags  = $('qv-tags');
    var specs = $('qv-specs');
    var acc   = $('qv-accordion');
    var cnt   = $('qv-acc-count');

    if (brand) brand.textContent = p.brand || '';
    if (title) title.textContent = p.name  || '';
    if (price) price.textContent = p.price || '';

    if (old)  { old.textContent  = p.oldPrice || ''; old.style.display  = p.oldPrice  ? '' : 'none'; }
    if (disc) { disc.textContent = p.discount || ''; disc.style.display = p.discount  ? '' : 'none'; }

    /* Descripción — acepta texto plano o HTML sanitizado */
    if (desc) {
      if (p.desc && p.desc.trim().indexOf('<') !== -1) {
        desc.innerHTML = sanitize(p.desc);
      } else {
        desc.textContent = p.desc || 'Consulta por WhatsApp para especificaciones completas.';
      }
    }

    /* Tags */
    if (tags) {
      tags.innerHTML = (p.tags || []).map(function (t) {
        return '<span class="qv-tag">' + String(t).replace(/</g,'&lt;') + '</span>';
      }).join('');
    }

    /* Imágenes */
    s.images = p.images || [];
    var thumbsEl = $('qv-thumbs');
    var dotsEl   = $('qv-dots');
    if (thumbsEl) {
      thumbsEl.innerHTML = s.images.map(function (src, i) {
        return '<img class="qv-thumb" src="' + src + '" alt="Vista ' + (i + 1) + '" loading="lazy" onclick="qvSetImg(' + i + ')">';
      }).join('');
    }
    if (dotsEl) {
      dotsEl.innerHTML = s.images.map(function (_, i) {
        return '<button class="qv-dot" onclick="qvSetImg(' + i + ')" aria-label="Imagen ' + (i + 1) + '"></button>';
      }).join('');
    }
    /* Ocultar flechas si hay 1 sola imagen */
    var pBtn = $('qv-prev'), nBtn = $('qv-next');
    var multiImg = s.images.length > 1;
    if (pBtn) pBtn.style.display = multiImg ? '' : 'none';
    if (nBtn) nBtn.style.display = multiImg ? '' : 'none';

    /* Especificaciones */
    var specArr = p.specs || [];
    if (cnt) cnt.textContent = specArr.length ? String(specArr.length) : '';
    if (specs) {
      specs.innerHTML = specArr.map(function (row) {
        return '<div class="qv-spec-row"><span class="qv-spec-key">' + String(row[0]).replace(/</g,'&lt;') + '</span><span class="qv-spec-val">' + String(row[1]).replace(/</g,'&lt;') + '</span></div>';
      }).join('');
    }
    if (acc) acc.style.display = specArr.length ? '' : 'none';

    /* Reset estado */
    setImg(0);
    if (acc) { acc.classList.remove('open'); }
    var trig = $('qv-acc-trigger');
    if (trig) trig.setAttribute('aria-expanded', 'false');

    /* Abrir overlay */
    var ov = $('qv-overlay');
    if (ov) { ov.classList.add('open'); document.body.style.overflow = 'hidden'; }
    startAuto();
    setTimeout(function () { var c = $('qv-close'); if (c) c.focus(); }, 60);
  };

  /* ── Cerrar ── */
  window.qvClose = function () {
    stopAuto();
    var ov = $('qv-overlay');
    if (ov) { ov.classList.remove('open'); document.body.style.overflow = ''; }
  };

  /* ── Callbacks de página ── */
  window.qvCartAction = null;
  window.qvWspAction  = null;

  /* ── Eventos ── */
  document.addEventListener('DOMContentLoaded', function () {
    var closeBtn = $('qv-close');
    var prevBtn  = $('qv-prev');
    var nextBtn  = $('qv-next');
    var overlay  = $('qv-overlay');
    var cartBtn  = $('qv-btn-cart');
    var wspBtn   = $('qv-btn-wsp');
    var accTrig  = $('qv-acc-trigger');

    if (closeBtn) closeBtn.addEventListener('click', window.qvClose);
    if (overlay)  overlay.addEventListener('click', function (e) { if (e.target === this) window.qvClose(); });
    if (prevBtn)  prevBtn.addEventListener('click', function () { stopAuto(); prevImg(); startAuto(); });
    if (nextBtn)  nextBtn.addEventListener('click', function () { stopAuto(); nextImg(); startAuto(); });
    if (accTrig)  accTrig.addEventListener('click', window.qvToggleAcc);
    if (cartBtn)  cartBtn.addEventListener('click', function () { if (typeof window.qvCartAction === 'function') window.qvCartAction(); });
    if (wspBtn)   wspBtn.addEventListener('click',  function () { if (typeof window.qvWspAction  === 'function') window.qvWspAction();  });

    /* Teclado */
    document.addEventListener('keydown', function (e) {
      var ov = $('qv-overlay');
      if (!ov || !ov.classList.contains('open')) return;
      if (e.key === 'Escape')     window.qvClose();
      if (e.key === 'ArrowLeft')  { stopAuto(); prevImg(); startAuto(); }
      if (e.key === 'ArrowRight') { stopAuto(); nextImg(); startAuto(); }
    });

    /* Touch swipe */
    var wrap = $('qv-main-wrap');
    if (wrap) {
      var sx = 0;
      wrap.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      wrap.addEventListener('touchend', function (e) {
        var dx = sx - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 38) { stopAuto(); dx > 0 ? nextImg() : prevImg(); startAuto(); }
      });
    }
  });

})();
