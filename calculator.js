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

            // Close dropdown
            wrapper.classList.remove('open');

            // Trigger change event on native select
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));

            // Clear any validation errors
            clearError(selectElement);
        });

        menu.appendChild(optionDiv);
    });

    // Toggle dropdown on click
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Close other dropdowns
        document.querySelectorAll('.cosmic-dropdown.open').forEach(dd => {
            if (dd !== wrapper) dd.classList.remove('open');
        });

        wrapper.classList.toggle('open');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            wrapper.classList.remove('open');
        }
    });

    // Close on escape key
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

// Load all JSON data on page load
async function loadData() {
    try {
        const responses = await Promise.all([
            fetch('spark_database.json'),
            fetch('true_placement_db1.json'),
            fetch('true_placement_db2.json'),
            fetch('planet_meanings.json'),
            fetch('sign_meanings.json'),
            fetch('profection_data.json')
        ]);

        [
            sparkDatabase,
            truePlacementDB1,
            truePlacementDB2,
            planetMeanings,
            signMeanings,
            profectionData
        ] = await Promise.all(responses.map(r => r.json()));

        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading calculator data. Please refresh the page.');
    }
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

// Spark Calculator
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

    const planet = planetInput.value;
    const sign = signInput.value;
    const degree = degreeInput.value;

    // Find matching entry in database
    const result = sparkDatabase.find(entry => {
        // Match degree and sign
        const entryDegree = String(entry.degree).replace('°', '').trim();
        return entryDegree === degree && entry.sign === sign;
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
                <strong>Spark Sign:</strong> <span>${result.spark || 'Not Found'}</span>
            </div>
            <div class="result-item">
                <strong>Decan:</strong> <span>${result.decan || 'Not Found'}</span>
            </div>
            <div class="result-item">
                <strong>Decan Planets:</strong> <span>${result.decan_planets || 'Not Found'}</span>
            </div>
            <div class="interpretation">
                <strong>${planet}</strong> at <strong>${degree}°</strong> in <strong>${sign}</strong> has a spark in <strong>${result.spark}</strong> and is in the <strong>${result.decan}</strong> decan, ruled by <strong>${result.decan_planets}</strong>.
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

// True Placement Calculator
document.getElementById('true-placement-form').addEventListener('submit', function(e) {
    e.preventDefault();
    clearAllErrors(this);

    const planetInput = document.getElementById('tp-planet');
    const signInput = document.getElementById('tp-sign');
    const risingInput = document.getElementById('tp-rising');

    // Validate all fields
    let isValid = true;
    if (!validateRequired(planetInput, 'planet')) isValid = false;
    if (!validateRequired(signInput, 'sign')) isValid = false;
    if (!validateRequired(risingInput, 'rising sign')) isValid = false;

    if (!isValid) return;

    const planet = planetInput.value;
    const sign = signInput.value;
    const rising = risingInput.value;

    // Search in database 1 first (most planets)
    let result = truePlacementDB1.find(entry =>
        entry.planet === planet &&
        entry.sign === sign &&
        entry.rising === rising
    );

    // If not found and planet is VENUS, check database 2
    if (!result && planet === 'VENUS') {
        result = truePlacementDB2.find(entry =>
            entry.planet === planet &&
            entry.house === sign &&
            entry.rising === rising
        );
    }

    const resultDiv = document.getElementById('true-placement-result');

    if (result) {
        const isHouseText = result.is_house || 'N/A';
        const isSignText = result.is_sign || 'N/A';
        const expressingSignText = result.expressing_sign || result.sign || 'N/A';
        const baseHouseText = result.base_house || 'N/A';
        const baseSignText = result.base_sign || 'N/A';

        let interpretation = `<strong>${planet}</strong> in <strong>${sign}</strong> with <strong>${rising}</strong> rising is in the <strong>${isHouseText}</strong> house (<strong>${isSignText}</strong>) expressing through <strong>${expressingSignText}</strong> with base from <strong>${baseHouseText}</strong> house (<strong>${baseSignText}</strong>).`;

        // Add additional houses for VENUS if available
        if (result.base_house3 && result.base_sign4) {
            interpretation += ` Also connected to <strong>${result.base_house3}</strong> house (<strong>${result.base_sign4}</strong>).`;
        }

        resultDiv.innerHTML = `
            <h3>True Placement Result</h3>
            <div class="result-item">
                <strong>Planet:</strong> <span>${planet}</span>
            </div>
            <div class="result-item">
                <strong>Sign:</strong> <span>${sign}</span>
            </div>
            <div class="result-item">
                <strong>Rising:</strong> <span>${rising}</span>
            </div>
            <div class="result-item">
                <strong>House (IS):</strong> <span>${isHouseText} (${isSignText})</span>
            </div>
            <div class="result-item">
                <strong>Expressing Through:</strong> <span>${expressingSignText}</span>
            </div>
            <div class="result-item">
                <strong>Base House:</strong> <span>${baseHouseText} (${baseSignText})</span>
            </div>
            ${result.base_house3 ? `
            <div class="result-item">
                <strong>Additional Base:</strong> <span>${result.base_house3} (${result.base_sign4})</span>
            </div>
            ` : ''}
            <div class="interpretation">
                ${interpretation}
            </div>
        `;
        resultDiv.classList.add('show');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// Profection Years Calculator
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

    // Parse birth date
    const birthDate = new Date(birthdate);
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth() + 1; // 0-indexed
    const birthDay = birthDate.getDate();

    // Calculate current age
    const today = new Date();
    let age = today.getFullYear() - birthYear;
    const monthDiff = today.getMonth() + 1 - birthMonth;
    const dayDiff = today.getDate() - birthDay;

    // Adjust age if birthday hasn't happened this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    // Determine first activation year
    // Born late Feb/early March often start same year, others start next year
    let firstActivation = birthYear;
    if (birthMonth <= 2 || (birthMonth === 3 && birthDay <= 15)) {
        firstActivation = birthYear; // Same year for early spring births
    } else {
        firstActivation = birthYear + 1; // Next year for most
    }

    // Get house mappings for this rising sign
    const houseMappings = profectionData.house_mappings[rising];
    const houseOrder = profectionData.house_order;

    if (!houseMappings) {
        alert('Error: Rising sign data not found');
        return;
    }

    // Calculate current profection house (which house the person is in this year)
    // Age 0-1 = 12th house, Age 1-2 = 1st house, etc.
    const currentHouseIndex = age % 12;
    const currentHouse = houseOrder[currentHouseIndex];
    const currentSign = houseMappings[currentHouse];

    // Generate profection table for current 12-year cycle and next
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

    // Generate rows for ages 0-23 (two full cycles)
    for (let i = 0; i <= 23; i++) {
        const houseIndex = i % 12;
        const house = houseOrder[houseIndex];
        const sign = houseMappings[house];
        const year = firstActivation + i;

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
