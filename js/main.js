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
    const titleElement = tempDiv.querySelector('h2');
    const modalTitle = titleElement ? titleElement.textContent : 'פרטים נוספים';

    // Remove the h2 from the content if it exists, as it's used for the modal title
    if (titleElement) {
        titleElement.remove();
    }

    const modalBodyContent = tempDiv.innerHTML;

    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'custom-modal-backdrop';
    modalBackdrop.innerHTML = `
        <div class="custom-modal-content">
            <div class="custom-modal-header">
                <h5 class="custom-modal-title">${modalTitle}</h5>
                <button type="button" class="custom-modal-close-button" aria-label="סגור">
                    &times;
                </button>
            </div>
            <div class="custom-modal-scrollable-body">
                ${modalBodyContent}
            </div>
        </div>
    `;

    // Add event listener to the close button
    const closeButton = modalBackdrop.querySelector('.custom-modal-close-button');
    closeButton.addEventListener('click', onClose);

    // Close modal when clicking outside the content
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            onClose();
        }
    });

    // Disable body scroll when modal is open
    document.body.classList.add('modal-open');

    // Enable body scroll when modal is closed (via onClose callback)
    const originalOnClose = onClose;
    onClose = () => {
        document.body.classList.remove('modal-open');
        originalOnClose();
    };

    // Add 'show' class after a small delay to trigger CSS transitions
    setTimeout(() => {
        modalBackdrop.classList.add('show');
        modalBackdrop.querySelector('.custom-modal-content').classList.add('show');
    }, 10);

    return modalBackdrop;
}

/**
 * AccordionItem component: Renders a single accordion item.
 * @param {object} item - The item data (id, title, summary, contentHtml, subItems).
 * @param {function} onSubItemClick - Callback for when a sub-item is clicked.
 * @returns {HTMLElement} The accordion item element.
 */
function AccordionItem(item, onSubItemClick) {
    const accordionItemDiv = document.createElement('div');
    accordionItemDiv.className = 'accordion-item-container';
    accordionItemDiv.id = `accordion-item-${item.id}`;

    const headerButton = document.createElement('button');
    headerButton.className = 'accordion-header-button';
    headerButton.setAttribute('aria-expanded', 'false');
    headerButton.innerHTML = `
        <span class="accordion-title-text">${item.title}</span>
        <svg class="arrow-icon w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    `;
    accordionItemDiv.appendChild(headerButton);

    const collapseContentDiv = document.createElement('div');
    collapseContentDiv.className = 'collapse-grid';
    collapseContentDiv.setAttribute('aria-hidden', 'true');

    if (item.isDirectContent) {
        // If it's direct content, render it directly
        const contentWrapper = document.createElement('div');
        contentWrapper.innerHTML = item.contentHtml;
        collapseContentDiv.appendChild(contentWrapper);
    } else {
        // If it has sub-items, render them as buttons
        const subCardContainer = document.createElement('div');
        subCardContainer.className = 'sub-card-container';
        item.subItems.forEach(subItem => {
            const subCardButton = document.createElement('button');
            subCardButton.className = 'subcard-button';
            subCardButton.textContent = subItem.title;
            subCardButton.addEventListener('click', () => onSubItemClick(subItem));
            subCardContainer.appendChild(subCardButton);
        });
        collapseContentDiv.appendChild(subCardContainer);
    }
    
    accordionItemDiv.appendChild(collapseContentDiv);

    headerButton.addEventListener('click', () => {
        const isOpen = headerButton.getAttribute('aria-expanded') === 'true';
        headerButton.setAttribute('aria-expanded', !isOpen);
        accordionItemDiv.classList.toggle('open', !isOpen);
        collapseContentDiv.classList.toggle('show', !isOpen);
        collapseContentDiv.setAttribute('aria-hidden', isOpen);
    });

    return accordionItemDiv;
}

/**
 * App component: Main application logic and rendering.
 * @param {object} contentData - The data object containing titles, paragraphs, and sections.
 */
function App(contentData) {
    const appRoot = document.getElementById('app-root');
    if (!appRoot) {
        console.error('App root element not found!');
        return;
    }
    appRoot.innerHTML = ''; // Clear existing content

    // Main container
    const mainContainer = document.createElement('div');
    mainContainer.className = 'main-container-border animate-main-container';
    appRoot.appendChild(mainContainer);

    // Logo
    const logoContainer = document.createElement('div');
    logoContainer.className = 'logo-container';
    const taazLogo = createSvgElement('svg', {
        id: 'Layer_1',
        'data-name': 'Layer 1',
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        viewBox: '0 0 568.89 544.35',
        class: 'taaz-main-logo'
    });
    taazLogo.innerHTML = `<defs><style>.cls-1{fill:url(#New_Gradient_Swatch_3);}</style><linearGradient id="New_Gradient_Swatch_3" data-name="New Gradient Swatch 3" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#50b8ee"/><stop offset=".75" stop-color="#0a4a7a"/></linearGradient></defs><path class="cls-1" d="M279.38,165.52s94.58-21.59,232.28-1.82c-32.91,37.96-83.84,21.5-126.51,20.23-21.16-.63-34.45-2.86-93.06,3.6-9.59-16.59-12.71-22-12.71-22ZM491.28,192.8c-20.38-1.2-63.93,6.68-78.36,4.74-51.04-6.86-115.63-1.29-115.63-1.29l11.84,21.1c56.62-2.27,85.83,8.48,122.15,4.22,19.75-2.31,45.86-14.8,59.99-28.77ZM384.91,230.74c-34.54-4.59-52.58-7.49-71.28-5.94l14.02,24.27c32.88,1.5,64.99,6.68,79.97,4.15,13.57-2.29,36.07-15.44,45.81-25.48-22.92,1.18-45.62,6.05-68.53,3ZM365.88,395h73.44l-65.81-113.98-2.58-4.6c10.71-3.17,23.37-8.11,29.3
