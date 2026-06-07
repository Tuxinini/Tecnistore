'use strict';
/* ══ TIENDA.JS ══ */

var tiendaItems = [];
var tiendaSort  = 'discount';
var tiendaCat   = 'all';
var _openProduct = null;
var _wooProducts = null; /* null = no cargado aún; [] = cargado pero vacío */

function fmt(n) { return '$' + n.toLocaleString('es-CO'); }

var BRANDS = ['Samsung','Xiaomi','Motorola','Lenovo','Asus','HP','Dell','Acer','MSI',
  'Logitech','Epson','JBL','Realme','WD','Kingston','Crucial','Adata','Patriot',
  'Hiksemi','Hikvision','Redmi','Xue','Lacie','Touch','Microsoft'];
function extractBrand(name) {
  var u = name.toUpperCase();
  for (var i = 0; i < BRANDS.length; i++) { if (u.indexOf(BRANDS[i].toUpperCase()) !== -1) return BRANDS[i]; }
  return '';
}

function sortArr(arr, s) {
  var a = arr.slice();
  if (s === 'discount')    a.sort(function(x,y){ return (parseFloat(y.discount)||0) - (parseFloat(x.discount)||0); });
  else if (s === 'price-asc')  a.sort(function(x,y){ return x.price - y.price; });
  else if (s === 'price-desc') a.sort(function(x,y){ return y.price - x.price; });
  else if (s === 'name')       a.sort(function(x,y){ return x.name.localeCompare(y.name,'es'); });
  return a;
}

/* ── Fuente de productos (prioridad: WooCommerce > admin local > bundled) ── */
function getSource() {
  if (_wooProducts !== null) return _wooProducts;
  try { var a = localStorage.getItem('ts-admin-products'); if (a) return JSON.parse(a); } catch(e){}
  return (typeof ALL_PRODUCTS !== 'undefined') ? ALL_PRODUCTS : [];
}

/* ──────────────────────────────────────────
   UI: barra de sincronización WooCommerce
   ────────────────────────────────────────── */
function setSyncStatus(state, text) {
  var bar  = document.getElementById('woo-sync-bar');
  var icon = document.getElementById('woo-sync-icon');
  var msg  = document.getElementById('woo-sync-msg');
  var btn  = document.getElementById('woo-sync-btn');
  if (!bar) return;
  bar.className = 'woo-sync-bar woo-sync-bar--' + state;
  if (icon) icon.className = 'woo-sync-icon woo-sync-icon--' + state;
  if (msg)  msg.textContent = text;
  if (btn)  btn.disabled = (state === 'loading');
}

function updateSyncStatus(meta) {
  if (!meta) { setSyncStatus('idle', 'Sin datos de WooCommerce'); return; }
  var age = getWooCacheAge ? getWooCacheAge() : null;
  var source = meta.fromCache ? 'caché' : 'WooCommerce';
  var staleWarn = meta.stale ? ' (sin conexión — datos anteriores)' : '';
  var timeStr = age !== null ? ' · hace ' + age + ' min' : '';
  setSyncStatus(meta.stale ? 'warn' : 'ok',
    meta.total + ' productos cargados desde ' + source + timeStr + staleWarn);
}

/* ── Trigger refresh desde el botón ── */
window.syncWooNow = function() {
  var btn = document.getElementById('woo-sync-btn');
  if (btn) btn.disabled = true;
  setSyncStatus('loading', 'Sincronizando con WooCommerce…');
  if (typeof refreshWooProducts !== 'function') return;
  refreshWooProducts(function(products, meta) {
    _wooProducts = products;
    updateSyncStatus(meta);
    renderStore(true);
    if (btn) btn.disabled = false;
  }, function(err) {
    setSyncStatus('warn', 'Error al sincronizar. Verifica la conexión con WooCommerce.');
    if (btn) btn.disabled = false;
  });
};

/* ──────────────────────────────────────────
   RENDER
   ────────────────────────────────────────── */
function makeCard(p, idx) {
  var img   = p.images && p.images[0] ? p.images[0] : '';
  var disc  = p.discount || '';
  var brand = extractBrand(p.name);
  var saving = p.oldPrice && p.oldPrice > p.price ? p.oldPrice - p.price : 0;
  var backorder = p.stockStatus === 'onbackorder'
    ? '<span class="tnd-backorder">Bajo encargo</span>' : '';
  return '<article class="tnd-card" onclick="openModal(' + idx + ')" tabindex="0" aria-label="' + p.name + '">' +
    (disc ? '<span class="tnd-badge">' + disc + '</span>' : '') +
    backorder +
    '<div class="tnd-img-wrap"><img src="' + img + '" alt="' + p.name + '" loading="lazy"></div>' +
    '<div class="tnd-info">' +
      (brand ? '<p class="tnd-brand">' + brand + '</p>' : '') +
      '<p class="tnd-name">' + p.name + '</p>' +
      '<div class="tnd-prices">' +
        '<span class="tnd-price">' + fmt(p.price) + '</span>' +
        (p.oldPrice && p.oldPrice !== p.price ? '<span class="tnd-old">' + fmt(p.oldPrice) + '</span>' : '') +
      '</div>' +
      (saving ? '<p class="tnd-saving">Ahorras ' + fmt(saving) + '</p>' : '') +
      '<button class="tnd-cta" tabindex="-1">Ver Producto</button>' +
    '</div></article>';
}

function showGridLoader() { var ov = document.getElementById('tnd-loading-overlay'); if (ov) ov.classList.add('active'); }
function hideGridLoader() { var ov = document.getElementById('tnd-loading-overlay'); if (ov) ov.classList.remove('active'); }

function renderStore(withLoader) {
  var src      = getSource();
  var filtered = tiendaCat === 'all' ? src.slice() : src.filter(function(p){ return p.category === tiendaCat; });
  filtered     = sortArr(filtered, tiendaSort);
  tiendaItems  = filtered;

  function paint() {
    var grid = document.getElementById('tnd-grid');
    var cnt  = document.getElementById('tnd-count');
    if (cnt) cnt.textContent = filtered.length + ' productos';
    if (grid) grid.innerHTML = filtered.length
      ? filtered.map(function(p, i){ return makeCard(p, i); }).join('')
      : '<div class="tnd-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><p>No encontramos productos en esta categoría.</p></div>';
    hideGridLoader();
  }
  if (withLoader) { showGridLoader(); setTimeout(paint, 180); } else { paint(); }
}

/* ── Búsqueda ── */
function doStoreSearch() {
  var q   = (document.getElementById('tnd-search-input').value || '').trim().toLowerCase();
  var src = getSource();
  var filtered = q
    ? src.filter(function(p){ return p.name.toLowerCase().indexOf(q) !== -1 || p.category.toLowerCase().indexOf(q) !== -1; })
    : src;
  filtered = sortArr(filtered, tiendaSort);
  tiendaItems = filtered;
  var grid = document.getElementById('tnd-grid');
  var cnt  = document.getElementById('tnd-count');
  if (cnt) cnt.textContent = filtered.length + ' productos';
  document.querySelectorAll('.ts-cat-filter').forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
  var allBtn = document.querySelector('.ts-cat-filter[data-cat="all"]');
  if (allBtn) { allBtn.classList.add('active'); allBtn.setAttribute('aria-selected','true'); }
  tiendaCat = 'all';
  history.replaceState(null, '', window.location.pathname);
  if (grid) grid.innerHTML = filtered.length
    ? filtered.map(function(p, i){ return makeCard(p, i); }).join('')
    : '<div class="tnd-empty"><p>Sin resultados para "' + q + '".</p></div>';
}

/* ── Modal (Quick View) ── */
function openModal(idx) {
  var p = tiendaItems[idx]; if (!p) return;
  _openProduct = p;
  var brand = extractBrand(p.name);
  /* Carrito */
  window.qvCartAction = function() {
    if (typeof addToCart === 'function') {
      addToCart({ name: p.name, price: p.price, image: p.images && p.images[0] ? p.images[0] : '', category: p.category || '' });
    }
    if (typeof tsAddToCart === 'function') tsAddToCart();
  };
  /* WhatsApp */
  var msg = encodeURIComponent('Hola! Me interesa: ' + p.name + ' (' + fmt(p.price) + ').');
  window.qvWspAction = function() { window.open('https://wa.me/573225817129?text=' + msg, '_blank'); };
  /* Abrir */
  if (typeof window.qvOpenProduct === 'function') {
    window.qvOpenProduct({
      brand:    brand || p.category || '',
      name:     p.name,
      price:    fmt(p.price),
      oldPrice: (p.oldPrice && p.oldPrice !== p.price) ? fmt(p.oldPrice) : '',
      discount: p.discount || '',
      desc:     p.shortDesc || 'Consulta por WhatsApp para especificaciones completas y disponibilidad.',
      tags:     [],
      images:   p.images || [],
      specs:    []
    });
  }
}

/* ── Agregar al carrito ── */
function tsAddToCart() {
  var p = _openProduct; if(!p) return;
  if(typeof addToCart==='function'){
    addToCart({name:p.name,price:p.price,image:p.images&&p.images[0]?p.images[0]:'',category:p.category||''});
  }
  var btn=document.getElementById('ts-btn-cart'); if(!btn) return;
  var orig=btn.innerHTML;
  btn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> ¡Agregado!';
  btn.style.background='#25D366';
  setTimeout(function(){btn.innerHTML=orig;btn.style.background='';},1800);
}

/* ──────────────────────────────────────────
   ZOOM DE IMAGEN EN MODAL
   ────────────────────────────────────────── */
(function () {
  document.addEventListener('mousemove', function (e) {
    var wrap = document.getElementById('ts-zoom-wrap');
    var img  = document.getElementById('ts-modal-main-img');
    if (!wrap || !img) return;
    var rect = wrap.getBoundingClientRect();
    var x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
    var y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
    img.style.transformOrigin = x + ' ' + y;
  });
})();

/* ──────────────────────────────────────────
   INIT
   ────────────────────────────────────────── */
(function(){
  /* URL param ?cat= */
  var urlCat = new URLSearchParams(window.location.search).get('cat');
  if(urlCat){
    tiendaCat = urlCat;
    var matchBtn = null;
    document.querySelectorAll('.ts-cat-filter').forEach(function(b){ if(b.dataset.cat===urlCat) matchBtn=b; });
    if(matchBtn){
      document.querySelectorAll('.ts-cat-filter').forEach(function(b){ b.classList.remove('active');b.setAttribute('aria-selected','false'); });
      matchBtn.classList.add('active'); matchBtn.setAttribute('aria-selected','true');
      setTimeout(function(){ matchBtn.scrollIntoView({inline:'center',behavior:'smooth'}); },120);
    }
  }

  /* Filtros categoría */
  document.querySelectorAll('.ts-cat-filter').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.ts-cat-filter').forEach(function(b){ b.classList.remove('active');b.setAttribute('aria-selected','false'); });
      btn.classList.add('active'); btn.setAttribute('aria-selected','true');
      tiendaCat=btn.dataset.cat;
      var si=document.getElementById('tnd-search-input');if(si)si.value='';
      renderStore(true);
      var url=new URL(window.location.href);
      if(btn.dataset.cat==='all') url.searchParams.delete('cat');
      else url.searchParams.set('cat',btn.dataset.cat);
      history.replaceState(null,'',url);
    });
  });

  /* Sort */
  var sortEl=document.getElementById('tnd-sort');
  if(sortEl) sortEl.addEventListener('change',function(){ tiendaSort=this.value; renderStore(true); });

  /* Búsqueda */
  var sbtn=document.getElementById('tnd-search-btn');
  if(sbtn) sbtn.addEventListener('click',doStoreSearch);
  var si=document.getElementById('tnd-search-input');
  if(si) si.addEventListener('keydown',function(e){ if(e.key==='Enter') doStoreSearch(); });

  /* Header scroll */
  var h=document.querySelector('.site-header');
  if(h) window.addEventListener('scroll',function(){ h.classList.toggle('scrolled',window.scrollY>80); },{passive:true});

  /* Hamburger */
  var navBtn=document.getElementById('nav-hamburger'),menu=document.getElementById('nav-mobile-menu');
  if(navBtn&&menu){
    navBtn.addEventListener('click',function(){
      var open=menu.classList.contains('open');
      navBtn.classList.toggle('open',!open); menu.classList.toggle('open',!open);
      navBtn.setAttribute('aria-expanded',String(!open)); menu.setAttribute('aria-hidden',String(open));
    });
    document.addEventListener('click',function(e){
      if(!e.target.closest('.nav-container')){ navBtn.classList.remove('open');menu.classList.remove('open');navBtn.setAttribute('aria-expanded','false');menu.setAttribute('aria-hidden','true'); }
    });
  }

  /* Footer año */
  var y=document.getElementById('footer-year'); if(y) y.textContent=new Date().getFullYear();

  /* ── Cargar productos desde WooCommerce ── */
  var cfg=window.WOO_CONFIG;
  var wooReady=true;

  if(wooReady && typeof initWooProducts==='function'){
    setSyncStatus('loading','Cargando catálogo desde WooCommerce…');
    renderStore(false); /* mostrar datos locales mientras carga */

    initWooProducts(function(products, meta){
      _wooProducts = products;
      updateSyncStatus(meta);
      renderStore(false);
    }, function(err){
      setSyncStatus('warn','No se pudo conectar con WooCommerce. Mostrando catálogo local.');
      renderStore(false);
    });
  } else {
    /* Sin WooCommerce: usar datos locales normalmente */
    var bar=document.getElementById('woo-sync-bar');
    if(bar) bar.style.display='none';
    renderStore(false);
  }
})();
