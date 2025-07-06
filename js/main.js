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

    // Create a new modal structure and get a direct reference to the modal content element
    const modalBackdrop = createInfoModalStructure(closeInfoModal, content);
    const modalContentElement = modalBackdrop.querySelector('.custom-modal-content'); // Get direct reference here

    if (!modalContentElement) {
        console.error('Error: custom-modal-content element not found within the modal backdrop.');
        return; // Prevent further errors if the structure is not as expected
    }

    currentModalElement = modalBackdrop; // Assign the backdrop to the global variable
    document.body.appendChild(currentModalElement);

    // Add 'show' classes for fade-in effect
    requestAnimationFrame(() => { // Use rAF for smoother animation start
        currentModalElement.classList.add('show'); // backdrop
        modalContentElement.classList.add('show'); // modal content
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
    modalContentElement.focus(); // Focus on the content element directly
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

    let mainContainer = null; // Initialize to null for robust error handling
    try {
        mainContainer = document.createElement('div');
    } catch (e) {
        console.error('Error creating mainContainer div:', e);
        return; // Exit if element creation fails
    }

    // Explicitly check if mainContainer is a valid HTMLElement before adding classes
    if (!(mainContainer instanceof HTMLElement)) {
        console.error('mainContainer is not a valid HTMLElement after creation. Value:', mainContainer);
        return;
    }
    
    // Debugging log: Check what mainContainer is right before adding classes
    console.log('mainContainer before adding classes:', mainContainer);
    
    mainContainer.classList.add('main-container-border');
    mainContainer.classList.add('animate-main-container');

    // Add shimmer effect (kept for consistency with CSS, though display:none)
    const shimmer = document.createElement('div');
    shimmer.className = 'shimmer-effect';
    
    // Debugging: Check shimmer before appending
    console.log('shimmer element:', shimmer);
    console.log('mainContainer element before appending shimmer:', mainContainer);

    try {
        mainContainer.appendChild(shimmer); 
    } catch (e) {
        console.error('Error appending shimmer:', e);
        console.error('mainContainer at error:', mainContainer);
        console.error('shimmer at error:', shimmer);
        return; // Stop execution to prevent further errors
    }
    

    // Logo - Main TAAZ Logo (now an SVG)
    const logoContainer = document.createElement('div');
    logoContainer.className = 'logo-container';
    
    // The full SVG content, excluding the XML declaration and the outer <svg> tag
    const mainTaazLogoSvgContent = `
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 568.89 544.35">
  <defs>
    <style>
      .cls-1 {
        fill: url(#New_Gradient_Swatch_3);
      }
    </style>
    <linearGradient id="New_Gradient_Swatch_3" data-name="New Gradient Swatch 3" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#50b8ee"/>
      <stop offset=".75" stop-color="#0a4a7a"/>
    </linearGradient>
  </defs>
  <path class="cls-1" d="M279.38,165.52s94.58-21.59,232.28-1.82c-32.91,37.96-83.84,21.5-126.51,20.23-21.16-.63-34.45-2.86-93.06,3.6-9.59-16.59-12.71-22-12.71-22ZM491.28,192.8c-20.38-1.2-63.93,6.68-78.36,4.74-51.04-6.86-115.63-1.29-115.63-1.29l11.84,21.1c56.62-2.27,85.83,8.48,122.15,4.22,19.75-2.31,45.86-14.8,59.99-28.77ZM384.91,230.74c-34.54-4.59-52.58-7.49-71.28-5.94l14.02,24.27c32.88,1.5,64.99,6.68,79.97,4.15,13.57-2.29,36.07-15.44,45.81-25.48-22.92,1.18-45.62,6.05-68.53,3ZM365.88,395h73.44l-65.81-113.98-2.58-4.6c10.71-3.17,23.37-8.11,29.35-14.01,0,0-17.42,1.64-35.82-1.4-10.22-1.69-21.34-2.9-32-3.63l12.96,22.43c.12,0,.24,0,.36.01l-.28.26.04.07.04-.07,13.93,24.13.04.07-.04.07,37.87,65.59h-17.05l-14.47,25.05ZM117.11,276.84l17.14,29.97,13.44-23.27-.04-.07-.04.07-13.44-23.27-.04-.07.04-.07-36.52-63.25h46.31l13.47-23.34H57.23l59.79,103.56.09-.26ZM169.93,371.18h-72.57l22.95-39.75-13.34-23.1-1.45,2.79.34-.99-48.62,84.21h126.07l-12.22-23.17h-1.16ZM264.1,274.93c-10.25-11.49-24.73-16.49-30.33-17.91-1.44-.37-1.92-56.89,13.77-86.14,14.98,19.76,16.55,104.06,16.55,104.06ZM278.13,387.8h-58.39c8.52-11.74,17.6-3.77,28.02-3.38,10.64.4,20.89-6.32,30.36,3.38ZM234.61,297.95c-1.85-1.38-1.15-15.82-2.26-19.07l31.56,18.22-.66,20.24c-7.79-12.72-28.64-19.4-28.64-19.4ZM255.02,380.62s-17.4.81-21.56-3.68l.03-53.25c1.8,1.51,29.17,20.52,29.72,23.5.83,4.4.25,23.81.09,28.65-.17,4.97-8.28,4.78-8.28,4.78ZM278.14,277.89,274.69,245.84,283.48,335.34c-3.17,11.85-2.94,28.52-8.21,39.87-.62,1.34-1.17,3.14-2.85,3.43,14.86-42.24-42.44-45.97-51.52-80.13,20.19,1.62,33.4,6.21,43.71,24.4,0,0,10.09,23.19,9.86,17.17-.15-3.76-1.68-21.69-3.41-24.77-1.78-3.16-6.35-2.42-5.54-8.16.75-5.32,8.8-5.55,10.14-.97,1.22,4.17-2.1,6.4-2.14,10.01-.04,3.61,1.84,9.76,2.31,13.79.12,1.03-.73,13.7,2.3,9.71l.39-34.07c-15.79-15.91-38.27-15.93-50.98-36.11-.77-1.23-9.3-17.84-6.08-16.81,9.51,6.19,21.64,8.28,30.92,14.88,4.3,3.06,11.82,10.74,14.52,15.25.7,1.17,3.34,6.8,6.01,11.16,1.63,2.65,1.34,7.47,4.07,9.08-1.81-28.8-7.96-27.78-12.55-41.04l-.33-3.74s14.04,23.02,15.6,43.16l4.5-28.14c-1.67-4.83,1.08-7.27,1.08-7.27,6.02-2.59,8.3,5.74,5.54,9.96-1.13,1.73-3.75.68-5.04,3.33-2.87,5.88-5.49,27.67-5.44,34.64.03,4.21,1.14,12.87,2.95,16.58,1.01-11.69,3.61-23.1,6.86-34.34.11-.39,2.26-8.89,2.86-4.04-2.24,10.86-5.9,21.39-7.77,32.35-.41,2.43.68,1.36,2.04,1.46M280.87,215.69s13.77,38.06-4.01,67.55c0,0-4.33-10.01-8.63-19.33,0,0-2.46-39.09,12.64-48.22ZM284.1,326.52s-5.07-30.36,8.9-53.74c13.97-23.38,13.31-23.8,13.31-23.8,0,0-5.96,66.51-19.96,78.2l-2.25-.67ZM279.62,382.55s-5.6-38.61,37.02-59.46c0,0-2.47,36.83-37.02,59.46ZM268.84,64.2c0,11.65-9.44,21.09-21.09,21.09-11.65,0-21.09-9.44-21.09-21.09,0-11.65,9.44-21.09,21.09-21.09,11.65,0,21.09,9.44,21.09,21.09ZM295.76,148.05h-27.26l-20.95-36.29-34.58,59.89h-.15s-13.63,23.61-13.63,23.61h-26.95l13.63-23.61h-.15l47.52-82.31c3.82,3.81,9.08,6.16,14.9,6.16,5.45,0,10.39-2.08,14.13-5.47l33.49,58.01ZM352.89,370.53c-18.48,32.52-61.15,100.4-106.31,130.72l-.25-.31c-30.53-15.38-55.01-61.31-75.24-90.25h20.78c12.11,16.96,21.89,31.55,26.98,34.26.87.46,1.74.8,2.62,1.04.07.02.13.03.2.04.13.03.26.05.39.08,1.26.23,2.49.28,3.65.15,4.48-.6,8.96-3.94,9.56-9.23,1.63-14.42,3.79-44.25,3.79-44.25,10.8,0,9.07,0,17.5,0,1.09,27.15.31,42.41,3.98,48.65s10.41,5.44,13.82,3.62c11.7-6.22,37.25-30.03,47.87-50.09-8.12,0-23.09,0-27.98,0,35.03-14.87,22.53-9.58,58.65-24.43Z"/>
</svg>
`;
    
    // Debugging: Check SVG content string
    console.log('mainTaazLogoSvgContent length:', mainTaazLogoSvgContent.length);
    console.log('mainTaazLogoSvgContent starts with:', mainTaazLogoSvgContent.substring(0, 50));

    // Create a temporary div to parse the SVG string
    const tempSvgContainer = document.createElement('div');
    try {
        tempSvgContainer.innerHTML = mainTaazLogoSvgContent;
    } catch (e) {
        console.error('Error setting innerHTML for tempSvgContainer:', e);
        // Fallback to placeholder if innerHTML assignment fails
        const fallbackImage = document.createElement('img');
        fallbackImage.src = "https://placehold.co/108x108/cccccc/000000?text=Logo+Error";
        fallbackImage.alt = "Logo Error";
        fallbackImage.classList.add('taaz-main-logo');
        logoContainer.appendChild(fallbackImage);
        mainContainer.appendChild(logoContainer); // Ensure logoContainer is appended even on error
        return; // Exit renderApp if SVG parsing fails critically
    }

    const svgElement = tempSvgContainer.firstChild;

    // Debugging: Check tempSvgContainer and svgElement after parsing
    console.log('tempSvgContainer:', tempSvgContainer);
    console.log('svgElement:', svgElement);

    if (svgElement instanceof SVGElement) { // Ensure it's an SVGElement
        svgElement.classList.add('taaz-main-logo'); // Add the class for styling
        logoContainer.appendChild(svgElement); // Append the created SVG element to its container
    } else {
        console.error('Failed to parse SVG content for main logo. svgElement is not an SVGElement. Value:', svgElement);
        // Fallback to a placeholder image if SVG parsing fails
        const fallbackImage = document.createElement('img');
        fallbackImage.src = "https://placehold.co/108x108/cccccc/000000?text=Logo+Error";
        fallbackImage.alt = "Logo Error";
        fallbackImage.classList.add('taaz-main-logo');
        logoContainer.appendChild(fallbackImage);
    }
    
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
            // All direct content sections (including "דבר ראש מרכז תע״ץ") now get the 'content-section' class.
            contentDiv.className = 'content-section'; 
            contentDiv.innerHTML = section.contentHtml;
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

        const img = document.createElement('img');
        img.src = linkData.imgSrc;
        img.alt = linkData.alt;
        img.loading = "lazy"; // Add lazy loading to footer icons
        // Fallback image in case the provided URL fails
        img.onerror = function() { this.src = 'https://placehold.co/32x32/cccccc/000000?text=Error'; }; 
        iconContainer.appendChild(img);
        
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
                    background-color: #28a745;\r
                    color: white;\r
                    padding: 10px 15px;\r
                    border-radius: 8px;\r
                    z-index: 1060;\r
                    opacity: 0;\r
                    transition: opacity 0.3s ease-out;\r
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
