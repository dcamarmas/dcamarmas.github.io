// publications.js

(function () {
  const DEFAULT_PUBLICATIONS_PATH = 'content/publications/publications.json';

  function getTypeClasses(type) {
    if (type === 'Journal') {
      return {
        border: 'border-green-600',
        badgeText: 'text-green-700',
        badgeBg: 'bg-green-100'
      };
    }

    if (type === 'Conference') {
      return {
        border: 'border-blue-500',
        badgeText: 'text-blue-700',
        badgeBg: 'bg-blue-100'
      };
    }

    if (type === 'Workshop') {
      return {
        border: 'border-orange-500',
        badgeText: 'text-orange-700',
        badgeBg: 'bg-orange-100'
      };
    }

    return {
      border: 'border-brand-600',
      badgeText: 'text-brand-700',
      badgeBg: 'bg-brand-100'
    };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getContainer(containerOrId) {
    if (!containerOrId) {
      return null;
    }

    return typeof containerOrId === 'string'
      ? document.getElementById(containerOrId)
      : containerOrId;
  }

  function openBibtexViewer(bibtex) {
    if (!bibtex) {
      return;
    }

    const blob = new Blob([bibtex], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  }

  function bindBibtexLinks(containerElement) {
    if (!containerElement) {
      return;
    }

    containerElement.querySelectorAll('a[data-bibtex-link]').forEach(link => {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        const bibtex = decodeURIComponent(this.getAttribute('data-bibtex-link') || '');
        openBibtexViewer(bibtex);
      });
    });
  }

  function renderPublication(pub) {
    const borderAndBadgeClasses = window.PublicationsLoader.getTypeClasses(pub.badge);
    const doiLink = pub.doi ? (pub.doi.startsWith('http') ? pub.doi : 'https://doi.org/' + pub.doi) : null;
    const urlLink = doiLink || (pub.url ? pub.url : null);
    const titleLink = urlLink;
    const hasBibtex = !!pub.bibtex;

    return `
      <div class="p-5 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-brand-200 transition-all">
        <div class="flex flex-col sm:flex-row sm:items-start gap-4">
          <div class="sm:w-24 flex-shrink-0">
            <span class="block text-xl font-bold text-gray-400">${pub.year}</span>
            <span class="inline-block px-2 py-0.5 mt-1 text-xs font-bold ${borderAndBadgeClasses.badgeText} ${borderAndBadgeClasses.badgeBg} rounded uppercase">
              ${pub.badge}
            </span>
          </div>

          <div class="flex-grow">
            <h3 class="text-base font-bold text-gray-900 leading-snug">
              ${titleLink
                ? `<a href="${titleLink}" target="_blank" rel="noopener noreferrer" class="hover:underline text-brand-600">${pub.title}</a>`
                : pub.title}
            </h3>
            <p class="text-sm text-gray-600 mt-2">${pub.authorsDisplay}</p>
            <p class="text-sm text-gray-500 italic mt-1 font-serif">${pub.venue}</p>

            ${urlLink || hasBibtex ? `
            <div class="mt-3 flex gap-3">
              ${urlLink ? `<a href="${urlLink}" target="_blank" class="text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"><i class="fa-solid fa-file-pdf mr-1"></i>URL / PDF</a>` : ''}
              ${hasBibtex ? `<a href="#" data-bibtex-link="${encodeURIComponent(pub.bibtex)}" class="text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"><i class="fa-solid fa-quote-right mr-1"></i>BibTeX</a>` : ''}
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  async function loadPublications(options = {}) {
    const {
      container = 'publicationsList',
      publicationsPath = DEFAULT_PUBLICATIONS_PATH,
      filter = () => true,
      sort = (a, b) => b.year - a.year,
      limit = null,
      renderer = null,
      emptyMessage = '',
      onComplete = null
    } = options;

    const containerElement = getContainer(container);
    if (!containerElement) {
      console.error('No element with id="publicationsList" found.');
      return [];
    }

    try {
      const response = await fetch(publicationsPath);
      if (!response.ok) {
        throw new Error(`Error loading ${publicationsPath}`);
      }

      const publications = await response.json();
      const filteredPublications = publications.filter(filter);
      filteredPublications.sort(sort);
      const itemsToRender = limit === null ? filteredPublications : filteredPublications.slice(0, limit);

      containerElement.innerHTML = '';

      if (itemsToRender.length === 0) {
        if (emptyMessage) {
          containerElement.innerHTML = emptyMessage;
        }

        if (onComplete) {
          onComplete([]);
        }

        return itemsToRender;
      }

      itemsToRender.forEach(pub => {
        const html = renderer ? renderer(pub) : renderPublication(pub);
        containerElement.insertAdjacentHTML('beforeend', html);
      });

      bindBibtexLinks(containerElement);

      if (onComplete) {
        onComplete(itemsToRender);
      }

      if (window.initPublicationFilters) {
        window.initPublicationFilters();
      }

      return itemsToRender;
    } catch (err) {
      console.error(err);
      containerElement.innerHTML = '<p class="text-red-500 italic text-sm">Error loading publications. Please try again later.</p>';
      return [];
    }
  }

  const PublicationsLoader = {
    getTypeClasses,
    escapeHtml,
    renderPublication,
    loadPublications
  };

  window.PublicationsLoader = PublicationsLoader;
  window.loadPublications = loadPublications;
  window.openBibtexViewer = openBibtexViewer;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('publicationsList')) {
        loadPublications();
      }
    });
  } else if (document.getElementById('publicationsList')) {
    loadPublications();
  }
})();