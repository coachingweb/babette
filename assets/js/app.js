// === Resilienz-Sonne: Interaktion ===
(function(){
  const buttons = Array.from(document.querySelectorAll('.ray'));
  const titleEl = document.getElementById('story-title');
  const textEl  = document.getElementById('story-text');
  const imgEl   = document.getElementById('story-image'); // NEU: Bild im Panel

  if (!buttons.length || !titleEl || !textEl) return;

  // Winkel der 7 Strahlen gleichmäßig über den Halbkreis verteilen
  const angles = [-76, -51, -26, 0, 26, 51, 76];
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
