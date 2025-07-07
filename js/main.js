// main.js

/**
 * Creates an SVG element with specified tag name and attributes.
 * @param {string} tagName - The SVG element tag name (e.g., 'svg', 'path', 'circle').
 * @param {object} attributes - An object of attributes to set on the SVG element.
 * @returns {SVGElement} The created SVG element.
 */
function createSvgElement(tagName, attributes) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", tagName);
    for (const key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            if (key === 'xlinkHref') {
                svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', attributes[key]);
            } else {
                svg.setAttribute(key, attributes[key]);
            }
        }
    }
    return svg;
}

// Global variable to hold the single modal instance
let currentModalElement = null;
let lastScrollY = 0; // Global variable to store scroll position
let scrollbarWidth = 0; // Global variable to store scrollbar width

/**
 * Calculates the width of the scrollbar.
 * @returns {number} The width of the scrollbar in pixels.
 */
function getScrollbarWidth() {
    // Create a temporary div to measure scrollbar
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // Force scrollbar
    document.body.appendChild(outer);

    // Create inner div to measure content width
    const inner = document.createElement('div');
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    // Remove temporary div
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
}

/**
 * Handles escape key press to close the modal.
 * @param {KeyboardEvent} event - The keyboard event.
 */
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeInfoModal();
    }
}

/**
 * Creates the structure for the info modal.
 * @param {function} closeCallback - Function to call when the modal is closed.
 * @param {string} contentHtml - The HTML content to display in the modal body.
 * @returns {HTMLElement} The modal backdrop element.
 */
function createInfoModalStructure(closeCallback, contentHtml) {
    // Create a temporary div to parse the contentHtml and extract the h2 title
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentHtml;
    const h2Element = tempDiv.querySelector('h2');
    const modalTitleText = h2Element ? h2Element.textContent : 'פרטים נוספים';

    // Create modal backdrop
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'custom-modal-backdrop';
    modalBackdrop.setAttribute('aria-modal', 'true');
    modalBackdrop.setAttribute('role', 'dialog');

    // Create modal content container
    const modalContent = document.createElement('div');
    modalContent.className = 'custom-modal-content';

    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'custom-modal-header';

    // Create modal title
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'custom-modal-title';
    modalTitle.textContent = modalTitleText;
    modalTitle.id = 'modal-title';

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'custom-modal-close-button';
    closeButton.innerHTML = '&times;'; // '×' character
    closeButton.onclick = closeCallback;
    closeButton.setAttribute('aria-label', 'סגור');

    // Append title and close button to header
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);

    // Remove the h2 from the contentHtml if it exists, as it's now in the header
    if (h2Element) {
        h2Element.remove();
    }
    // Re-set innerHTML to ensure changes are applied before moving children
    // This step is important if the h2 was the only child or if its removal changed the structure.
    // However, it's safer to move children directly.
    const scrollableBody = document.createElement('div');
    scrollableBody.className = 'custom-modal-scrollable-body';
    while (tempDiv.firstChild) {
        scrollableBody.appendChild(tempDiv.firstChild);
    }

    // Append header and body to modal content
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(scrollableBody);

    // Append modal content to backdrop
    modalBackdrop.appendChild(modalContent);

    // Close modal when clicking outside the content
    modalBackdrop.addEventListener('click', (event) => {
        if (event.target === modalBackdrop) {
            closeCallback();
        }
    });

    return modalBackdrop;
}

/**
 * Opens the info modal with the given content.
 * @param {string} contentHtml - The HTML content to display in the modal.
 */
function openInfoModal(contentHtml) {
    // If a modal is already open, close it first
    if (currentModalElement && document.body.contains(currentModalElement)) {
        document.body.removeChild(currentModalElement);
        document.removeEventListener('keydown', handleEscapeKey);
        currentModalElement = null;
    }

    // Store current scroll position
    lastScrollY = window.scrollY;

    // Calculate scrollbar width only once
    if (scrollbarWidth === 0) {
        scrollbarWidth = getScrollbarWidth();
    }

    // Create and append the new modal
    currentModalElement = createInfoModalStructure(closeInfoModal, contentHtml);
    document.body.appendChild(currentModalElement);

    // Animate modal in
    requestAnimationFrame(() => {
        currentModalElement.classList.add('show');
        currentModalElement.querySelector('.custom-modal-content').classList.add('show');
    });

    // Disable main page scroll
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open'); // Also disable scroll on html
    if (scrollbarWidth > 0) {
        document.body.style.paddingRight = scrollbarWidth + 'px';
    }
    const mainContainer = document.querySelector('.main-container-border');
    if (mainContainer) {
        mainContainer.classList.add('modal-open');
    }

    // Add escape key listener
    document.addEventListener('keydown', handleEscapeKey);

    // Focus on the modal content for accessibility
    currentModalElement.querySelector('.custom-modal-content').focus();
}

/**
 * Closes the info modal.
 */
function closeInfoModal() {
    if (currentModalElement) {
        currentModalElement.classList.remove('show');
        currentModalElement.querySelector('.custom-modal-content').classList.remove('show');
        document.removeEventListener('keydown', handleEscapeKey); // Remove listener when closing

        // Remove modal after transition ends
        currentModalElement.addEventListener('transitionend', () => {
            if (currentModalElement && !currentModalElement.classList.contains('show')) {
                document.body.removeChild(currentModalElement);
                currentModalElement = null; // Clear the global reference

                // Re-enable main page scroll
                document.body.classList.remove('modal-open');
                document.documentElement.classList.remove('modal-open');
                document.body.style.paddingRight = ''; // Remove padding
                const mainContainer = document.querySelector('.main-container-border');
                if (mainContainer) {
                    mainContainer.classList.remove('modal-open');
                }
                // Restore scroll position
                window.scrollTo(0, lastScrollY);
            }
        }, { once: true });
    }
}

/**
 * Debounces a function call.
 * @param {function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {function} The debounced function.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Renders the main application content based on provided data.
 * @param {object} contentData - The data object containing app content.
 */
function renderApp(contentData) {
    const appRoot = document.getElementById('app-root');
    if (!appRoot) {
        console.error('App root element not found!');
        return;
    }
    appRoot.innerHTML = ''; // Clear existing content

    const mainContainer = document.createElement('div');
    mainContainer.className = 'main-container-border animate-main-container';

    // Shimmer effect
    const shimmerDiv = document.createElement('div');
    shimmerDiv.className = 'shimmer-effect';
    mainContainer.appendChild(shimmerDiv);

    // Logo
    const logoContainer = document.createElement('div');
    logoContainer.className = 'logo-container';
    const taazLogo = document.createElement('img');
    taazLogo.src = "https://res.cloudinary.com/dwbq7b5vg/image/upload/v1751868710/logo_taaz_hwq7ly.png";
    taazLogo.alt = "לוגו תעץ";
    taazLogo.className = "taaz-main-logo";
    taazLogo.loading = "lazy";
    logoContainer.appendChild(taazLogo);
    mainContainer.appendChild(logoContainer);

    // Main Title
    const mainTitleElement = document.createElement('h1');
    mainTitleElement.textContent = contentData.mainTitle;
    mainContainer.appendChild(mainTitleElement);

    // Intro Paragraphs
    contentData.introParagraphs.forEach(paragraphText => {
        const p = document.createElement('p');
        p.className = 'intro-paragraph-text';
        p.textContent = paragraphText;
        mainContainer.appendChild(p);
    });

    // Motto
    const mottoParagraph = document.createElement('p');
    mottoParagraph.className = 'motto-text';
    mottoParagraph.textContent = contentData.motto;
    mainContainer.appendChild(mottoParagraph);

    // Search Input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'חיפוש...';
    searchInput.className = 'search-input';
    searchInput.setAttribute('aria-label', 'חיפוש בתוכן');
    mainContainer.appendChild(searchInput);

    // Accordion Container
    const accordionContainer = document.createElement('div');
    accordionContainer.className = 'accordion-container';
    mainContainer.appendChild(accordionContainer);

    contentData.sections.forEach(section => {
        const accordionItemContainer = document.createElement('div');
        accordionItemContainer.className = 'accordion-item-container';

        const accordionHeaderButton = document.createElement('button');
        accordionHeaderButton.className = 'accordion-header-button';
        accordionHeaderButton.setAttribute('aria-expanded', 'false');
        accordionHeaderButton.setAttribute('aria-controls', section.id + '-collapse');

        const accordionTitleText = document.createElement('span');
        accordionTitleText.className = 'accordion-title-text';
        accordionTitleText.textContent = section.title;
        accordionHeaderButton.appendChild(accordionTitleText);

        const arrowIcon = document.createElement('span');
        arrowIcon.className = 'arrow-icon';
        arrowIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
        `;
        accordionHeaderButton.appendChild(arrowIcon);

        const collapseGrid = document.createElement('div');
        collapseGrid.id = section.id + '-collapse';
        collapseGrid.className = 'collapse-grid';

        if (section.isDirectContent) {
            // For direct content, insert HTML directly
            let contentDiv;
            // Special handling for head-of-taatz-message to avoid extra content-section div
            if (section.id === "head-of-taatz-message") {
                contentDiv = collapseGrid; // Insert directly into collapseGrid
            } else {
                contentDiv = document.createElement('div');
                contentDiv.className = 'content-section';
            }
            contentDiv.innerHTML = section.contentHtml;
            // Only append contentDiv if it's not the collapseGrid itself
            if (section.id !== "head-of-taatz-message") {
                collapseGrid.appendChild(contentDiv);
            }
        } else {
            // For sub-items, create buttons
            const subCardContainer = document.createElement('div');
            subCardContainer.className = 'sub-card-container';
            section.subItems.forEach(subItem => {
                const subCardButton = document.createElement('button');
                subCardButton.className = 'subcard-button';
                subCardButton.textContent = subItem.title;
                subCardButton.onclick = () => openInfoModal(subItem.content);
                subCardContainer.appendChild(subCardButton);
            });
            collapseGrid.appendChild(subCardContainer);
        }

        accordionHeaderButton.onclick = () => {
            // Disable collapse/expand on desktop
            if (window.innerWidth > 768) {
                return;
            }
            const isOpen = accordionItemContainer.classList.toggle('open');
            collapseGrid.classList.toggle('show', isOpen);
            accordionHeaderButton.setAttribute('aria-expanded', isOpen);
        };

        accordionItemContainer.appendChild(accordionHeaderButton);
        accordionItemContainer.appendChild(collapseGrid);
        accordionContainer.appendChild(accordionItemContainer);
    });

    // Footer
    const footerCard = document.createElement('footer');
    footerCard.className = 'footer-card';

    const footerLinksContainer = document.createElement('div');
    footerLinksContainer.className = 'footer-links-container';

    contentData.footerLinks.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.href = link.href;
        linkElement.target = "_blank";
        linkElement.rel = "noopener noreferrer";
        linkElement.className = "footer-link-square";
        linkElement.setAttribute("aria-label", link.alt);

        const svgIconContainer = document.createElement('div');
        svgIconContainer.className = 'footer-svg-icon';

        if (link.imgSrc) {
            const img = document.createElement('img');
            img.src = link.imgSrc;
            img.alt = link.alt;
            img.loading = "lazy";
            img.onerror = function() {
                this.src = "https://placehold.co/32x32/cccccc/000000?text=Error"; // Fallback placeholder
            };
            svgIconContainer.appendChild(img);
        } else if (link.svgContent) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = link.svgContent;
            if (tempDiv.firstChild) {
                svgIconContainer.appendChild(tempDiv.firstChild);
            }
        }
        linkElement.appendChild(svgIconContainer);
        footerLinksContainer.appendChild(linkElement);
    });
    footerCard.appendChild(footerLinksContainer);
    mainContainer.appendChild(footerCard);

    appRoot.appendChild(mainContainer);

    // Search functionality
    const debouncedSearch = debounce((event) => {
        const searchTerm = event.target.value.toLowerCase();

        contentData.sections.forEach(section => {
            const itemContainer = document.getElementById(section.id + '-collapse').closest('.accordion-item-container');
            let sectionMatches = false;

            // Check if section title matches
            if (section.title.toLowerCase().includes(searchTerm)) {
                sectionMatches = true;
            }

            // Check sub-items if not direct content
            if (!section.isDirectContent) {
                const matchingSubItems = section.subItems.filter(subItem =>
                    subItem.title.toLowerCase().includes(searchTerm) ||
                    subItem.content.toLowerCase().includes(searchTerm)
                );
                if (matchingSubItems.length > 0) {
                    sectionMatches = true;
                }

                // Show/hide sub-buttons based on search term
                const subButtons = itemContainer.querySelectorAll('.subcard-button');
                subButtons.forEach(button => {
                    const subItem = section.subItems.find(item => item.title === button.textContent);
                    if (subItem) {
                        if (subItem.title.toLowerCase().includes(searchTerm) || subItem.content.toLowerCase().includes(searchTerm)) {
                            button.style.display = 'block';
                        } else {
                            button.style.display = 'none';
                        }
                    }
                });
            } else {
                // Check direct content HTML
                if (section.contentHtml.toLowerCase().includes(searchTerm)) {
                    sectionMatches = true;
                }
            }

            // Show/hide accordion item and manage its open/close state
            if (searchTerm === '') {
                itemContainer.style.display = 'block';
                // On mobile, collapse all when search is cleared
                if (window.innerWidth <= 768) {
                    itemContainer.classList.remove('open');
                    document.getElementById(section.id + '-collapse').classList.remove('show');
                }
                // Show all sub-buttons when search is cleared
                itemContainer.querySelectorAll('.subcard-button').forEach(button => {
                    button.style.display = 'block';
                });
            } else if (sectionMatches) {
                itemContainer.style.display = 'block';
                itemContainer.classList.add('open'); // Always open matching sections
                document.getElementById(section.id + '-collapse').classList.add('show');
            } else {
                itemContainer.style.display = 'none';
            }
        });
    }, 300); // Debounce delay of 300ms

    searchInput.addEventListener('input', debouncedSearch);

    // Scroll-to-top button logic
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Copy to clipboard functionality
    document.addEventListener('click', function(event) {
        let textToCopy = '';
        if (event.target.classList.contains('copy-button')) {
            const contentSection = event.target.closest('.content-section');
            if (contentSection) {
                const paragraphs = contentSection.querySelectorAll('p');
                const listItems = contentSection.querySelectorAll('li');

                paragraphs.forEach(p => {
                    textToCopy += p.textContent + '\n';
                });
                listItems.forEach(li => {
                    textToCopy += '- ' + li.textContent + '\n';
                });
            }
        }

        if (textToCopy) {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);

                const feedbackDiv = document.createElement('div');
                feedbackDiv.textContent = 'הועתק!';
                feedbackDiv.style.cssText = `
                    position: fixed;
                    bottom: 80px;
                    right: 20px;
                    background-color: #28a745;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 8px;\
                    z-index: 1060;
                    opacity: 0;
                    transition: opacity 0.3s ease-out;
                `;
                document.body.appendChild(feedbackDiv);
                setTimeout(() => {
                    feedbackDiv.style.opacity = '1';
                }, 10);
                setTimeout(() => {
                    feedbackDiv.style.opacity = '0';
                    feedbackDiv.addEventListener('transitionend', () => feedbackDiv.remove());
                }, 1500);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }
    });
}

// Initialize the app with the specific content data for this page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - Initializing app for sal_kelim.html'); // Debugging
    if (window.salKelimContentData) {
        renderApp(window.salKelimContentData);
    } else {
        console.error('salKelimContentData is not defined.');
    }
});
