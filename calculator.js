// Theme Management
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
    const themeText = document.getElementById('theme-text');

    if (theme === 'dark') {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark';
    } else {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light';
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

// Load all JSON data on page load
async function loadData() {
    try {
        const responses = await Promise.all([
            fetch('spark_database.json'),
            fetch('true_placement_db1.json'),
            fetch('true_placement_db2.json'),
            fetch('planet_meanings.json'),
            fetch('sign_meanings.json')
        ]);

        [
            sparkDatabase,
            truePlacementDB1,
            truePlacementDB2,
            planetMeanings,
            signMeanings
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
    } else {
        document.getElementById('true-placement-calculator').classList.add('active');
    }
}

// Spark Calculator
document.getElementById('spark-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const planet = document.getElementById('spark-planet').value;
    const sign = document.getElementById('spark-sign').value;
    const degree = document.getElementById('spark-degree').value;

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
    } else {
        resultDiv.innerHTML = `
            <div class="error-message">
                No matching data found for ${degree}° ${sign}. Please check your inputs.
            </div>
        `;
        resultDiv.classList.add('show');
    }
});

// True Placement Calculator
document.getElementById('true-placement-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const planet = document.getElementById('tp-planet').value;
    const sign = document.getElementById('tp-sign').value;
    const rising = document.getElementById('tp-rising').value;

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
    } else {
        resultDiv.innerHTML = `
            <div class="error-message">
                No matching data found for ${planet} in ${sign} with ${rising} rising. Please check your inputs.
            </div>
        `;
        resultDiv.classList.add('show');
    }
});

// Initialize data on page load
loadData();
