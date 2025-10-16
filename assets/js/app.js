// === Resilienz-Sonne: Interaktion ===
(function(){
  const buttons = Array.from(document.querySelectorAll('.ray'));
  const titleEl = document.getElementById('story-title');
  const textEl  = document.getElementById('story-text');
  const imgEl   = document.getElementById('story-image'); // NEU: Bild im Panel

  if (!buttons.length || !titleEl || !textEl) return;

  // Winkel der 8 Strahlen gleichmäßig über den Halbkreis verteilt (ohne 90° / -90°)
  const angles = [-75, -55, -35, -15, 15, 35, 55, 75];
  const fallbacks = [
    '../assets/img/portraits/portrait-babette-familie1.JPG',
    '../assets/img/portraits/portrait-babette-familie2.jpg',
    '../assets/img/portraits/portrait-babette-venedig.jpg',
    '../assets/img/portraits/portrait-babette-strand.jpg',
    '../assets/img/portraits/portrait-babette-strand-jacke.JPG',
    '../assets/img/portraits/portrait-babette-familie3.JPG',
    '../assets/img/natur/natur-schaukel-skulptur.JPG'
  ];

  buttons.forEach((btn, i) => {
    // Setze pro Strahl den Winkel (steuert Linie + Gegenrotation des Fotos)
    const ang = angles[i % angles.length];
    btn.style.setProperty('--angle', ang + 'deg');
    // Inline-Transform überschreibt ältere CSS-Regeln (nth-child)
    btn.style.transform = `translateY(-50%) rotate(${ang}deg)`;

    // Falls bereitgestellte storyX-Bilder fehlen, auf vorhandene Bilder zurückfallen
    const img = btn.querySelector('img');
    if (img) {
      const ensureFallback = () => {
        const fb = fallbacks[i % fallbacks.length];
        if (!img.src.endsWith(fb)) img.src = fb;
      };
      // Falls der Fehler bereits passiert ist, sofort ersetzen
      if (img.complete && img.naturalWidth === 0) {
        ensureFallback();
      } else {
        img.addEventListener('error', ensureFallback, { once: true });
      }
    }
  });

  // ARIA-Setup
  buttons.forEach(btn => {
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-pressed', 'false');
  });

  function activate(btn){
    // Titel + Text aus data-Attributen holen
    const t = btn.getAttribute('data-title') || 'Geschichte';
    const x = btn.getAttribute('data-text')  || '';

    titleEl.textContent = t;
    textEl.textContent  = x;

    // Auswahlzustand pflegen
    buttons.forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
    // NEU: Bild oberhalb des Textes anzeigen
const srcImg = btn.querySelector('img');
if (imgEl && srcImg) {
  imgEl.src = srcImg.currentSrc || srcImg.src;
  imgEl.alt = srcImg.alt || t;
  imgEl.removeAttribute('hidden');
}
  }

  // Klick + Enter/Space
  buttons.forEach(btn => {
    btn.addEventListener('click', () => activate(btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate(btn);
      }
    });
  });

  // Optional: Erste Story vorwählen
  // activate(buttons[0]);
})();
// === Kontaktformular: nur auf /pages/kontakt.html aktiv ===
document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('contactForm');
  if (!form) return; // nur auf kontakt.html

  const submitBtn = document.getElementById('submitBtn');
  const consent   = document.getElementById('consent');
  const ty        = document.getElementById('thankyou');
  const errBox    = document.getElementById('errorbox');
  const ENDPOINT = 'https://httpbin.org/post';

  // Pflichtfelder
  const requiredFields = [
    document.getElementById('name'),
    document.getElementById('email'),
    document.getElementById('phone'),
    document.getElementById('message')
  ];

  // Button nur aktiv, wenn alle Felder Text haben UND Datenschutz angehakt ist
  function validateForm() {
    const allFilled = requiredFields.every(f => f && f.value.trim() !== '');
    const ok = allFilled && consent && consent.checked;

    if (submitBtn) {
      submitBtn.disabled = !ok;
      submitBtn.style.opacity = ok ? '1' : '.6';
      submitBtn.style.cursor  = ok ? 'pointer' : 'not-allowed';
    }
  }

  // Initial prüfen & Listener setzen
  validateForm();
  requiredFields.forEach(f => f.addEventListener('input', validateForm));
  if (consent) consent.addEventListener('change', validateForm);

  // Senden
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // doppelte Absicherung
    const allFilled = requiredFields.every(f => f && f.value.trim() !== '');
    if (!allFilled || !consent.checked) {
      alert('Bitte füllen Sie alle Pflichtfelder aus und bestätigen Sie die Datenschutzhinweise.');
      validateForm();
      return;
    }

    if (errBox) errBox.hidden = true;
    if (ty) ty.hidden = true;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Senden …';

    try {
      const fd = new FormData(form);
      const body = new URLSearchParams(fd).toString();

      const resp = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body
      });

      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.ok) {
        form.hidden = true;
        if (ty) ty.hidden = false;
      } else {
        throw new Error(data.error || 'Unbekannter Fehler');
      }
    } catch (err) {
      console.error(err);
      if (errBox) errBox.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Nachricht senden';
      validateForm();
    }
  });
});
