// API Base URL - use relative path for production compatibility
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

// DOM Elements
const coverageCheckboxes = document.getElementById('coverage-checkboxes');
const searchBtn = document.getElementById('search-btn');
const clearBtn = document.getElementById('clear-btn');
const selectAllBtn = document.getElementById('select-all-btn');
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

// Load coverage IDs into checkboxes
async function loadCoverageIds() {
    try {
        const response = await fetch(`${API_BASE}/coverage-ids`);
        if (!response.ok) {
            throw new Error('Failed to fetch coverage IDs');
        }
        
        const coverageIds = await response.json();
        
        // Populate checkboxes
        coverageIds.forEach(item => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `coverage-${item.coverage_id}`;
            checkbox.value = item.coverage_id;
            checkbox.className = 'coverage-checkbox';
            
            const label = document.createElement('label');
            label.htmlFor = `coverage-${item.coverage_id}`;
            label.textContent = item.coverage_id;
            
            checkboxItem.appendChild(checkbox);
            checkboxItem.appendChild(label);
            coverageCheckboxes.appendChild(checkboxItem);
            
            // Add change event listener
            checkbox.addEventListener('change', updateSearchButton);
        });
        
        console.log(`Loaded ${coverageIds.length} coverage IDs`);
    } catch (error) {
        throw error;
    }
}

// Get selected coverage IDs
function getSelectedCoverageIds() {
    const checkboxes = document.querySelectorAll('.coverage-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Update search button state
function updateSearchButton() {
    const selectedCount = getSelectedCoverageIds().length;
    searchBtn.disabled = selectedCount === 0;
    searchBtn.textContent = selectedCount > 1 ? `Search ${selectedCount} IDs` : 'Search Selected';
}

// Select all checkboxes
function selectAll() {
    const checkboxes = document.querySelectorAll('.coverage-checkbox');
    checkboxes.forEach(cb => cb.checked = true);
    updateSearchButton();
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
                <th>Possible Metric(s)</th>
                <th>Where to see</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    if (data.customers.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 4;
        cell.textContent = 'No customers found for this coverage ID';
        cell.style.textAlign = 'center';
        cell.style.fontStyle = 'italic';
    } else {
        data.customers.forEach(customer => {
            customer.products.forEach((product, index) => {
                const row = tbody.insertRow();
                
                // Customer name cell (only show for first product)
                const nameCell = row.insertCell(0);
                if (index === 0) {
                    nameCell.textContent = customer.name;
                    nameCell.rowSpan = customer.products.length;
                } else {
                    row.deleteCell(0);
                }
                
                // Product name cell
                const productCell = row.insertCell(index === 0 ? 1 : 0);
                productCell.textContent = typeof product === 'string' ? product : product.name;
                
                // Possible Metrics cell
                const metricsCell = row.insertCell(index === 0 ? 2 : 1);
                metricsCell.textContent = (typeof product === 'object' && product.possibleMetrics) ? product.possibleMetrics : 'N/A';
                
                // Where to see cell
                const whereCell = row.insertCell(index === 0 ? 3 : 2);
                whereCell.textContent = (typeof product === 'object' && product.whereToSee) ? product.whereToSee : 'N/A';
            });
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
    const checkboxes = document.querySelectorAll('.coverage-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    updateSearchButton();
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
searchBtn.addEventListener('click', searchCoverage);
clearBtn.addEventListener('click', clearSelection);
selectAllBtn.addEventListener('click', selectAll);
exportCsvBtn.addEventListener('click', exportToCsv);
exportExcelBtn.addEventListener('click', exportToExcel);

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

// Made with Bob
