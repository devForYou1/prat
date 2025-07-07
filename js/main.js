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

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
    outer.parentNode.removeChild(outer); // Clean up
    return scrollbarWidth;
}

/**
 * Global handler for Escape key to close the modal.
 * This function is defined once to ensure a stable reference for add/removeEventListener.
 */
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeInfoModal(); // Call the global close function
    }
}

/**
 * InfoModal component: Creates a custom modal for displaying detailed content.
 * This function now only creates the modal structure, it's not responsible for opening/closing.
 * @param {function} onClose - Callback function to close the modal.
 * @param {string} content - The HTML content to display inside the modal.
 * @returns {HTMLElement} The created modal backdrop element.
 */
function createInfoModalStructure(onClose, content) {
    // Create a temporary div to parse the content string and extract the title
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const titleElement = tempDiv.querySelector('h2');
    const modalTitle = titleElement ? titleElement.textContent : 'פרטים נוספים';

    const backdrop = document.createElement('div');
    backdrop.className = 'custom-modal-backdrop';
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('role', 'dialog');

    const modalContent = document.createElement('div');
    modalContent.className = 'custom-modal-content';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'custom-modal-header';

    const title = document.createElement('h2');
    title.className = 'custom-modal-title';
    title.textContent = modalTitle;
    title.id = 'modal-title'; // Add ID for accessibility

    const closeButton = document.createElement('button');
    closeButton.className = 'custom-modal-close-button';
    closeButton.innerHTML = '&times;'; // '×' symbol
    closeButton.onclick = onClose;
    closeButton.setAttribute('aria-label', 'סגור');

    modalHeader.appendChild(title);
    modalHeader.appendChild(closeButton);

    const modalBody = document.createElement('div');
    modalBody.className = 'custom-modal-scrollable-body';
    modalBody.setAttribute('tabindex', '0'); // Make scrollable body focusable
    // Remove the h2 from the content before appending to body, as it's already in the header
    if (titleElement) {
        titleElement.remove();
    }
    modalBody.innerHTML = tempDiv.innerHTML; // Use the modified content

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    backdrop.appendChild(modalContent);

    // Add event listener to close modal when clicking outside content
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            onClose();
        }
    });

    return backdrop;
}

/**
 * Opens the info modal with provided content.
 * @param {string} content - The HTML content to display inside the modal.
 */
function openInfoModal(content) {
    // If modal already exists, remove it first to ensure a clean state
    if (currentModalElement && document.body.contains(currentModalElement)) {
        document.body.removeChild(currentModalElement);
        // Ensure the escape listener is removed if modal was already open
        document.removeEventListener('keydown', handleEscapeKey);
        currentModalElement = null;
    }

    // Store current scroll position
    lastScrollY = window.scrollY;

    // Calculate scrollbar width once
    if (scrollbarWidth === 0) { // Only calculate if not already calculated
        scrollbarWidth = getScrollbarWidth();
    }

    // Create a new modal structure
    currentModalElement = createInfoModalStructure(closeInfoModal, content);
    document.body.appendChild(currentModalElement);

    // Add 'show' classes for fade-in effect
    requestAnimationFrame(() => { // Use rAF for smoother animation start
        currentModalElement.classList.add('show');
        currentModalElement.querySelector('.custom-modal-content').classList.add('show');
    });

    // Disable main page scroll when modal is open
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open'); // Add to html element
    if (scrollbarWidth > 0) {
        document.body.style.paddingRight = scrollbarWidth + 'px'; // Compensate for scrollbar
    }
    
    const mainContainer = document.querySelector('.main-container-border');
    if (mainContainer) {
        mainContainer.classList.add('modal-open');
    }

    // Attach escape listener
    document.addEventListener('keydown', handleEscapeKey);

    // Focus on the modal for accessibility
    currentModalElement.querySelector('.custom-modal-content').focus();
}

/**
 * Closes the info modal.
 */
function closeInfoModal() {
    if (currentModalElement) {
        currentModalElement.classList.remove('show'); // Start fade-out
        currentModalElement.querySelector('.custom-modal-content').classList.remove('show'); // Start content fade-out

        // Remove escape listener immediately
        document.removeEventListener('keydown', handleEscapeKey);

        // Re-enable scroll after transition ends
        currentModalElement.addEventListener('transitionend', () => {
            if (currentModalElement && !currentModalElement.classList.contains('show')) { // Ensure it's fully faded out
                document.body.removeChild(currentModalElement);
                currentModalElement = null; // Clear reference

                // Restore body scroll properties
                document.body.classList.remove('modal-open'); // Re-enable body scroll
                document.documentElement.classList.remove('modal-open'); // Re-enable html scroll
                document.body.style.paddingRight = ''; // Remove padding-right
                
                const mainContainer = document.querySelector('.main-container-border');
                if (mainContainer) {
                    mainContainer.classList.remove('modal-open'); // Re-enable main container scroll
                }

                // Restore scroll position
                window.scrollTo(0, lastScrollY);
            }
        }, { once: true }); // Ensure listener runs only once
    }
}

/**
 * Debounce function to limit how often a function can run.
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
 * Renders the main application structure and content.
 * @param {object} data - The content data for the page.
 */
function renderApp(data) {
    const appRoot = document.getElementById('app-root');
    if (!appRoot) {
        console.error('App root element not found!');
        return;
    }
    appRoot.innerHTML = ''; // Clear existing content

    const mainContainer = document.createElement('div');
    mainContainer.className = 'main-container-border animate-main-container';

    // Add shimmer effect
    const shimmer = document.createElement('div');
    shimmer.className = 'shimmer-effect';
    mainContainer.appendChild(shimmer);

    // Logo - Main TAAZ Logo (using img tag as per original HTML data)
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
    const mainTitle = document.createElement('h1');
    mainTitle.textContent = data.mainTitle;
    mainContainer.appendChild(mainTitle);

    // Intro Paragraphs
    data.introParagraphs.forEach(paragraphText => {
        const p = document.createElement('p');
        p.className = 'intro-paragraph-text';
        p.textContent = paragraphText;
        mainContainer.appendChild(p);
    });

    // Motto
    const motto = document.createElement('p');
    motto.className = 'motto-text';
    motto.textContent = data.motto;
    mainContainer.appendChild(motto);

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

    data.sections.forEach(section => {
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
            // Direct content section
            const contentDiv = document.createElement('div');
            // Special handling for "דבר ראש מרכז תע״ץ" to remove the inner box
            if (section.id === "head-of-taatz-message") {
                contentDiv.innerHTML = section.contentHtml; // No content-section class for this one
            } else {
                contentDiv.className = 'content-section'; // Apply default content-section styles
                contentDiv.innerHTML = section.contentHtml;
            }
            collapseGrid.appendChild(contentDiv);
        } else {
            // Sub-items (nested accordion)
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
            // Prevent collapsing on larger screens (desktop)
            if (window.innerWidth > 768) { // Assuming 768px is the breakpoint for "100% original size"
                return; // Do nothing if on a large screen
            }

            const isOpen = accordionItemContainer.classList.toggle('open');
            collapseGrid.classList.toggle('show', isOpen);
            accordionHeaderButton.setAttribute('aria-expanded', isOpen);
        };

        accordionItemContainer.appendChild(accordionHeaderButton);
        accordionItemContainer.appendChild(collapseGrid);
        accordionContainer.appendChild(accordionItemContainer);
    });

    // Footer Card
    const footerCard = document.createElement('div');
    footerCard.className = 'footer-card';

    const footerLinksContainer = document.createElement('div');
    footerLinksContainer.className = 'footer-links-container';

    data.footerLinks.forEach(linkData => {
        const linkAnchor = document.createElement('a');
        linkAnchor.href = linkData.href;
        linkAnchor.target = "_blank";
        linkAnchor.rel = "noopener noreferrer";
        linkAnchor.className = 'footer-link-square';
        linkAnchor.setAttribute('aria-label', linkData.alt);

        const iconContainer = document.createElement('div');
        iconContainer.className = 'footer-svg-icon'; // Class for styling the icon/image

        if (linkData.imgSrc) {
            const img = document.createElement('img');
            img.src = linkData.imgSrc;
            img.alt = linkData.alt;
            // Fallback image in case the provided URL fails
            img.onerror = function() { this.src = 'https://placehold.co/32x32/cccccc/000000?text=Error'; }; 
            iconContainer.appendChild(img);
        } else if (linkData.svgContent) {
            // Use SVG content directly (this path is less likely now with PNGs)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = linkData.svgContent;
            if (tempDiv.firstChild) {
                iconContainer.appendChild(tempDiv.firstChild);
            }
        }
        
        linkAnchor.appendChild(iconContainer);
        footerLinksContainer.appendChild(linkAnchor);
    });

    footerCard.appendChild(footerLinksContainer);
    appRoot.appendChild(mainContainer); // Append mainContainer to appRoot
    appRoot.appendChild(footerCard); // Append footerCard to appRoot, outside mainContainer


    // Handle search functionality with debounce
    const debouncedSearch = debounce((e) => {
        const searchTerm = e.target.value.toLowerCase();
        data.sections.forEach(section => {
            const accordionItem = document.getElementById(section.id + '-collapse').closest('.accordion-item-container');
            let sectionMatches = false;

            // Check if section title matches
            if (section.title.toLowerCase().includes(searchTerm)) {
                sectionMatches = true;
            }

            // Check sub-items if not direct content
            if (!section.isDirectContent) {
                const subItemsMatching = section.subItems.filter(subItem =>
                    subItem.title.toLowerCase().includes(searchTerm) ||
                    subItem.content.toLowerCase().includes(searchTerm)
                );
                if (subItemsMatching.length > 0) {
                    sectionMatches = true;
                }
                // Toggle visibility of sub-item buttons
                const subCardButtons = accordionItem.querySelectorAll('.subcard-button');
                subCardButtons.forEach(button => {
                    const subItemData = section.subItems.find(item => item.title === button.textContent);
                    if (subItemData && (subItemData.title.toLowerCase().includes(searchTerm) || subItemData.content.toLowerCase().includes(searchTerm))) {
                        button.style.display = 'block'; // Show matching sub-items
                    } else {
                        button.style.display = 'none'; // Hide non-matching sub-items
                    }
                });
            } else {
                // For direct content, check contentHtml
                if (section.contentHtml.toLowerCase().includes(searchTerm)) {
                    sectionMatches = true;
                }
            }

            // Show/hide accordion item based on match
            if (searchTerm === '') {
                accordionItem.style.display = 'block'; // Show all when search is empty
                // On large screens, accordions should remain open even if search is cleared
                if (window.innerWidth <= 768) { // Only close on smaller screens
                    accordionItem.classList.remove('open');
                    document.getElementById(section.id + '-collapse').classList.remove('show');
                }
                // Show all sub-item buttons when search is empty
                const subCardButtons = accordionItem.querySelectorAll('.subcard-button');
                subCardButtons.forEach(button => {
                    button.style.display = 'block';
                });
            } else if (sectionMatches) {
                accordionItem.style.display = 'block';
                accordionItem.classList.add('open'); // Open matching accordion
                document.getElementById(section.id + '-collapse').classList.add('show');
            } else {
                accordionItem.style.display = 'none';
            }
        });
    }, 300); // Debounce delay of 300ms

    searchInput.addEventListener('input', debouncedSearch);


    // Scroll-to-Top Button Logic
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    // Listen for scroll events on the window, not the mainContainer
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
                // Get all text content from paragraphs and list items within the content section
                const paragraphs = contentSection.querySelectorAll('p');
                const listItems = contentSection.querySelectorAll('li');
                
                paragraphs.forEach(p => {
                    textToCopy += p.textContent + '\n';
                });
                listItems.forEach(li => {
                    // Prepend bullet point for list items
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
                    border-radius: 8px;
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
