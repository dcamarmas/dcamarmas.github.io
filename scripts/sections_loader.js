// CARGAR Y FILTRAR PUBLICACIONES
(function () {
  function getProfileAuthor() {
    return window.PROFILE_CONFIG?.searchName || '';
  }

  async function loadProfileJournalPublications() {
    const container = document.getElementById('journal-publications-list');
    if (!container) {
      return;
    }

    const authorToSearch = getProfileAuthor();
    if (!window.PublicationsLoader || typeof window.PublicationsLoader.loadPublications !== 'function') {
      console.error('PublicationsLoader is not available.');
      container.innerHTML = '<p class="text-red-500 italic text-sm">Error loading publications. Please try again later.</p>';
      return;
    }

    await window.PublicationsLoader.loadPublications({
      container,
      publicationsPath: 'content/publications/publications.json',
      filter: (pub) => {
        const isJournalOrConference = pub.type === 'journal';
        const isAuthor = String(pub.authorsDisplay || '').includes(authorToSearch) || String(pub.authorsData || '').includes(authorToSearch);
        return isJournalOrConference && isAuthor;
      },
      sort: (a, b) => b.year - a.year,
      limit: null,
      renderer: window.PublicationsLoader.renderPublication,
      emptyMessage: '<p class="text-gray-500 italic">No recent journal publications found.</p>'
    });
  }

  async function loadProfileInternationalConferencePublications() {
    const container = document.getElementById('international-conference-publications-list');
    if (!container) {
      return;
    }

    const authorToSearch = getProfileAuthor();
    if (!window.PublicationsLoader || typeof window.PublicationsLoader.loadPublications !== 'function') {
      console.error('PublicationsLoader is not available.');
      container.innerHTML = '<p class="text-red-500 italic text-sm">Error loading publications. Please try again later.</p>';
      return;
    }

    await window.PublicationsLoader.loadPublications({
      container,
      publicationsPath: 'content/publications/publications.json',
      filter: (pub) => {
        const isJournalOrConference = pub.type === 'conference';
        const isAuthor = String(pub.authorsDisplay || '').includes(authorToSearch) || String(pub.authorsData || '').includes(authorToSearch);
        return isJournalOrConference && isAuthor;
      },
      sort: (a, b) => b.year - a.year,
      limit: null,
      renderer: window.PublicationsLoader.renderPublication,
      emptyMessage: '<p class="text-gray-500 italic">No recent journal publications found.</p>'
    });
  }

  async function loadProfileNationalConferencePublications() {
    const container = document.getElementById('national-conference-publications-list');
    if (!container) {
      return;
    }

    const authorToSearch = getProfileAuthor();
    if (!window.PublicationsLoader || typeof window.PublicationsLoader.loadPublications !== 'function') {
      console.error('PublicationsLoader is not available.');
      container.innerHTML = '<p class="text-red-500 italic text-sm">Error loading publications. Please try again later.</p>';
      return;
    }

    await window.PublicationsLoader.loadPublications({
      container,
      publicationsPath: 'content/publications/publications.json',
      filter: (pub) => {
        const isJournalOrConference = pub.type === 'nat_conference';
        const isAuthor = String(pub.authorsDisplay || '').includes(authorToSearch) || String(pub.authorsData || '').includes(authorToSearch);
        return isJournalOrConference && isAuthor;
      },
      sort: (a, b) => b.year - a.year,
      limit: null,
      renderer: window.PublicationsLoader.renderPublication,
      emptyMessage: '<p class="text-gray-500 italic">No recent journal publications found.</p>'
    });
  }












  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-all-btn');
    const detailsElements = document.querySelectorAll('main details');
    let allExpanded = false;

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        allExpanded = !allExpanded;

        detailsElements.forEach(detail => {
          if (allExpanded) {
            detail.setAttribute('open', '');
          } else {
            detail.removeAttribute('open');
          }
        });

        if (allExpanded) {
          toggleBtn.innerHTML = '<i class="fa-solid fa-angles-up"></i><span>Collapse All</span>';
        } else {
          toggleBtn.innerHTML = '<i class="fa-solid fa-angles-down"></i><span>Expand All</span>';
        }
      });
    }

    loadProfileJournalPublications();
    loadProfileInternationalConferencePublications();
    loadProfileNationalConferencePublications();
  });
})();



// Expandir todas las secciones.
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-all-btn');
  // Seleccionamos todos los elementos <details> que están dentro del contenedor principal
  const detailsElements = document.querySelectorAll('main details');
  let allExpanded = false;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      allExpanded = !allExpanded; // Cambiamos el estado

      detailsElements.forEach(detail => {
        if (allExpanded) {
          detail.setAttribute('open', ''); // Expande
        } else {
          detail.removeAttribute('open'); // Colapsa
        }
      });

      // Actualizamos el texto y el icono del botón según el estado
      if (allExpanded) {
        toggleBtn.innerHTML = '<i class="fa-solid fa-angles-up"></i><span>Collapse All</span>';
      } else {
        toggleBtn.innerHTML = '<i class="fa-solid fa-angles-down"></i><span>Expand All</span>';
      }
    });
  }
});