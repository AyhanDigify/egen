/* EGEN teklif formu ekleri: talep özetinin altına iletişim bilgileri + KVKK + Gönder; ön seçimli açılış. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);

  function ozetMetni(kok) {
    const satir = [];
    const kat = ($('active-category').textContent || '').replace(/^›\s*/, '').trim();
    if (kat) satir.push('Category: ' + kat);
    const sonuc = kok.querySelector('.result strong');
    if (sonuc) satir.push('Recommended product group: ' + sonuc.textContent.trim());
    kok.querySelectorAll('dl > div').forEach(r => {
      const k = r.querySelector('dt'), v = r.querySelector('dd');
      if (k && v) satir.push(k.textContent.trim() + ': ' + v.textContent.trim());
    });
    return satir.join('\n');
  }

  function iletisimBlogu(kok, tur) {
    if (kok.querySelector('.tf-iletisim')) return;
    // "Copy request summary" artık ikincil işlem
    kok.querySelectorAll('.actions .button.primary').forEach(b => b.classList.remove('primary'));
    const f = document.createElement('form');
    f.className = 'tf-iletisim'; f.noValidate = false;
    f.innerHTML = `
      <h3>Your contact details</h3><p class="hint">Share your details so that we can assess your request and get back to you.</p>
      <div class="fields">
        <label>Ad soyad <span class="req">*</span><input name="ad" required maxlength="120" autocomplete="name"></label>
        <label>Company <span class="req">*</span><input name="firma" required maxlength="160" autocomplete="organization"></label>
        <label>E-posta <span class="req">*</span><input name="eposta" type="email" required maxlength="160" autocomplete="email"></label>
        <label>Telefon <span class="req">*</span><input name="telefon" type="tel" required maxlength="40" autocomplete="tel" placeholder="+90"></label>
        <label>City / country <small>(optional)</small><input name="sehir" maxlength="120" autocomplete="address-level2"></label>
        <label>Expected delivery <small>(optional)</small><input name="termin" maxlength="120" placeholder="E.g. within 2 weeks"></label>
        <label class="full">Anything you would like to add <small>(optional)</small><textarea name="not" maxlength="2000" rows="3"></textarea></label>
      </div>
      <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <label class="consent"><input type="checkbox" name="kvkk" value="evet" required><span>I consent to my information being processed by Egen Barkod for the purpose of responding to this request (<a href="kvkk-aydinlatma-metni.html" target="_blank" rel="noopener">KVKK Privacy Notice</a>). <span class="req">*</span></span></label>
      <div class="actions"><button type="submit" class="button primary">Send Quote Request</button></div>
      <p class="tf-durum" role="status"></p>`;
    kok.appendChild(f);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      if (!f.reportValidity()) return;
      const btn = f.querySelector('button[type=submit]'), durum = f.querySelector('.tf-durum');
      btn.disabled = true; btn.textContent = 'Sending…'; durum.textContent = ''; durum.className = 'tf-durum';
      const fd = new FormData(f);
      fd.set('talep_ozeti', ozetMetni(kok));
      fd.set('akis', tur);
      try {
        const r = await window.egenGonder(fd, 'teklif');
        basari(r.no);
      } catch (err) {
        durum.className = 'tf-durum err';
        durum.textContent = 'Your request could not be sent. Please try again or write to info@egen.com.tr.';
        btn.disabled = false; btn.textContent = 'Send Quote Request';
      }
    });
  }

  function basari(no) {
    ['entry', 'categories', 'category-flow', 'quick-view', 'flow-bar'].forEach(id => { const n = $(id); if (n) n.hidden = true; });
    const box = document.createElement('section');
    box.className = 'panel ok-box'; box.tabIndex = -1; box.setAttribute('role', 'status');
    box.innerHTML = `<h2>Thank you, your quotation request has been received.</h2>
      <p>Your request number: <span class="tf-no"></span></p>
      <p>Our team will review your request and contact you as soon as possible. For urgent matters <a href="tel:+902126591515">+90 212 659 15 15</a> You can reach us by telephone on</p>
      <div class="actions"><a class="button" href="index-a.html">Back to home page</a><button type="button" class="button primary" id="tf-yeni">Create a new request</button></div>`;
    box.querySelector('.tf-no').textContent = no;
    $('entry').parentNode.insertBefore(box, $('entry'));
    box.querySelector('#tf-yeni').onclick = () => location.href = location.pathname;
    box.focus(); box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Kategori akışı: "Request Summary" adımı açılınca iletişim bloğunu ekle
  const panel = $('panel');
  new MutationObserver(() => {
    const h = panel.querySelector('#step-title');
    if (h && h.textContent.trim() === 'Request Summary') iletisimBlogu(panel, 'kategori');
  }).observe(panel, { childList: true });

  // "I know my product": önizleme gösterilince
  const qr = $('quick-result');
  new MutationObserver(() => { if (!qr.hidden) iletisimBlogu(qr, 'urunu-biliyorum'); })
    .observe(qr, { attributes: true, attributeFilter: ['hidden'] });

  // Ön seçimli açılış: ?urun=…  ?kategori=…  #bilinen  #yardim
  const q = new URLSearchParams(location.search);
  const kat = q.get('kategori'), urun = q.get('urun');
  if (urun) {
    $('known-button').click();
    const qf = $('quick-form');
    qf.elements.product.value = urun.slice(0, 240);
    qf.elements.quantity.focus();
  } else if (kat && typeof categoryList !== 'undefined' && categoryList.some(c => c.id === kat)) {
    openCategory(categoryList.find(c => c.id === kat));
  } else if (location.hash === '#bilinen') {
    $('known-button').click();
  } else if (location.hash === '#yardim') {
    $('help-button').click();
  }
})();
