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
    outer.style.overflow = 'scroll'; // Force scrollbars
    document.body.appendChild(outer);

    // Create inner div
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculate width
    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

    // Remove temporary div
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
}

/**
 * Opens a modal with the given content.
 * @param {string} title - The title of the modal.
 * @param {string} contentHtml - The HTML content to display inside the modal body.
 */
function openModal(title, contentHtml) {
    // If a modal is already open, close it first
    if (currentModalElement) {
        closeModal();
    }

    // Store current scroll position
    lastScrollY = window.scrollY;

    // Calculate scrollbar width only once
    if (scrollbarWidth === 0) {
        scrollbarWidth = getScrollbarWidth();
    }

    // Add class to html and body to prevent scrolling and adjust for scrollbar
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.body.style.top = `-${lastScrollY}px`; // Position body to current scroll
    document.body.style.paddingRight = `${scrollbarWidth}px`; // Compensate for scrollbar

    // Create modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'modal-overlay';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('role', 'dialog');

    const modalDialog = document.createElement('div');
    modalDialog.className = 'modal-dialog';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = `
        <h5 class="modal-title">${title}</h5>
        <button type="button" class="close-button" aria-label="Close" id="close-modal-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        </button>
    `;

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.innerHTML = contentHtml;

    // Append elements
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalDialog.appendChild(modalContent);
    modalOverlay.appendChild(modalDialog);
    document.body.appendChild(modalOverlay);

    currentModalElement = modalOverlay; // Store reference to the current modal

    // Add event listener to close button
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);

    // Close modal when clicking outside the modal content
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    // Close modal when pressing Escape key
    document.addEventListener('keydown', handleEscapeKey);
}

/**
 * Closes the currently open modal.
 */
function closeModal() {
    if (currentModalElement) {
        document.body.removeChild(currentModalElement);
        currentModalElement = null;

        // Remove classes from html and body to re-enable scrolling
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
        document.body.style.top = ''; // Reset top position
        document.body.style.paddingRight = ''; // Reset padding

        // Restore scroll position
        window.scrollTo(0, lastScrollY);

        // Remove event listener for Escape key
        document.removeEventListener('keydown', handleEscapeKey);
    }
}

/**
 * Handles the Escape key press to close the modal.
 * @param {KeyboardEvent} event - The keyboard event.
 */
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}

/**
 * Renders the main application content based on provided data.
 * @param {object} contentData - The data object containing mainTitle, introParagraphs, sections, and footerLinks.
 */
function renderApp(contentData) {
    const appRoot = document.getElementById('app-root');
    if (!appRoot) {
        console.error('App root element not found!');
        return;
    }

    appRoot.innerHTML = ''; // Clear existing content

    // Create main container
    const mainContainer = document.createElement('div');
    mainContainer.className = 'main-container';

    // Header Section
    const headerSection = document.createElement('header');
    headerSection.className = 'header-section';

    // SVG element
    const svgElement = `
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
    headerSection.innerHTML = `
        <div class="svg-container">
            ${svgElement}
        </div>
        <h1 class="main-title">${contentData.mainTitle}</h1>
        <div class="intro-paragraphs">
            ${contentData.introParagraphs.map(p => `<p class="intro-paragraph">${p}</p>`).join('')}
        </div>
        <p class="motto">${contentData.motto}</p>
    `;
    mainContainer.appendChild(headerSection);

    // Accordion Section
    const accordionSection = document.createElement('section');
    accordionSection.className = 'accordion-section';

    contentData.sections.forEach(section => {
        const accordionItemContainer = document.createElement('div');
        accordionItemContainer.className = 'accordion-item-container';

        const accordionHeaderButton = document.createElement('button');
        accordionHeaderButton.className = 'accordion-header-button';
        accordionHeaderButton.innerHTML = `
            <span class="accordion-title">${section.title}</span>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
        `;

        const collapseGrid = document.createElement('div');
        collapseGrid.className = 'collapse-grid';

        if (section.isDirectContent) {
            collapseGrid.innerHTML = section.contentHtml;
            accordionItemContainer.classList.add('open', 'direct-content'); // Always open for direct content
            accordionHeaderButton.classList.add('no-hover'); // Disable hover for direct content
        } else {
            section.subItems.forEach(subItem => {
                const subItemButton = document.createElement('button');
                subItemButton.className = 'sub-item-button';
                subItemButton.textContent = subItem.title;
                subItemButton.addEventListener('click', () => openModal(subItem.title, subItem.content));
                collapseGrid.appendChild(subItemButton);
            });

            accordionHeaderButton.addEventListener('click', () => {
                accordionItemContainer.classList.toggle('open');
                // Optional: Close other open accordions
                document.querySelectorAll('.accordion-item-container.open').forEach(otherAccordion => {
                    if (otherAccordion !== accordionItemContainer) {
                        otherAccordion.classList.remove('open');
                    }
                });
            });
        }

        accordionItemContainer.appendChild(accordionHeaderButton);
        accordionItemContainer.appendChild(collapseGrid);
        accordionSection.appendChild(accordionItemContainer);
    });

    mainContainer.appendChild(accordionSection);

    // Footer Section
    const footerSection = document.createElement('footer');
    footerSection.className = 'footer-section';

    const footerLinksContainer = document.createElement('div');
    footerLinksContainer.className = 'footer-links-container';

    contentData.footerLinks.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.href = link.href;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.className = 'footer-link-item';

        const imgElement = document.createElement('img');
        imgElement.src = link.imgSrc;
        imgElement.alt = link.alt;
        imgElement.className = 'footer-logo';

        linkElement.appendChild(imgElement);
        footerLinksContainer.appendChild(linkElement);
    });

    footerSection.appendChild(footerLinksContainer);
    mainContainer.appendChild(footerSection);

    appRoot.appendChild(mainContainer);

    // Initialize copy to clipboard functionality
    initializeCopyToClipboard();
}

/**
 * Initializes copy to clipboard functionality for elements with the 'copy-to-clipboard' class.
 */
function initializeCopyToClipboard() {
    document.querySelectorAll('.copy-to-clipboard').forEach(element => {
        element.addEventListener('click', async () => {
            const textToCopy = element.dataset.textToCopy || element.textContent;
            try {
                // Use a temporary textarea for copying to clipboard
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                textarea.style.position = 'fixed'; // Avoid scrolling to bottom
                textarea.style.opacity = '0'; // Make it invisible
                document.body.appendChild(textarea);
                textarea.focus();
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
        });
    });
}

// Initialize the app with the specific content data for this page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - Initializing app for sal_kelim.html'); // Debugging
    if (window.salKelimContentData) {
        renderApp(window.salKelimContentData);
    } else {
        console.error('salKelimContentData is not defined. Ensure it is loaded before main.js');
    }
});
