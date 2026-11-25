/* EGEN — ortak form gönderimi (teklif, iletişim, kariyer)
 * CANLIYA ALIRKEN: EGEN_FORM.endpoint'e sunucu adresini yazın (ör. '/form.php').
 * Sunucu multipart/form-data alır, e-postayı gönderir ve {ok:true} döndürür.
 * Endpoint boşken (demo) gönderim simüle edilir: talep tarayıcıda saklanır, kullanıcı başarı ekranını görür.
 */
window.EGEN_FORM = window.EGEN_FORM || { endpoint: '', alici: 'info@egen.com.tr' };

window.egenTalepNo = function () {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return 'EGN-' + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
};

/* fd: FormData · tür: 'teklif' | 'iletisim' | 'kariyer' */
window.egenGonder = async function (fd, tur) {
  const no = window.egenTalepNo();
  fd.set('form_turu', tur);
  fd.set('talep_no', no);
  fd.set('sayfa', location.pathname.split('/').pop() || 'index.html');
  fd.set('kaynak', document.referrer || '');
  fd.set('tarih', new Date().toISOString());
  if (fd.get('website')) return { ok: true, no };            // bal küpü dolu → bot; sessizce geç
  const ep = window.EGEN_FORM.endpoint;
  if (ep) {
    const r = await fetch(ep, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
    let j = {}; try { j = await r.json(); } catch (e) {}
    if (!r.ok || j.ok === false) throw new Error(j.hata || 'Gönderim başarısız');
    return { ok: true, no: j.no || no };
  }
  // demo: sunucu yok → kaydı tarayıcıda tut (test için), başarı döndür
  const kayit = {};
  for (const [k, v] of fd.entries()) kayit[k] = v instanceof File ? (v.name ? v.name + ' (' + Math.round(v.size / 1024) + ' KB)' : '') : v;
  try { const a = JSON.parse(localStorage.getItem('egen_talepler') || '[]'); a.push(kayit); localStorage.setItem('egen_talepler', JSON.stringify(a.slice(-50))); } catch (e) {}
  console.info('[EGEN form · demo] gönderilecek veri:', kayit);
  await new Promise(r => setTimeout(r, 500));
  return { ok: true, no, demo: true };
};

/* data-egen-form="iletisim|kariyer" olan formları bağla */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-egen-form]').forEach(form => {
    const st = form.querySelector('[data-form-status]');
    const btn = form.querySelector('button[type=submit]');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const cv = form.querySelector('input[type=file]');
      if (cv && cv.files[0] && cv.files[0].size > 10 * 1024 * 1024) { cv.setCustomValidity('Dosya en fazla 10 MB olabilir.'); }
      else if (cv) cv.setCustomValidity('');
      if (!form.reportValidity()) return;
      btn.disabled = true; const eski = btn.innerHTML; btn.textContent = 'Gönderiliyor…';
      if (st) { st.className = 'form-status'; st.textContent = ''; }
      try {
        const r = await window.egenGonder(new FormData(form), form.dataset.egenForm);
        const ok = document.createElement('div');
        ok.className = 'form-ok'; ok.setAttribute('role', 'status'); ok.tabIndex = -1;
        ok.innerHTML = '<b>Teşekkürler, talebiniz alındı.</b><span>Talep numaranız: <strong></strong></span><span>Ekibimiz en kısa sürede sizinle iletişime geçecek.</span><button type="button" class="btn btn-line btn-sm">Yeni mesaj gönder</button>';
        ok.querySelector('strong').textContent = r.no;
        ok.querySelector('button').onclick = () => { ok.remove(); form.reset(); form.hidden = false; };
        form.hidden = true; form.after(ok); ok.focus();
      } catch (err) {
        if (st) { st.className = 'form-status err'; st.textContent = 'Gönderilemedi. Lütfen tekrar deneyin veya info@egen.com.tr adresine yazın.'; }
      } finally { btn.disabled = false; btn.innerHTML = eski; }
    });
  });
});
