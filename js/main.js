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
        viewBox: "0 0 100 100", // Adjusted viewBox for the IDF logo
        class: "w-20 h-20 object-contain taaz-main-logo"
    });
    // Using the IDF logo SVG content as a placeholder for the main logo
    taazSvg.innerHTML = `<path fill="#0A4A7A" d="M50 0L0 25v50l50 25 50-25V25zm0 8.2L91.8 25 50 41.8 8.2 25zm-41.8 25L50 58.2 91.8 41.8v33.6L50 91.8 8.2 75.4z"/>`;
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
