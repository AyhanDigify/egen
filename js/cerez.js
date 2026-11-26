/* Gizlilik Tercihi Merkezi (firma metni: "EGEN SİTE DÜZENLEME 26.11.2026")
 * Zorunlu çerezler her zaman açık; Fonksiyonel / Performans / Pazarlama yalnızca onayla.
 * Tercih: localStorage + çerez "egen_cerez" (12 ay). Google Consent Mode v2 ile uyumlu (gtag varsa günceller).
 * Analiz/reklam etiketleri eklenecekse: <script type="text/plain" data-cerez="performans|pazarlama|fonksiyonel" ...> → onay gelince çalıştırılır.
 */
(function () {
  'use strict';
  const ANAHTAR = 'egen_cerez', SURE = 365, KAT = ['fonksiyonel', 'performans', 'pazarlama'];
  const METIN = {
    baslik: 'Gizlilik Tercihi Merkezi',
    giris: 'Bu internet sitesinde kullanılan çerezlerin amaçları, kategorileri ve süreleri hakkında bilgi için Çerez Aydınlatma Metni bölümünü inceleyebilirsiniz. İsteğe bağlı çerezleri kabul edebilir, reddedebilir veya tercihlerinizi yönetebilirsiniz.',
    zorunlu: 'Belli çerezlerin kullanımı sitemizin doğru biçimde çalışması için zorunludur. Örneğin, sitemizde oturum açtığınızda devreye giren kimlik doğrulama çerezleri, sitemizde bir sayfadan diğerine geçişinizde açık olan oturumunuzun geçiş yaptığınız sayfada devam etmesini sağlamaktadır.',
    fonksiyonel: 'Bu çerezler web sitesinin daha zengin işlevsellik ve kişiselleştirme sunmasına olanak sağlar. Bunlar firmamız veya sayfamıza hizmetlerini eklediğimiz üçüncü taraf tedarikçiler tarafından yerleştirilebilir. Bu çerezler size sitemizde önceki ziyaret ve seçimlerinize dayanarak daha kişisel bir deneyim sunmayı amaçlar. Bu çerezlere izin vermediğiniz takdirde bazı hizmetler, hatta hiçbir hizmet düzgün çalışmayabilir.',
    performans: 'Bu çerezler sayesinde sitemizi kullanımınızı ve sitemizin performansını analiz ederek sizlere verdiğimiz hizmetleri daha iyi hale getirmemizi sağlamaktadır.',
    pazarlama: 'Bu çerezler reklam partnerlerimiz tarafından sitemiz üzerinden yerleştirilebilir. Bunlar söz konusu şirketler tarafından ilgi alanlarınızın bir profilini oluşturmak ve size diğer sitelerdeki ilgili reklamları göstermek amacıyla kullanılabilir ve paylaşılabilir. Bu işlem, tarayıcınızı ve internet cihazınızı benzersiz biçimde tanımlamaya dayalıdır. Bu çerezlere izin vermediğiniz takdirde, hedefli reklamları daha az görebileceksiniz.'
  };
  const AD = { fonksiyonel: 'Fonksiyonel', performans: 'Performans', pazarlama: 'Pazarlama' };

  function oku() {
    try { const v = JSON.parse(localStorage.getItem(ANAHTAR) || 'null'); if (v && v.t && Date.now() - v.t < SURE * 864e5) return v; } catch (e) {}
    const m = document.cookie.match(/(?:^|; )egen_cerez=([^;]+)/);
    if (m) { try { return JSON.parse(decodeURIComponent(m[1])); } catch (e) {} }
    return null;
  }
  function yaz(secim) {
    const v = { t: Date.now(), ...secim };
    try { localStorage.setItem(ANAHTAR, JSON.stringify(v)); } catch (e) {}
    document.cookie = 'egen_cerez=' + encodeURIComponent(JSON.stringify(v)) + ';max-age=' + SURE * 86400 + ';path=/;SameSite=Lax';
    uygula(v);
  }
  function uygula(v) {
    window.egenCerez = v;
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: v.performans ? 'granted' : 'denied',
        ad_storage: v.pazarlama ? 'granted' : 'denied', ad_user_data: v.pazarlama ? 'granted' : 'denied', ad_personalization: v.pazarlama ? 'granted' : 'denied',
        functionality_storage: v.fonksiyonel ? 'granted' : 'denied', personalization_storage: v.fonksiyonel ? 'granted' : 'denied'
      });
    }
    document.querySelectorAll('script[type="text/plain"][data-cerez]').forEach(s => {
      if (!v[s.dataset.cerez] || s.dataset.calisti) return;
      const n = document.createElement('script');
      for (const a of s.attributes) if (a.name !== 'type' && a.name !== 'data-cerez') n.setAttribute(a.name, a.value);
      n.text = s.text; s.dataset.calisti = '1'; s.after(n);
    });
    document.dispatchEvent(new CustomEvent('egen:cerez', { detail: v }));
  }

  let kok;
  function arayuz() {
    if (kok) return kok;
    kok = document.createElement('div');
    kok.className = 'cz'; kok.setAttribute('role', 'dialog'); kok.setAttribute('aria-modal', 'false'); kok.setAttribute('aria-labelledby', 'cz-b');
    kok.innerHTML = `
      <div class="cz-kutu">
        <div class="cz-ust"><h2 id="cz-b">${METIN.baslik}</h2></div>
        <p class="cz-giris">${METIN.giris}</p>
        <div class="cz-panel" hidden>
          <div class="cz-kat"><div class="cz-kb"><b>Zorunlu</b><span class="cz-her">Her zaman etkin</span></div><p>${METIN.zorunlu}</p></div>
          ${KAT.map(k => `<div class="cz-kat"><div class="cz-kb"><b>${AD[k]}</b><label class="cz-sw"><input type="checkbox" data-k="${k}"><span aria-hidden="true"></span><em class="sr-only">${AD[k]} çerezleri</em></label></div><p>${METIN[k]}</p></div>`).join('')}
        </div>
        <div class="cz-btns">
          <a class="cz-l" href="cerez-politikasi.html">Aydınlatma Metni</a>
          <button type="button" class="cz-b cz-yonet">Çerez Tercihlerimi Yönet</button>
          <button type="button" class="cz-b cz-kaydet" hidden>Tercihlerimi Kaydet</button>
          <button type="button" class="cz-b cz-red">İsteğe Bağlı Çerezleri Reddet</button>
          <button type="button" class="cz-b cz-ok">İsteğe Bağlı Çerezleri Kabul Et</button>
        </div>
      </div>`;
    document.body.appendChild(kok);
    const panel = kok.querySelector('.cz-panel');
    kok.querySelector('.cz-yonet').onclick = () => {
      const v = oku() || {};
      kok.querySelectorAll('input[data-k]').forEach(i => i.checked = !!v[i.dataset.k]);
      panel.hidden = false; kok.classList.add('cz-acik');
      kok.querySelector('.cz-yonet').hidden = true; kok.querySelector('.cz-kaydet').hidden = false;
    };
    kok.querySelector('.cz-kaydet').onclick = () => { const s = {}; kok.querySelectorAll('input[data-k]').forEach(i => s[i.dataset.k] = i.checked); yaz(s); kapat(); };
    kok.querySelector('.cz-red').onclick = () => { yaz({ fonksiyonel: false, performans: false, pazarlama: false }); kapat(); };
    kok.querySelector('.cz-ok').onclick = () => { yaz({ fonksiyonel: true, performans: true, pazarlama: true }); kapat(); };
    return kok;
  }
  function ac(yonet) {
    const k = arayuz(); k.hidden = false; k.classList.remove('cz-acik');
    k.querySelector('.cz-panel').hidden = true; k.querySelector('.cz-yonet').hidden = false; k.querySelector('.cz-kaydet').hidden = true;
    if (yonet) k.querySelector('.cz-yonet').click();
    setTimeout(() => k.querySelector(yonet ? 'input[data-k]' : '.cz-ok').focus(), 50);
  }
  function kapat() { if (kok) kok.hidden = true; }
  window.egenCerezAc = () => ac(true);

  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', e => { const a = e.target.closest('[data-cerez-ac]'); if (a) { e.preventDefault(); ac(true); } });
    const v = oku();
    if (v) uygula(v); else ac(false);
  });
})();
