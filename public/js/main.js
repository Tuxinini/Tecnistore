'use strict';
var PRODUCTS=[
  {brand:'Samsung',name:'Galaxy A16 5G',badge:'Mas Vendido',badgeClass:'blue',price:799000,oldPrice:950000,discount:'16% OFF',rating:5,
   images:['/images/products/samsung-a16.jpg','/images/products/samsung-a06.jpg','/images/products/samsung-a05s.webp'],
   specs:[['Pantalla','6.7 Super AMOLED FHD+'],['Procesador','Exynos 1330'],['RAM','8 GB'],['Almacenamiento','128 GB'],['Camara','50 MP + 5 MP'],['Bateria','5000 mAh 25W'],['Sistema','Android 14']]},
  {brand:'Samsung',name:'Galaxy A06 4G',badge:'Nuevo',badgeClass:'',price:589000,oldPrice:699000,discount:'16% OFF',rating:4,
   images:['/images/products/samsung-a06.jpg','/images/products/samsung-a16.jpg','/images/products/samsung-a05s.webp'],
   specs:[['Pantalla','6.7 PLS LCD'],['Procesador','Exynos 1280'],['RAM','4 GB'],['Almacenamiento','64 GB'],['Camara','50 MP'],['Bateria','5000 mAh'],['Sistema','Android 14']]},
  {brand:'HP',name:'Portatil 14-245 G10 AMD',badge:'Oferta',badgeClass:'',price:1229900,oldPrice:1499000,discount:'18% OFF',rating:5,
   images:['/images/products/portatil-hp.jpg','/images/products/portatil-lenovo.png','/images/products/portatil-dell.png'],
   specs:[['Procesador','AMD Ryzen 3'],['RAM','8 GB DDR4'],['Almacenamiento','512 GB SSD'],['Pantalla','14 FHD IPS'],['Graficos','AMD Radeon'],['Bateria','10 horas'],['Sistema','Windows 11 Home']]},
  {brand:'Dell',name:'Latitude 5420 Intel i5',badge:'Corporativo',badgeClass:'blue',price:2899000,oldPrice:3400000,discount:'15% OFF',rating:5,
   images:['/images/products/portatil-dell.png','/images/products/portatil-lenovo.png','/images/products/portatil-hp.jpg'],
   specs:[['Procesador','Intel Core i5-11th'],['RAM','16 GB DDR4'],['Almacenamiento','512 GB SSD'],['Pantalla','14 FHD IPS'],['Graficos','Intel Iris Xe'],['Bateria','54 Wh'],['Sistema','Windows 11 Pro']]},
  {brand:'Logitech',name:'Camara MX BRIO 705 4K',badge:'4K',badgeClass:'blue',price:769000,oldPrice:950000,discount:'19% OFF',rating:5,
   images:['/images/products/camara-logitech-mx-brio.png','/images/products/camara-brio-100.webp','/images/products/camara-mx-brio.webp'],
   specs:[['Resolucion','4K Ultra HD 30fps'],['Angulo','90 grados'],['Microfonos','Estereo ANC'],['Conexion','USB-C'],['Privacidad','Cubierta fisica'],['Compatible','Win/Mac'],['Peso','136 g']]},
  {brand:'JBL',name:'Flip 6 Bluetooth Speaker',badge:'IP67',badgeClass:'',price:499000,oldPrice:620000,discount:'19% OFF',rating:5,
   images:['/images/products/jbl-flip6.png','/images/products/audifono-redmi-buds6.webp','/images/products/audifono-redmi-buds5.png'],
   specs:[['Potencia','30W RMS'],['Frecuencia','63Hz-20kHz'],['Bateria','12 horas'],['Resistencia','IP67'],['Conexion','BT 5.1'],['Carga','USB-C 15W'],['Peso','550 g']]},
  {brand:'Xiaomi',name:'Redmi Buds 6 Active ANC',badge:'ANC',badgeClass:'',price:189000,oldPrice:240000,discount:'21% OFF',rating:4,
   images:['/images/products/audifono-redmi-buds6.webp','/images/products/audifono-redmi-buds5.png','/images/products/jbl-flip6.png'],
   specs:[['Driver','12.4mm dinamico'],['ANC','Activo'],['Bateria','6h+18h'],['Carga','USB-C'],['Resistencia','IP54'],['Conexion','BT 5.3'],['Latencia','46ms']]},
  {brand:'Epson',name:'EcoTank L4260 Wi-Fi',badge:'Sin cartuchos',badgeClass:'blue',price:879000,oldPrice:1050000,discount:'16% OFF',rating:4,
   images:['/images/products/impresora-epson-l4260.webp','/images/products/camara-hp-320.webp','/images/products/camara-logitech-mx-brio.png'],
   specs:[['Funcion','Impresora/Escaner/Copiadora'],['Velocidad','15 ppm negro'],['Resolucion','5760x1440 dpi'],['Conectividad','Wi-Fi/USB'],['Compatibilidad','Win/Mac'],['Tinta','7500 pag negro'],['Garantia','2 anos']]},
  {brand:'Lenovo',name:'Portátil Corporativo V14 G4 IRU',badge:'Corporativo',badgeClass:'blue',price:2490000,oldPrice:3890000,discount:'36% OFF',rating:5,
   images:['/images/products/portatil-lenovo.png','/images/products/portatil-dell.png'],
   desc:'El V14 G4 IRU está diseñado para el profesional moderno que exige rendimiento confiable en su jornada de trabajo. Con procesador Intel Core i5 de 13ª generación y pantalla FHD Anti-glare, ofrece nitidez y velocidad para las cargas de trabajo más exigentes. Su construcción supera la certificación MIL-STD-810H, garantizando durabilidad ante el uso intensivo diario.',
   descTags:['MIL-STD-810H','Intel 13ª Gen','Windows 11 Pro','SSD NVMe','Garantía Lenovo'],
   specs:[['Procesador','Intel Core i5-1335U 13ª Gen'],['RAM','8 GB DDR4 / amp. 16 GB'],['Almacenamiento','512 GB SSD NVMe'],['Pantalla','14" FHD IPS Anti-glare'],['Gráficos','Intel Iris Xe'],['Batería','45 Wh · ~7 horas'],['Sistema','Windows 11 Pro']]}
];

/* ── HELPERS ── */
function fmt(n){return '$'+n.toLocaleString('es-CO');}

var _SAFE_TAGS=/^(p|ul|ol|li|strong|em|b|i|br|h2|h3|h4|span|div|a)$/i;
var _UNSAFE_TAGS=/<(script|style|iframe|form|input|button|object|embed|link|meta|base)[^>]*>[\s\S]*?<\/\1>|<(script|style|iframe|form|input|button|object|embed|link|meta|base)[^>]*\/?>/gi;
function sanitizeDesc(html){
  if(!html)return'';
  return html.replace(_UNSAFE_TAGS,'').replace(/<[^>]+>/g,function(tag){
    var m=tag.match(/^<\/?([a-z][a-z0-9]*)/i);
    if(!m)return'';
    return _SAFE_TAGS.test(m[1])?tag:'';
  }).trim();
}
function stars(r){var s='';for(var i=0;i<5;i++)s+='<span class="ts-star '+(i<r?'on':'off')+'">&#9733;</span>';return s;}
function discountNum(d){return parseFloat(d)||0;}

function makeCard(p,idx){
  return '<article class="ts-prod-card" onclick="tsOpenModal('+idx+')" tabindex="0" aria-label="'+p.brand+' '+p.name+'">'+
    '<span class="ts-prod-badge '+p.badgeClass+'">'+p.badge+'</span>'+
    '<div class="ts-prod-img-wrap"><img src="'+p.images[0]+'" alt="'+p.name+'" loading="lazy"></div>'+
    '<div class="ts-prod-info">'+
      '<p class="ts-prod-brand">'+p.brand+'</p>'+
      '<p class="ts-prod-name">'+p.name+'</p>'+
      '<div class="ts-prod-stars">'+stars(p.rating)+'</div>'+
      '<div class="ts-prod-prices">'+
        '<span class="ts-prod-price">'+fmt(p.price)+'</span>'+
        '<span class="ts-prod-old">'+fmt(p.oldPrice)+'</span>'+
        '<span class="ts-prod-disc-tag">'+p.discount+'</span>'+
      '</div>'+
      '<button class="ts-prod-cta" tabindex="-1">Ver Producto</button>'+
    '</div></article>';
}

/* ── RENDER PRODUCTS ── */
function renderProducts(searchList){
  var isSearch=!!searchList;
  var items;

  if(isSearch){
    /* busqueda: mostrar todos los resultados, sin dividir */
    items=searchList.map(function(p){return{p:p,idx:PRODUCTS.indexOf(p)};});
    fillGrid('ts-products-grid',items);
    fillGrid('ts-products-grid-extra',[]);
    var w=document.getElementById('ts-ver-mas-wrap');if(w)w.style.display='none';
    closeExtra();
  } else {
    /* vista normal: ordenar por descuento y mostrar 4 primero */
    var sorted=PRODUCTS.map(function(p,i){return{p:p,idx:i};})
      .sort(function(a,b){return discountNum(b.p.discount)-discountNum(a.p.discount);});
    var featured=sorted.slice(0,4);
    var extra=sorted.slice(4);
    fillGrid('ts-products-grid',featured);
    fillGrid('ts-products-grid-extra',extra);
    var w2=document.getElementById('ts-ver-mas-wrap');
    if(w2)w2.style.display=extra.length?'flex':'none';
    closeExtra();
  }
}

function fillGrid(id,items){
  var g=document.getElementById(id);if(!g)return;
  g.innerHTML=items.map(function(item){return makeCard(item.p,item.idx);}).join('');
}

renderProducts(null);

/* ── BUSQUEDA ── */
function doSearch(){
  var q=(document.getElementById('search-input').value||'').trim().toLowerCase();
  if(q){
    var res=PRODUCTS.filter(function(p){
      return p.name.toLowerCase().indexOf(q)!==-1||p.brand.toLowerCase().indexOf(q)!==-1;
    });
    renderProducts(res);
  } else {
    renderProducts(null);
  }
  var s=document.getElementById('ts-productos');if(s)s.scrollIntoView({behavior:'smooth'});
}
var si=document.getElementById('search-input');
if(si)si.addEventListener('keydown',function(e){if(e.key==='Enter')doSearch();});

/* ── TOGGLE VER MAS ── */
var extraOpen=false;
function closeExtra(){
  extraOpen=false;
  var ex=document.getElementById('ts-extra-section');if(ex)ex.classList.remove('open');
  var btn=document.getElementById('ts-ver-mas-btn');
  if(btn){btn.classList.remove('open');btn.querySelector('.vm-text').textContent='Ver mas productos';}
}
function toggleExtraProducts(){
  extraOpen=!extraOpen;
  var ex=document.getElementById('ts-extra-section');
  var btn=document.getElementById('ts-ver-mas-btn');
  if(ex)ex.classList.toggle('open',extraOpen);
  if(btn){
    btn.classList.toggle('open',extraOpen);
    btn.querySelector('.vm-text').textContent=extraOpen?'Ver menos':'Ver mas productos';
  }
  if(extraOpen){
    setTimeout(function(){ex.scrollIntoView({behavior:'smooth',block:'start'});},100);
  }
}

/* ── MODAL (Quick View) ── */
var activeProductIdx=0;
function tsOpenModal(idx){
  activeProductIdx=idx;
  var p=PRODUCTS[idx]; if(!p) return;
  /* Carrito */
  window.qvCartAction=function(){
    if(typeof addToCart==='function'){
      addToCart({name:p.name,price:p.price,image:p.images&&p.images[0]?p.images[0]:'',category:p.brand||''});
    }
  };
  /* WhatsApp */
  var msg=encodeURIComponent('Hola! Me interesa: '+p.brand+' '+p.name+' ('+fmt(p.price)+').');
  window.qvWspAction=function(){ window.open('https://wa.me/573225817129?text='+msg,'_blank'); };
  /* Abrir modal */
  if(typeof window.qvOpenProduct==='function'){
    window.qvOpenProduct({
      brand:    p.brand,
      name:     p.name,
      price:    fmt(p.price),
      oldPrice: fmt(p.oldPrice),
      discount: p.discount||'',
      desc:     p.desc||'',
      tags:     p.descTags||[],
      images:   p.images||[],
      specs:    p.specs||[]
    });
  }
}
var _mc=document.querySelector('.ts-modal-close');
if(_mc)_mc.addEventListener('click',function(){var ov=document.getElementById('ts-modal-overlay');if(ov){ov.classList.remove('open');document.body.style.overflow='';}});
document.addEventListener('click',function(e){
  if(e.target&&e.target.id==='ts-modal-overlay'){var ov=document.getElementById('ts-modal-overlay');if(ov){ov.classList.remove('open');document.body.style.overflow='';}}
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){var ov=document.getElementById('ts-modal-overlay');if(ov&&ov.classList.contains('open')){ov.classList.remove('open');document.body.style.overflow='';}}
});
function tsSetThumb(idx){
  document.getElementById('ts-modal-main-img').src=PRODUCTS[activeProductIdx].images[idx];
  document.querySelectorAll('.ts-thumb').forEach(function(t,i){t.classList.toggle('active',i===idx);});
}

/* ── CARRITO (cart.js gestiona la lógica central) ── */
function tsAddToCart(){
  var p=PRODUCTS[activeProductIdx];if(!p)return;
  if(typeof addToCart==='function'){
    addToCart({name:p.brand+' '+p.name,price:p.price,image:p.images&&p.images[0]?p.images[0]:'',category:''});
  }
  var btn=document.getElementById('ts-btn-cart');if(!btn)return;
  var orig=btn.innerHTML;
  btn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> ¡Agregado!';
  btn.style.background='#25D366';
  setTimeout(function(){btn.innerHTML=orig;btn.style.background='';},1800);
}

/* ── CARRUSEL CLIENTES ── */
var clientPage=0,CLIENT_TOTAL=3;
function tsGoToClients(page){
  clientPage=page;
  var t=document.getElementById('ts-clients-track');
  if(t)t.style.transform='translateX(-'+(page*100)+'%)';
  document.querySelectorAll('.ts-ctrl-dot').forEach(function(d,i){d.classList.toggle('active',i===page);});
}
function tsNextClients(){tsGoToClients((clientPage+1)%CLIENT_TOTAL);}
function tsPrevClients(){tsGoToClients((clientPage-1+CLIENT_TOTAL)%CLIENT_TOTAL);}
var cAuto=setInterval(tsNextClients,3200);
var cWrap=document.querySelector('.ts-clients-carousel-wrap');
if(cWrap){cWrap.addEventListener('mouseenter',function(){clearInterval(cAuto);});cWrap.addEventListener('mouseleave',function(){cAuto=setInterval(tsNextClients,3200);});}

/* ── CONTADORES STATS ── */
function animateStat(el){
  var target=parseInt(el.dataset.target,10),prefix=el.dataset.prefix||'',sep=el.dataset.separator||'',dur=1800,start=performance.now();
  function tick(now){
    var prog=Math.min((now-start)/dur,1),ease=1-Math.pow(1-prog,3),val=Math.round(ease*target);
    var f=sep?val.toString().replace(/\B(?=(\d{3})+(?!\d))/g,sep):val.toLocaleString('es-CO');
    el.textContent=prefix+f;if(prog<1)requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
var sObs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.querySelectorAll('.stat-number').forEach(animateStat);sObs.unobserve(e.target);}});},{threshold:0.4});
var sSection=document.querySelector('.stats-section');if(sSection)sObs.observe(sSection);

/* ── ANIMACIONES SCROLL ── */
var scObs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');scObs.unobserve(e.target);}});},{threshold:0.12,rootMargin:'0px 0px -30px 0px'});
document.querySelectorAll('.fade-in,.fade-in-left,.fade-in-right').forEach(function(el){scObs.observe(el);});

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click',function(e){var t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}});
});

/* ── FOOTER AÑO ── */
var yEl=document.getElementById('footer-year');if(yEl)yEl.textContent=new Date().getFullYear();

/* ══ FILTROS DE CATEGORÍA ══ */
var currentCatItems=[];

function extractBrand(name){
  var brands=['Samsung','Xiaomi','Motorola','Lenovo','Asus','HP','Dell','Acer','MSI','Logitech',
    'Epson','JBL','Realme','WD','Kingston','Crucial','Adata','Patriot','Hiksemi','Hikvision',
    'Redmi','Xue','Lacie','Touch','Microsoft'];
  var u=name.toUpperCase();
  for(var i=0;i<brands.length;i++){
    if(u.indexOf(brands[i].toUpperCase())!==-1)return brands[i];
  }
  return '';
}

function makeCardAll(p,idx){
  var img=p.images&&p.images[0]?p.images[0]:'';
  var disc=p.discount||'';
  var brand=extractBrand(p.name);
  return '<article class="ts-prod-card" onclick="tsOpenModalAll('+idx+')" tabindex="0" aria-label="'+p.name+'">' +
    (disc?'<span class="ts-prod-badge">'+ disc +'</span>':'') +
    '<div class="ts-prod-img-wrap"><img src="'+img+'" alt="'+p.name+'" loading="lazy"></div>' +
    '<div class="ts-prod-info">' +
      (brand?'<p class="ts-prod-brand">'+brand+'</p>':'') +
      '<p class="ts-prod-name">'+p.name+'</p>' +
      '<div class="ts-prod-prices">' +
        '<span class="ts-prod-price">'+fmt(p.price)+'</span>' +
        (p.oldPrice&&p.oldPrice!==p.price?'<span class="ts-prod-old">'+fmt(p.oldPrice)+'</span>':'') +
        (disc?'<span class="ts-prod-disc-tag">'+disc+'</span>':'') +
      '</div>' +
      '<button class="ts-prod-cta" tabindex="-1">Ver Producto</button>' +
    '</div></article>';
}

function fillGridAll(id,items){
  var g=document.getElementById(id);if(!g)return;
  g.innerHTML=items.map(function(item,i){return makeCardAll(item,i);}).join('');
}

function filterAndRenderAll(cat){
  var filtered;
  if(cat==='all'){
    var sorted=PRODUCTS.map(function(p,i){return{p:p,idx:i};})
      .sort(function(a,b){return discountNum(b.p.discount)-discountNum(a.p.discount);});
    fillGrid('ts-products-grid',sorted.slice(0,4));
    fillGrid('ts-products-grid-extra',sorted.slice(4));
    currentCatItems=[];
    var w=document.getElementById('ts-ver-mas-wrap');
    if(w)w.style.display=sorted.length>4?'flex':'none';
    closeExtra();
    return;
  }
  filtered=(typeof ALL_PRODUCTS!=='undefined'?ALL_PRODUCTS:[])
    .filter(function(p){return p.category===cat;})
    .sort(function(a,b){return(parseFloat(b.discount)||0)-(parseFloat(a.discount)||0);});
  currentCatItems=filtered;
  fillGridAll('ts-products-grid',filtered.slice(0,8));
  fillGridAll('ts-products-grid-extra',filtered.slice(8));
  var w2=document.getElementById('ts-ver-mas-wrap');
  if(w2)w2.style.display=filtered.length>8?'flex':'none';
  closeExtra();
}

function tsOpenModalAll(idx){
  var p=currentCatItems[idx];if(!p)return;
  var brand=extractBrand(p.name);
  document.getElementById('ts-modal-brand').textContent=brand||p.category||'';
  document.getElementById('ts-modal-name').textContent=p.name;
  document.getElementById('ts-modal-disc').textContent=p.discount||'';
  document.getElementById('ts-modal-price').textContent=fmt(p.price);
  document.getElementById('ts-modal-old').textContent=(p.oldPrice&&p.oldPrice!==p.price)?fmt(p.oldPrice):'';
  var mi=document.getElementById('ts-modal-main-img');mi.src=p.images[0]||'';mi.alt=p.name;
  document.getElementById('ts-modal-thumbs').innerHTML=(p.images||[]).map(function(src,i){
    return '<img class="ts-thumb ts-modal-thumb '+(i===0?'active':'')+'" src="'+src+'" alt="Vista '+(i+1)+'" onclick="tsSetThumbAll('+i+','+idx+')" tabindex="0">';
  }).join('');
  var specsEl=document.getElementById('ts-modal-specs');
  if(specsEl){
    var desc=sanitizeDesc(p.shortDesc||'');
    specsEl.innerHTML=desc
      ?'<div style="padding:10px 0;font-size:13.5px;color:var(--color-text-muted);line-height:1.65">'+desc+'</div>'
      :'<div style="padding:10px 0;font-size:13.5px;color:var(--color-text-muted)">Consulta por WhatsApp para especificaciones completas y disponibilidad.</div>';
  }
  var msg=encodeURIComponent('Hola! Me interesa el producto: '+p.name+' ('+fmt(p.price)+').');
  var wb=document.getElementById('ts-btn-wsp');if(wb)wb.onclick=function(){window.open('https://wa.me/573225817129?text='+msg,'_blank');};
  var ov=document.getElementById('ts-modal-overlay');ov.classList.add('open');document.body.style.overflow='hidden';
  setTimeout(function(){var c=document.querySelector('.ts-modal-close');if(c)c.focus();},60);
}

function tsSetThumbAll(imgIdx,prodIdx){
  var p=currentCatItems[prodIdx];if(!p)return;
  document.getElementById('ts-modal-main-img').src=p.images[imgIdx]||'';
  document.querySelectorAll('.ts-thumb').forEach(function(t,i){t.classList.toggle('active',i===imgIdx);});
}

/* ── INIT FILTROS ── */
(function initCatFilters(){
  var btns=document.querySelectorAll('.ts-cat-filter');
  btns.forEach(function(btn){
    btn.addEventListener('click',function(){
      btns.forEach(function(b){b.classList.remove('active');b.setAttribute('aria-selected','false');});
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      filterAndRenderAll(btn.dataset.cat);
    });
  });
})();

/* ── OFERTAS HOY desde WooCommerce (vía proxy /api/products.php) ── */
(function loadOfertasHoy() {
  function fetchPage(page) {
    return fetch('/api/products.php?page=' + page)
      .then(function(r) {
        if (!r.ok) return Promise.reject('HTTP ' + r.status);
        var totalPages = parseInt(r.headers.get('X-WP-TotalPages') || '1', 10);
        return r.json().then(function(data) { return { data: data, totalPages: totalPages }; });
      });
  }

  function fetchAll() {
    return fetchPage(1).then(function(res) {
      var all = res.data;
      var pages = res.totalPages;
      if (pages <= 1) return all;
      var pending = [];
      for (var p = 2; p <= pages; p++) {
        pending.push(fetchPage(p).then(function(r) { return r.data; }));
      }
      return Promise.all(pending).then(function(results) {
        results.forEach(function(r) { all = all.concat(r); });
        return all;
      });
    });
  }

  fetchAll()
    .then(function(raw) {
      var ofertasRaw = raw.filter(function(p) {
        return (p.categories || []).some(function(c) {
          return c.name && c.name.toUpperCase().indexOf('OFERTA') !== -1;
        });
      });
      var products = ofertasRaw
        .filter(function(p) {
          if (p.stock_status === 'outofstock') return false;
          if (p.manage_stock && p.stock_quantity !== null && p.stock_quantity <= 0) return false;
          return true;
        })
        .map(function(p) {
          var regular = parseFloat(p.regular_price) || parseFloat(p.price) || 0;
          var sale    = parseFloat(p.sale_price) || 0;
          var price   = (p.on_sale && sale > 0) ? sale : regular;
          var discount = '';
          if (p.on_sale && sale > 0 && regular > sale) {
            discount = Math.round((1 - sale / regular) * 100) + '% OFF';
          }
          return {
            name:     p.name,
            price:    Math.round(price),
            oldPrice: Math.round(regular),
            discount: discount,
            images:   (p.images || []).map(function(img) { return img.src || ''; }).filter(Boolean),
            shortDesc: sanitizeDesc(p.short_description || p.description || ''),
            category: 'Ofertas'
          };
        });
      if (!products.length) return;
      currentCatItems = products;
      fillGridAll('ts-products-grid', products.slice(0, 4));
      fillGridAll('ts-products-grid-extra', products.slice(4));
      var w = document.getElementById('ts-ver-mas-wrap');
      if (w) w.style.display = products.length > 4 ? 'flex' : 'none';
      closeExtra();
    })
    .catch(function(err) { console.warn('[OfertasHoy] No se pudo cargar desde WooCommerce:', err); });
})();

/* ── FORMULARIO EMPRESAS → WHATSAPP ── */
(function(){
  var form=document.getElementById('empresas-form');
  if(!form)return;
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var empresa=form.querySelector('[name=empresa]').value.trim();
    var nit=form.querySelector('[name=nit]').value.trim();
    var contacto=form.querySelector('[name=contacto]').value.trim();
    var cargo=form.querySelector('[name=cargo]').value.trim();
    var tel=form.querySelector('[name=tel]').value.trim();
    var email=form.querySelector('[name=email]').value.trim();
    var sector=form.querySelector('[name=sector]').value;
    var cantidad=form.querySelector('[name=cantidad]').value;
    var tipos=[];
    form.querySelectorAll('[name=tipo]:checked').forEach(function(c){tipos.push(c.value);});
    var mensaje=form.querySelector('[name=mensaje]').value.trim();
    if(!empresa||!nit||!contacto||!tel||!email){
      alert('Por favor completa los campos obligatorios (*).');return;
    }
    var txt='*Cotización Empresarial — Technistore*\n\n'+
      '🏢 *Empresa:* '+empresa+'\n'+
      '📋 *NIT:* '+nit+'\n'+
      '👤 *Contacto:* '+contacto+(cargo?' ('+cargo+')':'')+'\n'+
      '📞 *Teléfono:* '+tel+'\n'+
      '✉️ *Correo:* '+email+'\n'+
      (sector?'🏭 *Sector:* '+sector+'\n':'')+
      (tipos.length?'💻 *Equipos:* '+tipos.join(', ')+'\n':'')+
      (cantidad?'📦 *Cantidad:* '+cantidad+'\n':'')+
      (mensaje?'📝 *Mensaje:* '+mensaje:'');
    window.open('https://wa.me/573225817129?text='+encodeURIComponent(txt),'_blank');
  });
})();
