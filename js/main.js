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
 * @returns {HTMLElement} The accordion item div element.
 */
function AccordionItem(title, summary, childrenElements, sectionId) {
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
    contentWrapper.innerHTML = `
        <p class="mb-3 fs-6" style="color: #0A4A7A;">${summary}</p>
        <div class="d-grid gap-2 sub-card-container"></div> <!-- Container for sub-cards -->
    `;

    const subCardContainer = contentWrapper.querySelector('.sub-card-container');
    childrenElements.forEach(child => { // Append actual sub-card elements
        subCardContainer.appendChild(child);
    });

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

// Define contentData for 'סל הכלים למפקד/ת לשימור וניהול עובדי צה"ל'
const salKelimContentData = {
    mainTitle: "סל הכלים למפקד/ת",
    introParagraphs: [
        "לשימור ולניהול עובדי צה\"ל",
        "מרכז תעסוקת עובדי צה\"ל",
        "בשנת 2025 כבר לא מספיק להשקיע רק בתוכניות עבודה, שיפור ביצועים, התייעלות, אנליטיקה או שדרוגים טכנולוגיים.",
        "בתכל'ס, על מה ארגונים מתחרים? על אנשים! וארגונים מוכנים לעשות הרבה בשביל האנשים שלהם.",
    ],
    motto: "הגיע הזמן לשמור על המעצמה של צה\"ל!",
    signature: ["אל\"ם מישאל/מרדכי", 'ראש מרכז תע"ץ'],
    sections: [
        {
            id: "flexibility",
            title: "גמישות בשעות העסקה",
            summary: "מידע מפורט על גמישות בשעות העסקה, כולל שעון גמיש, שעות נוספות, חופשות שנתיות ועוד.",
            subItems: [
                {
                    id: "flexible-clock",
                    title: "שעון גמיש",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">שעון גמיש</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong>מהות ההטבה:</strong> אישור פרטני המאפשר לעובדים להגמיש את שעות ההתחלה והסיום של יום העבודה, כל עוד הם עומדים במסגרת השעות היומיות שנקבעה בבסיס היום שלהם.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong>אופן אישור ההטבה:</strong> הטבה זו אינה קבועה, ונבחנת מדי שנה קלנדרית בכפוף להגשת בקשה ואישור מפקד. בקשה זו מאושרת ברמת היחידה.</p>
                    `,
                },
                {
                    id: "employment-hours-general",
                    title: "שעות העסקה - כללי",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">שעות העסקה - כללי</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">חודש עבודה במשרה מלאה מונה 173.33 שעות בממוצע עבודה חודשיות, למעט אוכלוסיות ייחודיות (שעות העבודה לא כוללות הפסקות). עובדים המועסקים במשרה מלאה יועסקו באופן הבא:</p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>עובדים המועסקים 5 ימים בשבוע יעבדו 8 שעות עבודה ביום, לא כולל הפסקות.</li>
                            <li>עובדים המועסקים 6 ימים בשבוע יעבדו 7 שעות בימים א'-ה' ו-5 שעות עבודה ביום ו', לא כולל הפסקות.</li>
                        </ul>
                    `,
                },
                {
                    id: "flexible-employee",
                    title: "עובד גמיש",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">עובד גמיש</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong>מהות ההטבה:</strong> אישור פרטני המאפשר לעובדים להגמיש את שעות עבודתם ברמה החודשית, כלומר סך שעות העבודה יספרו ברמה החודשית. בכל מקרה לעובד גמיש תהיה מגבלת שעות של 12 שעות עבודה. הטבה זו אינה קבועה, ונבחנת מדי שנה קלנדרית בכפוף להגשת בקשה ואישור מפקד.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ההטבה אוטומטית עבור: עובדים בהסכם הקיבוצי המועסקים במשרה חלקית, עובדים בחוזה אישי, סטודנטים ועובדים בהעסקה ארעית.</p>
                    `,
                },
                {
                    id: "overtime-hours",
                    title: "שעות נוספות",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">שעות נוספות</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">שעות המבוצעות בפועל מעבר למכסת השעות היומית המלאה. ביצוע השעות מותנה באישור מפקד/ת היחידה והסמכות. התשלום: שעתיים ראשונות - 125%, שעתיים הבאות ברצף - 150%, ומהשעה החמישית ואילך - 175%.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">יודגש כי שעות נוספות ניתנות למול אישור תקציבי בסמכות!</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">יש לשים לב כי שעות נוספות לעובדים גמישים מחושבות ברמה החודשית ולא ברמה יומית.</p>
                        <div class="tip-gold">
                            <p><strong>טיפ זהב!</strong></p>
                            <p>לא ניתן להעסיק ע"צ מעבר ל-12 שעות עבודה ביום. במקרים חריגים יהיה ניתן לחרוג מהגבלה בכפוף לאישור מרכז תע"ץ.</p>
                        </div>
                    `,
                },
                {
                    id: "annual-vacations",
                    title: "חופשות שנתיות",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">חופשות שנתיות</h2>
                        <div class="d-flex justify-content-center mb-3 overflow-x-auto">
                            <table class="table table-bordered w-100 max-w-md bg-white bg-opacity-90 rounded-3 shadow-sm overflow-hidden" style="border-color: #B5D0E8;">
                                <thead>
                                    <tr>
                                        <th class="py-2 px-3 border-bottom border-info text-end fs-6 fw-semibold text-uppercase" style="color: #0A4A7A;">דירוג</th>
                                        <th class="py-2 px-3 border-bottom border-info text-end fs-6 fw-semibold text-uppercase" style="color: #0A4A7A;">מספר ימי עבודה בשבוע</th>
                                        <th class="py-2 px-3 border-bottom border-info text-end fs-6 fw-semibold text-uppercase" style="color: #0A4A7A;">בכל ותק</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">האקדמאים לרבות ודירוג מחסנאים</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">5</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">24</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">עובדים בדירוג מנהלי</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">6</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">27</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ניתן לצבור עד 59 ימי חופשה לעובדים המועסקים 5 ימים בשבוע, ו-66 ימי חופשה לעובדים המועסקים 6 ימים בשבוע.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">מספר ימי החופשה ניתנים מראש בכל שנה קלנדרית ומותנים בהיקף ימי עבודה מינימליים בשנה.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">הנ"ל לא חל על עובדות ועובדי הוראה ולא על סטודנטים.</p>
                    `,
                },
                {
                    id: "parental-position",
                    title: "משרת הורה",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">משרת הורה</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">זכאות לקיצור יום עבודה בחצי שעה אחת ללא ניכוי מהשכר עבור הורים לילדים מתחת לגיל 12.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">זכאים להטבה עובדים במשרה מלאה שהינם הורים לילדים אשר גילם נמוך מ-12 שנים, ובלבד שבני/בנות זוגם/ן עובדים ב-100% משרה ולא מקבלים או לא מנצלים הטבה זו במקום עבודתם.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">עובדות זכאיות להטבה באופן אוטומטי. עובדים נדרשים להגיש בקשה לבחינה במדור פרט במרכז תע"ץ.</p>
                    `,
                },
                {
                    id: "nursing-mother",
                    title: "אם מניקה",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">אם מניקה</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">אם מניקה זכאית לקיצור יום עבודתה בשעה וחצי לכל היותר לצורך הנקה עד מלאת שנה לילד/ה שלה. זאת בכפוף לכך שהעובדת אינה גמישה ושבסיס היום לאחר הקיצור הוא 6 שעות לפחות.</p>
                    `,
                },
                {
                    id: "work-from-home",
                    title: "עבודה מהבית",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">עבודה מהבית</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">בסמכות מפקד יחידה סא"ל/ אע"ב לאשר לעובד/ת צה"ל לעבוד מהבית, עד 4 ימים בחודש ולא יותר מפעם בשבוע, במידה ועומד בקריטריונים:</p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>העובד מסכים וחתם על טופס ייעודי</li>
                            <li>למעובד תוספת חילית 10% בלבד</li>
                            <li>עיקר תפקידו אינו כרוך במתן שירות פרונטלי</li>
                            <li>הוגדרו משימות בהן יעסוק לטובת בקרה</li>
                            <li>קיימת תשתית טכנולוגית מאפשרת</li>
                            <li>יש אישור ב"ם</li>
                        </ul>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">עבודה מהבית תתאפשר עבור ימים שלמים בלבד וללא שעות נוספות.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong class="fw-semibold">למען הסר הספק, לא ניתן להעסיק בשעות נוספות מהבית.</strong></p>
                        <div class="tip-gold">
                            <p><strong>טיפ זהב!</strong></p>
                            <p>עבודה מהבית מהווה כלי משמעותי לשימור עובדים ולמתן האפשרות לאזן בין הבית לעבודה! אל תהססו להשתמש בכלי זה.</p>
                        </div>
                    `,
                },
                {
                    id: "compensation-days",
                    title: "ימי תמורה",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">ימי תמורה</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">חופשת תמורה הינה יום מנוחה בשכר (בסיס בלבד) על חשבון המערכת. המקרים עבורם מזכים בחופשת תמורה מפורטים בהוראה 24-12 ובמסמך מדיניות ימי תמורה בגין פעילויות רווחה, המתעדכן מידי שנה ובתיאום עם ארגון ע"צ. לרשות מפקד יחידה שני ימי תמורה בשנה עבור פעילות חברתית של היחידה.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">למרכז תע"צ הסמכות לאשר תמורה באופן חריג במקרה ייחודי כל עוד אין מענה חוקי אחר למצב זה.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">בהתאם, מפקד יוכל לפנות למרכז תע"צ לבחינה ואישור של חופשת תמורה שאיננה במסגרת המקרים המפורטים לעיל.</p>
                    `,
                },
                {
                    id: "choice-day",
                    title: "יום בחירה",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">יום בחירה</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">עובדים זכאים ליום בחירה אחד בשנה מתוך רשימת ימי בחירה אפשריים אשר מופצת מדי שנה ע"י מרכז תע"ץ.</p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>הזכאות ניתנת לאחר ותק של 68 ימי העסקה רצופים.</li>
                            <li>ימי הבחירה אינם נצברים.</li>
                        </ul>
                    `,
                },
            ],
        },
        {
            id: "recognition",
            title: "כלי הוקרה ותגמול",
            summary: "כלי הוקרה ותגמול לעובדי צה\"ל, כולל תמריצים, קידום בדרגת שכר, הצטיינות ושכר עידוד.",
            subItems: [
                {
                    id: "incentives",
                    title: "תמריצים",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">תמריצים</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">התמריצים מיועדים לעובדי צה"ל בהסכם קיבוצי (ללא סטודנטים, חניכים ועובדים בחוזה אישי). התמריצים מחולקים ל-2 קטגוריות:</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div class="bg-blue-50 p-4 rounded-lg shadow-sm">
                                <h4 class="font-bold text-blue-800">תמריצי שימור הון אנושי</h4>
                                <p class="text-gray-700">מיועדים לשימור עובדים/ות אשר כוללים חתימה להתחייבות על תקופת העסקה. 25,000/50,000 ש"ח לחתימה ל-24/36 חודשים העומדים בקריטריונים:</p>
                                <ul class="list-disc ml-6 text-gray-700">
                                    <li>ותק של שנה עד 15 שנות עבודה.</li>
                                    <li>ציון חוות דעת 1 או 2 בשלוש השנים האחרונות.</li>
                                </ul>
                            </div>
                            <div class="bg-blue-50 p-4 rounded-lg shadow-sm">
                                <h4 class="font-bold text-blue-800">תמריצי הוקרה</h4>
                                <p class="text-gray-700">מיועדים לעובדים/ות המצטיינים בעשייה המקצועית בסכום 8,000/10,000 ש"ח ללא צורך בהתחייבות, העומדים בקריטריונים:</p>
                                <ul class="list-disc ml-6 text-gray-700">
                                    <li>ותק של שלוש שנים ומעלה.</li>
                                    <li>ציון חוות דעת 1 או 2 בשלוש השנים האחרונות כאשר הציון חייב להיות 1 באחת מהן.</li>
                                </ul>
                            </div>
                        </div>
                        <p class="fs-6 lh-base mt-4" style="color: #0A4A7A;">המענקים יינתנו לעובדים המועסקים ב-100% משרה בלבד.</p>
                        <p class="fs-6 lh-base" style="color: #0A4A7A;">מקרים חריגים ייבחנו על ידי ראש מרכז תע"ץ.</p>
                    `,
                },
                {
                    id: "salary-grade-promotion",
                    title: "קידום בדרגת שכר לדרגה סגורה/ בכירה",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">קידום בדרגת שכר לדרגה סגורה/ בכירה</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ככלל, עובדי צה"ל מקודמים בדרגות בהתאם למתח הדרגות לקידום שוטף, בהתאם למדיניות הפז"ם והקיצורים הקבועה לעובדי צה"ל (עובדי דור ההמשך מקודמים בנוסף בהתאם למתח הדרגות לתקן). קידום עובד לדרגה סגורה/ בכירה אשר סיים את טווח קידומי הדרגות יתאפשר במסגרת ועדה צה"לית, בראשות ראש המרכז ויו"ר ארגון ע"צ, אשר מתקיימת אחת לשנה.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">שמות המועמדים לוועדה מועברים על ידי הסמכות בהתאם להקצאות ועמידה בקריטריונים כפי שמתפרסמים ע"י מרכז תע"ץ.</p>
                    `,
                },
                {
                    id: "excellence",
                    title: "הצטיינות",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">הצטיינות</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">בחירת עובד/ת כמצטיין/ת מהווה הזדמנות ייחודית להערכה והוקרה משמעותית על עשייה בולטת במקצועיות, במסירות ובתרומה עבור צה"ל. קיימים שלושה סוגי הצטיינות עבור עובדות ועובדי צה"ל כדלקמן:</p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li><strong>מצטיינות ומצטייני רמטכ"ל:</strong> ותק מינימלי של חמש שנים וציון חוות דעת 1 (מצוין) בשנתיים האחרונות.</li>
                            <li><strong>מצטיינות ומצטייני אלוף:</strong> ותק מינימלי של שנתיים לפחות וציון חוות דעת 1 (מצוין) באחת מהשנתיים האחרונות.</li>
                            <li><strong>מצטיינות ומצטייני תא"ל:</strong> ציון חוות דעת 1 (מצוין) באחת מהשנתיים האחרונות.</li>
                        </ul>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">השנה, תינתן גם הצטיינות במעמד שר הביטחון. הקריטריונים יפורסמו בהמשך.</p>
                    `,
                },
                {
                    id: "encouragement-salary",
                    title: "שכר עידוד",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">שכר עידוד</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">שכר עידוד הוא תוספת שכר המשולמת למי שתפוקת עבודתו גבוהה מעבר ליעדים שנקבעו. שכר העידוד מקובל כאמצעי ארגוני ליצירת הנעה, להגדלת תפוקות ולתגמול עובדים. שכר עידוד מחושב ברמה קבוצתית ולא בהכרח לכל היחידה באותה השיטה. גובה הפרמיה לקבוצת תעסוקה מסוימת נקבע ע"פ שיטת החישוב שאושרה על ידי הוועדה לקשירת השכר לתפוקה במשהב"ט.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ועדה זו קובעת לכל קבוצת עובדים שיטת חישוב נפרדת. לאחר אישור הוועדה יש לפנות למרכז תע"צ לפתיחת קבוצת תעסוקה ולהזנה.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">התשלום יכול להתבצע ברמה חודשית/רבעונית/חציונית בהתאם להחלטת הוועדה ובהתאם לעמידת העובדים ביעדים שהוגדרו להם.</p>
                    `,
                },
                {
                    id: "friend-brings-friend",
                    title: "\"חבר מביא חבר\"",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">"חבר מביא חבר"</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">שיטת "חבר מביא חבר" היא דרך מצוינת לגייס עובדים איכותיים באמצעות המלצות של עובדים קיימים. כל עובד שימליץ על מועמד שיתקבל ויישאר בתפקידו לפחות 4 חודשים יקבל שובר מתנה.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">על מנת לקבל את טופס הגשת המועמדים ניתן לפנות ל-WhatsApp של מדור איתור: <span class="fw-bold" style="color: #0A4A7A;">052-3869136</span></p>
                    `,
                },
            ],
        },
        {
            id: "education",
            title: "לימודים והשכלה",
            summary: "מידע על לימודים והשכלה לעובדי צה\"ל, כולל לימודי תוכייש וימי השתלמות בשכר.",
            subItems: [
                {
                    id: "tuition-studies",
                    title: "לימודי תוכייש",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">לימודי תוכייש</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">עובד/ת צה"ל המעוניין לצאת ללימודים ע"ח שעות העבודה יוכל ללמוד, באישור מפקדיו, לימודי טכנאים/ הנדסאים, לימודים אקדמיים ולימודי הוראה, 4 שעות/ יום לימודים בשבוע. ההטבה ניתנת על חשבון ימי השתלמות בשכר, או בניכוי עד חמישה ימי חופשה שנתית.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">בנוסף, קיימים ערוצי מימון לימודים שונים:</p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>כיתות לימוד במימון צה"ל כפי שיפתחו ויפורסמו מעת לעת.</li>
                            <li>מלגות מטעם צה"ל הניתנות באמצעות ארגון עובדי צה"ל.</li>
                            <li>מלגות הניתנות על ידי 'קרן ידע'.</li>
                        </ul>
                    `,
                },
                {
                    id: "paid-training-days",
                    title: "ימי השתלמות בשכר",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">ימי השתלמות בשכר</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ימים הניתנים על חשבון המערכת עבור השתלמויות הכרוכות לשיפור הרמה המקצועית ונמצאות בזיקה לתפקיד/ קורסים לגמו"ש/ סמינרים וביוזמת העובד.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">היקף ימי הזכאות להם זכאים עובדים במהלך השנה ניתנים בהתאם לדירוג ולדרגה. כמו כן, ימים אלו אינם ניתנים לפדיון.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">בקשה זו נדרשת בהמלצת מפקד בדרגת סא"ל/תנ"ב לפחות ומאושרת אצל הסמכות. יחידות קטנות וחריגים מטופלים ע"י מדור פרט במרכז תע"ץ. מפקד אל"ם/תס"ן יכול לעכב את יציאת העובד להשתלמות בחצי שנה במידה ויצא להשתלמות בת 5 ימים לפחות באותה השנה.</p>
                        <div class="tip-gold">
                            <p><strong>טיפ זהב!</strong></p>
                            <p>ניתן לשלב עובדות ועובדי צה"ל בכיתות מובנות של משרתי קבע בפיקוד/חיל. נדרש לפנות לקצין המשא"ן/ האזרחים על מנת להסדיר את התהליך מול מרכז תע"ץ.</p>
                        </div>
                    `,
                },
            ],
        },
        {
            id: "social-service",
            title: "השירות הסוציאלי",
            summary: "השירות הסוציאלי לעובדי צה\"ל, כולל טיפול וליווי מקצועי, מענה למצבי משבר ואנשי קשר.",
            subItems: [
                {
                    id: "social-service-overview",
                    title: "השירות הסוציאלי - סקירה",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">השירות הסוציאלי</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">השירות הסוציאלי לאזרחי עובדי צה"ל, הינו שירות מקצועי, נותן טיפול ונפנוי רגשי לעובד. הצוות כולל בתוכו צוות מטפלות בעלות תואר שני עובדות סוציאליות קליניות ובוגרות בתואר שני, בעלות ניסיון רב בטיפול, המעניק שירותי טיפול ברמה הגבוהה ביותר לאזרחים.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">מפקד מוזמן לפנות אלינו לקבלת סיוע ועצה בנושאים שונים הקשורים להתמודדות עם עובדים, כמו מצבי משבר, הורים לילדים עם מוגבלויות, תהליך שימוש בכבוד.</p>
                        <h3 class="fs-5 fw-semibold mt-4" style="color: #0A4A7A;">הנושאים בהם מטפל השירות הסוציאלי:</h3>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>סיוע בהתמודדות עם משברים אישיים, זוגיים ומשפחתיים.</li>
                            <li>טיפול בקשיים הנוגעים למקום העבודה.</li>
                            <li>ליווי ומיצוי זכויות בתוך מערכת הקהילה.</li>
                            <li>התמודדות עם משברים כלכליים (כולל מענקי סיוע).</li>
                            <li>התמודדות עם חולי שיש לעובד או אד בתוך המשפחה.</li>
                            <li>התמודדות עם אובדן.</li>
                            <li>טיפול נפשי הקשור להטרדה מינית, פגיעה מינית.</li>
                            <li>טיפול באוכלוסיות הדורשות בקשה מיוחדת - הורים לילדים עם מוגבלויות, הורים חד-הוריים, משברים רפואיים וכלכליים.</li>
                        </ul>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">אופן הפנייה לשירות הסוציאלי יכול להיות באופן ישיר. עם קבלת הפנייה (מצורפת רשימת העובדות הסוציאליות).</p>
                    `,
                },
                {
                    id: "social-service-contacts",
                    title: "השירות הסוציאלי - אנשי קשר",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">השירות הסוציאלי לעובדי צה"ל - אנשי קשר:</h2>
                        <ul class="list-none p-0 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>ראש מדור עובד סוציאלי תשלום סהר: <span class="fw-bold" style="color: #0A4A7A;">052-9289469</span></li>
                            <li>ע"ס רעות וניבוס יריעי זקלר: <span class="fw-bold" style="color: #0A4A7A;">055-6613328</span></li>
                            <li>ע"ס שי ברקאי: <span class="fw-bold" style="color: #0A4A7A;">052-9458746</span></li>
                            <li>ע"ס יחיאל יואב גולדמן: <span class="fw-bold" style="color: #0A4A7A;">055-6645054</span></li>
                            <li>ע"ס יחיאל סיוון הפרלה: <span class="fw-bold" style="color: #0A4A7A;">050-8357880</span></li>
                            <li>ע"ס חנה אורית פגנה: <span class="fw-bold" style="color: #0A4A7A;">052-8779826</span></li>
                            <li>ע"ס תמר נרקיס שמש: <span class="fw-bold" style="color: #0A4A7A;">052-9462435</span></li>
                            <li>ע"ס יגאל אוחיון: <span class="fw-bold" style="color: #0A4A7A;">054-2096111</span></li>
                            <li>ע"ס מאת נרקיס שמש: <span class="fw-bold" style="color: #0A4A7A;">052-3945810</span></li>
                            <li>ע"ס אמיר ב. לוי: <span class="fw-bold" style="color: #0A4A7A;">050-5401848</span></li>
                        </ul>
                        <p class="fs-6 lh-base mt-4 fw-semibold" style="color: #0A4A7A;">איתך ולצידך לאורך כל הדרך - מרכז תעסוקת עובדי צה"ל, המשימה שלנו.</p>
                    `,
                },
            ],
        },
        {
            id: "additional-social-responses",
            title: "מענים סוציאליים נוספים",
            summary: "מענקי סיוע כלכלי, סיוע חירום, מענה למקרי חופש מחלה חריגים והטבות להורים לילדים עם מוגבלויות.",
            subItems: [
                {
                    id: "exceptional-financial-grant",
                    title: "מענק סיוע כלכלי חריג",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">מענק סיוע כלכלי חריג</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">מענק סיוע כלכלי הינו מענק כספי וניתו סיוע כלכלי חריג, בעקבות צורך אישי או רפואי חריג, כמו מחלה סופנית, טיפולים, השתלות, תרופה שאין לה סבסוד והיא תרופה יקרה, רכישת ציוד רפואי הכרחי.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">המענק הינו חד פעמי, וניתן לקבל את המענק עד לסכום של 6,000 ש"ח. כמו כן, קיים אישור להגדלת סכום המענק ל-12,000 ש"ח.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">המענק ניתן בערוץ השירות הסוציאלי ובאישור מרכז תע"ץ, בכפוף לקריטריונים.</p>
                    `,
                },
                {
                    id: "emergency-aid",
                    title: "סיוע חירום",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">סיוע חירום</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">סיוע כלכלי לרכישת ציוד מחומם, מיועד עבור עובדים המתמודדים עם מצבי משבר כלכלי.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ההטבה הינה חד-פעמית וניתנת בסכום של עד 2,000 ש"ח במקרים חריגים. בנוסף, בהמלצת השירות הסוציאלי. במסגרת בחינת הבקשה העובד יידרש להציג את תג הסיוע והצדקה.</p>
                    `,
                },
                {
                    id: "gross-salary",
                    title: "שכר ברוטו",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">שכר ברוטו</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">מצב חירום המוגדר כמשפיע על חייו ושל העובד, ייצר הוצאות כספיות, הוצאות נסיעה, ועלול לגרום למצוקה כלכלית. הבקשה תיבחן בענף פרט במרכז תע"ץ.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">הורה לילד עם מוגבלות. תוכנית לבריאות כלכלית תאפשר לעובדים/ות.</p>
                    `,
                },
                {
                    id: "exceptional-sick-days",
                    title: "ימי מחלה חריגים",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">ימי מחלה חריגים</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">מענה למקרים בהם עובדים ועובדות צה"ל מתמודדים עם מצב חולי שיש לבן/בת זוגם או בתוך המשפחה, ובמקרים בהם ימי ההיעדרות נוצלו והם זכאים עם חופש מחלה, חופשה שנתית צבורה, ימי מחלה של הילד/ה.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong>הקריטריונים להגשת הבקשה:</strong></p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>ניצול ימי החופשה הרלוונטיים (ימי מחלה של הילד/ה, חופשה שנתית צבורה, ימי מחלה של הילד/ה, חופשת לידה).</li>
                            <li>צירוף חוות דעת של רופא/ה.</li>
                            <li>אישור מפקד/ת.</li>
                        </ul>
                    `,
                },
                {
                    id: "disabled-children-parents-benefit",
                    title: "הטבה להורים לילדים עם מוגבלויות",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">הטבה להורים לילדים עם מוגבלויות</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ההטבה כוללת: זכאות ל-52 שעות היעדרות על חשבון המערכת, עובד/ת במשרה חלקית/זכאי לחלק היחסי. הזכאות מתחדשת בכל שנה קלנדרית.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ימי מחלה מוגדלים: 18 ימי מחלה של הילד/ה בשנה על חשבון ימי המחלה הצבורה. העובד/ה יכול/ה להגיש בקשה לניצול ימי מחלה נוספים, והמצב של הילד/ה מצריך ניצול ימי מחלה נוספים.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">שכר ברוטו במקרה חירום. הטיפול ניתן במסגרת שעות העבודה וכולל את כל הרכיבים הכלולים בכלים המיועדים לסייע לעובד/ת.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">טיפול פסיכותרפיסט/ית עבור בן/בת זוג/משפחת המטופל/ת.</p>
                    `,
                },
            ],
        },
        {
            id: "evaluation",
            title: "כלי הערכה ומשוב",
            summary: "כלי הערכה ומשוב לעובדי צה\"ל, כולל חוות דעת שנתית.",
            subItems: [
                {
                    id: "annual-review",
                    title: "חוות דעת שנתית",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">חוות דעת שנתית</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">תהליך הערכת העובדים הוא אבן יסוד אסטרטגית והזדמנות חשובה להשפיע, לכוון ולחזק את ההון האנושי בארגון. הערכה זו משקפת את תפקוד העובד בשנה החולפת ומאפשרת לוועדה לבחון את עמידתו בדרישות התפקיד, התאמתו לערכי הארגון והמלצה על קביעות בעבודה.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">הערכה זו מתבצעת אחת לשנה, החל מחודש אוגוסט ומסתיימת בדצמבר, במסגרת קבלת החלטות חשובות.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">תהליך הערכת עובדים, כאשר הוא מתבצע כהלכה, הוא אבן יסוד להצלחה - הוא יכול לשפר את התפוקה, להגביר את המוטיבציה ולחזק את המחויבות הארגונית ולסייע לכל עובד ועובדת להבין כיצד הוא יכול לתרום יותר ולהצטיין.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">זהו כלי חשוב למנהלים ואנו מאמינים כי זה יאפשר להם להציע עצות קיימות לחזק את החולשה, ולתכנן ולשקף את ביצועיהם, לזהות חולשות, ולתכנן תוכנית להתפתחות מקצועית ואישית.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">הערכת עובדים אינה השקעה בעבר – היא השקעה בעתיד. נהל משוב איכותי ושיפור תפוקה, וצור סביבת עבודה מקצועית ונוהגת קידום מצוינות.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">הזמן הזה לקחת את התהליך הזה ברצינות, כי עובדים שמרגישים מוערכים, נותנים יותר, מתקדמים יותר, ומובילים את הארגון להישגים גדולים יותר.</p>
                    `,
                },
            ],
        },
        {
            id: "discipline",
            title: "ניהול משמעת",
            summary: "ניהול משמעת בצה\"ל, כולל סמכות המפקד, קביעות בעבודה, פיטורים ומשמעת צבאית.",
            subItems: [
                {
                    id: "commander-authority",
                    title: "סמכות המפקד בניהול משמעת",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">סמכות המפקד בניהול משמעת</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">בחינת העסקת עובד ניתנת באמצעים הניתנים לניהול משמעתי, כאשר מפקדים בארגון הממשלתי בקרב אזרחים, עומדים לרשותם כלים המספקים לטיפול משמעתי. יש להשתמש בכלים המשמעתיים בזהירות, על מנת לשמור על הסדר המשמעתי, אך גם עם יחס אנושי המכבד את העובדים. במצב כזה, מומלץ לפנות לייעוץ מקצועי על מנת לוודא שהפעולה תתבצע בהתאם לנהלי ומדיניות הארגון.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">להלן נציין חלק מהכלים: אזהרה, הודעה על תגובה חריפה, פיטורים.</p>
                    `,
                },
                {
                    id: "severe-response-notice",
                    title: "הודעה על תגובה חריפה",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">הודעה על תגובה חריפה</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">כלי זה מאפשר למפקד להודיע על תגובה משמעתית בהתאם להלן "הודעה על תגובה חריפה" כאשר עובד מאומת באחת מהעבירות המפורטות כגון הפרת פקודה, והפרת הוראה ברשלנות.</p>
                    `,
                },
                {
                    id: "employment-permanence",
                    title: "קביעות בעבודה",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">קביעות בעבודה</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">הוועדה בוחנת את תפוקת העובד לאורך שנת עבודתו, עמידתו בדרישות התפקיד, והתאמתו לערכי הארגון. עובדים העומדים בקריטריונים הנדרשים ומקבלים את המלצת הוועדה, יקבלו קביעות בעבודה, המבטיחה את המשך העסקתם בארגון.</p>
                        <div class="tip-gold">
                            <p><strong>טיפ זהב!</strong></p>
                            <p>המלצה בדבר קביעות העובד/ת תהיה אחת ההחלטות החשובות שתקבלי את איכות העובד/ה.</p>
                        </div>
                    `,
                },
                {
                    id: "termination-of-employment",
                    title: "פיטורים וסיום העסקה",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">פיטורים וסיום העסקה</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">סיום העסקה של עובד הוא תהליך דרמטי ומשמעותי עבור העובד והארגון. דרך זו הינה תהליך שדורש תכנון ארגוני מראש וזימון להודעה ופרסום ההחלטה הסופית.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ההודעה על סיום העסקה מחייבת לקיים תהליך ארגוני שיש לו חשיפה.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong>מדוע זה חשוב?</strong></p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>✔ מניעת חשיפה משפטית.</li>
                            <li>✔ אירוע פיטורים מחייב הועדה, ומוודא עמידה בחוק, ושימוש מושכל בהליך מתודולוגי.</li>
                            <li>✔ שמירה על חברות ארגונית של עובד שזועש במרכז או נוצר, והוא יכול להישאר רגש מחויב לארגון, אם התהליך יתבצע כהלכה.</li>
                            <li>✔ למידה ושיפור - תהליך מוסדר מאפשר ללמוד ולזהות את הפערים, ולתת הכרה והשגה של יעדים הבאים.</li>
                        </ul>
                        <p class="fs-6 lh-base mb-3 fw-semibold" style="color: #0A4A7A;">מרכז תע"ץ ילווה אתכם לאורך כל הדרך.</p>
                    `,
                },
                {
                    id: "military-discipline",
                    title: "משמעת צבאית",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">משמעת צבאית</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">בנוסף לניהול משמעת, קיימים כלים המתייחסים למשמעת צבאית (תע"ץ). יש לשים לב כי עובד המתחייב לחסימה על עבירה ששלמה לו שנה צבאית, ניתנת לו האפשרות להישפט בבית דין צבאי.</p>
                    `,
                },
            ],
        },
        {
            id: "personnel-gaps",
            title: "מענים לפערי כוח אדם",
            summary: "מענים לפערי כוח אדם, כולל העסקה ארעית וסטודנטים.",
            subItems: [
                {
                    id: "temporary-employment",
                    title: "העסקה ארעית",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">העסקה ארעית</h2>
                        <div class="tip-gold">
                            <p><strong>טיפ זהב!</strong></p>
                            <p>סטודנטים רבים מחפשים עובד במשרה חלקית וזמנית, מה שהופך אותם למקור מצוין עבורכם, שיכול להתאים לצרכים משתנים.</p>
                        </div>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ניתן להעסיק עובד/ים לתקופה קצובה בזמן, על שנה, או למלוא הפקודה, כמו (חופשת לידה, מחלה ממושכת ועוד). העסקה זו בקטגוריות הבאות:</p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>*העסקה בקטגוריה של מומחים המחייבת דעות במשהב"ט.</li>
                        </ul>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">מעבר לשכר היסוד, ישולמו רכיבים נוספים כמו דוגמה: ימי חופשה, ימי מחלה, ימי פנסיה, פוק מגורים, והבראה, והחזר הוצאות נסיעה. תהליך הקליטה במסלול זל המקוצר ומהיר.</p>
                    `,
                },
                {
                    id: "students",
                    title: "סטודנטים",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">סטודנטים</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ניתן להעסיק סטודנט ככוח עזר במעמד מזמן לתקופה של עד 6 שנים בתנאי ששילם בישראל את התואר הראשון, שנה א' ו-ב' במוסד הלימודים בישראל, או תואר שני, ג'למה, או תואר ראשון, שנה א' ו-ב' במוסד הלימודים בישראל.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">מעבר לשכר היסוד, ישולמו רכיבי שכר בהתאם לתפקיד הסטודנט והשכלתו. בנוסף, הסטודנטים זכאים לימי מחלה, ימי חופשה, פנסיה, פוק מגורים, חברות בארגון עובדי צה"ל, ושלש חג.</p>
                    `,
                },
            ],
        },
        {
            id: "zahal-workers-org",
            title: "ארגון עובדי צה\"ל - הטבה נוספת",
            summary: "הטבות נוספות הניתנות על ידי ארגון עובדי צה\"ל.",
            subItems: [
                {
                    id: "zahal-org-benefits",
                    title: "הטבות ארגון עובדי צה\"ל",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">ארגון עובדי צה"ל - הטבה נוספת</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ארגון עובדי צה"ל הוא הגוף המייצג את עובדי צה"ל, וככזה הוא הגוף המייצג את עובדי צה"ל. במסגרת זו ניתנות לעובדים הטבות משמעותיות, חופשות, סבסוד, מלגה ללימודים של עובד לילדיו, סיוע רפואי ייעודי.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">הטבה זו ניתנת ומותנית בקריטריונים המפורטים באתר הארגון: <a href="https://www.ovdayzahal.org.il" target="_blank" class="text-blue-600 hover:underline">https://www.ovdayzahal.org.il</a></p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">בנוסף, העובדים הזכאים להטבה נוספת מעצם היותם חברי הסתדרות (רלוונטי לחלק מהעובדים). הטבה זו מפורטת באתר המרוויח בשבילך.</p>
                        <p class="fs-6 lh-base mt-4 fw-semibold" style="color: #0A4A7A;">מרכז תעסוקת עובדי צה"ל, המשימה שלנו.</p>
                    `,
                },
            ],
        },
    ],
};

// Define contentData for 'זכויות הוריות'
const herayonContentData = {
    mainTitle: "עובדות ועובדים יקרים!",
    introParagraphs: [
        "הורות היא מסע מרגש, עמוק ומורכב.",
        "כחלק מהמחויבות שלנו לרווחתכם האישית והמשפחתית, ריכזנו עבורכם את כל המידע שחשוב שתכירו בנוגע לזכויותיכם במהלך ההיריון, הלידה ואחריה.",
        "חוברת זו נועדה להנגיש עבורכם את הכלים, התמיכה והזכויות המגיעות לכם בנושאים אלו.",
    ],
    motto: "המשפחה שלכם היא גם המשפחה שלנו!",
    signature: ["איתכם ובשבילכם,", 'מדור פרט ורווחה מרכז תע"ץ'],
    sections: [
        {
            id: "pregnancy-rights",
            title: "זכויות במהלך ההיריון",
            summary:
                "מידע מפורט על זכויותייך במהלך תקופת ההיריון, כולל שעות היעדרות, בדיקות ועוד.",
            subItems: [
                {
                    id: "fertility-treatments",
                    title: "טיפולי פוריות",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">טיפולי פוריות</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">טיפולי פוריות הם סדרת טיפולים רפואיים הנועדו לסייע לאנשים ולזוגות המתמודדים עם קושי להרות באופן טבעי. טיפולים אלו כוללים בין היתר הפריה חוץ גופית.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">עובדת אשר נדרשת לעבור סדרת טיפולי פוריות, רשאית להיעדר מעבודתה לצורך 4 סדרות טיפוליות בשנה. היעדרות זו תהיה על חשבון ימי המחלה הצבורים של העובדת, כדלקמן:</p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>ביחידה בה נהוג שבוע עבודה של 5 ימים, זכאית העובדת להיעדר במשך 18 ימי עבודה בשנה בעבור כל סדרת טיפולים, כלומר עד 72 ימים בשנה (עבור 4 סדרות טיפול סה"כ).</li>
                            <li>ביחידה בה נהוג שבוע עבודה של 6 ימים, זכאית העובדת להיעדר במשך 22 ימי עבודה בשנה בעבור כל סדרת טיפולים, כלומר עד 88 ימים בשנה.</li>
                        </ul>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">עובד רשאי להיעדר בגין טיפולי פוריות עד 12 ימים בשנה, על חשבון ימי המחלה הצבורים שלו.</p>
                        <p class="fs-6 lh-base" style="color: #0A4A7A;">במקרים בהם לא נותרה לעובדים יתרת ימי מחלה מספקת, יהיו רשאים להיעדר מהעבודה על חשבון ימי חופשה שנתית או לצאת לחופשה ללא תשלום.</p>
                    `,
                },
                {
                    id: "surrogacy-process",
                    title: "הליך פונדקאות",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">הליך פונדקאות</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">הליך פונדקאות מתקיים כאשר אישה נושאת היריון עבור זוג אחר או אדם יחיד, שמסיבות רפואיות או אחרות אינם יכולים לשאת היריון בעצמם.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">לעובדים ועובדות הנמצאים בתהליך פונדקאות מגיעות זכויות שונות, לרבות חופשות, ימי היעדרות ותמיכה נוספת.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong class="fw-semibold">עיקרי הזכויות הניתנות לעובדים ועובדות במהלך הפונדקאות ולאחריה:</strong></p>
                        <div class="d-flex justify-content-center mb-3 overflow-x-auto"> <!-- Added overflow-x-auto here -->
                            <table class="table table-bordered w-100 max-w-md bg-white bg-opacity-90 rounded-3 shadow-sm overflow-hidden" style="border-color: #B5D0E8;">
                                <thead>
                                    <tr>
                                        <th class="py-2 px-3 border-bottom border-info text-end fs-6 fw-semibold text-uppercase" style="color: #0A4A7A;">זכאויות</th>
                                        <th class="py-2 px-3 border-bottom border-info text-end fs-6 fw-semibold text-uppercase" style="color: #0A4A7A;">ניצול מקסימלי</th>
                                        <th class="py-2 px-3 border-bottom border-info text-end fs-6 fw-semibold text-uppercase" style="color: #0A4A7A;">הערות</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">חופשת מחלה בגין טיפולי פוריות</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">גבר- 12 ימים בשנה מהמחלה הצבורה,<br />אישה- 72/88 ימים בשנה מהמחלה הצבורה</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">כולל שישי שבת</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">חופשת מחלה בגין היריון ולידה</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">גבר- 7 ימים מהמחלה הצבורה,<br />אישה- 40 שעות על חשבון המערכת (לא כולל ימי מחלה רגילה)</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">כולל שישי שבת</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">חופשת לידה</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">גבר-חל"ד משותפת עד 7 ימים או לחילופין פיצול חל"ד עם בן/בת הזוג<br />אישה/בן הזוג (במקרים של בני זוג מאותו מין)- חל"ד מלאה של 15 שבועות בתשלום + 11 שבועות ללא תשלום (11 שבועות רלוונטיים במידה והתינוק/ת נולד/ה כאשר העובדת/בן הזוג בותק של 10 חודשים לפחות). ניתן לבקש לקצר את החal"ד לאחר 3 שבועות לפחות ממועד הלידה.</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">חל"ד משותפת ניתנת במידה ובן/בת הזוג מוותרים על דמי הלידה מהשבוע האחרון של חופשת הלידה. פיצול חל"ד יתקיים כאשר בן/בת הזוג מצהירים כי חזרו לעבודה. (חל"ד משותפת ופיצול חל"ד יפורטו בהמשך החוברת)</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 px-3 fs-6" style="color: #0A4A7A;">ימי תמורה</td>
                                        <td class="py-2 px-3 fs-6" style="color: #0A4A7A;">עד 10 ימים</td>
                                        <td class="py-2 px-3 fs-6" style="color: #0A4A7A;">רק לאחר מימוש ימי חופשה צבורה (כל הימים שמעל 24/27- החופשה השנתית הניתנת בשוטף כל שנה)+ <strong class="fw-semibold">ניצול החלק היחסי של החופשה השנתית השוטפת</strong>- קיים הסבר בתחתית העמוד</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p class="fs-6 lh-base" style="color: #0A4A7A;"><strong class="fw-semibold">ניצול חלק יחסי של חופשה שנתית</strong> – החלק היחסי מתייחס לכמות ימי החופשה היחסיים אותם נדרש לנצל במהלך השנה עצמה. לדוגמא- עובד אשר מכסת ימי החופשה השנתית שלו הינה 24, ייאלץ לנצל את החלק היחסי של ימי החופשה השנתית על מנת לקבל ימי תמורה. אם העובד מבקש את ימי התמורה בחודש יוני (אמצע השנה), נדרש יהיה לנצל מחצית מכמות ימי החופשה שלו, כלומר 12.</p>
                    `,
                },
                {
                    id: "pregnancy-absence",
                    title: "היעדרות בתקופת ההיריון לצורך בדיקות רפואיות",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">היעדרות בתקופת ההיריון לצורך בדיקות רפואיות</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">במהלך היריון - עובדת אינה מחוייבת להודיע למעסיק על הריונה עד לחודש החמישי.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">עובדת הרה זכאית להיעדר מהעבודה לצורך בדיקות רפואיות הקשורות להיריון:</p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>עובדת במשרה מלאה - זכאית להיעדר עד 40 שעות במשך כל תקופת ההיריון.</li>
                            <li>עובדת במשרה חלקית - זכאית להיעדר לחלק היחסי של 40 השעות, בהתאם לאחוז משרתה.</li>
                        </ul>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong class="fw-semibold">דגשים:</strong></p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>מהיעדרויות אלו לא יבוצעו ניכויים משכר העובדת, וכן הם לא יבואו על חשבון ימי מחלתה/חופשתה של העובדת.</li>
                            <li>על מנת לאשר היעדרויות אלו, יש להעביר לסגלי המשא"ן ביחידה אישורים רפואיים מטעם רופא נשים/תחנה לבריאות האם והילד.</li>
                            <li>במידה והעובדת לא הודיעה על ההיריון למעסיקה, אך מעוניינת לנצל את היעדרויות אלו בחמשת החודשים הראשונים להריונה, תוכל להצדיק את ההיעדרות באופן רטרואקטיבי לאחר שתודיע על הריונה למעסיק.</li>
                        </ul>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">עובד שאישתו הרה זכאי לנצל עד 7 ימי היעדרות בשנה על חשבון ימי המחלה הצבורים שלו בגין בדיקות וטיפולים הקשורים להיריון בת הזוג או בגין יום הלידה.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ניצול ימים אלו מותנה בהצהרת העובד על אישור רפואי המעיד על הבדיקות, הטיפולים או מועד הלידה, בהתאם לסיבת ההיעדרות:</p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>ליווי בת הזוג לבדיקות וטיפולים הקשורים להיריון, אשר כרוך בהם סיכון לחיי האישה/העובר.</li>
                            <li>ליווי בת הזוג לבדיקות/טיפולים אשר לצורך ביצועם בת זוג נדרשת בסיוע מאדם נוסף.</li>
                            <li>פרק הזמן של 24 שעות מתום ביצוע הפלה.</li>
                            <li>נוכחות בלידה - לעניין זה תיחשב "לידה" כפרק הזמן מתחילת הופעתם של צירים ועד 24 שעות לאחר תום הלידה.</li>
                        </ul>
                        <p class="fs-6 lh-base" style="color: #0A4A7A;">על מנת לאשר היעדררויות אלו, יש להעביר לסגלי המשא"ן ביחידה את האישורים הרפואיים המעידים על הבדיקות, הטיפולים או מועד הלידה.</p>
                    `,
                },
                {
                    id: "pregnancy-preservation",
                    title: "שמירת היריון",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">שמירת היריון</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">עובדת הנדרשת לצאת לשמירת היריון, עליה לפעול על פי השלבים הבאים:</p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>להפיק מהאתר של ביטוח לאומי טופס לתביעת "שמירת היריון", להחתים את רופא/ת הנשים ולצרף את המלצתו/ה.</li>
                            <li>להודיע לקצין האזרחים ביחידתה, תוך עדכון מועד הלידה המשוער.</li>
                            <li>קצין האזרחים יחתים את העובדת על טופס שבו היא מכירה כי אינה זכאית לשכר בתקופה זו.</li>
                            <li>כלל החומרים מועברים למופת לצורכי דיווח.</li>
                            <li>את טופס התביעה לשמירת היריון על העובדת להעביר לביטוח לאומי.</li>
                        </ul>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">בתקופת שמירת ההיריון נשמרות לעובדת הזכויות לעניין ותק, קרן פנסיה, קרן השתלמות, ביטוח חיים ושיניים.</p>
                        <p class="fs-6 lh-base" style="color: #0A4A7A;">חלק התשלום של העובדת לקרנות יירשם לחובת העובדת, וכשהעובדת תחזור מחופשת הלידה, תידרש להסדיר את החוב. אופציה נוספת היא לשלם את החוב במהלך חופשת הלידה באמצעות תשלום בכרטיס אשראי למופת אחת לחודש, על מנת למנוע חוב לאחר חופשת הלידה.</p>
                    `,
                },
            ],
        },
        {
            id: "maternity-leave-rights",
            title: "זכויות במהלך חופשת הלידה",
            summary:
                "כל המידע על תקופת חופשת הלידה, כולל אורך החופשה, תשלומים מביטוח לאומי, והארכת חופשה.",
            subItems: [
                {
                    id: "leave-duration",
                    title: "משך חופשת הלידה",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">משך חופשת הלידה</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">עובדת שילדה ועבדה כעובדת צה"ל לפחות 10 חודשים לפני מועד הלידה או התאריך המשוער של הלידה, תקבל חופשת לידה (חל"ד) מעבודתה של 26 שבועות, מתוכם 15 שבועות בתשלום ע"י ביטוח לאומי (דמי לידה) ו-11 השבועות הנותרים הינם חופשת לידה ללא תשלום (חל"ד ללא תשלום).</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">עובדת שילדה ועבדה בצה"ל פחות מ10 חודשים לפני מועד הלידה או התאריך המשוער של הלידה, תקבל חופשת לידה מעבודתה של 15 שבועות בלבד. מספר השבועות בתשלום במקרה זה (דמי הלידה), תלוי במספר חודשי האכשרה של העובדת - יש לבחון זאת פרטנית מול ביטוח לאומי.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong class="fw-semibold">דגשים:</strong></p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>באפשרות העובדת לנצל 7 שבועות מתוך חופשת הלידה טרם מועד הלידה המשוער. במידה ומעוניינת לצאת לחופשת לידה טרם הלידה, על העובדת להעביר לסגלי המשא"ן אישור רפואי המציג את תאריך הלידה המשוער.</li>
                            <li>חופשת הלידה אינה ניתנת לפדיון בכסף.</li>
                        </ul>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong class="fw-semibold">אוכלוסיות נוספות הזכאיות לחופשת לידה:</strong></p>
                        <ul class="list-disc ps-4 fs-6 lh-base mb-3" style="color: #0A4A7A;">
                            <li>בני זוג מאותו מין (המוכרים כנשואים/ידועים בציבור ע"י ביטוח לאומי)</li>
                            <li>הורים מאמצים</li>
                            <li>הורים מיועדים - המקבלים תינוק למשמורת מאם פונדקאית</li>
                            <li>פונדקאות - יולדת או הליך פונדקאות</li>
                            <li>הורים שקיבלו לאומה ילד שגילו עד 10 שנים לתקופה העולה על שישה חודשים מיום קבלת הילד.</li>
                            <li>לידת תינוק ללא רוח חיים (לאחר 22 שבועות היריון לפחות) מזכה בחופשת לידה מלאה (15/26 שבועות - תלוי בותק העובדת).</li>
                        </ul>
                        <p class="fs-6 lh-base" style="color: #0A4A7A;">דמי הלידה ניתנים מביטוח לאומי ותלויים בהזנת חופשת הלידה לרשומת הצה"לית על ידי סגלי המשא"ן ביחידה. לכן, יש להעביר בהקדם את אישור הלידה מבית החולים לסגלי המשא"ן.</p>
                    `,
                },
                {
                    id: "shorten-extend-leave",
                    title: "קיצור/הארכת חופשת לידה",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">קיצור/הארכת חופשת לידה</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong class="fw-semibold">קיצור חופשת הלידה:</strong><br />עובדת רשאית לוותר על 11 השבועות הנוספים (ללא תשלום) או חלקם ולקצר את חופשת הלידה בהודעה מראש. במידה והודיעה העובדת על רצונה בקיצור החal"ד לא יוכל לדחות המעסיק את חזרתה לעבודה למשך יותר מ-4 שבועות מיום הודעתה.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong class="fw-semibold">הארכת חופשת הלידה:</strong></p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong class="fw-semibold">לידה מרובת עוברים:</strong> עובדת שילדה בלידה אחת יותר מילד אחד, תהיה זכאית להאריך את החל"ד בתשלום בשלושה שבועות נוספים לכל ילד נוסף שילדה באותה הלידה, החל מהילד השני.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong class="fw-semibold">אשפוז של היולדת:</strong> יולדת הנדרשת להישאר בבית החולים או לחזור לאשפוז במהלך החל"ד ל-15 ימים לפחות (לא חובה ברצף), זכאית להאריך את חופשת הלידה לתקופת האשפוז, בתנאי שלא תעלה על ארבעה שבועות.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong class="fw-semibold">אשפוז של הנולד:</strong></p>
                        <ul class="list-disc ps-4 mt-2 space-y-3 mb-3" style="color: #0A4A7A;">
                            <li>תלוי בתקופת האכשרה של ביטוח לאומי.</li>
                            <li>שבועות נוספים - במידה וזכאית לתשלום דמי לידה בעד 15 שבועות.</li>
                            <li>12 שבועות נוספים - במידה וזכאית לתשלום דמי לידה בעד 8 שבועות.</li>
                        </ul>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">יודגש, כי על מנת להאריך את חופשת הלידה כאמור לעיל, על העובדת למלא את טופס התביעה המתאים ולשלוח אותו לביטוח הלאומי מוקדם ככל האפשר. לטופס יש לצרף את אישור בית החולים על האשפוז, בו יירשמו פרטי היולדת, הנולד, תקופת האשפוז ואישור המעסיק על פיצול או הארכת חל"ד.</p>
                        <p class="fs-6 lh-base" style="color: #0A4A7A;"><strong class="fw-semibold">חופשה ללא תשלום (חל"ת):</strong><br />עובדת תהיה זכאית להאריך את חופשת הלידה שלה מעבר ל15/26 שבועות באמצעות חופשה ללא תשלום (חל"ת) ובתנאי שלא תעסוק בעבודה אחרת. החal"ת תהיה ברציפות לחופשת הלידה ולא מעבר ל10 חודשים (לא כולל את חופשת הלידה של 15/26 השבועות אותם מימשה העובדת). על מנת לממש את הזכאות לחל"ת, על העובדת להעביר לסגלי המשא"ן ביחידה הצהרה חתומה עם פירוט התאריכים בהם היא מבקשת לצאת לחל"ת.</p>
                    `,
                },
                {
                    id: "preserve-rights-leave",
                    title: "שמירת זכויות במהלך חופשת הלידה",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">שמירת זכויות במהלך חופשת הלידה</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">לאורך כל תקופת החל"ד (15/26 שבועות) נשמרות זכויות הקשורות בותק כגון: ותק להבראה, ימי חופשה וימי מחלה.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">עובדת הנמצאת בחל"ד אינה זכאית להחזרים החודשיים בגין אחזקת רכב/רכב שירות למשך כל תקופה זו.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">החל משנת 2025, במהלך חופשת הלידה (15 שבועות בלבד) ושמירת היריון לא יבוצעו ניכויים בגין החזרי הביטוחים ואגרות הרישוי, והזכאות נמשכת גם במהלך תקופה זו.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong class="fw-semibold">שמירת הזכויות לקופות השונות בתקופת חל"ד (15 השבועות הראשונים בלבד) הינה בגין:</strong></p>
                        <ul class="list-disc ps-4 mt-2 space-y-3 mb-3" style="color: #0A4A7A;">
                            <li>פנסיה</li>
                            <li>קרן השתלמות</li>
                            <li>ביטוח חיים</li>
                            <li>ביטוח חיים בן זוג</li>
                            <li>ביטוח שיניים</li>
                        </ul>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">כמו כן, המעסיק ממשיך להפריש כספים לקרן הפנסיה וההשתלמות ומשלם בתקופה זו גם את חלקה של העובדת. ביטוחים שמנוכים בהתחייבויות יזומות ממשיכים להיות מנוכים, כגון: ביטוח בריאות מגדל, ביטוח רכב.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">בהמשך לעניין שמירת זכויות אלו, מנוכה מתלוש השכר סכום לטובת שמירת הזכויות אשר נצבר לחוב בתלוש וניתן להסדירו עוד במהלך חופשת הלידה מול מוקד מופת, או לחילופין שהחוב ינוכה אוטומטית מהשכר לאחר החזרה המחופשת הלידה.</p>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">במהלך חופשת הלידה ללא תשלום (11 השבועות הנוספים - למי שזכאית) - אין שמירת זכויות לקופות ועל העובדת לבצע את שמירת הזכויות לקופות השונות באופן עצמאי.</p>
                        <p class="fs-6 lh-base" style="color: #0A4A7A;">חופשה ללא תשלום לאחר חופשת הלידה (15/26 שבועות) אינה מזכה כלל בזכויות הקשורות לותק ובזכויות מול הקופות (במידה והעובדת מעוניינת לשמור על הזכויות מול הקופות עליה לפנות אליהן באופן עצמאית כמו בחל"ד ללא תשלום).</p>
                    `,
                },
                {
                    id: "fathers-rights",
                    title: "זכויות הגבר במועד הלידה ואחריה",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">זכויות הגבר במועד הלידה ואחריה</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;"><strong class="fw-semibold">יום הלידה:</strong> עובד רשאי להיעדר מעבודתו עקב לידת בת הזוג בגין אחת מהאופציות הבאות:</p>
                        <ul class="list-disc ps-4 mt-2 space-y-3 mb-3" style="color: #0A4A7A;">
                            <li>העובד יכול לממש את זכאותו ליום מחלת בת זוג בשל יום הלידה, מתוך 7 ימי המחלה הצבורה שלו בגין בדיקות וטיפולים הקשורים להיריון.</li>
                            <li>העובד זכאי להיעדרות בגין "יום משפחה" ביום הלידה או ביום הברית/ה של הנולד, לבחירתו (יום על חשבון המערכת).</li>
                        </ul>
                        <p class="fs-6 lh-base" style="color: #0A4A7A;">
                        <strong class="fw-semibold">לאחר יום הלידה:</strong> עובד רשאי להיעדר מעבודתו עד חמישה ימים מהיום שלאחר הלידה, באופן הבא:</p>
                        <ul class="list-disc ps-4 mt-2 space-y-3 mb-3" style="color: #0A4A7A;">
                            <li>שלושת הימים הראשונים יהיו על חשבון חופשה שנתית. במידה ואין לזכותו חופשה שנתית, ההיעדרות תהא על חשבון חופשה ללא תשלום (חל"ת).</li>
                            <li>שני הימים הנותרים יהיו על חשבון ימי מחלת בת הזוג מתוך 7 ימי המחלה הצבורה שלו.</li>
                        </ul>
                    `,
                },
                {
                    id: "shared-leave",
                    title: "חופשת לידה משותפת",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">חופשת לידה משותפת</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">עובד זכאי לצאת לחופשת לידה בת 7 ימים במהלך חופשת הלידה של אישתו (חל"ד משותפת), אם בת הזוג הסכימה בכתב לוותר על דמי הלידה שהיא זכאית להם בעד השבוע האחרון של דמי הלידה - מול ביטוח לאומי.</p>
                        <p class="fs-6 lh-base" style="color: #0A4A7A;">יודגש, כי הויתור של בת הזוג על דמי הלידה בשבוע האחרון של חופשת הלידה לא מחייב את העובד לצאת לחופשת לידה משותפת בשבוע האחרון, אלא מועד היציאה לחל"ד המשותפת הוא לבחירתו.</p>
                    `,
                },
                {
                    id: "split-leave",
                    title: "פיצול חופשת לידה בין בני הזוג",
                    content: `
                        <h2 class="fs-4 fw-bold mb-3 text-center" style="color: #0A4A7A;">פיצול חופשת לידה בין בני הזוג</h2>
                        <p class="fs-6 lh-base mb-3" style="color: #0A4A7A;">ניתן לפצל את חופשת הלידה כך ש-6 השבועות הראשונים לפחות יבוצעו על ידי האישה ויתרת חופשת הלידה תבוצע על ידי העובד, באופן הבא:</p>
                        <div class="d-flex justify-content-center mb-3 overflow-x-auto"> <!-- Added overflow-x-auto here -->
                            <table class="table table-bordered w-100 max-w-md bg-white bg-opacity-90 rounded-3 shadow-sm overflow-hidden" style="border-color: #B5D0E8;">
                                <thead>
                                    <tr>
                                        <th class="py-2 px-3 border-bottom border-info text-end fs-6 fw-semibold text-uppercase" style="color: #0A4A7A;">זכאויות</th>
                                        <th class="py-2 px-3 border-bottom border-info text-end fs-6 fw-semibold text-uppercase" style="color: #0A4A7A;">ניצול מקסימלי</th>
                                        <th class="py-2 px-3 border-bottom border-info text-end fs-6 fw-semibold text-uppercase" style="color: #0A4A7A;">הערות</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">26 שבועות</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">שנה ומעלה</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">20 שבועות מתוך 26 סה"כ</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">26 שבועות</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">מתחת לשנה</td>
                                        <td class="py-2 px-3 border-bottom border-info fs-6" style="color: #0A4A7A;">15 שבועות מתוך 26 סה"כ</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 px-3 fs-6" style="color: #0A4A7A;">15 שבועות</td>
                                        <td class="py-2 px-3 fs-6" style="color: #0A4A7A;">לא רלוונטי</td>
                                        <td class="py-2 px-3 fs-6" style="color: #0A4A7A;">9 שבועות מתוך 15 סה"כ</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p class="fs-6 lh-base" style="color: #0A4A7A;">לצורך מימוש הזכאות לפיצול החal"ד יש להעביר לסגלי המשא"ן הצהרה חתומה של בת הזוג הזכאית לחל"ד, בה היא מסכימה לוותר על יתרת החל"ד. כמו כן, עליה לשוב לעבודתה ולצרף על כך אישור מעסיק/ביטוח לאומי.</p>
                    `,
                },
            ],
        },
    ],
};

/**
 * Initializes the application by rendering the main content and setting up event listeners.
 * It selects the appropriate contentData based on the document title.
 */
function initializeApp() {
    const appRoot = document.getElementById('app-root');
    let currentModal = null;
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

    // Determine which contentData to use based on the document title
    let contentData;
    if (document.title.includes('סל הכלים')) {
        contentData = salKelimContentData;
    } else if (document.title.includes('זכויות הוריות')) {
        contentData = herayonContentData;
    } else {
        console.error("Unknown page title, cannot load content data.");
        return; // Exit if no matching content data is found
    }

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
        p.className = 'fs-5 lh-base mb-2 text-primary-dark';
        p.style.color = '#0A4A7A';
        p.textContent = paragraphText;
        mainContainer.appendChild(p);
    });

    // Create motto
    const motto = document.createElement('p');
    motto.className = 'fs-5 fw-bold lh-base mt-4 mb-4 text-primary-dark';
    motto.style.color = '#0A4A7A';
    motto.textContent = contentData.motto;
    mainContainer.appendChild(motto);

    // Create search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'חיפוש...';
    searchInput.className = 'form-control form-control-lg mb-4 text-end px-4 py-2 rounded-pill shadow-sm border border-info focus-ring-0';
    searchInput.style.cssText = 'background-color: #E0F2F7; color: #0A4A7A; border-color: #B5D0E8;';
    mainContainer.appendChild(searchInput);

    // Create accordion container
    const accordionContainer = document.createElement('div');
    accordionContainer.className = 'accordion-container mb-4';
    mainContainer.appendChild(accordionContainer);

    // Render accordion sections
    contentData.sections.forEach(section => {
        const subCardElements = section.subItems.map(subItem =>
            SubCard(subItem.title, () => openModal(subItem.content), subItem.id)
        );
        const accordionItem = AccordionItem(section.title, section.summary, subCardElements, section.id);
        accordionContainer.appendChild(accordionItem);
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
                sectionData.summary.toLowerCase().includes(searchTerm)) {
                sectionMatches = true;
            }

            // Check sub-items for matches and adjust their visibility/interactivity
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

            // Control visibility and expansion of the main accordion item
            if (searchTerm === '') {
                // If search is empty, show all accordions and collapse them
                accordionDiv.style.display = '';
                accordionDiv.classList.remove('open');
                accordionContentDiv.classList.remove('show');
                accordionButton.classList.remove('open');
                subCardButtons.forEach(btn => { // Ensure all sub-cards are visible when search is cleared
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                });
            } else if (sectionMatches) {
                // If the section or any of its sub-items match, show the section
                accordionDiv.style.display = '';
                // Open the accordion if a sub-item matched or the main accordion itself matched
                if (anySubItemMatches || sectionData.title.toLowerCase().includes(searchTerm) || sectionData.summary.toLowerCase().includes(searchTerm)) {
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
        if (event.target.closest('.custom-modal-scrollable-body p, .custom-modal-scrollable-body li')) {
            const textToCopy = event.target.textContent;
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

// Initialize the app once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});
