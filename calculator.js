// ============================================
// COSMIC DROPDOWN COMPONENT
// ============================================

function createCosmicDropdown(selectElement) {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'cosmic-dropdown';

    // Create toggle button
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'cosmic-dropdown-toggle';

    // Get placeholder text
    const placeholder = selectElement.options[0]?.text || 'Select...';
    toggle.innerHTML = `<span class="placeholder">${placeholder}</span>`;

    // Create dropdown menu
    const menu = document.createElement('div');
    menu.className = 'cosmic-dropdown-menu';

    // Create options (skip first placeholder option)
    Array.from(selectElement.options).forEach((option, index) => {
        if (index === 0 && !option.value) return; // Skip placeholder

        const optionDiv = document.createElement('div');
        optionDiv.className = 'cosmic-dropdown-option';
        optionDiv.textContent = option.text;
        optionDiv.dataset.value = option.value;

        optionDiv.addEventListener('click', () => {
            // Update native select
            selectElement.value = option.value;

            // Update toggle text
            toggle.innerHTML = option.text;

            // Update selected state
            menu.querySelectorAll('.cosmic-dropdown-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            optionDiv.classList.add('selected');

            // Close dropdown (keep flip-up until next open to prevent flicker)
            wrapper.classList.remove('open');

            // Trigger change event on native select
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));

            // Clear any validation errors
            clearError(selectElement);

            // Handle "Other" option - show/hide custom input
            const customInput = selectElement.parentNode.querySelector('.custom-planet-input');
            if (customInput) {
                if (option.value === 'OTHER') {
                    customInput.style.display = 'block';
                    customInput.required = true;
                    customInput.focus();
                } else {
                    customInput.style.display = 'none';
                    customInput.required = false;
                    customInput.value = '';
                }
            }
        });

        menu.appendChild(optionDiv);
    });

    // Toggle dropdown on click
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Close other dropdowns (keep flip-up to prevent flicker)
        document.querySelectorAll('.cosmic-dropdown.open').forEach(dd => {
            if (dd !== wrapper) {
                dd.classList.remove('open');
            }
        });

        // Check if dropdown should flip upward (not enough space below)
        const rect = wrapper.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 300; // max-height of dropdown menu

        if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
            wrapper.classList.add('flip-up');
        } else {
            wrapper.classList.remove('flip-up');
        }

        wrapper.classList.toggle('open');
    });

    // Close on click outside (keep flip-up until next open to prevent flicker)
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            wrapper.classList.remove('open');
        }
    });

    // Close on escape key (keep flip-up until next open to prevent flicker)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            wrapper.classList.remove('open');
        }
    });

    // Hide native select and insert custom dropdown
    selectElement.classList.add('hidden-select');
    selectElement.parentNode.insertBefore(wrapper, selectElement);
    wrapper.appendChild(toggle);
    wrapper.appendChild(menu);

    // Store reference for validation
    wrapper.nativeSelect = selectElement;

    return wrapper;
}

function initCosmicDropdowns() {
    document.querySelectorAll('.form-group select').forEach(select => {
        createCosmicDropdown(select);
    });
}

// ============================================
// COSMIC VALIDATION SYSTEM
// ============================================

function showError(input, message) {
    const formGroup = input.closest('.form-group');
    clearError(input);

    formGroup.classList.add('has-error');

    // Apply error styles directly to input
    input.style.border = '2px solid #ff6b6b';
    input.style.background = 'rgba(60, 20, 20, 0.8)';
    input.style.boxShadow = 'inset 0 0 25px rgba(255, 80, 80, 0.2), 0 0 0 3px rgba(255, 100, 100, 0.4), 0 0 35px rgba(255, 100, 100, 0.3)';

    // Also style the cosmic dropdown toggle if present
    const cosmicToggle = formGroup.querySelector('.cosmic-dropdown-toggle');
    if (cosmicToggle) {
        cosmicToggle.style.border = '2px solid #ff6b6b';
        cosmicToggle.style.background = 'rgba(60, 20, 20, 0.8)';
        cosmicToggle.style.boxShadow = 'inset 0 0 25px rgba(255, 80, 80, 0.2), 0 0 0 3px rgba(255, 100, 100, 0.4), 0 0 35px rgba(255, 100, 100, 0.3)';
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error show';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}

function clearError(input) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.remove('has-error');

    // Remove inline error styles
    input.style.border = '';
    input.style.background = '';
    input.style.boxShadow = '';

    // Also clear cosmic dropdown toggle styles
    const cosmicToggle = formGroup.querySelector('.cosmic-dropdown-toggle');
    if (cosmicToggle) {
        cosmicToggle.style.border = '';
        cosmicToggle.style.background = '';
        cosmicToggle.style.boxShadow = '';
    }

    const existingError = formGroup.querySelector('.validation-error');
    if (existingError) {
        existingError.remove();
    }
}

function clearAllErrors(form) {
    form.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('has-error');
        const error = group.querySelector('.validation-error');
        if (error) error.remove();

        // Clear inline styles from inputs
        const input = group.querySelector('input, select');
        if (input) {
            input.style.border = '';
            input.style.background = '';
            input.style.boxShadow = '';
        }

        // Clear cosmic dropdown toggle styles
        const cosmicToggle = group.querySelector('.cosmic-dropdown-toggle');
        if (cosmicToggle) {
            cosmicToggle.style.border = '';
            cosmicToggle.style.background = '';
            cosmicToggle.style.boxShadow = '';
        }
    });
}

function validateRequired(input, fieldName) {
    if (!input.value || input.value.trim() === '') {
        showError(input, `Please select a ${fieldName}`);
        return false;
    }
    clearError(input);
    return true;
}

function validateDegree(input) {
    const value = parseInt(input.value);
    if (isNaN(value)) {
        showError(input, 'Please enter a degree value');
        return false;
    }
    if (value < 0) {
        showError(input, 'Degree must be 0 or higher');
        return false;
    }
    if (value > 29) {
        showError(input, 'Degree must be 29 or less');
        return false;
    }
    clearError(input);
    return true;
}

function validateDate(input) {
    if (!input.value) {
        showError(input, 'Please select your birth date');
        return false;
    }
    const date = new Date(input.value);
    const today = new Date();
    if (date > today) {
        showError(input, 'Birth date cannot be in the future');
        return false;
    }
    clearError(input);
    return true;
}

// Add real-time validation on input change
document.addEventListener('DOMContentLoaded', function() {
    // Clear errors when user starts typing/selecting
    document.querySelectorAll('.form-group input, .form-group select').forEach(input => {
        input.addEventListener('input', () => clearError(input));
        input.addEventListener('change', () => clearError(input));
    });
});

// ============================================
// Theme Management
// ============================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    const themeIcon = document.getElementById('theme-icon');

    if (theme === 'dark') {
        themeIcon.textContent = '🌙';
    } else {
        themeIcon.textContent = '☀️';
    }
}

// Initialize theme on page load
initTheme();

// Add theme toggle event listener
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Global data storage
let sparkDatabase = [];
let truePlacementDB1 = [];
let truePlacementDB2 = [];
let planetMeanings = {};
let signMeanings = {};
let profectionData = {};
let planetKeywords = {};
let signKeywords = {};

// Load all JSON data on page load
async function loadData() {
    try {
        const responses = await Promise.all([
            fetch('spark_database.json'),
            fetch('true_placement_db1.json'),
            fetch('true_placement_db2.json'),
            fetch('planet_meanings.json'),
            fetch('sign_meanings.json'),
            fetch('profection_data.json'),
            fetch('planet_keywords.json'),
            fetch('sign_keywords.json')
        ]);

        [
            sparkDatabase,
            truePlacementDB1,
            truePlacementDB2,
            planetMeanings,
            signMeanings,
            profectionData,
            planetKeywords,
            signKeywords
        ] = await Promise.all(responses.map(r => r.json()));

        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading calculator data. Please refresh the page.');
    }
}

// Helper function to get keywords for a placement calculation
function getKeywordsForPlacement(result) {
    return {
        planetWords: planetKeywords[result.planet] || [],
        isSignWords: signKeywords[result.isSign] || [],
        sparkWords: signKeywords[result.spark] || [],
        decanWords: signKeywords[result.decan] || [],
        expressedThroughWords: signKeywords[result.expressedThrough] || [],
        baseSignWords: signKeywords[result.baseSign] || [],
        baseSign2Words: signKeywords[result.baseSign2] || []
    };
}

// ============================================
// SENTENCE BUILDER - Keyword Selection System
// ============================================

// Create a searchable dropdown for keyword selection
function createKeywordDropdown(id, keywords, label, signName) {
    if (!keywords || keywords.length === 0) {
        return `<div class="keyword-dropdown-group">
            <label class="keyword-dropdown-label">${label}: <span class="keyword-sign-name">${signName}</span></label>
            <div class="keyword-dropdown-empty">No keywords available</div>
        </div>`;
    }

    const optionsHTML = keywords.map(kw =>
        `<option value="${kw}">${kw}</option>`
    ).join('');

    return `
        <div class="keyword-dropdown-group">
            <label class="keyword-dropdown-label">${label}: <span class="keyword-sign-name">${signName}</span></label>
            <div class="keyword-dropdown-wrapper">
                <input type="text"
                       class="keyword-search-input"
                       id="${id}-search"
                       placeholder="Type to search or select..."
                       autocomplete="off"
                       data-dropdown-id="${id}">
                <select class="keyword-select" id="${id}" data-label="${label}">
                    <option value="">Select a keyword...</option>
                    ${optionsHTML}
                </select>
                <div class="keyword-dropdown-list" id="${id}-list">
                    ${keywords.map(kw => `<div class="keyword-dropdown-item" data-value="${kw}">${kw}</div>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// Build the sentence builder HTML
function buildSentenceBuilder(components) {
    // components = { planet, planetKeywords, base, baseKeywords, base2, base2Keywords, through, throughKeywords, through2, through2Keywords, isSign, isSignKeywords, sign, signKeywords, hasDualBase }

    // Convert to explicit boolean (otherwise && returns the string value, not true/false)
    const hasDual = !!(components.hasDualBase && components.base2);

    let html = `
        <div class="sentence-builder" data-dual-base="${hasDual}">
            <h4 class="sentence-builder-title">Build Your Interpretation</h4>
            <p class="sentence-builder-desc">Select keywords from each component to create a personalized meaning</p>

            <div class="keyword-dropdowns">
                ${createKeywordDropdown('kw-planet', components.planetKeywords, 'Planet', components.planet)}
                <div class="keyword-row ${hasDual ? 'dual-row' : ''}">
                    ${createKeywordDropdown('kw-base', components.baseKeywords, 'Base', components.base)}
                    ${hasDual ? createKeywordDropdown('kw-base2', components.base2Keywords, 'Base 2', components.base2) : ''}
                </div>
                <div class="keyword-row ${hasDual ? 'dual-row' : ''}">
                    ${createKeywordDropdown('kw-through', components.throughKeywords, 'Through', components.through)}
                    ${hasDual ? createKeywordDropdown('kw-through2', components.through2Keywords, 'Through 2', components.through2) : ''}
                </div>
                ${createKeywordDropdown('kw-is', components.isSignKeywords, 'House', components.isSign)}
                ${createKeywordDropdown('kw-sign', components.signKeywords, 'Sign', components.sign)}
            </div>

            <div class="sentence-output">
                <div class="sentence-label">Your Interpretation:</div>
                <div class="sentence-text" id="generated-sentence">
                    <span class="sentence-placeholder">Select keywords above to build your sentence...</span>
                </div>
            </div>
        </div>
    `;

    return html;
}

// Initialize sentence builder dropdowns after they're added to DOM
function initSentenceBuilder() {
    const dropdowns = document.querySelectorAll('.keyword-dropdown-wrapper');

    dropdowns.forEach(wrapper => {
        const searchInput = wrapper.querySelector('.keyword-search-input');
        const select = wrapper.querySelector('.keyword-select');
        const list = wrapper.querySelector('.keyword-dropdown-list');
        const items = list.querySelectorAll('.keyword-dropdown-item');

        // Store the previous value for restoration if no selection made
        let previousValue = '';

        // Check if dropdown should flip upward (not enough space below)
        function checkFlipDirection() {
            const rect = wrapper.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = 200; // max-height of dropdown list

            if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
                wrapper.classList.add('flip-up');
            } else {
                wrapper.classList.remove('flip-up');
            }
        }

        // Show/hide dropdown list on input focus
        searchInput.addEventListener('focus', () => {
            // Store current value before clearing
            previousValue = select.value;
            // Clear input for fresh search
            searchInput.value = '';
            // Show all items
            filterDropdownItems('', items);
            // Check flip direction before showing
            checkFlipDirection();
            list.classList.add('show');
        });

        // Filter items as user types
        searchInput.addEventListener('input', () => {
            list.classList.add('show');
            filterDropdownItems(searchInput.value, items);
        });

        // Handle item selection
        items.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                searchInput.value = value;
                select.value = value;
                previousValue = value; // Update previous value on selection
                list.classList.remove('show');
                updateGeneratedSentence();
            });
        });

        // Restore previous value if clicking outside without selecting
        searchInput.addEventListener('blur', (e) => {
            // Small delay to allow click events on items to fire first
            setTimeout(() => {
                if (!list.classList.contains('show')) {
                    // If dropdown is closed and input is empty or different, restore previous
                    if (searchInput.value === '' || searchInput.value !== select.value) {
                        searchInput.value = previousValue;
                        select.value = previousValue;
                    }
                }
            }, 150);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                list.classList.remove('show');
                // Restore previous value if nothing new was selected
                if (searchInput.value === '' || searchInput.value !== select.value) {
                    searchInput.value = previousValue;
                    select.value = previousValue;
                }
            }
        });

        // Handle keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
            const currentIndex = visibleItems.findIndex(item => item.classList.contains('highlighted'));

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = currentIndex < visibleItems.length - 1 ? currentIndex + 1 : 0;
                highlightItem(visibleItems, nextIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleItems.length - 1;
                highlightItem(visibleItems, prevIndex);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const highlighted = visibleItems.find(item => item.classList.contains('highlighted'));
                if (highlighted) {
                    highlighted.click();
                } else if (visibleItems.length > 0) {
                    visibleItems[0].click();
                }
            } else if (e.key === 'Escape') {
                list.classList.remove('show');
                // Restore previous value on Escape
                searchInput.value = previousValue;
                select.value = previousValue;
            }
        });
    });
}

// Filter dropdown items based on search text
function filterDropdownItems(searchText, items) {
    const search = searchText.toLowerCase();
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(search)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Highlight item for keyboard navigation
function highlightItem(items, index) {
    items.forEach(item => item.classList.remove('highlighted'));
    if (items[index]) {
        items[index].classList.add('highlighted');
        items[index].scrollIntoView({ block: 'nearest' });
    }
}

// Update the generated sentence based on selected keywords
function updateGeneratedSentence() {
    const planetKw = document.getElementById('kw-planet')?.value || '';
    const baseKw = document.getElementById('kw-base')?.value || '';
    const base2Kw = document.getElementById('kw-base2')?.value || '';
    const throughKw = document.getElementById('kw-through')?.value || '';
    const through2Kw = document.getElementById('kw-through2')?.value || '';
    const isKw = document.getElementById('kw-is')?.value || '';
    const signKw = document.getElementById('kw-sign')?.value || '';

    const sentenceDiv = document.getElementById('generated-sentence');
    const hasDualBase = document.querySelector('.sentence-builder')?.dataset.dualBase === 'true';

    if (!planetKw && !baseKw && !throughKw && !isKw && !signKw) {
        sentenceDiv.innerHTML = '<span class="sentence-placeholder">Select keywords above to build your sentence...</span>';
        return;
    }

    // Build sentence with filled and empty parts
    let sentence = '';
    sentence += planetKw ? `<strong class="kw-filled">${planetKw}</strong>` : '<span class="kw-empty">[Planet]</span>';
    sentence += ' <span class="kw-connector">based on</span> ';

    if (hasDualBase) {
        // Venus/Mercury: parentheses around (Base and Base2)
        sentence += '<span class="kw-paren">(</span>';
        sentence += baseKw ? `<strong class="kw-filled">${baseKw}</strong>` : '<span class="kw-empty">[Base]</span>';
        sentence += ' <span class="kw-connector">and</span> ';
        sentence += base2Kw ? `<strong class="kw-filled">${base2Kw}</strong>` : '<span class="kw-empty">[Base 2]</span>';
        sentence += '<span class="kw-paren">)</span>';
    } else {
        sentence += baseKw ? `<strong class="kw-filled">${baseKw}</strong>` : '<span class="kw-empty">[Base]</span>';
    }

    sentence += ' <span class="kw-connector">through</span> ';

    if (hasDualBase) {
        // Venus/Mercury: parentheses around (Through and Through2)
        sentence += '<span class="kw-paren">(</span>';
        sentence += throughKw ? `<strong class="kw-filled">${throughKw}</strong>` : '<span class="kw-empty">[Through]</span>';
        sentence += ' <span class="kw-connector">and</span> ';
        sentence += through2Kw ? `<strong class="kw-filled">${through2Kw}</strong>` : '<span class="kw-empty">[Through 2]</span>';
        sentence += '<span class="kw-paren">)</span>';
    } else {
        sentence += throughKw ? `<strong class="kw-filled">${throughKw}</strong>` : '<span class="kw-empty">[Through]</span>';
    }

    sentence += ' <span class="kw-connector">directed into</span> ';
    sentence += isKw ? `<strong class="kw-filled">${isKw}</strong>` : '<span class="kw-empty">[House]</span>';
    sentence += ' <span class="kw-connector">expressed through</span> ';
    sentence += signKw ? `<strong class="kw-filled">${signKw}</strong>` : '<span class="kw-empty">[Sign]</span>';

    sentenceDiv.innerHTML = sentence;
}

// Tab switching
function showCalculator(calculatorName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update calculator sections
    document.querySelectorAll('.calculator-section').forEach(section => {
        section.classList.remove('active');
    });

    if (calculatorName === 'spark') {
        document.getElementById('spark-calculator').classList.add('active');
    } else if (calculatorName === 'true-placement') {
        document.getElementById('true-placement-calculator').classList.add('active');
    } else if (calculatorName === 'profection-years') {
        document.getElementById('profection-years-calculator').classList.add('active');
    }
}

// ============================================
// SPARK CALCULATOR
// ============================================
// PURPOSE: Calculates the "Spark" (sub-sign) and Decan for a planet placement.
//
// HOW IT WORKS:
// 1. User inputs: Planet, Zodiac Sign, and Degree (0-29)
// 2. The calculator looks up the degree+sign combination in spark_database.json
// 3. Each degree of each sign has a corresponding:
//    - SPARK: A secondary zodiac sign influence (like a sub-sign within the main sign)
//    - DECAN: Which third of the sign (1st, 2nd, or 3rd decan - each sign is divided into 3 decans of 10 degrees each)
//    - DECAN PLANETS: The planetary rulers of that decan
//
// CALCULATION:
// - Simply a database lookup: finds the row where degree and sign match the user input
// - No mathematical calculation - the spark/decan values are pre-computed in the database
// ============================================
document.getElementById('spark-form').addEventListener('submit', function(e) {
    e.preventDefault();
    clearAllErrors(this);

    const planetInput = document.getElementById('spark-planet');
    const signInput = document.getElementById('spark-sign');
    const degreeInput = document.getElementById('spark-degree');

    // Validate all fields
    let isValid = true;
    if (!validateRequired(planetInput, 'planet')) isValid = false;
    if (!validateRequired(signInput, 'sign')) isValid = false;
    if (!validateDegree(degreeInput)) isValid = false;

    if (!isValid) return;

    // Get planet value - use custom input if "Other" is selected
    const customPlanetInput = document.getElementById('spark-planet-custom');
    let planet = planetInput.value;
    if (planet === 'OTHER') {
        if (!customPlanetInput.value || customPlanetInput.value.trim() === '') {
            showError(customPlanetInput, 'Please enter a custom planet/point name');
            return;
        }
        planet = customPlanetInput.value.trim().toUpperCase();
    }

    const sign = signInput.value;
    const degree = degreeInput.value;

    // DATABASE LOOKUP: Find the row in spark_database.json that matches the degree and sign
    // The database contains pre-computed spark signs and decans for all 360 degree positions
    // Note: New database uses capitalized field names (Degree, Sign, Spark, Decan, Decan_Planets)
    const result = sparkDatabase.find(entry => {
        // Match degree and sign - strip the degree symbol if present in database
        const entryDegree = String(entry.Degree).replace('°', '').trim();
        return entryDegree === degree && entry.Sign === sign;
    });

    const resultDiv = document.getElementById('spark-result');

    if (result) {
        resultDiv.innerHTML = `
            <h3>Spark Calculation Result</h3>
            <div class="result-item">
                <strong>Planet:</strong> <span>${planet}</span>
            </div>
            <div class="result-item">
                <strong>Position:</strong> <span>${degree}° ${sign}</span>
            </div>
            <div class="result-item">
                <strong>Spark Sign:</strong> <span>${result.Spark || 'Not Found'}</span>
            </div>
            <div class="result-item">
                <strong>Decan:</strong> <span>${result.Decan || 'Not Found'}</span>
            </div>
            <div class="result-item">
                <strong>Decan Planets:</strong> <span>${result.Decan_Planets || 'Not Found'}</span>
            </div>
            <div class="interpretation">
                <strong>${planet}</strong> at <strong>${degree}°</strong> in <strong>${sign}</strong> has a spark in <strong>${result.Spark}</strong> and is in the <strong>${result.Decan}</strong> decan, ruled by <strong>${result.Decan_Planets}</strong>.
            </div>
        `;
        resultDiv.classList.add('show');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        resultDiv.innerHTML = `
            <div class="error-message">
                No matching data found for ${degree}° ${sign}. Please check your inputs.
            </div>
        `;
        resultDiv.classList.add('show');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

// ============================================
// TRUE PLACEMENT CALCULATOR
// ============================================
// PURPOSE: Calculates the "True Placement" of a planet - showing which house
// and sign the planet truly operates through based on the rising sign.
// Also calculates the Spark (sub-sign) and Decan based on the degree.
//
// HOW IT WORKS:
// 1. User inputs: Planet, Sign, Degree (0-29), and Rising Sign
// 2. The calculator determines where this planet falls in the chart houses
//    based on whole sign house system (where rising sign = 1st house)
// 3. Also looks up the Spark and Decan from spark_database.json
//
// OUTPUTS:
// - IS HOUSE: The house number where the planet resides (1st through 12th)
// - IS SIGN: The zodiac sign associated with that house position
// - EXPRESSING SIGN: The sign through which the planet expresses its energy
// - BASE HOUSE: The foundational house influence
// - BASE SIGN: The foundational sign influence
// - SPARK SIGN: The sub-sign influence based on the degree
// - DECAN: Which third of the sign (1st, 2nd, or 3rd)
// - DECAN PLANETS: The planetary rulers of that decan
//
// CALCULATION:
// - Database lookup in true_placement_db1.json (for most planets)
// - Venus has special handling with additional data in true_placement_db2.json
// - Spark/Decan lookup in spark_database.json using degree + sign
// ============================================
document.getElementById('true-placement-form').addEventListener('submit', function(e) {
    e.preventDefault();
    clearAllErrors(this);

    const planetInput = document.getElementById('tp-planet');
    const signInput = document.getElementById('tp-sign');
    const degreeInput = document.getElementById('tp-degree');
    const risingInput = document.getElementById('tp-rising');

    // Validate required fields (degree is optional)
    let isValid = true;
    if (!validateRequired(planetInput, 'planet')) isValid = false;
    if (!validateRequired(signInput, 'sign')) isValid = false;
    if (!validateRequired(risingInput, 'rising sign')) isValid = false;

    // Only validate degree if provided
    const hasDegree = degreeInput.value !== '' && degreeInput.value !== null;
    if (hasDegree && !validateDegree(degreeInput)) isValid = false;

    if (!isValid) return;

    const planet = planetInput.value;
    const sign = signInput.value;
    const degree = hasDegree ? degreeInput.value : null;
    const rising = risingInput.value;

    // DATABASE LOOKUP: Search true_placement_db1.json first (contains most planets)
    // Matches on all three criteria: planet, sign, and rising sign
    // Note: New database uses capitalized field names (Planet, Sign, Rising)
    console.log('Looking for:', { planet, sign, rising });
    console.log('Database loaded:', truePlacementDB1.length, 'entries');
    console.log('First entry:', truePlacementDB1[0]);

    let result = truePlacementDB1.find(entry =>
        entry.Planet === planet &&
        entry.Sign === sign &&
        entry.Rising === rising
    );
    console.log('Result found:', result);

    // SPECIAL CASE: Venus has extended data in a second database
    // Venus has additional house connections that require extra fields
    if (!result && planet === 'VENUS') {
        result = truePlacementDB2.find(entry =>
            entry.Planet === planet &&
            entry.Sign === sign &&
            entry.Rising === rising
        );
    }

    const resultDiv = document.getElementById('true-placement-result');

    // SPARK LOOKUP: Only find spark/decan data if degree was provided
    let sparkResult = null;
    if (hasDegree) {
        sparkResult = sparkDatabase.find(entry => {
            const entryDegree = String(entry.Degree).replace('°', '').trim();
            return entryDegree === degree && entry.Sign === sign;
        });
    }

    if (result) {
        // True Placement data - using new capitalized field names
        const isHouseText = result.IS_house || 'N/A';
        const isSignText = result.IS_sign || 'N/A';
        const expressingSignText = result.Sign2 || 'N/A';
        const baseHouseText = result.BASE_house || 'N/A';
        const baseSignText = result.BASE_sign || 'N/A';
        const throughSignText = result.Sign3 || 'N/A';

        // Spark data - only available if degree was provided
        const sparkSign = sparkResult?.Spark || null;
        const decan = sparkResult?.Decan || null;
        const decanPlanets = sparkResult?.Decan_Planets || null;

        // DUAL RULERSHIP: Venus and Mercury rule two signs each, so they have two bases
        // Venus rules Taurus (Sign5) and Libra (Sign6), Mercury rules Gemini and Virgo
        const hasDualBase = (planet === 'VENUS' || planet === 'MERCURY') && result.Sign5;
        const secondBaseSign = result.Sign5 || null;  // Second base sign (Libra for Venus, Virgo for Mercury)
        const secondThroughSign = result.Sign6 || null;  // Second through sign
        const secondBaseHouse = result.Sign4 || null;  // Second base house

        // Build interpretation sentence based on whether planet has dual rulership
        // Spark part is only included if degree was provided
        const sparkPart = sparkSign ? `, with <strong>${sparkSign}</strong> spark in <strong>${decan}</strong> decan,` : ',';

        let interpretation;
        if (hasDualBase && secondBaseSign && secondThroughSign) {
            // VENUS or MERCURY: dual base format
            // Example: "MERCURY in Virgo, with Cancer spark in Aquarius decan, expressed through Aquarius with Capricorn and Aries base (through Gemini and Virgo)"
            interpretation = `<strong>${planet}</strong> in <strong>${sign}</strong>${sparkPart} expressed through <strong>${expressingSignText}</strong> with <strong>${baseSignText}</strong> and <strong>${secondBaseSign}</strong> base (through <strong>${throughSignText}</strong> and <strong>${secondThroughSign}</strong>).`;
        } else {
            // All other planets: single base format
            interpretation = `<strong>${planet}</strong> in <strong>${sign}</strong>${sparkPart} expressed through <strong>${expressingSignText}</strong> with <strong>${baseSignText}</strong> base (through <strong>${throughSignText}</strong>).`;
        }

        // Build the result HTML - show second base for Venus/Mercury
        let baseDisplay;
        if (hasDualBase && secondBaseSign) {
            baseDisplay = `
            <div class="result-item">
                <strong>Base 1:</strong> <span>(${baseHouseText}) ${baseSignText} through ${throughSignText}</span>
            </div>
            <div class="result-item">
                <strong>Base 2:</strong> <span>(${secondBaseHouse}) ${secondBaseSign} through ${secondThroughSign}</span>
            </div>`;
        } else {
            baseDisplay = `
            <div class="result-item">
                <strong>Base:</strong> <span>(${baseHouseText}) ${baseSignText} through ${throughSignText}</span>
            </div>`;
        }

        // Spark display - only show if degree was provided
        const sparkDisplay = sparkSign ? `
            <div class="result-item">
                <strong>Spark Sign:</strong> <span>${sparkSign}</span>
            </div>
            <div class="result-item">
                <strong>Decan:</strong> <span>${decan}</span>
            </div>
            <div class="result-item">
                <strong>Decan Planets:</strong> <span>${decanPlanets}</span>
            </div>` : '';

        // Get keywords for sentence builder
        // Structure: Planet, Base, Through, IS Sign (House), Input Sign
        // For Venus/Mercury: also includes Base 2 and Through 2
        const pKeywords = planetKeywords[planet] || [];
        const baseWords = signKeywords[baseSignText] || [];
        const base2Words = secondBaseSign ? signKeywords[secondBaseSign] || [] : [];
        const throughWords = signKeywords[throughSignText] || [];
        const through2Words = secondThroughSign ? signKeywords[secondThroughSign] || [] : [];
        const isSignWords = signKeywords[isSignText] || [];
        const inputSignWords = signKeywords[sign] || [];

        // Build sentence builder HTML
        const sentenceBuilderHTML = buildSentenceBuilder({
            planet: planet,
            planetKeywords: pKeywords,
            base: baseSignText,
            baseKeywords: baseWords,
            base2: secondBaseSign,
            base2Keywords: base2Words,
            through: throughSignText,
            throughKeywords: throughWords,
            through2: secondThroughSign,
            through2Keywords: through2Words,
            isSign: isSignText,
            isSignKeywords: isSignWords,
            sign: sign,
            signKeywords: inputSignWords,
            hasDualBase: hasDualBase
        });

        resultDiv.innerHTML = `
            <h3>True Placement Result</h3>
            <div class="result-item">
                <strong>House:</strong> <span>(${isHouseText}) ${isSignText}</span>
            </div>
            <div class="result-item">
                <strong>Expressing Through:</strong> <span>${expressingSignText}</span>
            </div>
            ${baseDisplay}
            ${sparkDisplay}
            <div class="interpretation">
                ${interpretation}
            </div>
            ${sentenceBuilderHTML}
        `;
        resultDiv.classList.add('show');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Initialize the sentence builder dropdowns after adding to DOM
        setTimeout(() => initSentenceBuilder(), 100);
    } else {
        resultDiv.innerHTML = `
            <div class="error-message">
                No matching data found for ${planet} in ${sign} with ${rising} rising. Please check your inputs.
            </div>
        `;
        resultDiv.classList.add('show');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

// ============================================
// PROFECTION YEARS CALCULATOR
// ============================================
// PURPOSE: Calculates Annual Profections - an ancient timing technique that
// activates different houses/signs each year of life in a 12-year cycle.
//
// HOW IT WORKS:
// 1. User inputs: Birth Date and Rising Sign
// 2. The calculator determines current age and which house is "activated" this year
//
// THE PROFECTION CYCLE:
// - Each year of life activates a different house in sequence
// - Age 0 = 1st house (rising sign)
// - Age 1 = 2nd house
// - Age 2 = 3rd house
// - ... and so on through all 12 houses
// - Age 12 = back to 1st house (cycle repeats)
//
// CALCULATION FORMULA:
// - Current House Index = Age modulo 12 (age % 12)
// - This gives a number 0-11, which maps to houses 1st-12th
// - The SIGN activated depends on the Rising Sign:
//   - If Rising = Aries, then 1st house = Aries, 2nd = Taurus, etc.
//   - If Rising = Taurus, then 1st house = Taurus, 2nd = Gemini, etc.
//
// OUTPUTS:
// - Current Age
// - Current Profection House (1st through 12th)
// - Current Activated Sign (based on rising sign)
// - Full 24-year table showing the profection cycle
// ============================================
document.getElementById('profection-form').addEventListener('submit', function(e) {
    e.preventDefault();
    clearAllErrors(this);

    const birthdateInput = document.getElementById('pf-birthdate');
    const risingInput = document.getElementById('pf-rising');

    // Validate all fields
    let isValid = true;
    if (!validateDate(birthdateInput)) isValid = false;
    if (!validateRequired(risingInput, 'rising sign')) isValid = false;

    if (!isValid) return;

    const birthdate = birthdateInput.value;
    const rising = risingInput.value;

    // STEP 1: Parse birth date into components
    const birthDate = new Date(birthdate);
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth() + 1; // JavaScript months are 0-indexed, so add 1
    const birthDay = birthDate.getDate();

    // STEP 2: Calculate current age
    // Age = current year - birth year, adjusted if birthday hasn't happened yet this year
    const today = new Date();
    let age = today.getFullYear() - birthYear;
    const monthDiff = today.getMonth() + 1 - birthMonth;
    const dayDiff = today.getDate() - birthDay;

    // Adjust age down by 1 if birthday hasn't occurred yet this year
    // (either we're in an earlier month, or same month but earlier day)
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    // STEP 3: Determine first activation year
    // This is when the profection cycle begins counting
    // People born early in the year (Jan-mid March) start same year
    // People born later in the year start the following year
    let firstActivation = birthYear;
    if (birthMonth <= 2 || (birthMonth === 3 && birthDay <= 15)) {
        firstActivation = birthYear; // Same year for early spring births
    } else {
        firstActivation = birthYear + 1; // Next year for most
    }

    // STEP 4: Get house-to-sign mappings for this rising sign from database
    // profection_data.json contains which sign corresponds to which house for each rising
    const houseMappings = profectionData.house_mappings[rising];
    const houseOrder = profectionData.house_order; // Array: ["1st", "2nd", "3rd", ... "12th"]

    if (!houseMappings) {
        alert('Error: Rising sign data not found');
        return;
    }

    // STEP 5: Calculate current profection house
    // FORMULA: age % 12 gives the index (0-11) into the house order
    // Age 0 → index 0 → 1st house
    // Age 1 → index 1 → 2nd house
    // Age 12 → index 0 → 1st house (cycle repeats)
    const currentHouseIndex = age % 12;
    const currentHouse = houseOrder[currentHouseIndex];
    const currentSign = houseMappings[currentHouse]; // Look up which sign this house corresponds to

    // STEP 6: Prepare to generate the profection table
    // Calculate which 12-year cycle the person is currently in
    const currentCycleStart = Math.floor(age / 12) * 12;
    const resultDiv = document.getElementById('profection-result');

    let tableHTML = `
        <h3>Profection Years Result</h3>
        <div class="result-item">
            <strong>Birth Date:</strong> <span>${birthdate}</span>
        </div>
        <div class="result-item">
            <strong>Rising Sign:</strong> <span>${rising}</span>
        </div>
        <div class="result-item">
            <strong>Current Age:</strong> <span>${age}</span>
        </div>
        <div class="result-item">
            <strong>Current Profection:</strong> <span>${currentHouse} House - ${currentSign}</span>
        </div>
        <div class="result-item">
            <strong>First Activation Year:</strong> <span>${firstActivation}</span>
        </div>

        <div class="interpretation">
            You are currently <strong>${age}</strong> years old and in your <strong>${currentHouse} house</strong> profection year, activated through the sign of <strong>${currentSign}</strong>.
        </div>

        <h4 style="margin-top: 30px; color: var(--accent-primary);">Your Profection Cycles:</h4>
        <div style="overflow-x: auto; margin-top: 15px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead>
                    <tr style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
                        <th style="padding: 10px; text-align: left; color: var(--text-primary);">Age</th>
                        <th style="padding: 10px; text-align: left; color: var(--text-primary);">Year</th>
                        <th style="padding: 10px; text-align: left; color: var(--text-primary);">House</th>
                        <th style="padding: 10px; text-align: left; color: var(--text-primary);">Sign</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // STEP 7: Generate the profection table rows
    // Shows ages 0-23 (two complete 12-year cycles)
    // For each age:
    //   - houseIndex = age % 12 (cycles 0-11 repeatedly)
    //   - house = the house name from houseOrder array ("1st", "2nd", etc.)
    //   - sign = the zodiac sign for that house based on rising sign
    //   - year = the calendar year when this age profection is active
    for (let i = 0; i <= 23; i++) {
        const houseIndex = i % 12;             // Cycles: 0,1,2...11,0,1,2...11
        const house = houseOrder[houseIndex];  // Maps index to house name
        const sign = houseMappings[house];     // Maps house to zodiac sign
        const year = firstActivation + i;      // Calendar year for this age

        // Highlight current age
        const isCurrentAge = i === age;
        const rowStyle = isCurrentAge ?
            'background: rgba(212, 175, 55, 0.2); border: 2px solid var(--accent-primary);' :
            'background: var(--bg-secondary); border: 1px solid var(--border-primary);';

        tableHTML += `
            <tr style="${rowStyle}">
                <td style="padding: 8px; color: var(--text-primary); ${isCurrentAge ? 'font-weight: bold;' : ''}">${i}</td>
                <td style="padding: 8px; color: var(--text-secondary);">${year}</td>
                <td style="padding: 8px; color: var(--accent-primary); ${isCurrentAge ? 'font-weight: bold;' : ''}">${house}</td>
                <td style="padding: 8px; color: var(--text-primary); ${isCurrentAge ? 'font-weight: bold;' : ''}">${sign}</td>
            </tr>
        `;
    }

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    resultDiv.innerHTML = tableHTML;
    resultDiv.classList.add('show');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Initialize data on page load
loadData();

// Initialize cosmic dropdowns after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initCosmicDropdowns();

    // Handle "Other" option for spark planet dropdown
    const sparkPlanetSelect = document.getElementById('spark-planet');
    const sparkPlanetCustom = document.getElementById('spark-planet-custom');

    if (sparkPlanetSelect && sparkPlanetCustom) {
        sparkPlanetSelect.addEventListener('change', function() {
            if (this.value === 'OTHER') {
                sparkPlanetCustom.style.display = 'block';
                sparkPlanetCustom.required = true;
                sparkPlanetCustom.focus();
            } else {
                sparkPlanetCustom.style.display = 'none';
                sparkPlanetCustom.required = false;
                sparkPlanetCustom.value = '';
            }
        });
    }
});

// ============================================
// LAUNCH BUTTON TOGGLE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const launchBtn = document.getElementById('launch-btn');
    const closeBtn = document.getElementById('close-btn');
    const container = document.getElementById('calculator-container');

    if (launchBtn && container) {
        launchBtn.addEventListener('click', function() {
            launchBtn.classList.add('hidden');
            container.classList.remove('hidden');
            container.classList.add('visible');
        });
    }

    if (closeBtn && container && launchBtn) {
        closeBtn.addEventListener('click', function() {
            container.classList.add('hidden');
            container.classList.remove('visible');
            launchBtn.classList.remove('hidden');
        });
    }
});
