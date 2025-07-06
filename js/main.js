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
<svg width="568.89" height="544.35" viewBox="0 0 568.89 544.35" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M279.38 165.52C279.38 165.52 373.96 143.93 511.66 163.7C478.75 201.66 427.82 185.19 385.15 183.92C363.99 183.29 350.7 181.06 292.09 187.5C282.5 170.91 279.38 165.52 279.38 165.52Z" fill="url(#paint0_linear_1_2)"/>
<path d="M491.28 192.8C470.9 191.6 427.35 199.48 412.92 197.54C361.88 190.68 297.29 196.35 297.29 196.35L309.13 217.45C365.75 215.18 394.96 225.93 431.28 221.67C451.03 219.36 477.14 206.87 491.28 192.8Z" fill="url(#paint1_linear_1_2)"/>
<path d="M384.91 230.74C350.37 226.15 332.33 223.65 313.03 225.2C313.03 225.2 313.03 225.2 313.03 225.2L327.05 249.47C359.93 250.97 392.04 256.15 407.02 253.62C420.59 251.33 443.59 238.18 453.33 228.14C430.41 229.32 407.71 234.19 384.91 230.74Z" fill="url(#paint2_linear_1_2)"/>
<path d="M365.88 395H439.32L373.51 281.02L370.93 276.42C381.64 273.25 394.3 268.31 400.28 262.41C400.28 262.41 382.86 264.05 364.46 261.04C354.24 259.35 343.12 258.14 332.4 257.41L345.36 279.84C345.48 279.84 345.6 279.84 345.72 279.85L345.44 280.11L345.48 280.18L345.44 280.11L359.37 304.24L359.41 304.31L359.37 304.24L397.24 369.83H380.19L365.72 395H365.88Z" fill="url(#paint3_linear_1_2)"/>
<path d="M117.11 276.84L134.25 306.81L147.69 283.54L147.65 283.47L147.61 283.54L134.17 260.27L134.13 260.2L134.17 260.27L97.65 197.02H143.96L157.43 173.68H57.23L117.11 276.84Z" fill="url(#paint4_linear_1_2)"/>
<path d="M169.93 371.18H97.36L120.31 331.43L106.97 308.33L105.52 311.12L105.86 310.13L57.24 394.34H183.31L171.09 371.18H169.93Z" fill="url(#paint5_linear_1_2)"/>
<path d="M264.1 274.93C253.85 263.44 239.37 258.44 233.77 257.02C232.33 256.65 231.85 200.13 247.54 170.88C262.52 190.64 264.09 274.93 264.1 274.93Z" fill="url(#paint6_linear_1_2)"/>
<path d="M278.13 387.8H219.74C228.26 376.06 237.34 384.03 247.76 384.42C258.4 384.82 268.65 378.1 278.13 387.8Z" fill="url(#paint7_linear_1_2)"/>
<path d="M234.61 297.95C232.76 296.57 233.46 282.13 232.35 278.88L263.91 297.1L263.25 317.34C255.46 304.62 234.61 297.95 234.61 297.95Z" fill="url(#paint8_linear_1_2)"/>
<path d="M255.02 380.62C255.02 380.62 237.62 381.43 233.46 376.94L233.49 323.69C235.29 325.2 262.66 344.21 263.21 347.19C264.04 351.59 263.46 371 263.3 375.85C263.13 380.82 255.02 380.62 255.02 380.62Z" fill="url(#paint9_linear_1_2)"/>
<path d="M278.14 277.89L274.69 245.84L283.48 335.34C280.31 347.19 280.54 363.86 275.27 375.11C274.65 376.45 274.1 378.25 272.42 378.54C257.56 336.3 200.08 332.57 190.99 298.41C211.18 300.03 224.4 304.62 234.71 322.84C234.71 322.84 244.8 346.03 244.57 340.01C244.42 336.25 242.89 318.32 241.16 315.25C239.38 312.09 234.81 312.83 235.62 307.09C236.37 301.77 244.42 301.54 245.76 306.12C246.98 310.29 243.6 312.52 243.56 316.13C243.52 319.74 245.4 325.89 245.87 329.92C246.01 330.95 245.16 343.62 248.23 339.63L248.62 305.56C232.83 289.65 210.35 289.63 197.64 269.45C196.87 268.22 188.34 251.61 191.56 252.64C201.07 258.83 213.2 260.92 222.48 267.52C226.78 270.58 234.3 278.26 237 282.77C237.7 283.94 240.34 289.57 243.01 293.93C244.64 296.58 244.35 301.4 247.08 303.01C245.27 274.21 239.12 275.23 234.53 261.97L234.2 258.23C234.2 258.23 248.24 281.25 249.8 301.39L254.3 273.25C252.63 268.42 255.38 265.98 255.38 265.98C261.4 263.39 263.68 271.74 260.92 275.96C259.79 277.69 257.17 276.64 255.88 279.29C253.01 285.17 250.4 306.96 250.45 313.93C250.48 318.14 251.59 326.8 253.4 330.51C252.39 318.82 249.79 307.41 246.54 296.17C246.43 295.78 244.28 287.28 243.68 292.13C241.44 303 237.78 313.53 235.91 324.49C235.5 326.92 236.59 325.85 237.95 325.95Z" fill="url(#paint10_linear_1_2)"/>
<path d="M280.87 215.69C280.87 215.69 294.64 253.75 276.86 283.24C276.86 283.24 272.53 273.23 268.23 263.91C268.23 263.91 265.77 224.82 280.87 215.69Z" fill="url(#paint11_linear_1_2)"/>
<path d="M284.1 326.52C284.1 326.52 279.03 296.16 293.03 272.78C307 249.4 306.34 248.98 306.34 248.98C306.34 248.98 300.38 315.49 286.38 327.18L284.13 326.52Z" fill="url(#paint12_linear_1_2)"/>
<path d="M279.62 382.55C279.62 382.55 274.02 343.94 316.64 323.09C316.64 323.09 314.17 359.92 279.62 382.55Z" fill="url(#paint13_linear_1_2)"/>
<path d="M268.84 64.2C268.84 75.85 259.4 85.29 247.75 85.29C236.1 85.29 226.66 75.85 226.66 64.2C226.66 52.55 236.1 43.11 247.75 43.11C259.4 43.11 268.84 52.55 268.84 64.2Z" fill="url(#paint14_linear_1_2)"/>
<path d="M295.76 148.05H268.5L247.55 111.76L212.97 171.65H212.82C199.19 195.26 199.19 195.26 199.19 195.26H172.24L185.87 171.65H185.72L233.24 89.34C237.06 93.15 242.32 95.5 248.14 95.5C253.59 95.5 258.53 93.42 262.27 90.03L295.76 148.05Z" fill="url(#paint15_linear_1_2)"/>
<path d="M352.89 370.53C334.41 403.05 291.74 470.93 246.58 501.25L246.33 500.94C215.8 485.56 191.32 439.63 171.09 410.69H191.87C203.98 427.65 213.76 442.24 218.85 444.95C219.72 445.41 220.59 445.75 221.47 445.99C221.54 446.01 221.6 446.02 221.67 446.03C221.8 446.06 221.93 446.08 222.06 446.11C223.32 446.34 224.55 446.39 225.71 446.26C230.19 445.66 234.67 442.32 235.27 437.03C236.9 422.61 239.06 392.78 239.06 392.78C249.86 392.78 248.13 392.78 256.66 392.78C257.75 419.93 256.97 435.19 260.64 441.43C264.31 447.67 270.45 447.11 273.86 445.29C285.56 439.07 311.11 415.26 321.73 395.2C313.61 395.2 298.54 395.2 293.65 395.2C328.68 380.33 316.18 385.62 352.89 370.53Z" fill="url(#paint16_linear_1_2)"/>
<defs>
<linearGradient id="paint0_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint1_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint2_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint3_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint4_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint5_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint6_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint7_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint8_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint9_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint10_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint11_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint12_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint13_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint14_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint15_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
<linearGradient id="paint16_linear_1_2" x1="419.87" y1="414.45" x2="118.1" y2="112.68" gradientUnits="userSpaceOnUse">
<stop stop-color="#50B8EE"/>
<stop offset="0.75" stop-color="#0A4A7A"/>
</linearGradient>
</defs>
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
