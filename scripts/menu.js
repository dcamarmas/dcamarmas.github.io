// Hacer que los enlaces del menú lateral abran los acordeones correspondientes
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const allDetails = document.querySelectorAll('details.group');

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Extraemos el ID destino
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        // Devolvemos el estado de todos los enlaces.
        sidebarLinks.forEach(l => {
            l.classList.remove('text-brand-600', 'border-brand-600', 'font-bold');
            l.classList.add('text-gray-600', 'border-transparent', 'font-medium');
        });

        // Iluminamos el enlace clickeado.
        link.classList.remove('text-gray-600', 'border-transparent', 'font-medium');
        link.classList.add('text-brand-600', 'border-brand-600', 'font-bold');                       

        // Efecto Acordeón: Cerramos todos los <details> EXCEPTO el que acabamos de clicar
        allDetails.forEach(details => {
            if (details.id !== targetId) {
                details.open = false;
            }
        });

        // Abrimos el elemento destino si es un <details>
        if (targetElement && targetElement.tagName === 'DETAILS') {
            targetElement.open = true;
        }
    });
});

// Iluminar menú activo
// detección de las secciones cuando estén cerca de la mitad superior de la pantalla
const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
};

// Cambia el color de las opciones del borde izquierdo conforme se navega.
// TOCHECK: si hay poco contenido o se colapsan todas las secciones no se marca el valor corrector por
// que la navegaciójn lo va cambiando.
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Si la sección entra en el área visible que configuramos...
        if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');

            // Revisamos todos los enlaces del menú lateral
            sidebarLinks.forEach(link => {
                if (link.getAttribute('href') === `#${currentId}`) {
                    // ENLACE ACTIVO: Le damos el color de tu marca, lo hacemos negrita y marcamos el borde izquierdo
                    link.classList.remove('text-gray-600', 'border-transparent', 'font-medium');
                    link.classList.add('text-brand-600', 'border-brand-600', 'font-bold');
                } else {
                    // ENLACE INACTIVO: Le devolvemos su estilo gris normal
                    link.classList.add('text-gray-600', 'border-transparent', 'font-medium');
                    link.classList.remove('text-brand-600', 'border-brand-600', 'font-bold');
                }
            });
        }
    });
}, observerOptions);

// Seleccionamos la sección 'About' y todos los '<details>' que tengan un ID, y los empezamos a vigilar
// const sectionsToObserve = document.querySelectorAll('section[id], details[id]');
// sectionsToObserve.forEach(section => {
//     scrollObserver.observe(section);
// });