'use strict';
/* ══ WOO-SYNC.JS — Sincronización de productos con WooCommerce ══
   Flujo:
   1. Lee caché de localStorage (válido por WOO_CONFIG.cacheTTL minutos)
   2. Si caché expirado o vacío → consulta la API y actualiza caché
   3. Filtra productos sin stock antes de entregarlos a la tienda
   4. Si la API falla → usa caché anterior aunque esté vencido (fallback)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var CACHE_KEY = 'ts-woo-cache-v2';

  /* ──────────────────────────────────────────
     MAPEO DE CATEGORÍAS WooCommerce → Tienda
     ────────────────────────────────────────── */
  var CAT_MAP = [
    { re: /celular|smartphone|m[oó]vil|tel[eé]fono|samsung|xiaomi|motorola|redmi|realme|honor|infinix/i, cat: 'Celulares' },
    { re: /tablet|ipad/i,                                                                                cat: 'Tablets' },
    { re: /audio|auricular|aud[íi]fono|parlant|bocina|speaker|jbl|headset|diadema/i,                    cat: 'Audio' },
    { re: /accesorio|perif[eé]ri|teclado|mouse|webcam|c[aá]mara web|logitech|gaming|gamepad/i,          cat: 'Accesorios' },
    { re: /port[aá]til|laptop|notebook|computador port/i,                                               cat: 'Portátiles' },
    { re: /empresa|corporativ|servidor|server|workstation/i,                                            cat: 'Empresas' },
    { re: /red|router|switch|access point|networking|wifi|tp-link|ubiquiti|cisco|mikrotik/i,            cat: 'Redes' },
    { re: /impres|printer|plotter|t[oó]ner|cartucho|epson|canon|hp laser|brother|kyocera/i,             cat: 'Impresión' },
    { re: /memoria|disco|ssd|hdd|storage|almacenamiento|pendrive|usb flash|micro sd|kingston|adata/i,   cat: 'Memorias' },
    { re: /hogar|smart home|televisor|\btv\b|smart tv|lavadora|nevera|electrodom/i,                     cat: 'Línea hogar' },
    { re: /pos|punto de venta|terminal|datafono|dat[aá]fono|caja registradora|bixolon/i,                cat: 'POS' },
  ];

  function resolveCategory(wooCategories) {
    var names = (wooCategories || []).map(function (c) { return c.name || ''; });
    for (var i = 0; i < names.length; i++) {
      for (var j = 0; j < CAT_MAP.length; j++) {
        if (CAT_MAP[j].re.test(names[i])) return CAT_MAP[j].cat;
      }
    }
    /* Sin coincidencia exacta: usar el nombre tal cual (puede aparecer como nueva categoría) */
    return names[0] || 'Empresas';
  }

  /* ──────────────────────────────────────────
     FILTRO DE STOCK
     - outofstock                 → ocultar
     - manage_stock + qty <= 0   → ocultar
     - onbackorder                → mostrar (pedido bajo encargo)
     ────────────────────────────────────────── */
  function isInStock(p) {
    if (p.stock_status === 'outofstock') return false;
    if (p.manage_stock && p.stock_quantity !== null && p.stock_quantity <= 0) return false;
    return true;
  }

  /* ──────────────────────────────────────────
     MAPEO WooCommerce → formato interno
     ────────────────────────────────────────── */
  /* ──────────────────────────────────────────
     DETECCIÓN LOGITECH
     ────────────────────────────────────────── */
  var LG_GAMER   = /\bG\s?\d{3}\b|\bGPRO\b|\bG PRO\b|gaming|gamer/i;
  var LG_OFICINA = /\bMX\b|ergo|zone|brio|wave.?keys|lift|vertical|apuntador|r500|webcam|h390|h650|h540/i;

  function isLogitechProduct(p) {
    var name = (p.name || '').toUpperCase();
    var cats = (p.categories || []).map(function (c) { return (c.name || '').toUpperCase(); });
    return name.indexOf('LOGITECH') !== -1 || cats.some(function (c) { return c.indexOf('LOGITECH') !== -1; });
  }

  function logitechSubCat(name) {
    if (LG_GAMER.test(name))   return 'gamer';
    if (LG_OFICINA.test(name)) return 'oficina';
    return 'hogar';
  }

  /* ──────────────────────────────────────────
     RESOLUCIÓN DE DESCRIPCIÓN DEL PRODUCTO
     Orden de prioridad:
     1. short_description (campo "Descripción corta" en WooCommerce)
     2. description (campo "Descripción" principal)
     3. meta_data: campos SEO comunes (Yoast, RankMath, SEOPress, All-in-One SEO)
     ────────────────────────────────────────── */
  var SEO_META_KEYS = [
    '_yoast_wpseo_metadesc',      /* Yoast SEO */
    'rank_math_description',       /* RankMath */
    '_aioseop_description',        /* All in One SEO */
    '_seopress_titles_desc',       /* SEOPress */
    'seo_description',             /* genérico */
    '_product_description'         /* custom field común */
  ];

  function resolveDesc(p) {
    /* 1. Descripción corta de WooCommerce */
    if (p.short_description && p.short_description.trim()) {
      return sanitizeDesc(p.short_description);
    }
    /* 2. Descripción principal de WooCommerce */
    if (p.description && p.description.trim()) {
      return sanitizeDesc(p.description);
    }
    /* 3. meta_data (plugins SEO / campos personalizados) */
    var meta = p.meta_data || [];
    for (var i = 0; i < meta.length; i++) {
      if (SEO_META_KEYS.indexOf(meta[i].key) !== -1 && meta[i].value) {
        return sanitizeDesc(String(meta[i].value));
      }
    }
    return '';
  }

  var SAFE_TAGS = /^(p|ul|ol|li|strong|em|b|i|br|h2|h3|h4|span|div|a)$/i;
  var UNSAFE_TAGS = /<(script|style|iframe|form|input|button|object|embed|link|meta|base)[^>]*>[\s\S]*?<\/\1>|<(script|style|iframe|form|input|button|object|embed|link|meta|base)[^>]*\/?>/gi;

  function sanitizeDesc(html) {
    if (!html) return '';
    var clean = html
      .replace(UNSAFE_TAGS, '')
      .replace(/<[^>]+>/g, function (tag) {
        var m = tag.match(/^<\/?([a-z][a-z0-9]*)/i);
        if (!m) return '';
        return SAFE_TAGS.test(m[1]) ? tag : '';
      });
    return clean.trim();
  }

  function mapProduct(p) {
    if (!isInStock(p)) return null;
    if (p.status !== 'publish') return null;

    var regular = parseFloat(p.regular_price) || parseFloat(p.price) || 0;
    var sale    = parseFloat(p.sale_price) || 0;
    var price   = (p.on_sale && sale > 0) ? sale : regular;
    var oldPrice = regular;
    var discount = '';
    if (p.on_sale && sale > 0 && regular > sale) {
      discount = Math.round((1 - sale / regular) * 100) + '% OFF';
    }

    var images = (p.images || []).map(function (img) { return img.src || ''; }).filter(Boolean);
    var shortDesc = resolveDesc(p);
    var logitech  = isLogitechProduct(p);

    return {
      id:         p.id,
      name:       p.name,
      category:   resolveCategory(p.categories),
      price:      Math.round(price),
      oldPrice:   Math.round(oldPrice),
      discount:   discount,
      images:     images,
      shortDesc:  shortDesc,
      stockStatus: p.stock_status,
      isLogitech: logitech,
      lgSubCat:   logitech ? logitechSubCat(p.name) : null
    };
  }

  /* ──────────────────────────────────────────
     FETCH CON PAGINACIÓN
     ────────────────────────────────────────── */
  function buildURL(cfg, page) {
    return '/api/products.php?page=' + page;
  }

  function fetchPage(cfg, page) {
    return fetch(buildURL(cfg, page))
      .then(function (r) {
        if (!r.ok) return Promise.reject('HTTP ' + r.status);
        var totalPages = parseInt(r.headers.get('X-WP-TotalPages') || '1', 10);
        var totalProds = parseInt(r.headers.get('X-WP-Total') || '0', 10);
        return r.json().then(function (data) {
          return { data: data, totalPages: totalPages, totalProds: totalProds };
        });
      });
  }

  function fetchAll(cfg) {
    return fetchPage(cfg, 1).then(function (res) {
      var all   = res.data;
      var pages = res.totalPages;
      if (pages <= 1) return all;
      var pending = [];
      for (var p = 2; p <= pages; p++) {
        pending.push(fetchPage(cfg, p).then(function (r) { return r.data; }));
      }
      return Promise.all(pending).then(function (results) {
        results.forEach(function (r) { all = all.concat(r); });
        return all;
      });
    });
  }

  /* ──────────────────────────────────────────
     API PÚBLICA
     ────────────────────────────────────────── */

  /**
   * initWooProducts(onReady, onError)
   * Lee caché o consulta la API.
   * onReady(products, meta) → products: array mapeado, meta: { fromCache, syncedAt, total }
   */
  window.initWooProducts = function (onReady, onError) {
    var cfg = window.WOO_CONFIG;
    if (!cfg) {
      if (onError) onError('WooCommerce no configurado');
      return;
    }

    var ttl = (cfg.cacheTTL || 30) * 60 * 1000;

    /* Intenta caché válida */
    try {
      var cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && cached.ts && (Date.now() - cached.ts) < ttl && cached.products && cached.products.length) {
        /* Si ningún producto tiene descripción, invalidar la caché para pedir datos frescos */
        var hasDesc = cached.products.some(function(p) { return p.shortDesc && p.shortDesc.trim(); });
        if (!hasDesc) {
          console.log('[WooSync] Caché sin descripciones — forzando actualización');
          localStorage.removeItem(CACHE_KEY);
        } else {
          console.log('[WooSync] Caché válida — ' + cached.products.length + ' productos');
          if (onReady) onReady(cached.products, { fromCache: true, syncedAt: cached.ts, total: cached.products.length });
          return;
        }
      }
    } catch (e) {}

    /* Fetch fresco */
    console.log('[WooSync] Consultando WooCommerce...');
    fetchAll(cfg)
      .then(function (raw) {
        var products = raw.map(mapProduct).filter(Boolean);
        var ts = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: ts, products: products }));
        console.log('[WooSync] Sincronizado — ' + products.length + '/' + raw.length + ' productos disponibles');
        if (onReady) onReady(products, { fromCache: false, syncedAt: ts, total: products.length });
      })
      .catch(function (err) {
        console.warn('[WooSync] Error al conectar con WooCommerce:', err);
        /* Fallback: caché aunque esté vencida */
        try {
          var stale = JSON.parse(localStorage.getItem(CACHE_KEY));
          if (stale && stale.products && stale.products.length) {
            console.warn('[WooSync] Usando caché vencida como respaldo');
            if (onReady) onReady(stale.products, { fromCache: true, syncedAt: stale.ts, total: stale.products.length, stale: true });
            return;
          }
        } catch (e2) {}
        if (onError) onError(err);
      });
  };

  /**
   * refreshWooProducts(onReady, onError)
   * Fuerza actualización ignorando la caché.
   */
  window.refreshWooProducts = function (onReady, onError) {
    localStorage.removeItem(CACHE_KEY);
    window.initWooProducts(onReady, onError);
  };

  /**
   * getWooCacheAge()
   * Devuelve los minutos desde la última sincronización, o null si no hay caché.
   */
  window.getWooCacheAge = function () {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (!c || !c.ts) return null;
      return Math.round((Date.now() - c.ts) / 60000);
    } catch (e) { return null; }
  };
})();
