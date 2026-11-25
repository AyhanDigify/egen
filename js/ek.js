/* EGEN — sağ alt iletişim düğmesi (WhatsApp · telefon · e-posta · konum) */
document.addEventListener('DOMContentLoaded', () => {
  const d = document.getElementById('cdial');
  if (!d) return;
  const b = d.querySelector('.cdial-btn'), l = document.getElementById('cdial-list');
  const ac = v => { d.classList.toggle('open', v); l.hidden = !v; b.setAttribute('aria-expanded', v); b.setAttribute('aria-label', v ? 'Kapat' : 'Bize ulaşın'); };
  b.addEventListener('click', () => ac(l.hidden));
  document.addEventListener('click', e => { if (!d.contains(e.target)) ac(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') ac(false); });
});
