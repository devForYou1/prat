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
    modalContent.className = 'custom-modal-content';
    modalContent.setAttribute('dir', 'rtl'); // Set direction for RTL
    modalContent.onclick = (e) => e.stopPropagation(); // Prevent closing when clicking inside modal

    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'custom-modal-header';
    modalHeader.setAttribute('dir', 'rtl'); // Ensure RTL for header

    const headerTitle = document.createElement('h2');
    headerTitle.className = 'custom-modal-title'; // CSS will handle color for h2
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
 * @param {Array<object>} subItemsData - Array of sub-item data (title, content, id).
 * @param {string} sectionId - Unique ID for the section, used for filtering.
 * @param {boolean} isDirectContent - If true, contentHtml is rendered directly, no sub-cards.
 * @param {string} contentHtml - HTML content to display directly if isDirectContent is true.
 * @param {function} openModalCallback - Callback to open the modal.
 * @returns {HTMLElement} The accordion item div element.
 */
function AccordionItem(title, summary, subItemsData, sectionId, isDirectContent = false, contentHtml = '', openModalCallback) {
    const accordionDiv = document.createElement('div');
    accordionDiv.className = 'accordion-item-container';
    accordionDiv.dataset.sectionId = sectionId;

    const button = document.createElement('button');
    button.className = 'accordion-header-button';
    button.setAttribute('aria-expanded', 'false'); // ARIA attribute for accessibility

    const titleSpan = document.createElement('span');
    titleSpan.className = 'accordion-title-text';
    titleSpan.textContent = title;

    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'arrow-icon';
    arrowSpan.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" style="width: 1.25rem; height: 1.25rem; color: #0A4A7A;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
    `;

    button.appendChild(titleSpan);
    button.appendChild(arrowSpan);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'collapse-grid';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'text-end';

    if (isDirectContent) {
        // For direct content, embed HTML directly
        contentWrapper.innerHTML = contentHtml;
    } else {
        // For regular sections, create sub-card container and append sub-cards
        const subCardContainer = document.createElement('div');
        subCardContainer.className = 'd-grid gap-1 sub-card-container';
        subItemsData.forEach(subItem => {
            const subCard = SubCard(subItem.title, () => {
                openModalCallback(subItem.content);
            }, subItem.id);
            subCardContainer.appendChild(subCard);
        });
        contentWrapper.appendChild(subCardContainer); // Append sub-card container to contentWrapper
    }
    
    contentDiv.appendChild(contentWrapper);

    // Event listener for button click to toggle accordion
    button.addEventListener('click', () => {
        const isOpen = accordionDiv.classList.toggle('open');
        contentDiv.classList.toggle('show', isOpen);
        button.setAttribute('aria-expanded', isOpen); // Update ARIA attribute
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
    button.className = `subcard-button`;
    button.dataset.subItemId = subItemId;
    button.textContent = title; // Use textContent for plain text title

    // Add event listener directly to prevent propagation issues
    button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the click from bubbling up to the accordion header
        onClick(); // Execute the modal opening function
    });

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
            currentModal = null; // Ensure it's nullified after removal
        }
        const modalElement = InfoModal(true, closeModal, content);
        try {
            document.body.appendChild(modalElement);
            currentModal = modalElement;
            // Add 'show' class for animation after a small delay
            setTimeout(() => {
                modalElement.classList.add('show'); // Use modalElement here
                document.body.classList.add('modal-open');
            }, 10);
        } catch (error) {
            console.error("Error appending modal to body:", error);
        }
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
    mainContainer.className = 'main-container-border animate-main-container';
    mainContainer.setAttribute('dir', 'rtl');

    // Add a subtle background shimmer effect for visual appeal
    const shimmerDiv = document.createElement('div');
    shimmerDiv.className = 'position-absolute inset-0 rounded-4 pointer-events-none';
    shimmerDiv.style.cssText = 'background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%); mask-image: radial-gradient(ellipse at center, transparent 0%, transparent 70%, black 100%); -webkit-mask-image: radial-gradient(ellipse at center, transparent 0%, transparent 70%, black 100%);';
    mainContainer.appendChild(shimmerDiv);

    // Create logo container at the top - now only one SVG in the middle
    const logoContainer = document.createElement('div');
    logoContainer.className = 'd-flex justify-content-center align-items-center mb-3 w-100 logo-container';
    logoContainer.style.cssText = 'transform: translateY(-30px); opacity: 0; animation: fadeInFromTop 0.5s ease-out 0.2s forwards;';

    // Single Taaz SVG in the middle (using the IDF logo as a placeholder for now)
    const taazSvg = createSvgElement('svg', {
        id: "Layer_1",
        'data-name': "Layer 1",
        xmlns: "http://www.w3.org/2000/svg",
        'xmlns:xlink': "http://www.w3.org/1999/xlink",
        viewBox: "0 0 568.89 544.35", // Original viewBox from taaz.txt
        class: "w-20 h-20 object-contain taaz-main-logo"
    });
    // Directly inject the provided taaz.txt SVG content
    taazSvg.innerHTML = `<defs><style>.cls-1{fill:url(#New_Gradient_Swatch_3);}</style><linearGradient id="New_Gradient_Swatch_3" data-name="New Gradient Swatch 3" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#50b8ee"/><stop offset=".75" stop-color="#0a4a7a"/></linearGradient></defs><path class="cls-1" d="M279.38,165.52s94.58-21.59,232.28-1.82c-32.91,37.96-83.84,21.5-126.51,20.23-21.16-.63-34.45-2.86-93.06,3.6-9.59-16.59-12.71-22-12.71-22ZM491.28,192.8c-20.38-1.2-63.93,6.68-78.36,4.74-51.04-6.86-115.63-1.29-115.63-1.29l11.84,21.1c56.62-2.27,85.83,8.48,122.15,4.22,19.75-2.31,45.86-14.8,59.99-28.77ZM384.91,230.74c-34.54-4.59-52.58-7.49-71.28-5.94l14.02,24.27c32.88,1.5,64.99,6.68,79.97,4.15,13.57-2.29,36.07-15.44,45.81-25.48-22.92,1.18-45.62,6.05-68.53,3ZM365.88,395h73.44l-65.81-113.98-2.58-4.6c10.71-3.17,23.37-8.11,29.35-14.01,0,0-17.42,1.64-35.82-1.4-10.22-1.69-21.34-2.9-32-3.63l12.96,22.43c.12,0,.24,0,.36.01l-.28.26.04.07.04-.07,13.93,24.13.04.07-.04.07,37.87,65.59h-17.05l-14.47,25.05ZM117.11,276.84l17.14,29.97,13.44-23.27-.04-.07-.04.07-13.44-23.27-.04-.07.04-.07-36.52-63.25h46.31l13.47-23.34H57.23l59.79,103.56.09-.26ZM169.93,371.18h-72.57l22.95-39.75-13.34-23.1-1.45,2.79.34-.99-48.62,84.21h126.07l-12.22-23.17h-1.16ZM264.1,274.93c-10.25-11.49-24.73-16.49-30.33-17.91-1.44-.37-1.92-56.89,13.77-86.14,14.98,19.76,16.55,104.06,16.55,104.06ZM278.13,387.8h-58.39c8.52-11.74,17.6-3.77,28.02-3.38,10.64.4,20.89-6.32,30.36,3.38ZM234.61,297.95c-1.85-1.38-1.15-15.82-2.26-19.07l31.56,18.22-.66,20.24c-7.79-12.72-28.64-19.4-28.64-19.4ZM255.02,380.62s-17.4.81-21.56-3.68l.03-53.25c1.8,1.51,29.17,20.52,29.72,23.5.83,4.4.25,23.81.09,28.65-.17,4.97-8.28,4.78-8.28,4.78ZM278.14,277.89,274.69,245.84,283.48,335.34c-3.17,11.85-2.94,28.52-8.21,39.87-.62,1.34-1.17,3.14-2.85,3.43,14.86-42.24-42.44-45.97-51.52-80.13,20.19,1.62,33.4,6.21,43.71,24.4,0,0,10.09,23.19,9.86,17.17-.15-3.76-1.68-21.69-3.41-24.77-1.78-3.16-6.35-2.42-5.54-8.16.75-5.32,8.8-5.55,10.14-.97,1.22,4.17-2.1,6.4-2.14,10.01-.04,3.61,1.84,9.76,2.31,13.79.12,1.03-.73,13.7,2.3,9.71l.39-34.07c-15.79-15.91-38.27-15.93-50.98-36.11-.77-1.23-9.3-17.84-6.08-16.81,9.51,6.19,21.64,8.28,30.92,14.88,4.3,3.06,11.82,10.74,14.52,15.25.7,1.17,3.34,6.8,6.01,11.16,1.63,2.65,1.34,7.47,4.07,9.08-1.81-28.8-7.96-27.78-12.55-41.04l-.33-3.74s14.04,23.02,15.6,43.16l4.5-28.14c-1.67-4.83,1.08-7.27,1.08-7.27,6.02-2.59,8.3,5.74,5.54,9.96-1.13,1.73-3.75.68-5.04,3.33-2.87,5.88-5.49,27.67-5.44,34.64.03,4.21,1.14,12.87,2.95,16.58,1.01-11.69,3.61-23.1,6.86-34.34.11-.39,2.26-8.89,2.86-4.04-2.24,10.86-5.9,21.39-7.77,32.35-.41,2.43.68,1.36,2.04,1.46M280.87,215.69s13.77,38.06-4.01,67.55c0,0-4.33-10.01-8.63-19.33,0,0-2.46-39.09,12.64-48.22ZM284.1,326.52s-5.07-30.36,8.9-53.74c13.97-23.38,13.31-23.8,13.31-23.8,0,0-5.96,66.51-19.96,78.2l-2.25-.67ZM279.62,382.55s-5.6-38.61,37.02-59.46c0,0-2.47,36.83-37.02,59.46ZM268.84,64.2c0,11.65-9.44,21.09-21.09,21.09-11.65,0-21.09-9.44-21.09-21.09,0-11.65,9.44-21.09,21.09-21.09,11.65,0,21.09,9.44,21.09,21.09ZM295.76,148.05h-27.26l-20.95-36.29-34.58,59.89h-.15s-13.63,23.61-13.63,23.61h-26.95l13.63-23.61h-.15l47.52-82.31c3.82,3.81,9.08,6.16,14.9,6.16,5.45,0,10.39-2.08,14.13-5.47l33.49,58.01ZM352.89,370.53c-18.48,32.52-61.15,100.4-106.31,130.72l-.25-.31c-30.53-15.38-55.01-61.31-75.24-90.25h20.78c12.11,16.96,21.89,31.55,26.98,34.26.87.46,1.74.8,2.62,1.04.07.02.13.03.2.04.13.03.26.05.39.08,1.26.23,2.49.28,3.65.15,4.48-.6,8.96-3.94,9.56-9.23,1.63-14.42,3.79-44.25,3.79-44.25,10.8,0,9.07,0,17.5,0,1.09,27.15.31,42.41,3.98,48.65s10.41,5.44,13.82,3.62c11.7-6.22,37.25-30.03,47.87-50.09-8.12,0-23.09,0-27.98,0,35.03-14.87,22.53-9.58,58.65-24.43Z"/>`;
    logoContainer.appendChild(taazSvg);

    mainContainer.appendChild(logoContainer);

    // Create main title
    const mainTitle = document.createElement('h1');
    mainTitle.className = 'text-2xl md:text-3xl font-extrabold mb-2 text-center';
    mainTitle.textContent = contentData.mainTitle;
    mainContainer.appendChild(mainTitle);

    // Create introductory paragraphs container and center its content
    const introParagraphsContainer = document.createElement('div');
    introParagraphsContainer.className = 'text-center';
    contentData.introParagraphs.forEach(paragraphText => {
        const p = document.createElement('p');
        p.className = 'intro-paragraph-text';
        p.textContent = paragraphText;
        introParagraphsContainer.appendChild(p);
    });
    mainContainer.appendChild(introParagraphsContainer);

    // Create motto
    const motto = document.createElement('p');
    motto.className = 'motto-text';
    motto.textContent = contentData.motto;
    mainContainer.appendChild(motto);

    // Create search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'חיפוש...';
    searchInput.className = 'search-input';
    mainContainer.appendChild(searchInput);

    // Create accordion container
    const accordionContainer = document.createElement('div');
    accordionContainer.className = 'accordion-container mb-3';
    mainContainer.appendChild(accordionContainer);

    // Render accordion sections
    contentData.sections.forEach(section => {
        // Pass subItemsData directly to AccordionItem, it will decide whether to render them
        const accordionItem = AccordionItem(
            section.title,
            section.summary,
            section.subItems, // Pass the array of sub-items
            section.id,
            section.isDirectContent, // Pass isDirectContent flag
            section.contentHtml, // Pass contentHtml for direct content sections
            openModal // Pass the openModal function
        );
        accordionContainer.appendChild(accordionItem);
    });

    // Explicitly open the "דבר ראש מרכז תע"ץ" accordion on load
    const headOfTaatzAccordion = document.querySelector('.accordion-item-container[data-section-id="head-of-taatz-message"]');
    if (headOfTaatzAccordion) {
        const contentDiv = headOfTaatzAccordion.querySelector('.collapse-grid');
        const button = headOfTaatzAccordion.querySelector('.accordion-header-button');
        headOfTaatzAccordion.classList.add('open');
        contentDiv.classList.add('show');
        button.classList.add('open');
        button.setAttribute('aria-expanded', 'true'); // Update ARIA attribute
    }


    // Create footer card for external links
    const footerCard = document.createElement('div');
    footerCard.className = 'footer-card';

    const footerTitle = document.createElement('p');
    footerTitle.className = 'footer-title';
    footerTitle.textContent = 'קישורים נוספים:';
    footerCard.appendChild(footerTitle);

    // Declare footerLinksContainer before its usage
    const footerLinksContainer = document.createElement('div');
    footerLinksContainer.className = 'footer-links-container';

    // Use contentData.footerLinks for rendering footer links
    contentData.footerLinks.forEach(link => {
        footerLinksContainer.appendChild(createLinkSquare(link.href, link.alt, link.svgContent));
    });

    footerCard.appendChild(footerLinksContainer);
    mainContainer.appendChild(footerCard);

    appRoot.appendChild(mainContainer);

    // Event listener for search input
    searchInput.addEventListener('input', debounce((e) => {
        const searchTerm = e.target.value.toLowerCase();
        const accordionItems = document.querySelectorAll('.accordion-item-container');
        let anyVisible = false;

        accordionItems.forEach(item => {
            const title = item.querySelector('.accordion-title-text').textContent.toLowerCase();
            const subCards = item.querySelectorAll('.subcard-button');
            const isDirectContent = item.dataset.isDirectContent === 'true'; // Check if it's direct content

            let itemMatches = false;

            if (isDirectContent) {
                // For direct content, check if the main title or content matches
                const contentHtml = item.querySelector('.collapse-grid .text-end').innerHTML.toLowerCase();
                if (title.includes(searchTerm) || contentHtml.includes(searchTerm)) {
                    itemMatches = true;
                }
            } else {
                // For regular accordions, check sub-cards
                let subCardMatches = false;
                subCards.forEach(subCard => {
                    const subCardTitle = subCard.textContent.toLowerCase();
                    if (subCardTitle.includes(searchTerm)) {
                        subCard.style.display = 'block'; // Show matching sub-card
                        subCardMatches = true;
                    } else {
                        subCard.style.display = 'none'; // Hide non-matching sub-card
                    }
                });

                if (title.includes(searchTerm) || subCardMatches) {
                    itemMatches = true;
                }
            }

            if (itemMatches) {
                item.style.display = 'block'; // Show accordion item
                anyVisible = true;
                // If the accordion item matches, ensure it's open if it has matching sub-cards or its title matches
                if (!item.classList.contains('open') && (title.includes(searchTerm) || (subCardMatches && !isDirectContent))) {
                    item.classList.add('open');
                    item.querySelector('.collapse-grid').classList.add('show');
                    item.querySelector('.accordion-header-button').setAttribute('aria-expanded', 'true');
                }
            } else {
                item.style.display = 'none'; // Hide accordion item
            }
        });

        // Show a message if no results are found
        let noResultsMessage = document.getElementById('no-results-message');
        if (!noResultsMessage) {
            noResultsMessage = document.createElement('p');
            noResultsMessage.id = 'no-results-message';
            noResultsMessage.className = 'text-center text-red-500 mt-4';
            mainContainer.appendChild(noResultsMessage);
        }

        if (!anyVisible && searchTerm.length > 0) {
            noResultsMessage.textContent = 'לא נמצאו תוצאות לחיפוש שלך.';
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }
    }, 300)); // Debounce with 300ms delay

    // Scroll to top button logic
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) { // Show button after scrolling 200px
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Smooth scroll to top
        });
    });

    // Copy to clipboard functionality for content-section-copyable
    document.addEventListener('click', function(event) {
        const copyButton = event.target.closest('.copy-button');
        if (!copyButton) return;

        const contentSection = copyButton.closest('.content-section-copyable');
        let textToCopy = '';

        if (contentSection) {
            // Get all text content within the copyable section, excluding the button itself
            const paragraphs = contentSection.querySelectorAll('p, h3, ul, li');
            paragraphs.forEach(p => {
                // Exclude the copy button's text from being copied
                if (!p.contains(copyButton)) {
                    textToCopy += p.textContent.trim() + '\n';
                }
            });
            textToCopy = textToCopy.trim(); // Remove trailing newline
        } else if (copyButton.dataset.copyText) {
            textToCopy = copyButton.dataset.copyText;
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

/**
 * Helper function to create a footer link square with SVG content.
 * @param {string} href - The URL for the link.
 * @param {string} alt - Alt text for the SVG.
 * @param {string} svgContent - The inner HTML of the SVG.
 * @returns {HTMLAnchorElement} The created anchor element.
 */
function createLinkSquare(href, alt, svgContent) {
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'footer-link-square';
    link.setAttribute('aria-label', alt);

    const svgDiv = document.createElement('div');
    svgDiv.className = 'footer-svg-icon';
    svgDiv.innerHTML = svgContent; // Directly inject SVG content

    link.appendChild(svgDiv);
    return link;
}

// Initialize the app with the specific content data for this page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - Initializing app for sal_kelim.html'); // Debugging
    if (window.salKelimContentData) {
        initializeApp(window.salKelimContentData);
    } else {
        console.error('salKelimContentData is not defined. Cannot initialize app.');
    }
});
