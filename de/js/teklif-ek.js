/* EGEN teklif formu ekleri: talep özetinin altına iletişim bilgileri + KVKK + Gönder; ön seçimli açılış. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);

  function ozetMetni(kok) {
    const satir = [];
    const kat = ($('active-category').textContent || '').replace(/^›\s*/, '').trim();
    if (kat) satir.push('Kategorie: ' + kat);
    const sonuc = kok.querySelector('.result strong');
    if (sonuc) satir.push('Empfohlene Produktgruppe: ' + sonuc.textContent.trim());
    kok.querySelectorAll('dl > div').forEach(r => {
      const k = r.querySelector('dt'), v = r.querySelector('dd');
      if (k && v) satir.push(k.textContent.trim() + ': ' + v.textContent.trim());
    });
    return satir.join('\n');
  }

  function iletisimBlogu(kok, tur) {
    if (kok.querySelector('.tf-iletisim')) return;
    // "Anfrageübersicht kopieren" artık ikincil işlem
    kok.querySelectorAll('.actions .button.primary').forEach(b => b.classList.remove('primary'));
    const f = document.createElement('form');
    f.className = 'tf-iletisim'; f.noValidate = false;
    f.innerHTML = `
      <h3>Ihre Kontaktdaten</h3><p class="hint">Teilen Sie uns Ihre Daten mit, damit wir Ihre Anfrage prüfen und uns bei Ihnen melden können.</p>
      <div class="fields">
        <label>Ad soyad <span class="req">*</span><input name="ad" required maxlength="120" autocomplete="name"></label>
        <label>Firma <span class="req">*</span><input name="firma" required maxlength="160" autocomplete="organization"></label>
        <label>E-posta <span class="req">*</span><input name="eposta" type="email" required maxlength="160" autocomplete="email"></label>
        <label>Telefon <span class="req">*</span><input name="telefon" type="tel" required maxlength="40" autocomplete="tel" placeholder="+90"></label>
        <label>Stadt / Land <small>(optional)</small><input name="sehir" maxlength="120" autocomplete="address-level2"></label>
        <label>Erwartete Lieferzeit <small>(optional)</small><input name="termin" maxlength="120" placeholder="Z. B. innerhalb von 2 Wochen"></label>
        <label class="full">Ihre Ergänzungen <small>(optional)</small><textarea name="not" maxlength="2000" rows="3"></textarea></label>
      </div>
      <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <label class="consent"><input type="checkbox" name="kvkk" value="evet" required><span>Ich stimme der Verarbeitung meiner Daten durch Egen Barkod zur Beantwortung dieser Anfrage zu (<a href="kvkk-aydinlatma-metni.html" target="_blank" rel="noopener">KVKK-Informationstext</a>). <span class="req">*</span></span></label>
      <div class="actions"><button type="submit" class="button primary">Angebotsanfrage senden</button></div>
      <p class="tf-durum" role="status"></p>`;
    kok.appendChild(f);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      if (!f.reportValidity()) return;
      const btn = f.querySelector('button[type=submit]'), durum = f.querySelector('.tf-durum');
      btn.disabled = true; btn.textContent = 'Wird gesendet…'; durum.textContent = ''; durum.className = 'tf-durum';
      const fd = new FormData(f);
      fd.set('talep_ozeti', ozetMetni(kok));
      fd.set('akis', tur);
      try {
        const r = await window.egenGonder(fd, 'teklif');
        basari(r.no);
      } catch (err) {
        durum.className = 'tf-durum err';
        durum.textContent = 'Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie an info@egen.com.tr.';
        btn.disabled = false; btn.textContent = 'Angebotsanfrage senden';
      }
    });
  }

  function basari(no) {
    ['entry', 'categories', 'category-flow', 'quick-view', 'flow-bar'].forEach(id => { const n = $(id); if (n) n.hidden = true; });
    const box = document.createElement('section');
    box.className = 'panel ok-box'; box.tabIndex = -1; box.setAttribute('role', 'status');
    box.innerHTML = `<h2>Vielen Dank, Ihre Angebotsanfrage ist eingegangen.</h2>
      <p>Ihre Anfragenummer: <span class="tf-no"></span></p>
      <p>Unser Team prüft Ihre Anfrage und meldet sich schnellstmöglich bei Ihnen. Für dringende Fälle <a href="tel:+902126591515">+90 212 659 15 15</a> erreichen Sie uns telefonisch.</p>
      <div class="actions"><a class="button" href="index-a.html">Zurück zur Startseite</a><button type="button" class="button primary" id="tf-yeni">Neue Anfrage erstellen</button></div>`;
    box.querySelector('.tf-no').textContent = no;
    $('entry').parentNode.insertBefore(box, $('entry'));
    box.querySelector('#tf-yeni').onclick = () => location.href = location.pathname;
    box.focus(); box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Kategori akışı: "Anfrageübersicht" adımı açılınca iletişim bloğunu ekle
  const panel = $('panel');
  new MutationObserver(() => {
    const h = panel.querySelector('#step-title');
    if (h && h.textContent.trim() === 'Anfrageübersicht') iletisimBlogu(panel, 'kategori');
  }).observe(panel, { childList: true });

  // "Ich kenne mein Produkt": önizleme gösterilince
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
