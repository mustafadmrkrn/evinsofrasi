/* Evin Sofrası — ortak istemci kodu */
window.ES = (function () {
  'use strict';
  const CFG = window.ES_CONFIG;
  const sb = window.supabase.createClient(CFG.url, CFG.key);
  const TZ = 'Europe/Istanbul';
  const ctx = { session: null, profile: null, district: null, kitchen: null };

  /* ---------- tarih / para yardımcıları (hepsi İstanbul saatine göre) ---------- */
  const fmtDate = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  const fmtTime = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const DOW = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const todayISO = () => fmtDate.format(new Date());
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const tomorrowISO = () => addDays(todayISO(), 1);
  const dowOf = (iso) => new Date(iso + 'T12:00:00Z').getUTCDay();
  const trDate = (iso) => { const d = new Date(iso + 'T12:00:00Z'); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]; };
  const money = (n) => '₺' + Number(n || 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  const hm = (t) => (t || '').slice(0, 5);
  const nowHM = () => fmtTime.format(new Date()).slice(0, 5);
  const secondsToMidnight = () => { const [h, m, s] = fmtTime.format(new Date()).split(':').map(Number); return 86400 - (h * 3600 + m * 60 + s); };
  const pad = (n) => String(n).padStart(2, '0');
  const hms = (s) => pad(Math.floor(s / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MEAL = { ogle: 'Öğle', aksam: 'Akşam' };
  const CAT = { corba: 'Çorba', ana_yemek: 'Ana Yemek', pilav_makarna: 'Pilav / Makarna', salata: 'Salata', meze: 'Meze', icecek_tatli: 'İçecek / Tatlı' };
  const CAT_ORDER = ['corba', 'ana_yemek', 'pilav_makarna', 'salata', 'meze', 'icecek_tatli'];

  /* ---------- bildirim ---------- */
  function toast(msg, type) {
    let box = document.getElementById('es-toast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-toast';
      box.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none px-4';
      document.body.appendChild(box);
    }
    const t = document.createElement('div');
    const cls = type === 'error' ? 'bg-light-error text-light-on-error' : type === 'ok' ? 'bg-success text-on-success' : 'bg-light-inverse-surface text-light-inverse-on-surface';
    t.className = 'px-4 py-3 rounded-lg shadow-md font-body text-body-md max-w-[360px] ' + cls;
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.remove(), type === 'error' ? 6000 : 3500);
  }
  const fail = (e) => toast((e && e.message) || String(e), 'error');

  async function busy(btn, fn) {
    if (btn.disabled) return;
    const old = btn.innerHTML; btn.disabled = true; btn.style.opacity = '.6';
    try { return await fn(); } catch (e) { fail(e); } finally { btn.disabled = false; btn.style.opacity = ''; btn.innerHTML = old; }
  }
  async function q(promise) { const { data, error } = await promise; if (error) throw error; return data; }

  /* ---------- oturum / bağlam ---------- */
  async function init(opts) {
    opts = opts || {};
    const role = opts.role || 'customer';
    const { data: { session } } = await sb.auth.getSession();
    ctx.session = session;
    if (role === 'public') {
      if (session && opts.redirectIfAuthed) { location.replace(opts.redirectIfAuthed); return null; }
      return ctx;
    }
    if (!session) {
      location.replace('giris.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search));
      return null;
    }
    ctx.profile = await q(sb.from('profiles').select('*').eq('id', session.user.id).single());
    if (role === 'kitchen') {
      if (!['kitchen', 'admin'].includes(ctx.profile.role)) {
        document.body.innerHTML = '<div class="max-w-[420px] mx-auto p-8 text-center font-body"><h1 class="font-headline text-headline-sm mb-2">Bu sayfa mutfak personeline özeldir</h1><p class="text-body-md text-light-on-surface-variant mb-4">Hesabına mutfak yetkisi tanımlanmamış.</p><a class="underline text-light-primary" href="anasayfa.html">Uygulamaya dön</a></div>';
        return null;
      }
      let kid = ctx.profile.kitchen_id;
      if (!kid) { const ks = await q(sb.from('kitchens').select('*').order('id').limit(1)); kid = ks[0] && ks[0].id; }
      const sel = localStorage.getItem('es_kitchen');
      if (ctx.profile.role === 'admin' && sel) kid = Number(sel);
      ctx.kitchen = await q(sb.from('kitchens').select('*').eq('id', kid).single());
      return ctx;
    }
    if (ctx.profile.district_id) {
      ctx.district = await q(sb.from('districts').select('*, cities(name)').eq('id', ctx.profile.district_id).single());
      if (ctx.district.kitchen_id) ctx.kitchen = await q(sb.from('kitchens').select('*').eq('id', ctx.district.kitchen_id).single());
    }
    return ctx;
  }
  async function signOut() { await sb.auth.signOut(); location.href = 'index.html'; }

  /* ---------- sepet (tarayıcı oturumu) ---------- */
  const Cart = {
    get() { try { return JSON.parse(sessionStorage.getItem('es_cart')) || { meal: 'ogle', items: {}, editing: null }; } catch (e) { return { meal: 'ogle', items: {}, editing: null }; } },
    set(c) { try { sessionStorage.setItem('es_cart', JSON.stringify(c)); } catch (e) { /* yok say */ } },
    clear() { try { sessionStorage.removeItem('es_cart'); } catch (e) { /* yok say */ } },
    count(c) { c = c || this.get(); return Object.values(c.items).reduce((a, i) => a + i.q, 0); },
    total(c) { c = c || this.get(); return Object.values(c.items).reduce((a, i) => a + i.q * i.p, 0); },
    setQty(dish, qty) { const c = this.get(); if (qty <= 0) delete c.items[dish.id]; else c.items[dish.id] = { q: Math.min(qty, 20), p: Number(dish.price), n: dish.name }; this.set(c); return c; },
  };

  /* ---------- görsel parçalar ---------- */
  function dishImg(d, cls) {
    const url = d.image_url || (window.ES_IMG || {})[d.name];
    if (url) return '<img src="' + esc(url) + '" alt="' + esc(d.name) + '" class="' + cls + '" loading="lazy">';
    return '<div class="' + cls + ' bg-light-primary-container text-light-on-primary-container flex items-center justify-center"><span class="material-symbols-outlined text-[28px]">restaurant</span></div>';
  }
  function appHeader(label, title, right) {
    return '<header class="sticky top-0 z-20 bg-light-surface border-b border-light-outline-variant px-page-margin py-3 flex items-center justify-between gap-gutter-sm">' +
      '<div class="flex items-center gap-gutter-sm min-w-0"><div class="w-9 h-9 rounded-md bg-light-primary text-light-on-primary flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[20px]">location_on</span></div>' +
      '<div class="min-w-0"><span class="block font-body text-label-sm text-light-on-surface-variant">' + esc(label) + '</span><span class="block font-body text-title-md text-light-on-surface truncate">' + esc(title) + '</span></div></div>' + (right || '') + '</header>';
  }
  function cartPill() {
    return '<a href="odeme.html" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-light-surface-container-lowest border border-light-outline-variant text-light-on-surface"><span class="material-symbols-outlined text-[18px] text-light-primary">shopping_bag</span><span data-cart-count class="font-body text-label-md tabular-nums">' + Cart.count() + '</span></a>';
  }
  function refreshCartPill() { document.querySelectorAll('[data-cart-count]').forEach((e) => { e.textContent = Cart.count(); }); }
  function tabbar(active) {
    const tabs = [['anasayfa', 'anasayfa.html', 'home', 'Ana Sayfa'], ['menu', 'menu.html', 'restaurant_menu', 'Menü'], ['siparis', 'siparis.html', 'receipt_long', 'Siparişlerim'], ['uyelik', 'uyelik.html', 'card_membership', 'Üyelik'], ['profil', 'profil.html', 'person', 'Profil']];
    return '<nav aria-label="Alt menü" class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-30 bg-light-surface-container-lowest border-t border-light-outline-variant px-2 py-2 grid grid-cols-5">' +
      tabs.map((t) => { const on = t[0] === active; return '<a href="' + t[1] + '"' + (on ? ' aria-current="page"' : '') + ' class="flex flex-col items-center justify-center gap-0.5 min-h-[48px] ' + (on ? 'text-light-primary' : 'text-light-on-surface-variant') + '"><span class="material-symbols-outlined text-[22px]"' + (on ? ' style="font-variation-settings:\'FILL\' 1;"' : '') + '>' + t[2] + '</span><span class="font-body text-label-sm">' + t[3] + '</span></a>'; }).join('') + '</nav>';
  }
  function noKitchenBanner() {
    const d = ctx.district;
    return '<div class="m-4 p-4 rounded-lg bg-warning-container text-on-warning-container font-body text-body-md">' +
      (d ? '<b>' + esc(d.name) + '</b> ilçesinde henüz hizmet vermiyoruz. Yakında geliyoruz!' : 'Teslimat bölgen seçilmemiş.') +
      ' <a class="underline" href="profil.html">Profilden bölgeni değiştir</a></div>';
  }
  function startCountdown(timerEl, barEl) {
    function tick() {
      const s = secondsToMidnight();
      if (timerEl) timerEl.textContent = hms(s);
      if (barEl) barEl.style.width = Math.max(2, Math.round(100 * (1 - s / 86400))) + '%';
    }
    tick(); return setInterval(tick, 1000);
  }

  /* ---------- sipariş durumu ---------- */
  function orderStages(o) {
    const pickup = o.method === 'pickup';
    const labels = ['Sipariş alındı', 'Planlama', 'Hazırlanıyor', pickup ? 'Hazır (Gel Al)' : 'Yolda', pickup ? 'Teslim alındı' : 'Teslim edildi'];
    const today = todayISO();
    let done, cur;
    if (o.status === 'delivered') { done = 5; cur = -1; }
    else if (o.status === 'ready' || o.status === 'on_the_way') { done = 3; cur = 3; }
    else if (o.status === 'preparing') { done = 2; cur = 2; }
    else if (o.target_date <= today) { done = 2; cur = 2; }
    else { done = 1; cur = 1; }
    return labels.map((l, i) => ({ label: l, state: i < done ? 'done' : i === cur ? 'current' : 'pending' }));
  }
  const canEdit = (o) => o.status === 'placed' && o.source === 'single' && o.target_date > todayISO();

  /* ---------- mutfak kabuğu ---------- */
  const KNAV = [['sabah', 'mutfak-sabah.html', 'wb_sunny', 'Sabah Özeti'], ['uretim', 'mutfak-uretim.html', 'skillet', 'Üretim Planı'], ['teslimat', 'mutfak-teslimat.html', 'local_shipping', 'Teslimat'], ['menu', 'mutfak-menu.html', 'restaurant_menu', 'Menü Yönetimi'], ['rapor', 'mutfak-rapor.html', 'bar_chart', 'Raporlar']];
  function kitchenDate() { const p = new URLSearchParams(location.search).get('d'); return /^\d{4}-\d{2}-\d{2}$/.test(p || '') ? p : todayISO(); }
  function mountKitchen(active, title, subtitle, actionsHtml) {
    const k = ctx.kitchen;
    const d = kitchenDate(); const t = todayISO();
    const badge = d === t ? ['bg-success-container text-on-success-container', 'Sipariş Alımı Kapalı (Planlama Modu)'] : d > t ? ['bg-light-secondary-container text-light-on-secondary-container', d === tomorrowISO() ? 'Sipariş alımı açık · 00:00\'da kapanır' : 'Gelecek tarih'] : ['bg-light-surface-container-high text-light-on-surface-variant', 'Geçmiş gün'];
    document.body.innerHTML =
      '<div class="min-h-[1024px] flex bg-light-surface"><aside class="w-64 shrink-0 bg-light-surface-container-lowest border-r border-light-outline-variant p-gutter-xl flex flex-col justify-between"><div class="flex flex-col gap-gutter-xl">' +
      '<div class="flex items-center gap-gutter-md"><div class="w-11 h-11 rounded-md bg-light-primary text-light-on-primary flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[24px]" style="font-variation-settings:\'FILL\' 1;">soup_kitchen</span></div><div><span class="block font-headline text-title-lg text-light-on-surface leading-tight">Evin Sofrası</span><span class="block font-body text-body-sm text-light-on-surface-variant">Mutfak Paneli</span></div></div>' +
      '<nav class="flex flex-col gap-gutter-xs">' + KNAV.map((n) => '<a href="' + n[1] + '?d=' + d + '"' + (n[0] === active ? ' aria-current="page"' : '') + ' class="flex items-center gap-gutter-md min-h-[48px] px-4 rounded-md ' + (n[0] === active ? 'bg-light-primary text-light-on-primary' : 'text-light-on-surface-variant hover:bg-light-surface-container-low') + '"><span class="material-symbols-outlined text-[20px]">' + n[2] + '</span><span class="font-body text-label-lg">' + n[3] + '</span></a>').join('') + '</nav></div>' +
      '<div class="flex flex-col gap-gutter-sm"><div class="p-gutter-md rounded-md bg-light-surface-container-low border border-light-outline-variant"><span class="block font-body text-label-sm text-light-on-surface-variant">Aktif Mutfak</span><span class="block font-body text-title-md text-light-on-surface">' + esc(k.name) + '</span><span class="block font-body text-body-sm text-light-on-surface-variant">Şef: ' + esc(k.chef || '-') + '</span></div>' +
      '<a href="anasayfa.html" class="text-center font-body text-label-md text-light-primary underline">Müşteri uygulaması</a><button id="k-logout" class="font-body text-label-md text-light-on-surface-variant underline">Çıkış yap</button></div></aside>' +
      '<div class="flex-1 min-w-0 flex flex-col"><header class="bg-light-surface-container-lowest border-b border-light-outline-variant px-dashboard-margin py-4 flex items-center justify-between gap-gutter-lg"><div><h1 class="font-headline text-headline-md text-light-on-surface">' + esc(title) + '</h1><p class="font-body text-body-md text-light-on-surface-variant tabular-nums">' + esc(subtitle || '') + '</p></div>' +
      '<div class="flex items-center gap-gutter-md flex-wrap justify-end"><span class="px-3.5 py-1.5 rounded-full ' + badge[0] + ' font-body text-label-md">' + badge[1] + '</span>' +
      '<div class="flex items-center gap-1"><button id="k-prev" class="w-10 h-10 rounded-full border border-light-outline-variant bg-light-surface-container-lowest" aria-label="Önceki gün"><span class="material-symbols-outlined text-[18px]">chevron_left</span></button><input id="k-date" type="date" value="' + d + '" class="min-h-[40px] px-3 rounded-md bg-light-surface-container-low border border-light-outline-variant font-body text-body-md"><button id="k-next" class="w-10 h-10 rounded-full border border-light-outline-variant bg-light-surface-container-lowest" aria-label="Sonraki gün"><span class="material-symbols-outlined text-[18px]">chevron_right</span></button></div>' +
      (actionsHtml || '') + '</div></header><main id="content" class="flex-1 p-dashboard-margin flex flex-col gap-gutter-xl"></main></div></div>';
    const go = (v) => { location.search = '?d=' + v; };
    document.getElementById('k-date').addEventListener('change', (e) => e.target.value && go(e.target.value));
    document.getElementById('k-prev').addEventListener('click', () => go(addDays(d, -1)));
    document.getElementById('k-next').addEventListener('click', () => go(addDays(d, 1)));
    document.getElementById('k-logout').addEventListener('click', signOut);
    return document.getElementById('content');
  }

  const DIET = { standart: 'Standart', vegan: 'Vegan', vejetaryen: 'Vejetaryen', protein: 'Protein Ağırlıklı', sporcu: 'Sporcu', hafif: 'Hafif / Diyet', glutensiz: 'Glutensiz' };
  return { DIET, sb, ctx, init, signOut, q, toast, fail, busy, esc, money, hm, nowHM, trDate, todayISO, tomorrowISO, addDays, dowOf, DOW, MONTHS, MEAL, CAT, CAT_ORDER, Cart, dishImg, appHeader, cartPill, refreshCartPill, tabbar, noKitchenBanner, startCountdown, orderStages, canEdit, kitchenDate, mountKitchen, secondsToMidnight, hms };
})();
