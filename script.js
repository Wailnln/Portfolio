/* =====================================================================
   PORTFOLIO – WAIL BENARBA
   JavaScript volontairement minimal, sans librairie. Il sert à :
     1. ouvrir / fermer le menu sur mobile ;
     2. faire apparaître les blocs au fur et à mesure du défilement ;
     3. mettre en évidence la section courante dans le menu ;
     4. copier l'adresse email en un clic.
   Si JavaScript est désactivé, le site reste entièrement lisible.
   ===================================================================== */

(() => {
  'use strict';

  // Respecte le réglage système « réduire les animations »
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ---------------------------------------------------------------
     1. MENU MOBILE
     --------------------------------------------------------------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');

  if (toggle && nav) {
    const setMenu = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', () => {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Ferme le menu après le choix d'une rubrique
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });

    // Ferme avec la touche Échap (et remet le focus sur le bouton)
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    // Ferme si on clique en dehors du menu
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.site-header')) setMenu(false);
    });

    // Réinitialise l'état si on repasse en affichage large
    window.matchMedia('(min-width: 961px)').addEventListener('change', (event) => {
      if (event.matches) setMenu(false);
    });
  }


  /* ---------------------------------------------------------------
     2. APPARITION AU SCROLL
     Tout élément portant l'attribut data-reveal apparaît une fois visible.
     --------------------------------------------------------------- */
  const revealItems = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);   // on n'anime qu'une seule fois
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    // Navigateur ancien ou mouvement réduit : tout est affiché directement
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }


  /* ---------------------------------------------------------------
     3. SECTION ACTIVE DANS LE MENU
     --------------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  const sections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === '#' + entry.target.id;
          if (isCurrent) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });   // la section qui croise le milieu de l'écran

    sections.forEach((section) => spy.observe(section));
  }


  /* ---------------------------------------------------------------
     4. COPIER L'EMAIL
     Le bouton doit porter data-copy="#id-de-l-element-a-copier".
     --------------------------------------------------------------- */
  const copyButton = document.querySelector('[data-copy]');
  const copyStatus = document.getElementById('copy-status');

  if (copyButton) {
    if (!navigator.clipboard) {
      copyButton.hidden = true;             // pas de presse-papiers : on cache le bouton
    } else {
      const defaultLabel = copyButton.textContent;

      copyButton.addEventListener('click', async () => {
        const source = document.querySelector(copyButton.dataset.copy);
        if (!source) return;

        let message;
        try {
          await navigator.clipboard.writeText(source.textContent.trim());
          message = 'Copié';
        } catch (error) {
          message = 'Copie impossible';
        }

        copyButton.textContent = message;
        if (copyStatus) copyStatus.textContent = message === 'Copié' ? 'Adresse email copiée' : message;
        setTimeout(() => { copyButton.textContent = defaultLabel; }, 2000);
      });
    }
  }
})();
