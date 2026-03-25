// API Base URL
const API_BASE = 'http://localhost:3000/api';

// DOM Elements
const coverageSelect = document.getElementById('coverage-select');
const searchBtn = document.getElementById('search-btn');
const clearBtn = document.getElementById('clear-btn');
const loadingDiv = document.getElementById('loading');
const resultsSection = document.getElementById('results-section');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const resultsContainer = document.getElementById('results-container');
const coverageCountSpan = document.getElementById('coverage-count');
const totalCoveragesSpan = document.getElementById('total-coverages');
const totalCustomersSpan = document.getElementById('total-customers');
const totalProductsSpan = document.getElementById('total-products');
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportExcelBtn = document.getElementById('export-excel-btn');

// Current selected coverage IDs
let currentCoverageIds = [];

// Initialize app
async function init() {
    try {
        showLoading(true);
        await loadCoverageIds();
        showLoading(false);
    } catch (error) {
        showLoading(false);
        showError('Failed to load coverage IDs. Please refresh the page.');
        console.error('Initialization error:', error);
    }
}

// Load coverage IDs into dropdown
async function loadCoverageIds() {
    try {
        const response = await fetch(`${API_BASE}/coverage-ids`);
        if (!response.ok) {
            throw new Error('Failed to fetch coverage IDs');
        }
        
        const coverageIds = await response.json();
        
        // Populate dropdown
        coverageIds.forEach(item => {
            const option = document.createElement('option');
            option.value = item.coverage_id;
            option.textContent = item.coverage_id;
            coverageSelect.appendChild(option);
        });
        
        console.log(`Loaded ${coverageIds.length} coverage IDs`);
    } catch (error) {
        throw error;
    }
}

// Get selected coverage IDs
function getSelectedCoverageIds() {
    const selected = Array.from(coverageSelect.selectedOptions).map(option => option.value);
    return selected;
}

// Search for coverage details
async function searchCoverage() {
    const selectedIds = getSelectedCoverageIds();
    
    if (selectedIds.length === 0) {
        showError('Please select at least one coverage ID');
        return;
    }
    
    currentCoverageIds = selectedIds;
    hideError();
    hideResults();
    showLoading(true);
    
    try {
        let results;
        
        if (selectedIds.length === 1) {
            // Single ID - use GET endpoint
            const response = await fetch(`${API_BASE}/coverage/${selectedIds[0]}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Coverage ID not found');
                }
                throw new Error('Failed to fetch coverage details');
            }
            
            const data = await response.json();
            results = [data];
        } else {
            // Multiple IDs - use POST endpoint
            const response = await fetch(`${API_BASE}/coverage/multiple`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ coverageIds: selectedIds })
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch coverage details');
            }
            
            results = await response.json();
        }
        
        displayResults(results);
        showLoading(false);
    } catch (error) {
        showLoading(false);
        showError(error.message);
        console.error('Search error:', error);
    }
}

// Display results for multiple coverage IDs
function displayResults(resultsArray) {
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Update coverage count
    coverageCountSpan.textContent = resultsArray.length;
    
    // Calculate overall stats
    let totalCustomers = 0;
    let totalProducts = new Set();
    
    // Display each coverage result
    resultsArray.forEach(data => {
        const coverageDiv = createCoverageResultElement(data);
        resultsContainer.appendChild(coverageDiv);
        
        // Update overall stats
        totalCustomers += data.customers.length;
        data.products.forEach(product => totalProducts.add(product));
    });
    
    // Update overall summary
    totalCoveragesSpan.textContent = resultsArray.length;
    totalCustomersSpan.textContent = totalCustomers;
    totalProductsSpan.textContent = totalProducts.size;
    
    // Show results
    resultsSection.style.display = 'block';
}

// Create a result element for a single coverage ID
function createCoverageResultElement(data) {
    const coverageDiv = document.createElement('div');
    coverageDiv.className = 'coverage-result';
    
    // Header
    const header = document.createElement('div');
    header.className = 'coverage-result-header';
    
    const title = document.createElement('h3');
    title.textContent = `Coverage ID: ${data.coverageId}`;
    
    const badge = document.createElement('span');
    badge.className = 'coverage-badge';
    badge.textContent = `${data.customers.length} Customer${data.customers.length !== 1 ? 's' : ''}`;
    
    header.appendChild(title);
    header.appendChild(badge);
    coverageDiv.appendChild(header);
    
    // Targets Summary
    const targetsDiv = document.createElement('div');
    targetsDiv.className = 'targets-summary';
    
    const dataTargetCard = document.createElement('div');
    dataTargetCard.className = 'target-card';
    dataTargetCard.innerHTML = `
        <h3>Data Target</h3>
        <p class="target-value">${data.dataTarget !== null ? data.dataTarget.toLocaleString() : 'N/A'}</p>
    `;
    
    const autoTargetCard = document.createElement('div');
    autoTargetCard.className = 'target-card';
    autoTargetCard.innerHTML = `
        <h3>Auto Target</h3>
        <p class="target-value">${data.autoTarget !== null ? data.autoTarget.toLocaleString() : 'N/A'}</p>
    `;
    
    targetsDiv.appendChild(dataTargetCard);
    targetsDiv.appendChild(autoTargetCard);
    coverageDiv.appendChild(targetsDiv);
    
    // Customers and Products Table
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Customer Name</th>
                <th>Products</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    if (data.customers.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 2;
        cell.textContent = 'No customers found for this coverage ID';
        cell.style.textAlign = 'center';
        cell.style.fontStyle = 'italic';
    } else {
        data.customers.forEach(customer => {
            const row = tbody.insertRow();
            
            // Customer name cell
            const nameCell = row.insertCell(0);
            nameCell.textContent = customer.name;
            
            // Products cell
            const productsCell = row.insertCell(1);
            const productsList = document.createElement('ul');
            productsList.className = 'products-list';
            
            customer.products.forEach(product => {
                const li = document.createElement('li');
                li.textContent = product;
                productsList.appendChild(li);
            });
            
            productsCell.appendChild(productsList);
        });
    }
    
    tableContainer.appendChild(table);
    coverageDiv.appendChild(tableContainer);
    
    // Coverage Stats
    const statsDiv = document.createElement('div');
    statsDiv.className = 'coverage-stats';
    statsDiv.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Customers:</span>
            <span class="stat-value">${data.customers.length}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Products:</span>
            <span class="stat-value">${data.products.length}</span>
        </div>
    `;
    coverageDiv.appendChild(statsDiv);
    
    return coverageDiv;
}

// Export to CSV
async function exportToCsv() {
    if (currentCoverageIds.length === 0) return;
    
    try {
        if (currentCoverageIds.length === 1) {
            // Single ID - use GET endpoint
            const url = `${API_BASE}/export/csv/${currentCoverageIds[0]}`;
            window.open(url, '_blank');
        } else {
            // Multiple IDs - use POST endpoint
            const response = await fetch(`${API_BASE}/export/csv/multiple`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ coverageIds: currentCoverageIds })
            });
            
            if (!response.ok) {
                throw new Error('Failed to export CSV');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'coverage_multiple.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    } catch (error) {
        showError('Failed to export CSV');
        console.error('Export error:', error);
    }
}

// Export to Excel
async function exportToExcel() {
    if (currentCoverageIds.length === 0) return;
    
    try {
        if (currentCoverageIds.length === 1) {
            // Single ID - use GET endpoint
            const url = `${API_BASE}/export/excel/${currentCoverageIds[0]}`;
            window.open(url, '_blank');
        } else {
            // Multiple IDs - use POST endpoint
            const response = await fetch(`${API_BASE}/export/excel/multiple`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ coverageIds: currentCoverageIds })
            });
            
            if (!response.ok) {
                throw new Error('Failed to export Excel');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'coverage_multiple.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    } catch (error) {
        showError('Failed to export Excel');
        console.error('Export error:', error);
    }
}

// Clear selection
function clearSelection() {
    coverageSelect.selectedIndex = -1;
    searchBtn.disabled = true;
    hideResults();
    hideError();
    currentCoverageIds = [];
}

// Show/hide loading
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
}

// Show/hide results
function hideResults() {
    resultsSection.style.display = 'none';
}

// Show error
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
}

// Hide error
function hideError() {
    errorMessage.style.display = 'none';
}

// Event Listeners
coverageSelect.addEventListener('change', () => {
    const selectedCount = getSelectedCoverageIds().length;
    searchBtn.disabled = selectedCount === 0;
    searchBtn.textContent = selectedCount > 1 ? `Search ${selectedCount} IDs` : 'Search Selected';
    hideError();
});

searchBtn.addEventListener('click', searchCoverage);
clearBtn.addEventListener('click', clearSelection);
exportCsvBtn.addEventListener('click', exportToCsv);
exportExcelBtn.addEventListener('click', exportToExcel);

// Allow Enter key to search
coverageSelect.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && getSelectedCoverageIds().length > 0) {
        searchCoverage();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

// Made with Bob
