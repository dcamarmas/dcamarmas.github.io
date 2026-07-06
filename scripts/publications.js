async function loadPublications() {
  const container = document.getElementById('publications-list');

  try {
    const response = await fetch('content/publications/publications.json');
    if (!response.ok) throw new Error('Error al cargar publications.json');

    const allPublications = await response.json();

    // Ordenar: De más reciente a más antiguo por año
    allPublications.sort((a, b) => b.year - a.year);

    // Limpiar el mensaje de "Loading..."
    container.innerHTML = '';

    if (allPublications.length === 0) {
      container.innerHTML = '<p class="text-gray-500 italic">No recent publications found.</p>';
      return;
    }

    allPublications.forEach(pub => {
      const html = `
            <div class="p-5 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-brand-200 transition-all">
              <div class="flex flex-col sm:flex-row sm:items-start gap-4">
                
                <div class="sm:w-24 flex-shrink-0">
                  <span class="block text-xl font-bold text-gray-400">${pub.year}</span>

                  ${pub.badge === "Journal" ? `
                  <span class="inline-block px-2 py-0.5 mt-1 text-xs font-bold text-green-700 bg-green-100 rounded uppercase">
                    ${pub.badge}
                  </span>
                  ` : ''}

                  ${pub.badge === "Conference" ? `
                  <span class="inline-block px-2 py-0.5 mt-1 text-xs font-bold text-blue-700 bg-blue-100 rounded uppercase">
                    ${pub.badge}
                  </span>
                  ` : ''}

                  ${pub.badge === "Workshop" ? `
                  <span class="inline-block px-2 py-0.5 mt-1 text-xs font-bold text-orange-700 bg-orange-100 rounded uppercase">
                    ${pub.badge}
                  </span>
                  ` : ''}
                  
                </div>
                
                <div class="flex-grow">
                  <h3 class="text-base font-bold text-gray-900 leading-snug">${pub.title}</h3>
                  <p class="text-sm text-gray-600 mt-2">${pub.authorsDisplay}</p>
                  <p class="text-sm text-gray-500 italic mt-1 font-serif">${pub.venue}</p>

                  ${pub.doi  || pub.bibtex ? `
                  <div class="mt-3 flex gap-3">
                    ${pub.doi  ? `<a href="${pub.doi.startsWith('http') ? pub.doi : 'https://doi.org/' + pub.doi}" target="_blank" class="text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"><i class="fa-solid fa-file-pdf mr-1"></i>URL / PDF</a>` : ''}
                    ${pub.bibtex ? `<a href="#" data-bibtex-link="${encodeURIComponent(pub.bibtex)}" class="text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"><i class="fa-solid fa-quote-right mr-1"></i>BibTeX</a>` : ''}
                  </div>
                  ` : ''}
                </div>

              </div>
            </div>
          `;
      container.insertAdjacentHTML('beforeend', html);
    });

  } catch (error) {
    console.error("Error cargando las publicaciones del perfil:", error);
    container.innerHTML = '<p class="text-red-500 italic text-sm">Error loading publications. Please try again later.</p>';
  }
}



// Ejecutar la función
loadPublications();
