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

/**
 * InfoModal component: Renders a custom modal for displaying detailed content.
 * @param {boolean} isOpen - Whether the modal should be open or closed.
 * @param {function} onClose - Callback function to close the modal.
 * @param {string} content - The HTML content to display inside the modal.
 * @returns {HTMLElement|string} The modal backdrop element if open, otherwise an empty string.
 */
function InfoModal(isOpen, onClose, content) {
    if (!isOpen) return '';

    // Create a temporary div to parse the content string and extract the title
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    let modalTitleText = "מידע נוסף"; // Default title
    const firstH2 = tempDiv.querySelector('h2');
    if (firstH2) {
        modalTitleText = firstH2.textContent;
        firstH2.remove(); // Remove the h2 from the content that goes into the scrollable body
    }
    const cleanedContent = tempDiv.innerHTML; // Content without the first h2

    // Create backdrop element
    const backdrop = document.createElement('div');
    backdrop.className = 'custom-modal-backdrop';
    backdrop.onclick = onClose; // Close modal when clicking backdrop

    // Create modal content container
    const modalContent = document.createElement('div');
    // Ensure proper class is used for modal content sizing
    modalContent.className = 'custom-modal-content';
    modalContent.setAttribute('dir', 'rtl'); // Set direction for RTL
    modalContent.onclick = (e) => e.stopPropagation(); // Prevent closing when clicking inside modal

    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'custom-modal-header';
    modalHeader.setAttribute('dir', 'rtl'); // Ensure RTL for header

    const headerTitle = document.createElement('h2');
    headerTitle.className = 'custom-modal-title';
    headerTitle.textContent = modalTitleText;

    const closeButton = document.createElement('button');
    closeButton.className = 'custom-modal-close-button';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.innerHTML = '&times;'; // '×' character for close icon
    closeButton.onclick = onClose;

    modalHeader.appendChild(headerTitle);
    modalHeader.appendChild(closeButton);

    // Create scrollable body for content
    const modalScrollableBody = document.createElement('div');
    modalScrollableBody.className = 'custom-modal-scrollable-body modal-content-scrollable';
    modalScrollableBody.innerHTML = cleanedContent;

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalScrollableBody);
    backdrop.appendChild(modalContent);

    // Add 'show' class for animation after a small delay
    setTimeout(() => {
        backdrop.classList.add('show');
        document.body.classList.add('modal-open'); // Add class to body for background opacity effect and to disable scroll
    }, 10);

    return backdrop;
}

/**
 * AccordionItem component: Renders a collapsible accordion item.
 * @param {string} title - The title of the accordion item.
 * @param {string} summary - A brief summary displayed below the title.
 * @param {HTMLElement[]} childrenElements - Array of child elements (SubCards) to display when expanded.
 * @param {string} sectionId - Unique ID for the section, used for filtering.
 * @param {boolean} isDirectContent - If true, contentHtml is rendered directly, no sub-cards.
 * @param {string} contentHtml - HTML content to display directly if isDirectContent is true.
 * @returns {HTMLElement} The accordion item div element.
 */
function AccordionItem(title, summary, childrenElements, sectionId, isDirectContent = false, contentHtml = '') {
    const accordionDiv = document.createElement('div');
    accordionDiv.className = 'rounded-4 overflow-hidden border transition-all duration-300 mb-3 accordion-item-container';
    accordionDiv.style.cssText = 'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);';
    accordionDiv.dataset.sectionId = sectionId; // Store section ID for filtering

    const button = document.createElement('button');
    // Adjusted font size for accordion titles (fs-6 for smaller text) and padding
    button.className = 'btn w-100 py-2 px-3 text-primary-dark fs-6 fw-semibold d-flex justify-content-between align-items-center bg-white bg-opacity-80 transition-all duration-300 focus-ring-0 accordion-header-button'; // Removed hover classes
    button.style.color = '#0A4A7A';
    button.innerHTML = `
        ${title}
        <span class="transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" style="width: 1.25rem; height: 1.25rem; color: #0A4A7A;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </span>
    `;

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'overflow-hidden px-4 pb-2 pt-1 text-end';

    if (isDirectContent) {
        contentWrapper.innerHTML = contentHtml; // Directly embed content
    } else {
        contentWrapper.innerHTML = `
            <p class="mb-3 fs-6" style="color: #0A4A7A;">${summary}</p>
            <div class="d-grid gap-2 sub-card-container"></div> <!-- Container for sub-cards -->
        `;
        const subCardContainer = contentWrapper.querySelector('.sub-card-container');
        childrenElements.forEach(child => {
            subCardContainer.appendChild(child);
        });
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'collapse-grid'; // Class for grid-based collapse animation
    contentDiv.appendChild(contentWrapper);

    // Event listener for button click to toggle accordion
    button.addEventListener('click', () => {
        const isOpen = accordionDiv.classList.toggle('open');
        contentDiv.classList.toggle('show', isOpen);
        button.classList.toggle('open', isOpen);
    });

    accordionDiv.appendChild(button);
    accordionDiv.appendChild(contentDiv);
    return accordionDiv;
}

/**
 * SubCard component: Renders a button that acts as a sub-item in an accordion.
 * @param {string} title - The title of the sub-card.
 * @param {function} onClick - Callback function when the sub-card is clicked.
 * @param {string} subItemId - Unique ID for the sub-item, used for filtering.
 * @returns {HTMLElement} The sub-card button element.
 */
function SubCard(title, onClick, subItemId) {
    const button = document.createElement('button');
    button.className = `btn w-100 py-2 px-3 bg-white bg-opacity-70 rounded-3 shadow-sm border border-info
                        text-primary-dark fs-6 fw-medium transition-all duration-200
                        focus-ring-0 text-end position-relative overflow-hidden mb-2 subcard-button`; // Removed hover classes
    button.style.color = '#0A4A7A';
    button.dataset.subItemId = subItemId; // Store sub-item ID for filtering
    button.innerHTML = `
        <span class="position-absolute inset-0 bg-white opacity-0 transition-opacity duration-300 shimmer" style="border-radius: 0.75rem;"></span>
        ${title}
    `;
    button.onclick = onClick;
    return button;
}

/**
 * Debounce utility function.
 * @param {function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {function} The debounced function.
 */
const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
};

/**
 * Initializes the application by rendering the main content and setting up event listeners.
 * @param {object} contentData - The data object containing titles, paragraphs, sections, etc.
 */
function initializeApp(contentData) {
    const appRoot = document.getElementById('app-root');
    let currentModal = null;
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

    /**
     * Opens the custom modal with the given content.
     * @param {string} content - The HTML content to display in the modal.
     */
    const openModal = (content) => {
        if (currentModal) {
            currentModal.remove(); // Remove existing modal if any
        }
        const modalElement = InfoModal(true, closeModal, content);
        document.body.appendChild(modalElement);
        currentModal = modalElement;
    };

    /**
     * Closes the currently open modal.
     */
    const closeModal = () => {
        if (currentModal) {
            // Start hide animation by removing 'show' class
            currentModal.classList.remove('show');
            document.body.classList.remove('modal-open'); // Remove class from body to restore background opacity and enable scroll
            // Wait for animation to finish before removing the element
            setTimeout(() => {
                if (currentModal) {
                    currentModal.remove();
                    currentModal = null;
                }
            }, 300); // Match CSS transition duration for smooth closing
        }
    };

    // Clear existing content in app-root to prevent duplicates on re-initialization
    appRoot.innerHTML = '';

    // Create the main container for the application content
    const mainContainer = document.createElement('div');
    mainContainer.className = 'position-relative w-100 max-w-2xl mx-auto p-4 bg-white bg-opacity-95 rounded-4 shadow-lg border border-info text-center animate-main-container';
    mainContainer.setAttribute('dir', 'rtl'); // Set direction for RTL
    mainContainer.style.cssText = 'backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);';

    // Add a subtle background shimmer effect for visual appeal
    const shimmerDiv = document.createElement('div');
    shimmerDiv.className = 'position-absolute inset-0 rounded-4 pointer-events-none';
    shimmerDiv.style.cssText = 'background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%); mask-image: radial-gradient(ellipse at center, transparent 0%, transparent 70%, black 100%); -webkit-mask-image: radial-gradient(ellipse at center, transparent 0%, transparent 70%, black 100%);';
    mainContainer.appendChild(shimmerDiv);

    // Create logo container at the top
    const logoContainer = document.createElement('div');
    logoContainer.className = 'd-flex justify-content-between align-items-center mb-4 w-100 logo-container';
    // Manual animation for initial fade-in from top
    logoContainer.style.cssText = 'transform: translateY(-30px); opacity: 0; animation: fadeInFromTop 0.5s ease-out 0.2s forwards;';

    // Left Logo (Abstract Family) - Smaller SVG size (w-16 h-16)
    const familySvg = createSvgElement('svg', {
        viewBox: "0 0 24 24",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        'xmlns:xlink': "http://www.w3.org/1999/xlink",
        class: "w-16 h-16 object-contain"
    });
    familySvg.innerHTML = `
        <path d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 10c-2.76 0-5 2.24-5 5v3h10v-3c0-2.76-2.24-5-5-5z" fill="#0A4A7A" />
        <circle cx="9" cy="18" r="2" fill="#50B8EE" />
        <path d="M9 20v2h6v-2c0-1.1-.9-2-2-2H11c-1.1 0-2 .9-2 2z" fill="#50B8EE" />
        <path d="M12 4.24C10.86 3.09 9.29 2.5 7.5 2.5 4.42 2.5 2 4.92 2 8c0 2.5 1.5 4.5 4 6.5 2.5 2 5 3.5 6 4.5 1-1 3.5-2.5 6-4.5 2.5-2 4-4 4-6.5 0-3.08-2.42-5.5-5.5-5.5-1.79 0-3.36.59-4.5 1.74z" fill="#50B8EE" fill-opacity="0.5" />
    `;
    logoContainer.appendChild(familySvg);

    // Original Right Logo (Abstract Waves/Flow)
    const wavesSvg = createSvgElement('svg', {
        id: "Layer_1",
        'data-name': "Layer 1",
        xmlns: "http://www.w3.org/2000/svg",
        'xmlns:xlink': "http://www.w3.org/1999/xlink",
        viewBox: "0 0 568.89 544.35",
        class: "w-16 h-16 object-contain"
    });
    wavesSvg.innerHTML = `
        <defs>
            <style>
                .cls-1 { fill: url(#New_Gradient_Swatch_3); }
            </style>
            <linearGradient id="New_Gradient_Swatch_3" data-name="New Gradient Swatch 3" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#50B8EE" />
                <stop offset=".75" stop-color="#0A4A7A" />
            </linearGradient>
        </defs>
        <path class="cls-1" d="M279.38,165.52s94.58-21.59,232.28-1.82c-32.91,37.96-83.84,21.5-126.51,20.23-21.16-.63-34.45-2.86-93.06,3.6-9.59-16.59-12.71-22-12.71-22ZM491.28,192.8c-20.38-1.2-63.93,6.68-78.36,4.74-51.04-6.86-115.63-1.29-115.63-1.29l11.84,21.1c56.62-2.27,85.83,8.48,122.15,4.22,19.75-2.31,45.86-14.8,59.99-28.77ZM384.91,230.74c-34.54-4.59-52.58-7.49-71.28-5.94l14.02,24.27c32.88,1.5,64.99,6.68,79.97,4.15,13.57-2.29,36.07-15.44,45.81-25.48-22.92,1.18-45.62,6.05-68.53,3ZM365.88,395h73.44l-65.81-113.98-2.58-4.6c10.71-3.17,23.37-8.11,29.35-14.01,0,0-17.42,1.64-35.82-1.4-10.22-1.69-21.34-2.9-32-3.63l12.96,22.43c.12,0,.24,0,.36.01l-.28.26.04.07.04-.07,13.93,24.13.04.07-.04.07,37.87,65.59h-17.05l-14.47,25.05ZM117.11,276.84l17.14,29.97,13.44-23.27-.04-.07-.04.07-13.44-23.27-.04-.07.04-.07-36.52-63.25h46.31l13.47-23.34H57.23l59.79,103.56.09-.26ZM169.93,371.18h-72.57l22.95-39.75-13.34-23.1-1.45,2.79.34-.99-48.62,84.21h126.07l-12.22-23.17h-1.16ZM264.1,274.93c-10.25-11.49-24.73-16.49-30.33-17.91-1.44-.37-1.92-56.89,13.77-86.14,14.98,19.76,16.55,104.06,16.55,104.06ZM278.13,387.8h-58.39c8.52-11.74,17.6-3.77,28.02-3.38,10.64.4,20.89-6.32,30.36,3.38ZM234.61,297.95c-1.85-1.38-1.15-15.82-2.26-19.07l31.56,18.22-.66,20.24c-7.79-12.72-28.64-19.4-28.64-19.4ZM255.02,380.62s-17.4.81-21.56-3.68l.03-53.25c1.8,1.51,29.17,20.52,29.72,23.5.83,4.4.25,23.81.09,28.65-.17,4.97-8.28,4.78-8.28,4.78ZM278.14,277.89,274.69,245.84,283.48,335.34c-3.17,11.85-2.94,28.52-8.21,39.87-.62,1.34-1.17,3.14-2.85,3.43,14.86-42.24-42.44-45.97-51.52-80.13,20.19,1.62,33.4,6.21,43.71,24.4,0,0,10.09,23.19,9.86,17.17-.15-3.76-1.68-21.69-3.41-24.77-1.78-3.16-6.35-2.42-5.54-8.16.75-5.32,8.8-5.55,10.14-.97,1.22,4.17-2.1,6.4-2.14,10.01-.04,3.61,1.84,9.76,2.31,13.79.12,1.03-.73,13.7,2.3,9.71l.39-34.07c-15.79-15.91-38.27-15.93-50.98-36.11-.77-1.23-9.3-17.84-6.08-16.81,9.51,6.19,21.64,8.28,30.92,14.88,4.3,3.06,11.82,10.74,14.52,15.25.7,1.17,3.34,6.8,6.01,11.16,1.63,2.65,1.34,7.47,4.07,9.08-1.81-28.8-7.96-27.78-12.55-41.04l-.33-3.74s14.04,23.02,15.6,43.16l4.5-28.14c-1.67-4.83,1.08-7.27,1.08-7.27,6.02-2.59,8.3,5.74,5.54,9.96-1.13,1.73-3.75.68-5.04,3.33-2.87,5.88-5.49,27.67-5.44,34.64.03,4.21,1.14,12.87,2.95,16.58,1.01-11.69,3.61-23.1,6.86-34.34.11-.39,2.26-8.89,2.86-4.04-2.24,10.86-5.9,21.39-7.77,32.35-.41,2.43.68,1.36,2.04,1.46M280.87,215.69s13.77,38.06-4.01,67.55c0,0-4.33-10.01-8.63-19.33,0,0-2.46-39.09,12.64-48.22ZM284.1,326.52s-5.07-30.36,8.9-53.74c13.97-23.38,13.31-23.8,13.31-23.8,0,0-5.96,66.51-19.96,78.2l-2.25-.67ZM279.62,382.55s-5.6-38.61,37.02-59.46c0,0-2.47,36.83-37.02,59.46ZM268.84,64.2c0,11.65-9.44,21.09-21.09,21.09-11.65,0-21.09-9.44-21.09-21.09,0-11.65,9.44-21.09,21.09,21.09ZM295.76,148.05h-27.26l-20.95-36.29-34.58,59.89h-.15s-13.63,23.61-13.63,23.61h-26.95l13.63-23.61h-.15l47.52-82.31c3.82,3.81,9.08,6.16,14.9,6.16,5.45,0,10.39-2.08,14.13-5.47l33.49,58.01ZM352.89,370.53c-18.48,32.52-61.15,100.4-106.31,130.72l-.25-.31c-30.53-15.38-55.01-61.31-75.24-90.25h20.78c12.11,16.96,21.89,31.55,26.98,34.26.87.46,1.74.8,2.62,1.04.07.02.13.03.2.04.13.03.26.05.39.08,1.26.23,2.49.28,3.65.15,4.48-.6,8.96-3.94,9.56-9.23,1.63-14.42,3.79-44.25,3.79-44.25,10.8,0,9.07,0,17.5,0,1.09,27.15.31,42.41,3.98,48.65s10.41,5.44,13.82,3.62c11.7-6.22,37.25-30.03,47.87-50.09-8.12,0-23.09,0-27.98,0,35.03-14.87,22.53-9.58,58.65-24.43Z" />
    `;
    logoContainer.appendChild(wavesSvg);

    mainContainer.appendChild(logoContainer);

    // Create main title
    const mainTitle = document.createElement('h1');
    mainTitle.className = 'text-3xl md:text-4xl font-extrabold mb-2 text-primary-dark';
    mainTitle.style.color = '#0A4A7A';
    mainTitle.textContent = contentData.mainTitle;
    mainContainer.appendChild(mainTitle);

    // Create introductory paragraphs
    contentData.introParagraphs.forEach(paragraphText => {
        const p = document.createElement('p');
        // Changed font size to fs-6 for smaller introductory text
        p.className = 'fs-6 lh-base mb-2 text-primary-dark';
        p.style.color = '#0A4A7A';
        p.textContent = paragraphText;
        mainContainer.appendChild(p);
    });

    // Create motto
    const motto = document.createElement('p');
    // Changed font size to fs-6 for smaller motto text
    motto.className = 'fs-6 fw-bold lh-base mt-4 mb-4 text-primary-dark';
    motto.style.color = '#0A4A7A';
    motto.textContent = contentData.motto;
    mainContainer.appendChild(motto);

    // Create search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'חיפוש...';
    searchInput.className = 'form-control form-control-lg mb-4 text-end px-4 py-2 rounded-pill shadow-sm border border-info focus-ring-0';
    // Changed background color to a "burnt"/earthy tone
    searchInput.style.cssText = 'background-color: #F5E5D0; color: #0A4A7A; border-color: #B5D0E8;';
    mainContainer.appendChild(searchInput);

    // Create accordion container
    const accordionContainer = document.createElement('div');
    accordionContainer.className = 'accordion-container mb-4';
    mainContainer.appendChild(accordionContainer);

    // Render accordion sections
    contentData.sections.forEach(section => {
        if (section.isDirectContent) {
            // For direct content sections, pass the contentHtml directly
            const accordionItem = AccordionItem(section.title, '', [], section.id, true, section.contentHtml);
            accordionContainer.appendChild(accordionItem);
        } else {
            // For regular sections, map subItems to SubCard components
            const subCardElements = section.subItems.map(subItem =>
                SubCard(subItem.title, () => openModal(subItem.content), subItem.id)
            );
            const accordionItem = AccordionItem(section.title, section.summary, subCardElements, section.id);
            accordionContainer.appendChild(accordionItem);
        }
    });

    // Create signature section
    const signatureDiv = document.createElement('div');
    signatureDiv.className = 'text-center mt-4 mb-4';
    contentData.signature.forEach(line => {
        const p = document.createElement('p');
        p.className = 'fs-6 lh-base text-primary-dark';
        p.style.color = '#0A4A7A';
        p.textContent = line;
        signatureDiv.appendChild(p);
    });
    mainContainer.appendChild(signatureDiv);

    // Create footer card for external links
    const footerCard = document.createElement('div');
    footerCard.className = 'd-flex flex-column flex-sm-row justify-content-between align-items-center p-3 mt-4 rounded-4 shadow-md footer-card';
    footerCard.style.cssText = 'background-color: #E0F2F7; border: 1px solid #B5D0E8;';

    const footerTitle = document.createElement('p');
    footerTitle.className = 'fs-6 fw-semibold text-primary-dark mb-2 mb-sm-0 margin-inline-end-auto footer-title';
    footerTitle.style.color = '#0A4A7A';
    footerTitle.textContent = 'קישורים שימושיים:';
    footerCard.appendChild(footerTitle);

    const footerLinksContainer = document.createElement('div');
    footerLinksContainer.className = 'd-flex gap-3 footer-links-container';

    // Taaz link
    const taazLink = document.createElement('a');
    taazLink.href = 'https://www.taaz.org.il/';
    taazLink.target = '_blank'; // Open in new tab
    taazLink.rel = 'noopener noreferrer'; // Security best practice
    taazLink.className = 'footer-link';
    taazLink.innerHTML = `
        <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" class="taaz-svg">
            <rect width="54" height="54" rx="12" fill="url(#paint0_linear_3797_24326)"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M19.9072 13.6335L29.7484 18.9149L33.1826 14.6222L33.2298 14.5745C34.2858 13.5087 35.4994 12.9409 36.7206 12.8732C37.9355 12.8059 39.0562 13.241 39.8951 13.9947C41.6039 15.5299 42.0566 18.2616 40.3619 20.7257L36.9124 25.7397L34.8267 24.3048L38.2759 19.2911C39.3018 17.7995 38.8995 16.5034 38.2032 15.8779C37.8396 15.5512 37.3703 15.3727 36.8607 15.401C36.3686 15.4282 35.7405 15.6555 35.0731 16.3116L30.4085 22.1423L18.6666 15.8409L18.6447 15.828C17.8043 15.3327 17.121 15.2689 16.6311 15.3678C16.1334 15.4683 15.7353 15.7548 15.4802 16.1383C15.0049 16.8527 14.9691 18.0174 16.2099 18.9435L38.6271 31.6451C40.655 32.5742 41.4795 34.688 41.2739 36.5127C41.0599 38.412 39.691 40.2655 37.2047 40.3999L37.1705 40.4018H17.3023L17.2476 40.397C15.7023 40.2627 14.4748 39.6642 13.6533 38.7236C12.8399 37.7923 12.5107 36.6224 12.581 35.5044C12.721 33.2774 14.4779 31.0981 17.3573 31.0981H23.3698V33.6298H17.3573C15.9645 33.6298 15.1735 34.615 15.1076 35.6633C15.075 36.1829 15.2283 36.6784 15.5601 37.0583C15.8783 37.4226 16.4444 37.7754 17.4153 37.8702H37.0986C38.1055 37.803 38.6568 37.1294 38.7582 36.2292C38.867 35.264 38.413 34.3169 37.5435 33.9335L37.4853 33.9079L14.8376 21.0757L14.7816 21.0354C12.4052 19.323 12.1219 16.6156 13.3724 14.736C13.9834 13.8176 14.9479 13.1249 16.1302 12.8862C17.3134 12.6474 18.6191 12.8807 19.9072 13.6335Z" fill="white"/>
            <defs>
                <linearGradient id="paint0_linear_3797_24326" x1="15.6094" y1="8.4375" x2="60.75" y2="36.7031" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#F29F05"/>
                    <stop offset="0.484653" stop-color="#37A647"/>
                    <stop offset="1" stop-color="#1B62BF"/>
                </linearGradient>
            </defs>
        </svg>
    `;
    footerLinksContainer.appendChild(taazLink);

    // Tsad360 link
    const tsad360Link = document.createElement('a');
    tsad360Link.href = 'https://www.home.idf.il/';
    tsad360Link.target = '_blank'; // Open in new tab
    tsad360Link.rel = 'noopener noreferrer'; // Security best practice
    tsad360Link.className = 'footer-link';
    tsad360Link.innerHTML = `
        <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" class="tsad360-svg">
            <rect width="54" height="54" rx="12" fill="url(#paint0_linear_3797_24326)"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M19.9072 13.6335L29.7484 18.9149L33.1826 14.6222L33.2298 14.5745C34.2858 13.5087 35.4994 12.9409 36.7206 12.8732C37.9355 12.8059 39.0562 13.241 39.8951 13.9947C41.6039 15.5299 42.0566 18.2616 40.3619 20.7257L36.9124 25.7397L34.8267 24.3048L38.2759 19.2911C39.3018 17.7995 38.8995 16.5034 38.2032 15.8779C37.8396 15.5512 37.3703 15.3727 36.8607 15.401C36.3686 15.4282 35.7405 15.6555 35.0731 16.3116L30.4085 22.1423L18.6666 15.8409L18.6447 15.828C17.8043 15.3327 17.121 15.2689 16.6311 15.3678C16.1334 15.4683 15.7353 15.7548 15.4802 16.1383C15.0049 16.8527 14.9691 18.0174 16.2099 18.9435L38.6271 31.6451C40.655 32.5742 41.4795 34.688 41.2739 36.5127C41.0599 38.412 39.691 40.2655 37.2047 40.3999L37.1705 40.4018H17.3023L17.2476 40.397C15.7023 40.2627 14.4748 39.6642 13.6533 38.7236C12.8399 37.7923 12.5107 36.6224 12.581 35.5044C12.721 33.2774 14.4779 31.0981 17.3573 31.0981H23.3698V33.6298H17.3573C15.9645 33.6298 15.1735 34.615 15.1076 35.6633C15.075 36.1829 15.2283 36.6784 15.5601 37.0583C15.8783 37.4226 16.4444 37.7754 17.4153 37.8702H37.0986C38.1055 37.803 38.6568 37.1294 38.7582 36.2292C38.867 35.264 38.413 34.3169 37.5435 33.9335L37.4853 33.9079L14.8376 21.0757L14.7816 21.0354C12.4052 19.323 12.1219 16.6156 13.3724 14.736C13.9834 13.8176 14.9479 13.1249 16.1302 12.8862C17.3134 12.6474 18.6191 12.8807 19.9072 13.6335Z" fill="white"/>
            <defs>
                <linearGradient id="paint0_linear_3797_24326" x1="15.6094" y1="8.4375" x2="60.75" y2="36.7031" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#F29F05"/>
                    <stop offset="0.484653" stop-color="#37A647"/>
                    <stop offset="1" stop-color="#1B62BF"/>
                </linearGradient>
            </defs>
        </svg>
    `;
    footerLinksContainer.appendChild(tsad360Link);

    // New IDF link with provided SVG
    const idfLink = document.createElement('a');
    idfLink.href = 'https://www.idf.il/';
    idfLink.target = '_blank'; // Open in new tab
    idfLink.rel = 'noopener noreferrer'; // Security best practice
    idfLink.className = 'footer-link';
    idfLink.innerHTML = `
        <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" class="idf-svg">
            <rect width="54" height="54" rx="12" fill="url(#paint0_linear_3797_24326)"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M19.9072 13.6335L29.7484 18.9149L33.1826 14.6222L33.2298 14.5745C34.2858 13.5087 35.4994 12.9409 36.7206 12.8732C37.9355 12.8059 39.0562 13.241 39.8951 13.9947C41.6039 15.5299 42.0566 18.2616 40.3619 20.7257L36.9124 25.7397L34.8267 24.3048L38.2759 19.2911C39.3018 17.7995 38.8995 16.5034 38.2032 15.8779C37.8396 15.5512 37.3703 15.3727 36.8607 15.401C36.3686 15.4282 35.7405 15.6555 35.0731 16.3116L30.4085 22.1423L18.6666 15.8409L18.6447 15.828C17.8043 15.3327 17.121 15.2689 16.6311 15.3678C16.1334 15.4683 15.7353 15.7548 15.4802 16.1383C15.0049 16.8527 14.9691 18.0174 16.2099 18.9435L38.6271 31.6451C40.655 32.5742 41.4795 34.688 41.2739 36.5127C41.0599 38.412 39.691 40.2655 37.2047 40.3999L37.1705 40.4018H17.3023L17.2476 40.397C15.7023 40.2627 14.4748 39.6642 13.6533 38.7236C12.8399 37.7923 12.5107 36.6224 12.581 35.5044C12.721 33.2774 14.4779 31.0981 17.3573 31.0981H23.3698V33.6298H17.3573C15.9645 33.6298 15.1735 34.615 15.1076 35.6633C15.075 36.1829 15.2283 36.6784 15.5601 37.0583C15.8783 37.4226 16.4444 37.7754 17.4153 37.8702H37.0986C38.1055 37.803 38.6568 37.1294 38.7582 36.2292C38.867 35.264 38.413 34.3169 37.5435 33.9335L37.4853 33.9079L14.8376 21.0757L14.7816 21.0354C12.4052 19.323 12.1219 16.6156 13.3724 14.736C13.9834 13.8176 14.9479 13.1249 16.1302 12.8862C17.3134 12.6474 18.6191 12.8807 19.9072 13.6335Z" fill="white"/>
            <defs>
                <linearGradient id="paint0_linear_3797_24326" x1="15.6094" y1="8.4375" x2="60.75" y2="36.7031" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#F29F05"/>
                    <stop offset="0.484653" stop-color="#37A647"/>
                    <stop offset="1" stop-color="#1B62BF"/>
                </linearGradient>
            </defs>
        </svg>
    `;
    footerLinksContainer.appendChild(idfLink);

    footerCard.appendChild(footerLinksContainer);
    mainContainer.appendChild(footerCard);


    appRoot.appendChild(mainContainer);

    // Manual animation for logo container to ensure it plays after content is appended
    setTimeout(() => {
        logoContainer.style.transform = 'translateY(0)';
        logoContainer.style.opacity = '1';
    }, 200);

    // Debounced version of filterAccordions
    const debouncedFilterAccordions = debounce(filterAccordions, 300); // 300ms delay

    // Search functionality: filters accordion items and sub-items based on search term
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        debouncedFilterAccordions(searchTerm); // Use the debounced function
    });

    /**
     * Filters accordion items and their sub-items based on a search term.
     * Accordions expand if a match is found within them or their sub-items.
     * Non-matching sub-items are dimmed and disabled.
     * @param {string} searchTerm - The text to search for (case-insensitive).
     */
    function filterAccordions(searchTerm) {
        const allAccordionItems = document.querySelectorAll('.accordion-item-container');

        allAccordionItems.forEach(accordionDiv => {
            const sectionId = accordionDiv.dataset.sectionId;
            const sectionData = contentData.sections.find(s => s.id === sectionId);
            const accordionButton = accordionDiv.querySelector('.accordion-header-button');
            const accordionContentDiv = accordionDiv.querySelector('.collapse-grid');
            const subCardButtons = accordionDiv.querySelectorAll('.subcard-button');

            let sectionMatches = false;
            let anySubItemMatches = false;

            // Check if the main accordion title or summary matches the search term
            if (sectionData.title.toLowerCase().includes(searchTerm) ||
                (sectionData.summary && sectionData.summary.toLowerCase().includes(searchTerm))) {
                sectionMatches = true;
            }

            // Check sub-items for matches and adjust their visibility/interactivity
            // Only iterate sub-items if it's not a direct content section
            if (!sectionData.isDirectContent) {
                subCardButtons.forEach((subCardButton, index) => {
                    const subItemData = sectionData.subItems[index];
                    const subItemContent = subItemData.content.toLowerCase();
                    const subItemTitle = subItemData.title.toLowerCase();

                    if (subItemTitle.includes(searchTerm) || subItemContent.includes(searchTerm)) {
                        subCardButton.style.opacity = '1'; // Full opacity if matches
                        subCardButton.style.pointerEvents = 'auto'; // Enable clicks
                        anySubItemMatches = true;
                        sectionMatches = true; // If a sub-item matches, the parent section must be shown
                    } else {
                        // Dim non-matching sub-items and disable clicks if a search term is active
                        if (searchTerm !== '') {
                            subCardButton.style.opacity = '0.3';
                            subCardButton.style.pointerEvents = 'none';
                        } else {
                            // If search term is empty, reset sub-item styles
                            subCardButton.style.opacity = '1';
                            subCardButton.style.pointerEvents = 'auto';
                        }
                    }
                });
            } else {
                // For direct content section, check its contentHtml
                if (sectionData.contentHtml.toLowerCase().includes(searchTerm)) {
                    sectionMatches = true;
                }
            }


            // Control visibility and expansion of the main accordion item
            if (searchTerm === '') {
                // If search is empty, show all accordions and collapse them
                accordionDiv.style.display = '';
                accordionDiv.classList.remove('open');
                accordionContentDiv.classList.remove('show');
                accordionButton.classList.remove('open');
                if (!sectionData.isDirectContent) { // Only reset sub-card styles for non-direct content
                    subCardButtons.forEach(btn => { // Ensure all sub-cards are visible when search is cleared
                        btn.style.opacity = '1';
                        btn.style.pointerEvents = 'auto';
                    });
                }
            } else if (sectionMatches) {
                // If the section or any of its sub-items match, show the section
                accordionDiv.style.display = '';
                // Open the accordion if a sub-item matched or the main accordion itself matched
                if (anySubItemMatches || sectionData.title.toLowerCase().includes(searchTerm) || (sectionData.summary && sectionData.summary.toLowerCase().includes(searchTerm)) || (sectionData.isDirectContent && sectionData.contentHtml.toLowerCase().includes(searchTerm))) {
                    accordionDiv.classList.add('open');
                    accordionContentDiv.classList.add('show');
                    accordionButton.classList.add('open');
                } else {
                    // If only the main accordion title/summary matched, but no sub-items, keep it collapsed
                    accordionDiv.classList.remove('open');
                    accordionContentDiv.classList.remove('show');
                    accordionButton.classList.remove('open');
                }
            } else {
                // Hide the accordion if no match is found
                accordionDiv.style.display = 'none';
            }
        });
    }

    // Scroll-to-top button functionality: shows/hides based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // Show button after scrolling 300px down
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    // Smooth scroll to top when button is clicked
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Feature: Keyboard navigation for accordions and sub-cards
    let focusableElements = [];
    let currentFocus = -1;

    /** Updates the list of focusable elements (accordion buttons and sub-card buttons). */
    function updateFocusableElements() {
        focusableElements = Array.from(document.querySelectorAll('.accordion-header-button, .subcard-button'));
    }

    document.addEventListener('keydown', (e) => {
        updateFocusableElements(); // Re-scan focusable elements on each keydown for dynamic content
        if (focusableElements.length === 0) return; // No focusable elements to navigate

        if (e.key === 'ArrowDown') {
            e.preventDefault(); // Prevent default scroll behavior
            currentFocus = (currentFocus + 1) % focusableElements.length;
            focusableElements[currentFocus].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault(); // Prevent default scroll behavior
            currentFocus = (currentFocus - 1 + focusableElements.length) % focusableElements.length;
            focusableElements[currentFocus].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            // Trigger click event on focused element when Enter or Space is pressed
            if (currentFocus !== -1) {
                e.preventDefault(); // Prevent default spacebar scroll
                focusableElements[currentFocus].click();
            }
        }
    });

    // Feature: Copy to Clipboard on Modal Content Click (for paragraphs and list items)
    document.addEventListener('click', (event) => {
        // Check if the clicked element is a paragraph or list item within the modal's scrollable body
        // Or if it's a paragraph or list item directly within an open accordion's contentWrapper
        const target = event.target;
        let textToCopy = '';

        if (target.closest('.custom-modal-scrollable-body p, .custom-modal-scrollable-body li')) {
            textToCopy = target.textContent;
        } else if (target.closest('.accordion-item-container.open .collapse-grid p, .accordion-item-container.open .collapse-grid li')) {
            // Ensure it's within a direct content accordion and not a sub-card button itself
            const directContentAccordion = target.closest('.accordion-item-container.open');
            if (directContentAccordion && directContentAccordion.dataset.sectionId === 'head-of-taatz-message') { // Check if it's the direct content accordion
                textToCopy = target.textContent;
            }
        }

        if (textToCopy) {
            try {
                // Use a temporary textarea for copying text to clipboard, as navigator.clipboard.writeText()
                // might have restrictions in iframes or older browsers.
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy'); // Deprecated but widely supported for this use case
                document.body.removeChild(textarea);

                // Provide temporary visual feedback to the user
                const feedbackDiv = document.createElement('div');
                feedbackDiv.textContent = 'הועתק!';
                feedbackDiv.style.cssText = `
                    position: fixed;
                    bottom: 80px;
                    right: 20px;
                    background-color: #28a745; /* Green color for success */
                    color: white;
                    padding: 10px 15px;
                    border-radius: 8px;
                    z-index: 1060; /* Ensure it's above other elements */
                    opacity: 0;
                    transition: opacity 0.3s ease-out;
                `;
                document.body.appendChild(feedbackDiv);
                // Animate fade-in
                setTimeout(() => {
                    feedbackDiv.style.opacity = '1';
                }, 10);
                // Animate fade-out and remove element after a delay
                setTimeout(() => {
                    feedbackDiv.style.opacity = '0';
                    feedbackDiv.addEventListener('transitionend', () => feedbackDiv.remove());
                }, 1500);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                // Optionally, show an error message to the user
            }
        }
    });
}
