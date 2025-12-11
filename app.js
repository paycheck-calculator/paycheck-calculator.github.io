// Paycheck Calculator App

// State
let allResults = [];
let debounceTimer = null;
const isLoading = false; // Kept for future use if needed

// Tax & FICA Rates (Mock Data for demonstration - Real rates are complex and vary)
const MOCK_TAX_RATES = {
    federal: 0.15, // 15% flat mock federal tax
    state: 0.05,   // 5% flat mock state tax
    fica: 0.0765,  // 7.65% (Social Security + Medicare)
};

// DOM Elements - Updated for calculator
const calculatorForm = document.getElementById("calculatorForm");
const grossPayInput = document.getElementById("grossPayInput");
const payFrequencySelect = document.getElementById("payFrequencySelect");
const filingStatusSelect = document.getElementById("filingStatusSelect"); // Kept for future use
const clearBtn = document.getElementById("clearBtn");
const calculateBtn = document.getElementById("calculateBtn");

// Re-used DOM Elements
const loading = document.getElementById("loading");
const resultsContainer = document.getElementById("resultsContainer");
const resultsCount = document.getElementById("resultsCount");
const resultsGrid = document.getElementById("resultsGrid");
const emptyState = document.getElementById("emptyState");
const noResults = document.getElementById("noResults");
const copyAllBtn = document.getElementById("copyAllBtn");
const themeToggle = document.getElementById("themeToggle");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const mobileNav = document.getElementById("mobileNav");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const subscribeForm = document.getElementById("subscribeForm");


// Initialize
function init() {
  setupEventListeners();
  initTheme();
  // Update stats on load
  const totalWordsEl = document.getElementById("totalWords");
  if (totalWordsEl) {
    totalWordsEl.textContent = "Millions"
  }
}

// Map frequency to periods per year
const periodsPerYear = {
    'annual': 1,
    'monthly': 12,
    'biweekly': 26,
    'weekly': 52,
}

// Core Calculation Function (Simplified Mock)
function calculatePaycheck(grossAnnualPay, frequency) {
    const periods = periodsPerYear[frequency] || 1;
    const grossPeriodPay = grossAnnualPay / periods;

    // Simple mock deduction for pre-tax benefits (e.g., 5% of annual salary)
    const preTaxDeduction = (grossAnnualPay * 0.05) / periods;

    const taxableGross = grossPeriodPay - preTaxDeduction;

    // Apply mock tax rates to taxable gross
    const netFederalTax = taxableGross * MOCK_TAX_RATES.federal;
    const netStateTax = taxableGross * MOCK_TAX_RATES.state;
    const netFicaTax = grossPeriodPay * MOCK_TAX_RATES.fica; // FICA usually applies to full gross

    const totalTaxes = netFederalTax + netStateTax + netFicaTax;
    const totalDeductions = totalTaxes + preTaxDeduction;

    const netPay = grossPeriodPay - totalDeductions;

    // Format for display
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });

    const results = [
        { label: 'Gross Pay', value: grossPeriodPay, color: 'var(--text-primary)' },
        { label: 'Pre-Tax Deductions', value: preTaxDeduction, color: '#FF6347' }, 
        { label: 'Taxable Gross', value: taxableGross, color: 'var(--text-primary)' },
        { label: 'Federal Tax', value: netFederalTax, color: '#1E90FF' },
        { label: 'State Tax', value: netStateTax, color: '#DAA520' },
        { label: 'FICA (SS & Medicare)', value: netFicaTax, color: '#9370DB' },
        { label: 'Total Deductions', value: totalDeductions, color: '#DC143C' },
        { label: 'Net Pay (Take-Home)', value: netPay, color: 'var(--success)', isHighlight: true },
    ];
    
    // Convert to formatted strings
    const formattedResults = results.map(item => ({
        ...item,
        formattedValue: formatter.format(item.value)
    }));
    
    return {
        netPay: netPay,
        formattedNetPay: formatter.format(netPay),
        frequency: frequency,
        results: formattedResults
    };
}


// Event Handlers
function handleFormSubmit(e) {
  e.preventDefault();
  
  const grossAnnualPay = parseFloat(grossPayInput.value);
  const frequency = payFrequencySelect.value;
  
  if (isNaN(grossAnnualPay) || grossAnnualPay <= 0) {
    showNoResults();
    return;
  }
  
  const result = calculatePaycheck(grossAnnualPay, frequency);
  displayResults(result);
}

// Display results
function displayResults(result) {
    showResults();
    const frequencyText = result.frequency.charAt(0).toUpperCase() + result.frequency.slice(1);
    
    resultsCount.innerHTML = `Net Pay: ${result.formattedNetPay} (${frequencyText})`;
    
    resultsGrid.innerHTML = result.results.map(item => `
        <div class="word-card ${item.isHighlight ? 'longest' : ''}">
            <div class="word-info">
                <span class="word-text" style="color: ${item.color}">${item.label}</span>
                <span class="word-length">${item.formattedValue}</span>
            </div>
            <button class="copy-btn" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
        </div>
    `).join('');
    
    allResults = result.results;
}


// Setup Event Listeners
function setupEventListeners() {
  calculatorForm.addEventListener("submit", handleFormSubmit);
  clearBtn.addEventListener("click", () => {
    grossPayInput.value = "";
    showEmptyState();
  });
  
  // Copy All functionality
  copyAllBtn.addEventListener("click", handleCopyAll);
  
  // Theme toggle
  themeToggle.addEventListener("click", toggleTheme);

  // Mobile nav toggle
  mobileMenuToggle.addEventListener("click", toggleMobileMenu);

  // Subscribe form
  subscribeForm.addEventListener("submit", handleSubscribe);
}

// Handle Copy All - updated for calculator breakdown
function handleCopyAll() {
    if (allResults.length === 0) return;

    const breakdownText = allResults
        .map(item => `${item.label}: ${item.formattedValue}`)
        .join('\n');

    navigator.clipboard.writeText(breakdownText)
        .then(() => {
            showToast("Copied full breakdown to clipboard!");
        })
        .catch(err => {
            console.error('Could not copy text: ', err);
            showToast("Failed to copy breakdown.");
        });
}


// Utility Functions (kept for UI consistency)
function showResults() {
  resultsContainer.classList.add("active");
  emptyState.classList.add("hidden");
  noResults.classList.add("hidden");
}

function showEmptyState() {
  resultsContainer.classList.remove("active");
  emptyState.classList.remove("hidden");
  noResults.classList.add("hidden");
  allResults = [];
}

function showNoResults() {
  resultsContainer.classList.remove("active");
  emptyState.classList.add("hidden");
  noResults.classList.remove("hidden");
}

// Toast notification
function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add("active");

  setTimeout(() => {
    toast.classList.remove("active");
  }, 3000);
}

// Theme handling
function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else if (prefersDark) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

// Mobile menu
function toggleMobileMenu() {
  mobileNav.classList.toggle("active");
}

// Subscribe form
function handleSubscribe(e) {
  e.preventDefault();
  // Mock subscription handler
  const emailInput = e.target.querySelector('input[type="email"]');
  if (emailInput && emailInput.value) {
    showToast("Subscribed! Thanks for joining.");
    emailInput.value = '';
  }
}

// Start the app
init();
